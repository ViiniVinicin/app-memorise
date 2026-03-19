const express = require('express');
const router = express.Router({ mergeParams: true }); // mergeParams para pegar :deckId
const { PrismaClient } = require('@prisma/client');
const { autenticar } = require('./decks');

const prisma = new PrismaClient();

// ==========================================
// LISTAR CARTÕES DO DECK
// ==========================================
router.get('/', autenticar, async (req, res) => {
  try {
    const deck = await prisma.deck.findFirst({
      where: { id: req.params.deckId, usuario_id: req.usuarioId }
    });

    if (!deck) {
      return res.status(404).json({ erro: 'Deck não encontrado.' });
    }

    const cartoes = await prisma.cartao.findMany({
      where: { deck_id: req.params.deckId },
      orderBy: { proxima_revisao: 'asc' }
    });

    res.json(cartoes);
  } catch (error) {
    console.error(error);
    res.status(500).json({ erro: 'Erro ao buscar cartões.' });
  }
});

// ==========================================
// CRIAR CARTÃO
// ==========================================
router.post('/', autenticar, async (req, res) => {
  try {
    const { frente, verso, imagem_url } = req.body;

    if (!frente || !verso) {
      return res.status(400).json({ erro: 'Frente e verso são obrigatórios.' });
    }

    const deck = await prisma.deck.findFirst({
      where: { id: req.params.deckId, usuario_id: req.usuarioId }
    });

    if (!deck) {
      return res.status(404).json({ erro: 'Deck não encontrado.' });
    }

    const cartao = await prisma.cartao.create({
      data: {
        frente,
        verso,
        imagem_url: imagem_url || null,
        deck_id: req.params.deckId
      }
    });

    res.status(201).json(cartao);
  } catch (error) {
    console.error(error);
    res.status(500).json({ erro: 'Erro ao criar cartão.' });
  }
});

// ==========================================
// EDITAR CARTÃO
// ==========================================
router.put('/:cardId', autenticar, async (req, res) => {
  try {
    const { frente, verso, imagem_url } = req.body;

    const cartao = await prisma.cartao.findFirst({
      where: {
        id: req.params.cardId,
        deck: { id: req.params.deckId, usuario_id: req.usuarioId }
      }
    });

    if (!cartao) {
      return res.status(404).json({ erro: 'Cartão não encontrado.' });
    }

    const atualizado = await prisma.cartao.update({
      where: { id: req.params.cardId },
      data: { frente, verso, imagem_url }
    });

    res.json(atualizado);
  } catch (error) {
    console.error(error);
    res.status(500).json({ erro: 'Erro ao editar cartão.' });
  }
});

// ==========================================
// DELETAR CARTÃO
// ==========================================
router.delete('/:cardId', autenticar, async (req, res) => {
  try {
    const cartao = await prisma.cartao.findFirst({
      where: {
        id: req.params.cardId,
        deck: { id: req.params.deckId, usuario_id: req.usuarioId }
      }
    });

    if (!cartao) {
      return res.status(404).json({ erro: 'Cartão não encontrado.' });
    }

    await prisma.cartao.delete({ where: { id: req.params.cardId } });

    res.json({ mensagem: 'Cartão deletado com sucesso.' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ erro: 'Erro ao deletar cartão.' });
  }
});

module.exports = router;