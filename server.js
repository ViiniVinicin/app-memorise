require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');         // ← adicione
const nodemailer = require('nodemailer');

const prisma = new PrismaClient();
const app = express();

app.use(cors());
app.use(express.json());

function stripNullChars(value) {
  return typeof value === 'string' ? value.replace(/\u0000/g, '') : value;
}

function cleanText(value) {
  return typeof value === 'string' ? stripNullChars(value).trim() : value;
}

function cleanEmail(value) {
  return typeof value === 'string'
    ? stripNullChars(value).trim().toLowerCase()
    : value;
}

function cleanPassword(value) {
  return typeof value === 'string' ? stripNullChars(value) : value;
}

// ==========================================
// AUTH MIDDLEWARE
// ==========================================
function authenticate(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

  if (!token) {
    return res.status(401).json({ error: 'No token provided.' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.userId = decoded.id;
    next();
  } catch (error) {
    return res.status(403).json({ error: 'Invalid token.' });
  }
}

// ==========================================
// ADMIN MIDDLEWARE
// ==========================================
async function authorizeAdmin(req, res, next) {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.userId },
      select: { role: true }
    });

    if (!user || user.role !== 'admin') {
      return res.status(403).json({ error: 'Access denied. Admins only.' });
    }

    next();
  } catch (error) {
    return res.status(500).json({ error: 'Error checking permissions.' });
  }
}

// ==========================================
// BASE ROUTE
// ==========================================
app.get('/', (req, res) => {
  res.json({ message: 'Welcome to the MemoRise API!' });
});

// ==========================================
// AUTH ROUTES
// ==========================================

// Register
app.post('/register', async (req, res) => {
  try {
    const name = cleanText(req.body.name);
    const email = cleanEmail(req.body.email);
    const password = cleanPassword(req.body.password);

    if (!name || !email || !password) {
      return res.status(400).json({ error: 'Name, email and password are required.' });
    }

    const existingUser = await prisma.user.findUnique({
      where: { email }
    });

    if (existingUser) {
      return res.status(400).json({ error: 'This email is already registered.' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    await prisma.user.create({
      data: {
        name,
        email,
        password_hash: hashedPassword
      }
    });

    res.status(201).json({ message: 'User created successfully!' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal error while registering user.' });
  }
});

// Login
app.post('/login', async (req, res) => {
  try {
    const email = cleanEmail(req.body.email);
    const password = cleanPassword(req.body.password);

    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required.' });
    }

    const user = await prisma.user.findUnique({
      where: { email }
    });

    if (!user) {
      return res.status(404).json({ error: 'User not found.' });
    }

    const validPassword = await bcrypt.compare(password, user.password_hash);

    if (!validPassword) {
      return res.status(401).json({ error: 'Incorrect password.' });
    }

    const token = jwt.sign(
      { id: user.id, email: user.email },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.json({
      message: 'Login successful!',
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        dark_theme: user.dark_theme,
        created_at: user.created_at
      }
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal error while logging in.' });
  }
});

// Get current logged in user
app.get('/me', authenticate, async (req, res) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.userId },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        dark_theme: true,
        created_at: true,
        _count: {
          select: { decks: true }
        }
      }
    });

    if (!user) {
      return res.status(404).json({ error: 'User not found.' });
    }

    res.json(user);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error fetching user.' });
  }
});

// Get all users — admin only
app.get('/users', authenticate, authorizeAdmin, async (req, res) => {
  try {
    const users = await prisma.user.findMany({
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        dark_theme: true,
        created_at: true,
        _count: {
          select: { decks: true }
        }
      },
      orderBy: { created_at: 'desc' }
    });

    res.json(users);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error fetching users.' });
  }
});

// Update current user profile
app.put('/me', authenticate, async (req, res) => {
  try {
    const name = req.body.name !== undefined ? cleanText(req.body.name) : undefined;
    const email = req.body.email !== undefined ? cleanEmail(req.body.email) : undefined;
    const { dark_theme } = req.body;

    const user = await prisma.user.update({
      where: { id: req.userId },
      data: {
        ...(name && { name }),
        ...(email && { email }),
        ...(dark_theme !== undefined && { dark_theme })
      },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        dark_theme: true,
        created_at: true
      }
    });

    res.json({ message: 'Profile updated successfully!', user });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error updating profile.' });
  }
});

// Update password
app.put('/me/password', authenticate, async (req, res) => {
  try {
    const current_password = cleanPassword(req.body.current_password);
    const new_password = cleanPassword(req.body.new_password);

    if (!current_password || !new_password) {
      return res.status(400).json({ error: 'Current and new password are required.' });
    }

    const user = await prisma.user.findUnique({
      where: { id: req.userId }
    });

    const validPassword = await bcrypt.compare(current_password, user.password_hash);

    if (!validPassword) {
      return res.status(401).json({ error: 'Current password is incorrect.' });
    }

    const hashedPassword = await bcrypt.hash(new_password, 10);

    await prisma.user.update({
      where: { id: req.userId },
      data: { password_hash: hashedPassword }
    });

    res.json({ message: 'Password updated successfully!' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error updating password.' });
  }
});

// Delete account
app.delete('/me', authenticate, async (req, res) => {
  try {
    await prisma.user.delete({
      where: { id: req.userId }
    });

    res.json({ message: 'Account deleted successfully.' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error deleting account.' });
  }
});

// ==========================================
// DECK ROUTES
// ==========================================

// List all decks
app.get('/decks', authenticate, async (req, res) => {
  try {
    const decks = await prisma.deck.findMany({
      where: { user_id: req.userId },
      include: {
        _count: { select: { cards: true } }
      },
      orderBy: { created_at: 'desc' }
    });

    res.json(decks);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error fetching decks.' });
  }
});

// Create deck
app.post('/decks', authenticate, async (req, res) => {
  try {
    const { title, color, icon } = req.body;

    if (!title) {
      return res.status(400).json({ error: 'Deck title is required.' });
    }

    const deck = await prisma.deck.create({
      data: {
        title,
        color: color || '#CCCCCC',
        icon: icon || null,
        user_id: req.userId
      }
    });

    res.status(201).json(deck);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error creating deck.' });
  }
});

// Get deck by ID
app.get('/decks/:id', authenticate, async (req, res) => {
  try {
    const deck = await prisma.deck.findFirst({
      where: {
        id: req.params.id,
        user_id: req.userId
      },
      include: {
        cards: true,
        _count: { select: { cards: true } }
      }
    });

    if (!deck) {
      return res.status(404).json({ error: 'Deck not found.' });
    }

    res.json(deck);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error fetching deck.' });
  }
});

// Update deck
app.put('/decks/:id', authenticate, async (req, res) => {
  try {
    const { title, color, icon } = req.body;

    const deckExists = await prisma.deck.findFirst({
      where: { id: req.params.id, user_id: req.userId }
    });

    if (!deckExists) {
      return res.status(404).json({ error: 'Deck not found.' });
    }

    const deck = await prisma.deck.update({
      where: { id: req.params.id },
      data: { title, color, icon }
    });

    res.json(deck);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error updating deck.' });
  }
});

// Delete deck
app.delete('/decks/:id', authenticate, async (req, res) => {
  try {
    const deckExists = await prisma.deck.findFirst({
      where: { id: req.params.id, user_id: req.userId }
    });

    if (!deckExists) {
      return res.status(404).json({ error: 'Deck not found.' });
    }

    await prisma.deck.delete({ where: { id: req.params.id } });

    res.json({ message: 'Deck deleted successfully.' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error deleting deck.' });
  }
});

// ==========================================
// CARD ROUTES
// ==========================================

// List cards from a deck
app.get('/decks/:deckId/cards', authenticate, async (req, res) => {
  try {
    const deck = await prisma.deck.findFirst({
      where: { id: req.params.deckId, user_id: req.userId }
    });

    if (!deck) {
      return res.status(404).json({ error: 'Deck not found.' });
    }

    const cards = await prisma.card.findMany({
      where: { deck_id: req.params.deckId },
      orderBy: { next_review: 'asc' }
    });

    res.json(cards);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error fetching cards.' });
  }
});

// Create card
app.post('/decks/:deckId/cards', authenticate, async (req, res) => {
  try {
    const { front, back, image_url } = req.body;

    if (!front || !back) {
      return res.status(400).json({ error: 'Front and back are required.' });
    }

    const deck = await prisma.deck.findFirst({
      where: { id: req.params.deckId, user_id: req.userId }
    });

    if (!deck) {
      return res.status(404).json({ error: 'Deck not found.' });
    }

    const card = await prisma.card.create({
      data: {
        front,
        back,
        image_url: image_url || null,
        deck_id: req.params.deckId
      }
    });

    res.status(201).json(card);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error creating card.' });
  }
});

// Update card
app.put('/decks/:deckId/cards/:cardId', authenticate, async (req, res) => {
  try {
    const { front, back, image_url } = req.body;

    const card = await prisma.card.findFirst({
      where: {
        id: req.params.cardId,
        deck: { id: req.params.deckId, user_id: req.userId }
      }
    });

    if (!card) {
      return res.status(404).json({ error: 'Card not found.' });
    }

    const updatedCard = await prisma.card.update({
      where: { id: req.params.cardId },
      data: { front, back, image_url }
    });

    res.json(updatedCard);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error updating card.' });
  }
});

// Delete card
app.delete('/decks/:deckId/cards/:cardId', authenticate, async (req, res) => {
  try {
    const card = await prisma.card.findFirst({
      where: {
        id: req.params.cardId,
        deck: { id: req.params.deckId, user_id: req.userId }
      }
    });

    if (!card) {
      return res.status(404).json({ error: 'Card not found.' });
    }

    await prisma.card.delete({ where: { id: req.params.cardId } });

    res.json({ message: 'Card deleted successfully.' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error deleting card.' });
  }
});

// ==========================================
// STUDY ROUTES
// ==========================================

// Get cards due for review today
app.get('/decks/:deckId/study', authenticate, async (req, res) => {
  try {
    const deck = await prisma.deck.findFirst({
      where: { id: req.params.deckId, user_id: req.userId }
    });

    if (!deck) {
      return res.status(404).json({ error: 'Deck not found.' });
    }

    const now = new Date();

    const cards = await prisma.card.findMany({
      where: {
        deck_id: req.params.deckId,
        next_review: { lte: now }
      },
      orderBy: { next_review: 'asc' }
    });

    res.json({ cards, total: cards.length });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error fetching cards for study.' });
  }
});

// Review a card (correct or incorrect)
app.post('/decks/:deckId/cards/:cardId/review', authenticate, async (req, res) => {
  try {
    const { result } = req.body; // "correct" or "incorrect"

    if (!['correct', 'incorrect'].includes(result)) {
      return res.status(400).json({ error: 'Result must be "correct" or "incorrect".' });
    }

    const card = await prisma.card.findFirst({
      where: {
        id: req.params.cardId,
        deck: { id: req.params.deckId, user_id: req.userId }
      }
    });

    if (!card) {
      return res.status(404).json({ error: 'Card not found.' });
    }

    // Spaced repetition algorithm (simplified SM-2)
    let { interval_days, easiness, streak } = card;

    if (result === 'correct') {
      streak += 1;

      if (streak === 1) interval_days = 1;
      else if (streak === 2) interval_days = 3;
      else interval_days = Math.round(interval_days * easiness);

      easiness = Math.max(1.3, easiness + 0.1);
    } else {
      streak = 0;
      interval_days = 1;
      easiness = Math.max(1.3, easiness - 0.2);
    }

    const next_review = new Date();
    next_review.setDate(next_review.getDate() + interval_days);

    const updatedCard = await prisma.card.update({
      where: { id: req.params.cardId },
      data: { interval_days, easiness, streak, next_review }
    });

    // Update today's study stats
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const todayStats = await prisma.statistic.findFirst({
      where: {
        user_id: req.userId,
        study_date: { gte: today, lt: tomorrow }
      }
    });

    if (todayStats) {
      await prisma.statistic.update({
        where: { id: todayStats.id },
        data: { cards_reviewed: { increment: 1 } }
      });
    } else {
      await prisma.statistic.create({
        data: {
          user_id: req.userId,
          cards_reviewed: 1
        }
      });
    }

    res.json({
      message: 'Review recorded successfully.',
      card: updatedCard
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error recording review.' });
  }
});

// ==========================================
// STATS ROUTES
// ==========================================

// Get dashboard summary
app.get('/stats/summary', authenticate, async (req, res) => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const todayStats = await prisma.statistic.findFirst({
      where: {
        user_id: req.userId,
        study_date: { gte: today, lt: tomorrow }
      }
    });

    const totalDecks = await prisma.deck.count({
      where: { user_id: req.userId }
    });

    const totalCards = await prisma.card.count({
      where: { deck: { user_id: req.userId } }
    });

    const now = new Date();
    const pendingCards = await prisma.card.count({
      where: {
        deck: { user_id: req.userId },
        next_review: { lte: now }
      }
    });

    res.json({
      cards_today: todayStats?.cards_reviewed || 0,
      total_decks: totalDecks,
      total_cards: totalCards,
      pending_cards: pendingCards
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error fetching summary.' });
  }
});

// Get study history (last 7 days)
app.get('/stats/history', authenticate, async (req, res) => {
  try {
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    sevenDaysAgo.setHours(0, 0, 0, 0);

    const stats = await prisma.statistic.findMany({
      where: {
        user_id: req.userId,
        study_date: { gte: sevenDaysAgo }
      },
      orderBy: { study_date: 'asc' }
    });

    res.json(stats);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error fetching history.' });
  }
});

// ==========================================
// FORGOT PASSWORD
// ==========================================
app.post('/forgot-password', async (req, res) => {
  try {
    const email = cleanEmail(req.body.email);

    if (!email) {
      return res.status(400).json({ error: 'Email is required.' });
    }

    const user = await prisma.user.findUnique({ where: { email } });

    // Sempre responde com sucesso para não expor quais e-mails existem
    if (!user) {
      return res.json({ message: 'If this email exists, a reset link was sent.' });
    }

    const token = crypto.randomBytes(32).toString('hex');
    const expiry = new Date(Date.now() + 1000 * 60 * 60); // 1 hora

    await prisma.user.update({
      where: { email },
      data: { reset_token: token, reset_token_expiry: expiry }
    });

    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: Number(process.env.SMTP_PORT) || 587,
      secure: false,
      requireTLS: true,
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS.replace(/\s/g, '') // remove espaços da senha de app
      }
    });

    // Verifica se a conexão está funcionando
    await transporter.verify();

    const resetUrl = `http://${process.env.EXPO_IP}:3000/redirect-reset?token=${token}`;

    await transporter.sendMail({
      from: `"MemoRise" <${process.env.SMTP_USER}>`,
      to: email,
      subject: 'Redefinição de senha — MemoRise',
      html: `
        <div style="font-family:sans-serif;max-width:480px;margin:auto;padding:32px">
          <h2 style="color:#2E2832">Redefinir sua senha</h2>
          <p style="color:#555">Recebemos uma solicitação para redefinir sua senha.</p>
          <a href="http://${process.env.EXPO_IP}:3000/redirect-reset?token=${token}"
            style="display:inline-block;padding:14px 28px;background:#D80E4E;
                    color:#ffffff;border-radius:8px;text-decoration:none;
                    font-weight:bold;font-size:16px;margin:16px 0">
            Redefinir senha
          </a>
          <p style="color:#888;font-size:12px;margin-top:24px">
            Link válido por 1 hora. Se não foi você, ignore este e-mail.
          </p>
        </div>
      `
    });

    res.json({ message: 'If this email exists, a reset link was sent.' });
  } catch (error) {
      console.error('ERRO FORGOT PASSWORD:', error); // ← troque o console.error
      res.status(500).json({ error: 'Error processing request.' });
  }
});

// ==========================================
// RESET PASSWORD
// ==========================================
app.post('/reset-password', async (req, res) => {
  try {
    const token = cleanText(req.body.token);
    const new_password = cleanPassword(req.body.new_password);

    if (!token || !new_password) {
      return res.status(400).json({ error: 'Token and new password are required.' });
    }

    const user = await prisma.user.findFirst({
      where: {
        reset_token: token,
        reset_token_expiry: { gt: new Date() }
      }
    });

    if (!user) {
      return res.status(400).json({ error: 'Invalid or expired token.' });
    }

    const hashedPassword = await bcrypt.hash(new_password, 10);

    await prisma.user.update({
      where: { id: user.id },
      data: {
        password_hash: hashedPassword,
        reset_token: null,
        reset_token_expiry: null
      }
    });

    res.json({ message: 'Password reset successfully.' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error resetting password.' });
  }
});

// ==========================================
// GOOGLE OAUTH
// ==========================================
app.post('/auth/google', async (req, res) => {
  try {
    const google_id = cleanText(req.body.google_id);
    const name = cleanText(req.body.name);
    const email = cleanEmail(req.body.email);

    if (!google_id || !email) {
      return res.status(400).json({ error: 'Google ID and email are required.' });
    }

    // Busca por google_id ou email (caso já exista conta normal)
    let user = await prisma.user.findFirst({
      where: { OR: [{ google_id }, { email }] }
    });

    if (user) {
      // Vincula google_id se ainda não tinha
      if (!user.google_id) {
        user = await prisma.user.update({
          where: { id: user.id },
          data: { google_id }
        });
      }
    } else {
      user = await prisma.user.create({
        data: {
          name,
          email,
          google_id,
          password_hash: crypto.randomBytes(32).toString('hex') // senha aleatória
        }
      });
    }

    const token = jwt.sign(
      { id: user.id, email: user.email },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.json({
      message: 'Login successful!',
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        dark_theme: user.dark_theme,
        created_at: user.created_at
      }
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error with Google authentication.' });
  }
});

app.get('/redirect-reset', (req, res) => {
  const { token } = req.query;
  const deepLink = `exp://${process.env.EXPO_IP}:8081/--/reset-password?token=${token}`;

  res.send(`
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="UTF-8">
        <meta http-equiv="refresh" content="3;url=${deepLink}">
        <title>MemoRise — Redirecionando...</title>
        <style>
          body { font-family: sans-serif; display: flex; flex-direction: column;
                 align-items: center; justify-content: center; height: 100vh;
                 background: #E0E9EE; margin: 0; }
          h2 { color: #2E2832; }
          p { color: #888; }
          a { display: inline-block; margin-top: 16px; padding: 12px 24px;
              background: #D80E4E; color: #fff; border-radius: 8px;
              text-decoration: none; font-weight: bold; }
        </style>
      </head>
      <body>
        <h2>Redirecionando para o MemoRise...</h2>
        <p>Abrindo o aplicativo automaticamente.</p>
        <a href="${deepLink}">Clique aqui se não abrir automaticamente</a>
      </body>
    </html>
  `);
});

const PORT = 3000;
app.listen(PORT, '0.0.0.0', () => {
  console.log(`Server running on port ${PORT}`);
});
