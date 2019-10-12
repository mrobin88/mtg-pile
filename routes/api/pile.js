const express = require('express');
const router = express.Router();
const pileCtrl = require('../../controllers/piles');

/*---------- Public Routes ----------*/

/*---------- Protected Routes ----------*/
router.post('/create', pileCtrl.createPile);




module.exports = router;