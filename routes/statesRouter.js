const express = require('express');
const router = express.Router();

// Route for getting states with a total population over 10 million
router.get('/states', (req, res) => {
  const collection = req.app.locals.db.collection('US-zips-data'); // Replace 'yourCollectionName' with the actual name of your collection

  collection.aggregate([
    {
      $group: {
        _id: '$state_name',
        totalPopulation: { $sum: '$population' }
      }
    },
    {
      $match: {
        totalPopulation: { $gt: 10000000 }
      }
    }
  ]).toArray((err, result) => {
    if (err) {
      console.error('Error retrieving states:', err);
      res.status(500).json({ error: 'An error occurred' });
    } else {
      const states = result.map(state => state._id);
      res.json(states);
    }
  });
});

module.exports = router;
