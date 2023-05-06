/*
  Warnings:

  - Added the required column `profileImageCaption` to the `User` table without a default value. This is not possible if the table is not empty.
  - Added the required column `profileImageName` to the `User` table without a default value. This is not possible if the table is not empty.
  - Added the required column `profileImageURI` to the `User` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `User` ADD COLUMN `profileImageCaption` VARCHAR(191) NOT NULL,
    ADD COLUMN `profileImageName` VARCHAR(191) NOT NULL,
    ADD COLUMN `profileImageURI` VARCHAR(191) NOT NULL;