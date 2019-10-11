const express = require('express');
const router = express.Router();
const cardCtrl = require('../../controllers/cards');

/*---------- Public Routes ----------*/

/*---------- Protected Routes ----------*/
router.post('/add', cardCtrl.create);




module.exports = router;