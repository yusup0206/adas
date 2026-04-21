/*
  Warnings:

  - You are about to drop the column `name` on the `agreement` table. All the data in the column will be lost.
  - Added the required column `name_ru` to the `Agreement` table without a default value. This is not possible if the table is not empty.
  - Added the required column `name_tm` to the `Agreement` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `agreement` DROP COLUMN `name`,
    ADD COLUMN `name_ru` VARCHAR(191) NOT NULL,
    ADD COLUMN `name_tm` VARCHAR(191) NOT NULL;
