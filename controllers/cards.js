const Pile = require('../models/pile');

module.exports = {
create
};

function create (req, res){
    console.log(req.body)
    const pile = new Pile(req.body)
    try {
        await pile.save();
      } catch (err) {
        console.log(err);
        res.status(400).json(err);
      }
    }

