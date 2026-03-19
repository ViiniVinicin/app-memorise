/*
  Warnings:

  - You are about to drop the column `cor_hex` on the `Deck` table. All the data in the column will be lost.
  - You are about to drop the column `criado_em` on the `Deck` table. All the data in the column will be lost.
  - You are about to drop the column `icone` on the `Deck` table. All the data in the column will be lost.
  - You are about to drop the column `titulo` on the `Deck` table. All the data in the column will be lost.
  - You are about to drop the column `usuario_id` on the `Deck` table. All the data in the column will be lost.
  - You are about to drop the `Cartao` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Estatistica` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Usuario` table. If the table is not empty, all the data it contains will be lost.
  - Added the required column `title` to the `Deck` table without a default value. This is not possible if the table is not empty.
  - Added the required column `user_id` to the `Deck` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "Cartao" DROP CONSTRAINT "Cartao_deck_id_fkey";

-- DropForeignKey
ALTER TABLE "Deck" DROP CONSTRAINT "Deck_usuario_id_fkey";

-- DropForeignKey
ALTER TABLE "Estatistica" DROP CONSTRAINT "Estatistica_usuario_id_fkey";

-- AlterTable
ALTER TABLE "Deck" DROP COLUMN "cor_hex",
DROP COLUMN "criado_em",
DROP COLUMN "icone",
DROP COLUMN "titulo",
DROP COLUMN "usuario_id",
ADD COLUMN     "color" TEXT NOT NULL DEFAULT '#CCCCCC',
ADD COLUMN     "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "icon" TEXT,
ADD COLUMN     "title" TEXT NOT NULL,
ADD COLUMN     "user_id" TEXT NOT NULL;

-- DropTable
DROP TABLE "Cartao";

-- DropTable
DROP TABLE "Estatistica";

-- DropTable
DROP TABLE "Usuario";

-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "password_hash" TEXT NOT NULL,
    "dark_theme" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Card" (
    "id" TEXT NOT NULL,
    "front" TEXT NOT NULL,
    "back" TEXT NOT NULL,
    "image_url" TEXT,
    "deck_id" TEXT NOT NULL,
    "next_review" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "interval_days" INTEGER NOT NULL DEFAULT 0,
    "easiness" DOUBLE PRECISION NOT NULL DEFAULT 2.5,
    "streak" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "Card_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Statistic" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "study_date" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "cards_reviewed" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "Statistic_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- AddForeignKey
ALTER TABLE "Deck" ADD CONSTRAINT "Deck_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Card" ADD CONSTRAINT "Card_deck_id_fkey" FOREIGN KEY ("deck_id") REFERENCES "Deck"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Statistic" ADD CONSTRAINT "Statistic_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
