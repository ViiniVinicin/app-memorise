const express = require('express');
const router = express.Router();
const { PrismaClient } = require('@prisma/client');
const jwt = require('jsonwebtoken');

const prisma = new PrismaClient();

// Middleware de autenticação
function autenticar(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

  if (!token) {
    return res.status(401).json({ erro: 'Token não fornecido.' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.usuarioId = decoded.id;
    next();
  } catch (error) {
    return res.status(403).json({ erro: 'Token inválido.' });
  }
}

// ==========================================
// LISTAR TODOS OS DECKS DO USUÁRIO
// ==========================================
router.get('/', autenticar, async (req, res) => {
  try {
    const decks = await prisma.deck.findMany({
      where: { usuario_id: req.usuarioId },
      include: {
        _count: { select: { cartoes: true } }
      },
      orderBy: { criado_em: 'desc' }
    });

    res.json(decks);
  } catch (error) {
    console.error(error);
    res.status(500).json({ erro: 'Erro ao buscar decks.' });
  }
});

// ==========================================
// CRIAR NOVO DECK
// ==========================================
router.post('/', autenticar, async (req, res) => {
  try {
    const { titulo, color_hex, icone } = req.body;

    if (!titulo) {
      return res.status(400).json({ erro: 'O título do deck é obrigatório.' });
    }

    const deck = await prisma.deck.create({
      data: {
        titulo,
        color_hex: color_hex || '#CCCCCC',
        icone: icone || null,
        usuario_id: req.usuarioId
      }
    });

    res.status(201).json(deck);
  } catch (error) {
    console.error(error);
    res.status(500).json({ erro: 'Erro ao criar deck.' });
  }
});

// ==========================================
// BUSCAR DECK POR ID (com cartões)
// ==========================================
router.get('/:id', autenticar, async (req, res) => {
  try {
    const deck = await prisma.deck.findFirst({
      where: {
        id: req.params.id,
        usuario_id: req.usuarioId
      },
      include: {
        cartoes: true,
        _count: { select: { cartoes: true } }
      }
    });

    if (!deck) {
      return res.status(404).json({ erro: 'Deck não encontrado.' });
    }

    res.json(deck);
  } catch (error) {
    console.error(error);
    res.status(500).json({ erro: 'Erro ao buscar deck.' });
  }
});

// ==========================================
// EDITAR DECK
// ==========================================
router.put('/:id', autenticar, async (req, res) => {
  try {
    const { titulo, color_hex, icone } = req.body;

    const deckExiste = await prisma.deck.findFirst({
      where: { id: req.params.id, usuario_id: req.usuarioId }
    });

    if (!deckExiste) {
      return res.status(404).json({ erro: 'Deck não encontrado.' });
    }

    const deck = await prisma.deck.update({
      where: { id: req.params.id },
      data: { titulo, color_hex, icone }
    });

    res.json(deck);
  } catch (error) {
    console.error(error);
    res.status(500).json({ erro: 'Erro ao editar deck.' });
  }
});

// ==========================================
// DELETAR DECK
// ==========================================
router.delete('/:id', autenticar, async (req, res) => {
  try {
    const deckExiste = await prisma.deck.findFirst({
      where: { id: req.params.id, usuario_id: req.usuarioId }
    });

    if (!deckExiste) {
      return res.status(404).json({ erro: 'Deck não encontrado.' });
    }

    await prisma.deck.delete({ where: { id: req.params.id } });

    res.json({ mensagem: 'Deck deletado com sucesso.' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ erro: 'Erro ao deletar deck.' });
  }
});

module.exports = router;
module.exports.autenticar = autenticar;