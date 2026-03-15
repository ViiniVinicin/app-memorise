const express = require('express');
const cors = require('cors');
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();
const app = express();

app.use(cors());
app.use(express.json());

app.get('/', (req, res) => {
  res.json({ mensagem: "Bem-vindo à API do app_memorise!" });
});

const PORT = 3000;
app.listen(PORT, () => {
  console.log(`Foguete lançado! Servidor rodando na porta ${PORT}`);
});