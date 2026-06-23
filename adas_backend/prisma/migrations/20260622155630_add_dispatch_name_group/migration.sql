-- AlterTable: add dispatchName and dispatchGroupId to WarehouseDispatch
ALTER TABLE `WarehouseDispatch` ADD COLUMN `dispatchName` VARCHAR(191) NOT NULL DEFAULT '';
ALTER TABLE `WarehouseDispatch` ADD COLUMN `dispatchGroupId` INT NULL;

-- AlterTable: add dispatchName and dispatchGroupId to Loan
ALTER TABLE `Loan` ADD COLUMN `dispatchName` VARCHAR(191) NOT NULL DEFAULT '';
ALTER TABLE `Loan` ADD COLUMN `dispatchGroupId` INT NULL;
