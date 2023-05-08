/*
  Warnings:

  - The primary key for the `Group` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to alter the column `id` on the `Group` table. The data in that column could be lost. The data in that column will be cast from `VarChar(191)` to `Int`.
  - You are about to alter the column `A` on the `_GroupToUser` table. The data in that column could be lost. The data in that column will be cast from `VarChar(191)` to `Int`.

*/
-- DropForeignKey
ALTER TABLE `Group` DROP FOREIGN KEY `Group_creatorId_fkey`;

-- DropForeignKey
ALTER TABLE `Group` DROP FOREIGN KEY `Group_eventId_fkey`;

-- DropForeignKey
ALTER TABLE `Post` DROP FOREIGN KEY `Post_authorId_fkey`;

-- DropForeignKey
ALTER TABLE `_GroupToUser` DROP FOREIGN KEY `_GroupToUser_A_fkey`;

-- DropForeignKey
ALTER TABLE `_GroupToUser` DROP FOREIGN KEY `_GroupToUser_B_fkey`;

-- DropForeignKey
ALTER TABLE `_UserToUser` DROP FOREIGN KEY `_UserToUser_A_fkey`;

-- DropForeignKey
ALTER TABLE `_UserToUser` DROP FOREIGN KEY `_UserToUser_B_fkey`;

-- AlterTable
ALTER TABLE `Group` DROP PRIMARY KEY,
    MODIFY `id` INTEGER NOT NULL AUTO_INCREMENT,
    ADD PRIMARY KEY (`id`);

-- AlterTable
ALTER TABLE `_GroupToUser` MODIFY `A` INTEGER NOT NULL;
