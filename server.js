const express = require('express');
const MongoClient = require('mongodb').MongoClient;

const app = express();
const port = 5500;
const mongoURI = 'mongodb://localhost:27017'; // Replace 'yourDatabaseName' with the actual name of your MongoDB database

// Connect to MongoDB
MongoClient.connect(mongoURI, { useUnifiedTopology: true })
  .then(client => {
    console.log('Connected to MongoDB');
    const db = client.db();

    // Define your routes here

    // Route for getting states with a total population over 10 million
    app.get('/states', (req, res) => {
      const collection = db.collection('US-zips-data'); // Replace 'yourCollectionName' with the actual name of your collection

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

    // Start the server
    app.listen(port, () => {
      console.log(`Server listening on port ${port}`);
    });
  })
  .catch(err => {
    console.error('Error connecting to MongoDB:', err);
  });
