const utils = require('../utils/utils');
const { DATE_REGEX } = require('../utils/consts');

const rateFilter = (req, res, next) => {
  const { rate } = req.query;
  const data = utils.readTalkersList();

  if (rate === undefined) {
    req.body.data = data;
    next();
  }

  const rateNumber = Number(rate);

  if (!Number.isInteger(rateNumber) || rateNumber > 5 || rateNumber < 1) {
    return res.status(400)
      .json({ message: 'O campo "rate" deve ser um número inteiro entre 1 e 5' });
  }

  req.body.data = data.filter(({ talk }) => talk.rate === rateNumber);
  next();
};

const dateFilter = (req, res, next) => {
  const { date } = req.query;
  const { data } = req.body;

  if (date === undefined || date.trim() === '') {
    next();
  }

  if (!DATE_REGEX.test(date)) {
    return res.status(400).json({ message: 'O parâmetro "date" deve ter o formato "dd/mm/aaaa"' });
  }

  req.body.data = data.filter(({ talk }) => talk.watchedAt === date);
  next();
};

const nameFilter = (req, res) => {
  const { q } = req.query;
  const { data } = req.body;

  if (!q) return res.status(200).json(data);

  const searchedData = data.filter(({ name }) => name.toLowerCase().includes(q.toLowerCase()));

  return res.status(200).json(searchedData);
};

const queryFilters = [rateFilter, dateFilter, nameFilter];

module.exports = queryFilters;
