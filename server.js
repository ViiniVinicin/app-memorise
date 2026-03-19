require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

const prisma = new PrismaClient();
const app = express();

app.use(cors());
app.use(express.json());

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
    const { name, email, password } = req.body;

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
    const { email, password } = req.body;

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
    const { name, email, dark_theme } = req.body;

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
    const { current_password, new_password } = req.body;

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

const PORT = 3000;
app.listen(PORT, '0.0.0.0', () => {
  console.log(`Server running on port ${PORT}`);
});