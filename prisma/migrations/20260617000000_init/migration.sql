-- CreateTable
CREATE TABLE `Activity` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `tanggal` DATE NOT NULL,
    `customer_name` VARCHAR(255) NOT NULL,
    `collector` VARCHAR(255) NOT NULL,
    `os_amount` DOUBLE NOT NULL,
    `od_amount` DOUBLE NOT NULL,
    `invoice_count` INTEGER NOT NULL,
    `od_days` INTEGER NOT NULL,
    `activity` TEXT NOT NULL,
    `feedback` TEXT NOT NULL,
    `status` VARCHAR(50) NOT NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    INDEX `Activity_tanggal_idx`(`tanggal`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
