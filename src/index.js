const express = require('express');
const fs = require('fs');
const path = require('path');

const app = express();
app.use(express.json());

const HTTP_OK_STATUS = 200;
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

app.get('/talker', (_req, res) => {
  const talkerData = loadTalkerData();
  res.status(HTTP_OK_STATUS).json(talkerData);
});
  
// não remova esse endpoint, e para o avaliador funcionar
app.get('/', (_request, response) => {
  response.status(HTTP_OK_STATUS).send();
});

app.listen(PORT, () => {
  console.log('Online');
});