const express = require('express');
const cors = require('cors');
const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

const prisma = new PrismaClient();
const app = express();

app.use(cors());
app.use(express.json());

// Rota de Teste Base
app.get('/', (req, res) => {
  res.json({ mensagem: "Bem-vindo à API do app_memorise!" });
});

// ==========================================
// ROTA DE CADASTRO (Register)
// ==========================================
app.post('/cadastro', async (req, res) => {
  try {
    const { nome, email, senha } = req.body;

    // 1. Verifica se o usuário já existe no banco
    const usuarioExistente = await prisma.usuario.findUnique({
      where: { email: email }
    });

    if (usuarioExistente) {
      return res.status(400).json({ erro: "Este e-mail já está cadastrado." });
    }

    // 2. Criptografa a senha (o número 10 é o "custo" do processamento)
    const senhaCriptografada = await bcrypt.hash(senha, 10);

    // 3. Salva o novo usuário no banco de dados
    const novoUsuario = await prisma.usuario.create({
      data: {
        nome: nome,
        email: email,
        senha_hash: senhaCriptografada
      }
    });

    res.status(201).json({ mensagem: "Usuário criado com sucesso!" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ erro: "Erro interno ao cadastrar usuário." });
  }
});

// ==========================================
// ROTA DE LOGIN
// ==========================================
app.post('/login', async (req, res) => {
  try {
    const { email, senha } = req.body;

    // 1. Busca o usuário pelo e-mail
    const usuario = await prisma.usuario.findUnique({
      where: { email: email }
    });

    if (!usuario) {
      return res.status(404).json({ erro: "Usuário não encontrado." });
    }

    // 2. Compara a senha digitada com a senha criptografada do banco
    const senhaValida = await bcrypt.compare(senha, usuario.senha_hash);

    if (!senhaValida) {
      return res.status(401).json({ erro: "Senha incorreta." });
    }

    // 3. Gera o Token de Acesso (JWT)
    const token = jwt.sign(
      { id: usuario.id, email: usuario.email },
      process.env.JWT_SECRET,
      { expiresIn: '7d' } // O token expira em 7 dias
    );

    // 4. Devolve os dados do usuário e o token para o React Native
    res.json({
      mensagem: "Login realizado com sucesso!",
      token: token,
      usuario: {
        id: usuario.id,
        nome: usuario.nome,
        email: usuario.email
      }
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ erro: "Erro interno ao fazer login." });
  }
});

const PORT = 3000;
app.listen(PORT, () => {
  console.log(`Foguete lançado! Servidor rodando na porta ${PORT}`);
});