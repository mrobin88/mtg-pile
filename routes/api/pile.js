const express = require('express');
const router = express.Router();
const pileCtrl = require('../../controllers/piles');

/*---------- Public Routes ----------*/

/*---------- Protected Routes ----------*/
router.post('/create', require('../../config/auth'), pileCtrl.createPile);
router.get('/', require('../../config/auth'), pileCtrl.getAllPiles);
router.delete('/:id', require('../../config/auth'), pileCtrl.deletePile);

module.exports = router;