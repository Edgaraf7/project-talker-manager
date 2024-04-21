const path = require('path');

const PATH_TO_TALKERS = path.resolve(__dirname, '..', 'talker.json');

const EMAIL_REGEX = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{1,}$/;
const DATE_REGEX = /\d{2}\/\d{2}\/\d{4}/;

module.exports = {
  PATH_TO_TALKERS,
  EMAIL_REGEX,
  DATE_REGEX,
};
