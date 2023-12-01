const express = require('express');
const path = require('path');
const fs = require('fs');
const crypto = require('crypto');

const app = express();
app.use(express.json());

const HTTP_OK_STATUS = 200;
const HTTP_BAD_REQUEST_STATUS = 400;
const PORT = process.env.PORT || 3002;
const TALKER_FILE_PATH = path.join(__dirname, 'talker.json');

const loadTalkerData = () => {
  try {
    const data = fs.readFileSync(TALKER_FILE_PATH, 'utf8');
    console.log('Conteúdo do arquivo:', data);
    const parsedData = JSON.parse(data);
    console.log('Dados parseados:', parsedData);
    return Array.isArray(parsedData) && parsedData.length > 0 ? parsedData : [];
  } catch (err) {
    console.error('Erro ao carregar dados do arquivo:', err);
    return [];
  }
};

// Middleware para validar o formato do email
const validateEmailFormat = (req, res, next) => {
  const { email } = req.body;
  if (!email || !email.trim()) {
    return res.status(HTTP_BAD_REQUEST_STATUS).json({
      message: 'O campo "email" é obrigatório',
    });
  }

  // Utilize uma expressão regular simples para validar o formato do email
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return res.status(HTTP_BAD_REQUEST_STATUS).json({
      message: 'O "email" deve ter o formato "email@email.com"',
    });
  }

  next();
};

// Middleware para validar a senha
const validatePassword = (req, res, next) => {
  const { password } = req.body;
  if (!password || !password.trim()) {
    return res.status(HTTP_BAD_REQUEST_STATUS).json({
      message: 'O campo "password" é obrigatório',
    });
  }

  if (password.length < 6) {
    return res.status(HTTP_BAD_REQUEST_STATUS).json({
      message: 'O "password" deve ter pelo menos 6 caracteres',
    });
  }

  next();
};

// Endpoint para obter todas as pessoas palestrantes
app.get('/talker', (_req, res) => {
  const talkerData = loadTalkerData();
  res.status(HTTP_OK_STATUS).json(talkerData);
});

// Endpoint para obter uma pessoa palestrante por ID
app.get('/talker/:id', (req, res) => {
  const talkerId = parseInt(req.params.id, 10);
  const talkerData = loadTalkerData();
  const foundTalker = talkerData.find((talker) => talker.id === talkerId);

  if (foundTalker) {
    res.status(HTTP_OK_STATUS).json(foundTalker);
  } else {
    res.status(404).json({ message: 'Pessoa palestrante não encontrada' });
  }
});

app.post('/login', validateEmailFormat, validatePassword, (req, res) => {
  const randomToken = crypto.randomBytes(8).toString('hex');
  res.status(HTTP_OK_STATUS).json({ token: randomToken });
});
// Não remova esse endpoint, e para o avaliador funcionar
app.get('/', (_request, response) => {
  response.status(HTTP_OK_STATUS).send();
});

app.listen(PORT, () => {
  console.log('Online');
});
