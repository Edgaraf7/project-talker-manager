const talkerDB = require('../db/talkerDB');
const utils = require('../utils/utils');

const getAllTalkers = (_req, res) => {
  const data = utils.readTalkersList();
  return res.status(200).json(data);
};

const getTalkerById = (req, res) => {
  const { id } = req.params;
  const data = utils.readTalkersList();

  const talker = data.find((t) => t.id === parseInt(id, 10));
  if (!talker) return res.status(404).json({ message: 'Pessoa palestrante não encontrada' });

  return res.status(200).json(talker);
};

const getTalkersFromDB = async (_req, res) => {
  try {
    const [result] = await talkerDB.findAll();
    const talkerList = utils.formatList(result);
    res.status(200).json(talkerList);
  } catch (e) {
    res.status(500).json({ message: `Something went wrong: ${e.sqlMessage}` });
  }
};

const addNewTalker = (req, res) => {
  const talker = req.body;
  const data = utils.readTalkersList();

  const newTalker = { id: data.length + 1, ...talker };

  data.push(newTalker);
  utils.writeToTalkersList(data);

  return res.status(201).json(newTalker);
};

const updateTalker = (req, res) => {
  const { id } = req.params;
  const idNumber = parseInt(id, 10);
  const data = utils.readTalkersList();

  const talker = data.find((t) => t.id === idNumber);
  if (!talker) res.status(404).json({ message: 'Pessoa palestrante não encontrada' });

  const editedData = data.reduce((acc, currTalker) => {
    if (currTalker.id === idNumber) return [...acc, { id: idNumber, ...req.body }];
    return [...acc, currTalker];
  }, []);

  utils.writeToTalkersList(editedData);
  return res.status(200).json({ id: idNumber, ...req.body });
};

const deleteTalker = (req, res) => {
  const { id } = req.params;
  const idNumber = parseInt(id, 10);
  const data = utils.readTalkersList();

  const newData = data.filter((d) => d.id !== idNumber);

  utils.writeToTalkersList(newData);

  res.status(204).end();
};

const patchTalkerId = (req, res) => {
  const { id } = req.params;
  const { rate } = req.body;
  const data = utils.readTalkersList();
  const editedData = data.reduce((acc, currTalker) => {
    if (currTalker.id === +id) {
      return [...acc, { ...currTalker, talk: { ...currTalker.talk, rate } }];
    }
    return [...acc, currTalker];
  }, []);
  utils.writeToTalkersList(editedData);
  return res.status(204).end();
};

module.exports = {
  getAllTalkers,
  getTalkerById,
  getTalkersFromDB,
  addNewTalker,
  updateTalker,
  deleteTalker,
  patchTalkerId,
};
