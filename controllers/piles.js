const Pile = require('../models/pile');

module.exports = {
    createPile
};

async function createPile(req, res) {
    const pile = new Pile(req.body);
    try{
        await pile.save();
    }catch (err) {
        res.status(400).json(err);
    }
}

