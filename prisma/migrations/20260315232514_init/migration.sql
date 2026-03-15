-- CreateTable
CREATE TABLE "Usuario" (
    "id" TEXT NOT NULL,
    "nome" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "senha_hash" TEXT NOT NULL,
    "tema_escuro" BOOLEAN NOT NULL DEFAULT false,
    "criado_em" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Usuario_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Deck" (
    "id" TEXT NOT NULL,
    "titulo" TEXT NOT NULL,
    "cor_hex" TEXT NOT NULL DEFAULT '#CCCCCC',
    "icone" TEXT,
    "usuario_id" TEXT NOT NULL,
    "criado_em" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Deck_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Cartao" (
    "id" TEXT NOT NULL,
    "frente" TEXT NOT NULL,
    "verso" TEXT NOT NULL,
    "imagem_url" TEXT,
    "deck_id" TEXT NOT NULL,
    "proxima_revisao" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "intervalo_dias" INTEGER NOT NULL DEFAULT 0,
    "facilidade" DOUBLE PRECISION NOT NULL DEFAULT 2.5,
    "acertos_seguidos" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "Cartao_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Estatistica" (
    "id" TEXT NOT NULL,
    "usuario_id" TEXT NOT NULL,
    "data_estudo" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "cartoes_revisados" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "Estatistica_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Usuario_email_key" ON "Usuario"("email");

-- AddForeignKey
ALTER TABLE "Deck" ADD CONSTRAINT "Deck_usuario_id_fkey" FOREIGN KEY ("usuario_id") REFERENCES "Usuario"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Cartao" ADD CONSTRAINT "Cartao_deck_id_fkey" FOREIGN KEY ("deck_id") REFERENCES "Deck"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Estatistica" ADD CONSTRAINT "Estatistica_usuario_id_fkey" FOREIGN KEY ("usuario_id") REFERENCES "Usuario"("id") ON DELETE CASCADE ON UPDATE CASCADE;
