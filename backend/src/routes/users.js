import express from 'express';
import * as queries from '../database/queries.js';

const router = express.Router();

// GET /api/users - Obter todos os usuários
router.get('/', (req, res) => {
  try {
    const users = queries.getAllUsers();
    res.json(users);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// GET /api/users/:id - Obter usuário por ID
router.get('/:id', (req, res) => {
  try {
    const user = queries.getUserById(req.params.id);
    if (!user) {
      return res.status(404).json({ error: 'Usuário não encontrado' });
    }
    res.json(user);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// POST /api/users - Criar novo usuário
router.post('/', (req, res) => {
  try {
    const user = queries.createUser(req.body);
    res.status(201).json(user);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// POST /api/users/login - Login
router.post('/login', (req, res) => {
  try {
    const { email, password } = req.body;
    const user = queries.getUserByEmail(email);
    
    if (!user) {
      return res.status(401).json({ error: 'Usuário ou senha inválidos' });
    }
    
    // Em produção: usar bcrypt.compare()
    if (user.password !== password) {
      return res.status(401).json({ error: 'Usuário ou senha inválidos' });
    }
    
    const updatedUser = queries.updateUser(user.id, {});
    res.json(updatedUser);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// PUT /api/users/:id - Atualizar usuário
router.put('/:id', (req, res) => {
  try {
    const user = queries.updateUser(req.params.id, req.body);
    if (!user) {
      return res.status(404).json({ error: 'Usuário não encontrado' });
    }
    res.json(user);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
