const Pile = require('../models/pile');

module.exports = {
    createPile,
    getAllPiles,
    deletePile
};

async function createPile(req, res) {
    try {
        const pile = new Pile({
            ...req.body,
            createdBy: req.user._id
        });
        await pile.save();
        res.json(pile);
    } catch (err) {
        console.error('Error creating pile:', err);
        res.status(400).json(err);
    }
}

async function getAllPiles(req, res) {
    try {
        const piles = await Pile.find({ createdBy: req.user._id }).sort({ createdAt: -1 });
        res.json(piles);
    } catch (err) {
        console.error('Error fetching piles:', err);
        res.status(400).json(err);
    }
}

async function deletePile(req, res) {
    try {
        const pile = await Pile.findOneAndDelete({ 
            _id: req.params.id, 
            createdBy: req.user._id 
        });
        if (!pile) {
            return res.status(404).json({ error: 'Pile not found' });
        }
        res.json(pile);
    } catch (err) {
        console.error('Error deleting pile:', err);
        res.status(400).json(err);
    }
}

