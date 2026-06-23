const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  try {
    await prisma.$executeRawUnsafe(
      "ALTER TABLE WarehouseDispatch ADD COLUMN dispatchName VARCHAR(191) NOT NULL DEFAULT ''"
    );
    console.log('Added dispatchName to WarehouseDispatch');
  } catch (e) {
    if (e.message && e.message.includes('Duplicate column')) {
      console.log('dispatchName on WarehouseDispatch already exists');
    } else {
      throw e;
    }
  }
  try {
    await prisma.$executeRawUnsafe(
      'ALTER TABLE WarehouseDispatch ADD COLUMN dispatchGroupId INT NULL'
    );
    console.log('Added dispatchGroupId to WarehouseDispatch');
  } catch (e) {
    if (e.message && e.message.includes('Duplicate column')) {
      console.log('dispatchGroupId on WarehouseDispatch already exists');
    } else {
      throw e;
    }
  }
  try {
    await prisma.$executeRawUnsafe(
      "ALTER TABLE Loan ADD COLUMN dispatchName VARCHAR(191) NOT NULL DEFAULT ''"
    );
    console.log('Added dispatchName to Loan');
  } catch (e) {
    if (e.message && e.message.includes('Duplicate column')) {
      console.log('dispatchName on Loan already exists');
    } else {
      throw e;
    }
  }
  try {
    await prisma.$executeRawUnsafe(
      'ALTER TABLE Loan ADD COLUMN dispatchGroupId INT NULL'
    );
    console.log('Added dispatchGroupId to Loan');
  } catch (e) {
    if (e.message && e.message.includes('Duplicate column')) {
      console.log('dispatchGroupId on Loan already exists');
    } else {
      throw e;
    }
  }
  console.log('Migration complete!');
  await prisma.$disconnect();
}

main().catch(e => {
  console.error(e);
  process.exit(1);
});
