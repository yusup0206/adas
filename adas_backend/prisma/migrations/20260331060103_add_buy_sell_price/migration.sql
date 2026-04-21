-- Step 1: Add new columns with defaults so existing rows don't break
ALTER TABLE `product` ADD COLUMN `buyPrice` DECIMAL(15, 2) NOT NULL DEFAULT 0;
ALTER TABLE `product` ADD COLUMN `sellPrice` DECIMAL(15, 2) NOT NULL DEFAULT 0;

-- Step 2: Copy existing price into sellPrice for all existing products
UPDATE `product` SET `sellPrice` = `price`, `buyPrice` = 0;

-- Step 3: Drop the old price column
ALTER TABLE `product` DROP COLUMN `price`;
