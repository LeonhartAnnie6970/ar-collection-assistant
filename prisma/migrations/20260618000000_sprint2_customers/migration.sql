-- CreateTable Sales
CREATE TABLE `Sales` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `code` VARCHAR(191) NOT NULL,
    `name` VARCHAR(191) NOT NULL,

    UNIQUE INDEX `Sales_code_key`(`code`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable Customer
CREATE TABLE `Customer` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `name` VARCHAR(191) NOT NULL,
    `salesId` INTEGER NULL,
    `picCustomer` VARCHAR(255) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `Customer_salesId_idx`(`salesId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey Customer -> Sales
ALTER TABLE `Customer` ADD CONSTRAINT `Customer_salesId_fkey`
    FOREIGN KEY (`salesId`) REFERENCES `Sales`(`id`)
    ON DELETE SET NULL ON UPDATE CASCADE;

-- AlterTable Activity: add customerId and picCustomer columns
ALTER TABLE `Activity`
    ADD COLUMN `customerId` INTEGER NULL,
    ADD COLUMN `picCustomer` VARCHAR(255) NULL;

-- CreateIndex Activity_customerId
CREATE INDEX `Activity_customerId_idx` ON `Activity`(`customerId`);

-- AddForeignKey Activity -> Customer
ALTER TABLE `Activity` ADD CONSTRAINT `Activity_customerId_fkey`
    FOREIGN KEY (`customerId`) REFERENCES `Customer`(`id`)
    ON DELETE SET NULL ON UPDATE CASCADE;
