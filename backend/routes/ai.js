const express = require('express');
const { spawn } = require('child_process');
const path = require('path');
const fs = require('fs');
const csv = require('csv-parser');

const router = express.Router();

const DATA_FILE = path.join(
  __dirname,
  '../../ai/Agriculture_price_dataset.csv'
);


/* ---------- Dataset options cache ---------- */

let datasetOptions = [];


function loadDatasetOptions() {

  return new Promise((resolve, reject) => {

    const unique = new Set();

    fs.createReadStream(DATA_FILE)
      .pipe(csv())

      .on('data', (row) => {

        const commodity = row.Commodity?.trim();
        const state = row.STATE?.trim();
        const district = row['District Name']?.trim();
        const market = row['Market Name']?.trim();

        if (
          commodity &&
          state &&
          district &&
          market
        ) {

          unique.add(
            JSON.stringify({
              commodity,
              state,
              district,
              market
            })
          );

        }

      })

      .on('end', () => {

        datasetOptions = Array.from(unique)
          .map(item => JSON.parse(item));

        console.log(
          `AI dataset options loaded: ${datasetOptions.length} unique combinations`
        );

        resolve();

      })

      .on('error', reject);

  });

}


/* ---------- Dataset options API ---------- */

router.get('/options', (req, res) => {

  const {
    commodity,
    state,
    district
  } = req.query;


  let filtered = datasetOptions;


  if (commodity) {

    filtered = filtered.filter(
      item => item.commodity === commodity
    );

  }


  if (state) {

    filtered = filtered.filter(
      item => item.state === state
    );

  }


  if (district) {

    filtered = filtered.filter(
      item => item.district === district
    );

  }


  const commodities = [
    ...new Set(
      filtered.map(item => item.commodity)
    )
  ].sort();


  const states = [
    ...new Set(
      filtered.map(item => item.state)
    )
  ].sort();


  const districts = [
    ...new Set(
      filtered.map(item => item.district)
    )
  ].sort();


  const markets = [
    ...new Set(
      filtered.map(item => item.market)
    )
  ].sort();


  res.json({
    commodities,
    states,
    districts,
    markets
  });

});


/* ---------- Demand prediction API ---------- */

router.get('/demand', (req, res) => {

  const {
    commodity,
    state,
    district,
    market
  } = req.query;


  if (
    !commodity ||
    !state ||
    !district ||
    !market
  ) {

    return res.status(400).json({
      message:
        'commodity, state, district and market are required'
    });

  }


  const pythonScript = path.join(
    __dirname,
    '../../ai/predict_demand.py'
  );


  const python = spawn('python', [
    pythonScript,
    commodity,
    state,
    district,
    market
  ]);


  let output = '';
  let errorOutput = '';


  python.stdout.on('data', (data) => {

    output += data.toString();

  });


  python.stderr.on('data', (data) => {

    errorOutput += data.toString();

  });


  python.on('close', (code) => {

    if (code !== 0) {

      console.error(errorOutput);

      return res.status(500).json({
        message: 'AI prediction failed',
        error: errorOutput
      });

    }


    try {

      const result = JSON.parse(output);

      res.json(result);

    } catch (error) {

      console.error(output);

      res.status(500).json({
        message: 'Invalid AI prediction response'
      });

    }

  });

});


/* ---------- Load dataset when route file starts ---------- */

loadDatasetOptions()
  .catch((error) => {

    console.error(
      'Failed to load AI dataset:',
      error.message
    );

  });


module.exports = router;