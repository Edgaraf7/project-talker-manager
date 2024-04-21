const { Router } = require('express');
const crypto = require('crypto');
const { validateEmail, validatePassword } = require('../middlewares/loginValidators');

const route = Router();

const validators = [validateEmail, validatePassword];

route.post('/', validators, (_req, res) => {
  const token = crypto.randomBytes(8).toString('hex');
  return res.status(200).json({ token });
});

module.exports = route;
