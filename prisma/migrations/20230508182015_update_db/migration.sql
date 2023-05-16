/*
  Warnings:

  - You are about to drop the `Event` table. If the table is not empty, all the data it contains will be lost.
  - Added the required column `authorMessage` to the `Post` table without a default value. This is not possible if the table is not empty.

*/
-- DropIndex
DROP INDEX `Group_creatorId_fkey` ON `Group`;

-- DropIndex
DROP INDEX `Group_eventId_fkey` ON `Group`;

-- DropIndex
DROP INDEX `Post_authorId_fkey` ON `Post`;

-- AlterTable
ALTER TABLE `Post` ADD COLUMN `authorMessage` VARCHAR(191) NOT NULL;

-- DropTable
DROP TABLE `Event`;

-- CreateTable
CREATE TABLE `Like` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `postId` INTEGER NOT NULL,
    `userId` INTEGER NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
