/*
  Warnings:

  - You are about to drop the column `altText` on the `Post` table. All the data in the column will be lost.
  - You are about to drop the column `imageURI` on the `Post` table. All the data in the column will be lost.
  - Added the required column `image` to the `Post` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `Post` DROP COLUMN `altText`,
    DROP COLUMN `imageURI`,
    ADD COLUMN `image` VARCHAR(191) NOT NULL,
    MODIFY `authorMessage` VARCHAR(191) NULL;
