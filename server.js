const express = require('express');
const mongodb = require('mongodb');
const cors = require('cors');
const app = express();
const port = 3000;
const mongoURL = 'mongodb://localhost:27017'; 
const dbName = 'admin';

app.use(cors());

app.get('/population/10-million', async (req, res) => {
    let client;
    try {
        client = await mongodb.MongoClient.connect(mongoURL);
        const db = client.db(dbName);
        const collection = db.collection('US-zips-data');

        const result = await collection
          .aggregate([
            {
              $group: {
                _id: '$state_name',
                totalPopulation: { $sum: '$population' },
              },
            },
            {
              $match: {
                totalPopulation: { $gt: 10000000 },
              },
            },
            {
              $project: {
                state_name: '$_id',
                totalPopulation: 1,
                _id: 0,
              },
            }
          ])
          .toArray();

        res.json(result);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'An error occurred' });
    } finally {
        client.close();
    }
});

app.get('/population/state-average', async (req, res) => {
  let client;
  try {
    client = await mongodb.MongoClient.connect(mongoURL);
    const db = client.db(dbName);
    const collection = db.collection('US-zips-data');

    const result = await collection.aggregate([
      {
        $group: {
          _id: {
            state_id: '$state_id',
            state_name: '$state_name',
            city: '$city'
          },
          population: {
            $sum: '$population',
          },
        },
      },
      {
        $group: {
          _id: '$_id.state_id',
          state_name: { $first: '$_id.state_name' },
          averageCityPopulation: {
            $avg: '$population',
          },
        },
      },
      {
        $project: {
          _id: 0,
          state_id: '$_id',
          state_name: 1,
          averageCityPopulation: { $round: ['$averageCityPopulation', 0] }
        },
      },
    ]).toArray();

    res.json(result);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'An error occurred' });
  } finally {
    client.close();
  }
});

app.get('/population/smallest-city', async (req, res) => {
  let client;
  try {
    client = await mongodb.MongoClient.connect(mongoURL);
    const db = client.db(dbName);
    const collection = db.collection('US-zips-data');

    const states = await collection.distinct('state_name');
    const result = [];

    for (const state of states) {
      const pipeline = [
        {
          $match: { state_name: state }
        },
        {
          $group: {
            _id: { city: "$city" },
            suma_populatie: { $sum: "$population" },
            lat: { $first: "$lat" }, 
            lng: { $first: "$lng" }
          }
        },
        {
          $sort: {
            suma_populatie: 1
          }
        },
        {
          $limit: 1
        }
      ];

      const stateResult = await collection.aggregate(pipeline).toArray();

      if (stateResult.length > 0) {
        const smallestCity = stateResult[0];
        result.push({
          state: state,
          city: smallestCity._id.city,
          population: smallestCity.suma_populatie,
          lat: smallestCity.lat,
          lng: smallestCity.lng
        });
      }
    }

    res.json(result);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'An error occurred' });
  } finally {
    if (client) {
      client.close();
    }
  }
});

app.get('/population/largest-city', async (req, res) => {
  let client;
  try {
    client = await mongodb.MongoClient.connect(mongoURL);
    const db = client.db(dbName);
    const collection = db.collection('US-zips-data');

    const states = await collection.distinct('state_name');
    const result = [];

    for (const state of states) {
      const pipeline = [
        {
          $match: { state_name: state }
        },
        {
          $group: {
            _id: { city: "$city" },
            suma_populatie: { $sum: "$population" },
            lat: { $first: "$lat" }, 
            lng: { $first: "$lng" }
          }
        },
        {
          $sort: {
            suma_populatie: -1
          }
        },
        {
          $limit: 1
        }
      ];

      const stateResult = await collection.aggregate(pipeline).toArray();

      if (stateResult.length > 0) {
        const largestCity = stateResult[0];
        result.push({
          state: state,
          city: largestCity._id.city,
          population: largestCity.suma_populatie,
          lat: largestCity.lat,
          lng: largestCity.lng
        });
      }
    }

    res.json(result);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'An error occurred' });
  } finally {
    if (client) {
      client.close();
    }
  }
});

app.get('/population/smallest-county', async (req, res) => {
  let client;
  try {
    client = await mongodb.MongoClient.connect(mongoURL);
    const db = client.db(dbName);
    const collection = db.collection('US-zips-data');

    const states = await collection.distinct('state_name');
    const result = [];

    for (const state of states) {
      const pipeline = [
        {
          $match: { state_name: state }
        },
        {
          $group: {
            _id: { county_fips: "$county_fips", county_name: "$county_name" },
            suma_populatie: { $sum: "$population" }
          }
        },
        {
          $sort: {
            suma_populatie: 1
          }
        },
        {
          $limit: 1
        }
      ];

      const stateResult = await collection.aggregate(pipeline).toArray();

      if (stateResult.length > 0) {
        const smallestCounty = stateResult[0];
        result.push({
          state: state,
          county_fips: smallestCounty._id.county_fips,
          county_name: smallestCounty._id.county_name,
          population: smallestCounty.suma_populatie,
        });
      }
    }

    res.json(result);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'An error occurred' });
  } finally {
    if (client) {
      client.close();
    }
  }
});

app.get('/population/largest-county', async (req, res) => {
  let client;
  try {
    client = await mongodb.MongoClient.connect(mongoURL);
    const db = client.db(dbName);
    const collection = db.collection('US-zips-data');

    const states = await collection.distinct('state_name');
    const result = [];

    for (const state of states) {
      const pipeline = [
        {
          $match: { state_name: state }
        },
        {
          $group: {
            _id: { county_fips: "$county_fips", county_name: "$county_name" },
            suma_populatie: { $sum: "$population" }
          }
        },
        {
          $sort: {
            suma_populatie: -1
          }
        },
        {
          $limit: 1
        }
      ];

      const stateResult = await collection.aggregate(pipeline).toArray();

      if (stateResult.length > 0) {
        const smallestCounty = stateResult[0];
        result.push({
          state: state,
          county_fips: smallestCounty._id.county_fips,
          county_name: smallestCounty._id.county_name,
          population: smallestCounty.suma_populatie,
        });
      }
    }

    res.json(result);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'An error occurred' });
  } finally {
    if (client) {
      client.close();
    }
  }
});

app.get('/zips/zips-near-willis', async (req, res) => {
  let client;
  try {
    client = await mongodb.MongoClient.connect(mongoURL);
    const db = client.db(dbName);
    const collection = db.collection('US-zips-data');

    const result = await collection.aggregate([
      {
        $geoNear: {
          near: {
            type: "Point",
            coordinates: [-87.635918, 41.878876]
          },
          distanceField: "distance",
          spherical: true
        }
      },
      {
        $project: {
          _id: 0,
          zipCode: "$zip",
          lat: 1,
          lng: 1
        }
      },
      {
        $limit: 20
      }
    ]).toArray();
    
    res.json(result);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'An error occurred', error: error.message });
  } finally {
    if (client) {
      client.close();
    }
  }
});

app.get('/population/population-near-statue', async (req, res) => {
  let client;
  try {
    client = await mongodb.MongoClient.connect(mongoURL);
    const db = client.db(dbName);
    const collection = db.collection('US-zips-data');

    const result = await collection.aggregate([
      {
        $geoNear: {
          near: {
            type: "Point",
            coordinates: [-74.044502, 40.689247]
          },
          distanceField: "dist",
          key: "location",
          spherical: true
        }
      },
      {
        $match: {
          dist: {
            $gte: 50000,
            $lte: 200000
          }
        }
      },
      {
        $group: {
          _id: null,
          totalPopulation: { $sum: "$population" }
        }
      },
      {
        $project: {
          _id: 0,
          totalPopulation: 1
        }
      }
    ]).toArray();

    res.json(result[0]);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'An error occurred', error: error.message });
  } finally {
    if (client) {
      client.close();
    }
  }
});

app.listen(port, () => {
    console.log(`Server running on port ${port}`);
});
