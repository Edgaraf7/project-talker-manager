const express = require('express');
const fs = require('fs').promises;
const crypto = require('crypto');

const app = express();
app.use(express.json());

const HTTP_OK_STATUS = 200;
const HTTP_BAD_REQUEST_STATUS = 400;
const HTTP_NOT_FOUND_STATUS = 404;
const HTTP_UNAUTHORIZED_STATUS = 401;
const HTTP_CREATED_STATUS = 201;
const PORT = process.env.PORT || '3001';
function isTokenValid(token) {
  return token && token.length === 16;
}

function isDateValid(date) {
  return /^\d{2}\/\d{2}\/\d{4}$/.test(date);
}

function isRateValid(rate) {
  return typeof rate === 'number' && Number.isInteger(rate) && rate >= 1 && rate <= 5;
}

function validateTalkDetails({ watchedAt, rate }) {
  if (!watchedAt) return 'O campo "watchedAt" é obrigatório';
  if (!isDateValid(watchedAt)) return 'O campo "watchedAt" deve ter o formato "dd/mm/aaaa"';
  if (rate === undefined) return 'O campo "rate" é obrigatório';
  if (!isRateValid(rate)) return 'O campo "rate" deve ser um número inteiro entre 1 e 5';
  return null;
}

async function readTalkerFile() {
  try {
    const data = await fs.readFile('src/talker.json', 'utf8');
    return JSON.parse(data);
  } catch (error) {
    console.error('Erro ao ler o arquivo:', error.message);
    return [];
  }
}

async function writeTalkerFile(data) {
  try {
    await fs.writeFile('src/talker.json', JSON.stringify(data));
  } catch (error) {
    console.error('Erro ao escrever no arquivo:', error.message);
  }
}

app.get('/talker', async (_request, response) => {
  const talkers = await readTalkerFile();
  response.status(HTTP_OK_STATUS).json(talkers);
});
async function handleTalkerSearch(request, response) {
  const { q: searchTerm } = request.query;
  const { authorization: token } = request.headers;

  if (!token) {
    return response.status(HTTP_UNAUTHORIZED_STATUS).json({ message: 'Token não encontrado' });
  }
  if (!isTokenValid(token)) {
    return response.status(HTTP_UNAUTHORIZED_STATUS).json({ message: 'Token inválido' });
  }

  const talkers = await readTalkerFile();

  if (!searchTerm) {
    return response.status(HTTP_OK_STATUS).json(talkers);
  }

  const filteredTalkers = talkers.filter((talker) => talker.name.includes(searchTerm));
  response.status(HTTP_OK_STATUS).json(filteredTalkers);
}

app.get('/talker/search', handleTalkerSearch);

app.get('/talker/:id', async (request, response) => {
  const { id } = request.params;
  const talkers = await readTalkerFile();

  const talker = talkers.find((t) => t.id === parseInt(id, 10));

  if (!talker) {
    return response
      .status(HTTP_NOT_FOUND_STATUS).json({ message: 'Pessoa palestrante não encontrada' });
  }

  response.status(HTTP_OK_STATUS).json(talker);
});

function validateEmail(email) {
  const emailRegex = /^\S+@\S+\.\S+$/;
  if (!email) {
    return 'O campo "email" é obrigatório';
  }
  if (!emailRegex.test(email)) {
    return 'O "email" deve ter o formato "email@email.com"';
  }
  return null;
}

function validatePassword(password) {
  if (!password) {
    return 'O campo "password" é obrigatório';
  }
  if (password.length < 6) {
    return 'O "password" deve ter pelo menos 6 caracteres';
  }
  return null;
}

app.post('/login', (request, response) => {
  const { email, password } = request.body;
  
  const emailError = validateEmail(email);
  if (emailError) {
    return response.status(HTTP_BAD_REQUEST_STATUS).json({ message: emailError });
  }

  const passwordError = validatePassword(password);
  if (passwordError) {
    return response.status(HTTP_BAD_REQUEST_STATUS).json({ message: passwordError });
  }

  const token = crypto.randomBytes(8).toString('hex');
  response.status(HTTP_OK_STATUS).json({ token });
});

function validateName(name) {
  if (!name) return 'O campo "name" é obrigatório';
  if (name.length < 3) return 'O "name" deve ter pelo menos 3 caracteres';
  return null;
}

function validateAge(age) {
  if (age === undefined) return 'O campo "age" é obrigatório';
  if (typeof age !== 'number' || !Number.isInteger(age) || age < 18) {
    return 'O campo "age" deve ser um número inteiro igual ou maior que 18';
  }
  return null;
}
function validateTalk(talk) {
  if (!talk) return 'O campo "talk" é obrigatório';
  return validateTalkDetails(talk);
}
function validateTalkerInput(name, age, talk) {
  return validateName(name) || validateAge(age) || validateTalk(talk);
}
async function createNewTalker(name, age, talk) {
  const talkers = await readTalkerFile();
  const newTalker = { id: talkers.length + 1, name, age, talk };
  talkers.push(newTalker);
  await writeTalkerFile(talkers);
  return newTalker;
}
app.post('/talker', async (request, response) => {
  const { authorization: token } = request.headers;
  if (!token) {
    return response.status(HTTP_UNAUTHORIZED_STATUS).json({ message: 'Token não encontrado' });
  }
  if (!isTokenValid(token)) {
    return response.status(HTTP_UNAUTHORIZED_STATUS).json({ message: 'Token inválido' });
  }

  const { name, age, talk } = request.body;
  const errorMessage = validateTalkerInput(name, age, talk);
  if (errorMessage) {
    return response.status(HTTP_BAD_REQUEST_STATUS).json({ message: errorMessage });
  }

  const newTalker = await createNewTalker(name, age, talk);
  response.status(HTTP_CREATED_STATUS).json(newTalker);
});
function validateInput(name, age, talk) {
  return validateName(name) || validateAge(age) || validateTalk(talk);
}

app.put('/talker/:id', async (request, response) => {
  const { id } = request.params;
  const { name, age, talk } = request.body;
  const { authorization: token } = request.headers;
  if (!token) {
    return response.status(HTTP_UNAUTHORIZED_STATUS).json({ message: 'Token não encontrado' });
  } if (!isTokenValid(token)) {
    return response.status(HTTP_UNAUTHORIZED_STATUS).json({ message: 'Token inválido' });
  } const validationError = validateInput(name, age, talk);
  if (validationError) {
    return response.status(HTTP_BAD_REQUEST_STATUS).json({ message: validationError });
  } const talkers = await readTalkerFile();
  const talkerIndex = talkers.findIndex((t) => t.id === parseInt(id, 10));
  if (talkerIndex === -1) {
    return response
      .status(HTTP_NOT_FOUND_STATUS).json({ message: 'Pessoa palestrante não encontrada' });
  } talkers[talkerIndex] = { ...talkers[talkerIndex], name, age, talk };
  await writeTalkerFile(talkers);
  response.status(HTTP_OK_STATUS).json(talkers[talkerIndex]);
});

app.delete('/talker/:id', async (request, response) => {
  const { id } = request.params;
  const { authorization: token } = request.headers;
  if (!token) {
    return response.status(HTTP_UNAUTHORIZED_STATUS).json({ message: 'Token não encontrado' });
  } if (!isTokenValid(token)) {
    return response.status(HTTP_UNAUTHORIZED_STATUS).json({ message: 'Token inválido' });
  }
  const talkers = await readTalkerFile();
  const talkerIndex = talkers.findIndex((t) => t.id === parseInt(id, 10));  
  if (talkerIndex === -1) {
    return response.status(HTTP_NOT_FOUND_STATUS).json({
      message: 'Pessoa palestrante não encontrada' });
  }

  talkers.splice(talkerIndex, 1);
  await writeTalkerFile(talkers);
 
  response.status(204).send();
});

// Não remova esse endpoint, é para o avaliador funcionar
app.get('/', (_request, response) => {
  response.status(HTTP_OK_STATUS).send();
});

app.listen(PORT, () => {
  console.log('Online');
});