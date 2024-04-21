const { Router } = require('express');
const postValidators = require('../middlewares/postValidators');
const validateToken = require('../middlewares/auth');
const validateRate = require('../middlewares/rateValitor');
const queryFilters = require('../middlewares/queryFilters');
const talkerController = require('../controllers/talkerController');

const router = Router();

router.get('/', talkerController.getAllTalkers);

router.get('/db', talkerController.getTalkersFromDB);

router.get('/search', validateToken, queryFilters);

router.get('/:id', talkerController.getTalkerById);

router.post('/', validateToken, postValidators, talkerController.addNewTalker);

router.put('/:id', validateToken, postValidators, talkerController.updateTalker);

router.patch('/rate/:id', validateToken, validateRate, talkerController.patchTalkerId);

router.delete('/:id', validateToken, talkerController.deleteTalker);

module.exports = router;
