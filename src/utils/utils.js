const fs = require('fs');
const { PATH_TO_TALKERS } = require('./consts');

const readTalkersList = () => JSON.parse(fs.readFileSync(PATH_TO_TALKERS, 'utf-8'));

const writeToTalkersList = (newData) => {
  fs.writeFileSync(PATH_TO_TALKERS, JSON.stringify(newData, null, 2));
};

const formatList = (list) => list.map((r) => {
  const { name, age, id, talk_watched_at: watchedAt, talk_rate: rate } = r;
  return { name, age, id, talk: { watchedAt, rate } };
});

module.exports = {
  formatList,
  readTalkersList,
  writeToTalkersList,
};
