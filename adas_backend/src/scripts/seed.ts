import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

// ─── New Granular Permissions ────────────────────────────────────────────────
export const PERMISSIONS = [
  // Users
  { name: "USERS_VIEW", description: "Can view users" },
  { name: "USERS_CREATE", description: "Can create users" },
  { name: "USERS_UPDATE", description: "Can edit users" },
  { name: "USERS_DELETE", description: "Can delete users" },

  // Roles
  { name: "ROLES_VIEW", description: "Can view roles and permissions" },
  { name: "ROLES_CREATE", description: "Can create roles" },
  { name: "ROLES_UPDATE", description: "Can edit roles" },
  { name: "ROLES_DELETE", description: "Can delete roles" },

  // Products
  { name: "PRODUCTS_VIEW", description: "Can view products" },
  { name: "PRODUCTS_CREATE", description: "Can create products" },
  { name: "PRODUCTS_UPDATE", description: "Can edit products" },
  { name: "PRODUCTS_DELETE", description: "Can delete products" },

  // Units (Measurements)
  { name: "UNITS_VIEW", description: "Can view units of measurement" },
  { name: "UNITS_CREATE", description: "Can create units" },
  { name: "UNITS_UPDATE", description: "Can edit units" },
  { name: "UNITS_DELETE", description: "Can delete units" },

  // Suppliers
  { name: "SUPPLIERS_VIEW", description: "Can view suppliers" },
  { name: "SUPPLIERS_CREATE", description: "Can create suppliers" },
  { name: "SUPPLIERS_UPDATE", description: "Can edit suppliers" },
  { name: "SUPPLIERS_DELETE", description: "Can delete suppliers" },

  // Clients
  { name: "CLIENTS_VIEW", description: "Can view clients" },
  { name: "CLIENTS_CREATE", description: "Can create clients" },
  { name: "CLIENTS_UPDATE", description: "Can edit clients" },
  { name: "CLIENTS_DELETE", description: "Can delete clients" },

  // Orders
  { name: "ORDERS_VIEW", description: "Can view purchase orders" },
  { name: "ORDERS_CREATE", description: "Can create purchase orders" },
  { name: "ORDERS_UPDATE", description: "Can edit and pay purchase orders" },
  { name: "ORDERS_DELETE", description: "Can delete purchase orders" },

  // Warehouse
  {
    name: "WAREHOUSE_VIEW",
    description: "Can view warehouse stock, arrivals and dispatches",
  },
  {
    name: "WAREHOUSE_CREATE",
    description: "Can create warehouse arrivals and dispatches",
  },
  {
    name: "WAREHOUSE_DELETE",
    description: "Can delete warehouse arrivals and dispatches",
  },

  // Loans
  { name: "LOANS_VIEW", description: "Can view loans" },
  { name: "LOANS_UPDATE", description: "Can pay / update loans" },

  // Income
  { name: "INCOME_VIEW", description: "Can view income and debt summary" },

  // Settings (Expense Formulas)
  { name: "SETTINGS_VIEW", description: "Can view expense formulas settings" },
  { name: "SETTINGS_CREATE", description: "Can create expense formulas" },
  { name: "SETTINGS_UPDATE", description: "Can edit expense formulas" },
  { name: "SETTINGS_DELETE", description: "Can delete expense formulas" },
];

// ─── Legacy → New permission mapping (for auto-migration) ────────────────────
const LEGACY_MIGRATION_MAP: Record<string, string[]> = {
  MANAGE_USERS: ["USERS_VIEW", "USERS_CREATE", "USERS_UPDATE", "USERS_DELETE"],
  MANAGE_ROLES: ["ROLES_VIEW", "ROLES_CREATE", "ROLES_UPDATE", "ROLES_DELETE"],
  MANAGE_PRODUCTS: [
    "PRODUCTS_VIEW",
    "PRODUCTS_CREATE",
    "PRODUCTS_UPDATE",
    "PRODUCTS_DELETE",
    "UNITS_VIEW",
    "UNITS_CREATE",
    "UNITS_UPDATE",
    "UNITS_DELETE",
  ],
  MANAGE_SUPPLIERS: [
    "SUPPLIERS_VIEW",
    "SUPPLIERS_CREATE",
    "SUPPLIERS_UPDATE",
    "SUPPLIERS_DELETE",
  ],
  MANAGE_CLIENTS: [
    "CLIENTS_VIEW",
    "CLIENTS_CREATE",
    "CLIENTS_UPDATE",
    "CLIENTS_DELETE",
  ],
  MANAGE_ORDERS: [
    "ORDERS_VIEW",
    "ORDERS_CREATE",
    "ORDERS_UPDATE",
    "ORDERS_DELETE",
  ],
  MANAGE_WAREHOUSE: [
    "WAREHOUSE_VIEW",
    "WAREHOUSE_CREATE",
    "WAREHOUSE_DELETE",
    "LOANS_VIEW",
    "LOANS_UPDATE",
  ],
  VIEW_INCOME: ["INCOME_VIEW"],
  VIEW_REPORTS: ["INCOME_VIEW"],
  MANAGE_SETTINGS: [
    "SETTINGS_VIEW",
    "SETTINGS_CREATE",
    "SETTINGS_UPDATE",
    "SETTINGS_DELETE",
  ],
};

const EXPENSE_FORMULA_KEYS = [
  "tax",
  "director",
  "customs",
  "transportation",
  "workers",
  "stockExchange",
  "forensics",
  "bank",
  "textileMinistry",
  "export",
  "minusConjugation",
  "additionalExpenses",
];

async function main() {
  console.log("Seeding data...");

  // ── 1. Upsert all new granular permissions ──────────────────────────────────
  for (const perm of PERMISSIONS) {
    await prisma.permission.upsert({
      where: { name: perm.name },
      update: { description: perm.description },
      create: perm,
    });
  }
  console.log("Permissions seeded.");

  // ── 2. Auto-migrate existing roles: map legacy → new permissions ────────────
  const allRoles = await prisma.role.findMany({
    include: { permissions: { include: { permission: true } } },
  });

  const newPermMap: Record<string, { id: number }> = {};
  for (const perm of PERMISSIONS) {
    const found = await prisma.permission.findUnique({
      where: { name: perm.name },
    });
    if (found) newPermMap[perm.name] = found;
  }

  for (const role of allRoles) {
    const legacyNames = role.permissions.map((rp) => rp.permission.name);
    const newNamesToGrant = new Set<string>();

    for (const legacyName of legacyNames) {
      const mapped = LEGACY_MIGRATION_MAP[legacyName];
      if (mapped) mapped.forEach((n) => newNamesToGrant.add(n));
    }

    for (const permName of newNamesToGrant) {
      const permRecord = newPermMap[permName];
      if (!permRecord) continue;
      await prisma.rolePermission.upsert({
        where: {
          roleId_permissionId: { roleId: role.id, permissionId: permRecord.id },
        },
        update: {},
        create: { roleId: role.id, permissionId: permRecord.id },
      });
    }
  }
  console.log("Existing roles auto-migrated to new granular permissions.");

  // ── 3. Create/update admin role with ALL new permissions ────────────────────
  const adminRole = await prisma.role.upsert({
    where: { name: "admin" },
    update: {},
    create: { name: "admin" },
  });

  const allNewPermissions = await prisma.permission.findMany({
    where: { name: { in: PERMISSIONS.map((p) => p.name) } },
  });

  for (const perm of allNewPermissions) {
    await prisma.rolePermission.upsert({
      where: {
        roleId_permissionId: { roleId: adminRole.id, permissionId: perm.id },
      },
      update: {},
      create: { roleId: adminRole.id, permissionId: perm.id },
    });
  }
  console.log("Admin role permissions updated.");

  // ── 4. Create admin user if not exists ─────────────────────────────────────
  const adminPassword = await bcrypt.hash("shaggi86", 10);
  await prisma.user.upsert({
    where: { username: "admin" },
    update: { password: adminPassword, roleId: adminRole.id },
    create: {
      username: "admin",
      password: adminPassword,
      roleId: adminRole.id,
    },
  });
  console.log("Admin user seeded.");

  // ── 5. Seed default expense formulas ────────────────────────────────────────
  for (const key of EXPENSE_FORMULA_KEYS) {
    await prisma.expenseFormula.upsert({
      where: { key },
      update: {},
      create: { key, formula: "0" },
    });
  }
  console.log("Expense formulas seeded.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
