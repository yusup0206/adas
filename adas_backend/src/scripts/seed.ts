import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

const PERMISSIONS = [
  { name: 'MANAGE_USERS', description: 'Can create, edit, delete users' },
  { name: 'MANAGE_ROLES', description: 'Can create, edit, delete roles and assign permissions' },
  { name: 'MANAGE_PRODUCTS', description: 'Can manage products and units' },
  { name: 'MANAGE_SUPPLIERS', description: 'Can manage suppliers' },
  { name: 'MANAGE_CLIENTS', description: 'Can manage clients' },
  { name: 'MANAGE_ORDERS', description: 'Can manage purchase orders' },
  { name: 'MANAGE_WAREHOUSE', description: 'Can manage warehouse arrivals and dispatches' },
  { name: 'VIEW_REPORTS', description: 'Can view reports' },
  { name: 'VIEW_INCOME', description: 'Can view income' }
];

async function main() {
  console.log('Seeding data...');

  // 1. Seed Permissions
  for (const perm of PERMISSIONS) {
    await prisma.permission.upsert({
      where: { name: perm.name },
      update: { description: perm.description },
      create: perm,
    });
  }
  console.log('Permissions seeded.');

  // 2. Create Admin Role
  const adminRole = await prisma.role.upsert({
    where: { name: 'admin' },
    update: {},
    create: { name: 'admin' },
  });

  // 3. Assign all permissions to Admin Role
  const allPermissions = await prisma.permission.findMany();
  for (const perm of allPermissions) {
    await prisma.rolePermission.upsert({
      where: {
        roleId_permissionId: {
          roleId: adminRole.id,
          permissionId: perm.id
        }
      },
      update: {},
      create: {
        roleId: adminRole.id,
        permissionId: perm.id
      }
    });
  }
  console.log('Admin role seeded and permissions assigned.');

  // 4. Create Admin User
  const adminPassword = await bcrypt.hash('admin123', 10);
  await prisma.user.upsert({
    where: { username: 'admin' },
    update: { password: adminPassword, roleId: adminRole.id },
    create: {
      username: 'admin',
      password: adminPassword,
      roleId: adminRole.id
    }
  });
  console.log('Admin user seeded.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
