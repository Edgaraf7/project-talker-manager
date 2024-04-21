const express = require('express');
const talkerRouter = require('./routes/talkerRoutes');
const loginRouter = require('./routes/loginRoutes');

const app = express();
app.use(express.json());

const HTTP_OK_STATUS = 200;

app.use('/talker', talkerRouter);
app.use('/login', loginRouter);

// não remova esse endpoint, e para o avaliador funcionar
app.get('/', (_request, response) => {
  response.status(HTTP_OK_STATUS).send();
});

const PORT = process.env.PORT || '3001';
app.listen(PORT, () => {
  console.log('Online');
});
