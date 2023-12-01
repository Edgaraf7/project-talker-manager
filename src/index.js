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
// Middleware para verificar o token de autenticação
const authenticateToken = (req, res, next) => {
  const token = req.headers.authorization;

  if (!token) {
    return res.status(401).json({ message: 'Token não encontrado' });
  }

  if (typeof token !== 'string' || token.length !== 16) {
    return res.status(401).json({ message: 'Token inválido' });
  }

  next();
};

// Middleware para validar o formato da data (dd/mm/aaaa)
const isValidDate = (dateString) => {
  const dateRegex = /^\d{2}\/\d{2}\/\d{4}$/;
  return dateRegex.test(dateString);
};

// Endpoint para obter todas as pessoas palestrantes
// eslint-disable-next-line max-lines-per-function, complexity, sonarjs/cognitive-complexity
app.post('/talker', authenticateToken, (req, res) => {
  const { name, age, talk } = req.body;

  // Validando o campo "name"
  if (!name || name.trim().length < 3) {
    if (!name) {
      return res.status(HTTP_BAD_REQUEST_STATUS).json({
        message: 'O campo "name" é obrigatório',
      });
    } 
    return res.status(HTTP_BAD_REQUEST_STATUS).json({
      message: 'O "name" deve ter pelo menos 3 caracteres',
    });
  }
  // Validando o campo "age"
  // eslint-disable-next-line no-restricted-globals
  if (!age && age !== 0) {
    return res.status(HTTP_BAD_REQUEST_STATUS).json({
      message: 'O campo "age" é obrigatório',
    });
  }
  
  // eslint-disable-next-line no-restricted-globals
  if (isNaN(age) || age < 18 || !Number.isInteger(age)) {
    return res.status(HTTP_BAD_REQUEST_STATUS).json({
      message: 'O campo "age" deve ser um número inteiro igual ou maior que 18',
    });
  } 

  // Validando o campo "talk"
  if (!talk || typeof talk !== 'object') {
    return res.status(HTTP_BAD_REQUEST_STATUS).json({
      message: 'O campo "talk" é obrigatório',
    });
  }

  // Validando a chave "watchedAt"
  const { watchedAt, rate } = talk;

  if (!watchedAt) {
    return res.status(HTTP_BAD_REQUEST_STATUS).json({
      message: 'O campo "watchedAt" é obrigatório',
    });
  }
  
  if (!isValidDate(watchedAt)) {
    return res.status(HTTP_BAD_REQUEST_STATUS).json({
      message: 'O campo "watchedAt" deve ter o formato "dd/mm/aaaa"',
    });
  }

  // Validando a chave "rate"
  // eslint-disable-next-line no-restricted-globals

  if (!rate && rate !== 0) {
    return res.status(HTTP_BAD_REQUEST_STATUS).json({
      message: 'O campo "rate" é obrigatório',
    });
  }
  
  // eslint-disable-next-line no-restricted-globals
  if (isNaN(rate) || rate < 1 || rate > 5 || !Number.isInteger(rate)) {
    return res.status(HTTP_BAD_REQUEST_STATUS).json({
      message: 'O campo "rate" deve ser um número inteiro entre 1 e 5',
    });
  }

  // Carregando dados atuais e criando nova pessoa palestrante
  const talkerData = loadTalkerData();
  const newTalker = {
    id: talkerData.length + 1,
    name,
    age,
    talk: { watchedAt, rate },
  };

  // Adicionando a nova pessoa palestrante aos dados
  talkerData.push(newTalker);

  // Salvando os dados atualizados no arquivo
  fs.writeFileSync(TALKER_FILE_PATH, JSON.stringify(talkerData, null, 2), 'utf8');

  // Retornando a pessoa palestrante cadastrada
  res.status(201).json(newTalker);
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
