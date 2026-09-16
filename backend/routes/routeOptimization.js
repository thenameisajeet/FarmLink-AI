const express = require('express');
const axios = require('axios');
const { spawn } = require('child_process');
const path = require('path');
const Order = require('../models/Order');

const router = express.Router();

const NOMINATIM_URL =
  'https://nominatim.openstreetmap.org/search';

const OSRM_URL =
  'https://router.project-osrm.org';

const geocodeCache = new Map();


async function geocodeLocation(location) {

  const key = location.trim().toLowerCase();

  if (geocodeCache.has(key)) {
    return geocodeCache.get(key);
  }

  const response = await axios.get(
    NOMINATIM_URL,
    {
      params: {
        q: `${location}, India`,
        format: 'json',
        limit: 1
      },
      headers: {
        'User-Agent': 'FarmLink-AI-SIH-Demo/1.0'
      },
      timeout: 10000
    }
  );

  if (!response.data?.length) {
    throw new Error(
      `Could not locate "${location}"`
    );
  }

  const result = response.data[0];

  const coordinates = {
    latitude: Number(result.lat),
    longitude: Number(result.lon),
    displayName: result.display_name
  };

  geocodeCache.set(key, coordinates);

  return coordinates;
}


/* =========================================================
   OSRM ROAD MATRIX
========================================================= */

async function getRoadMatrix(locations) {

  const coordinateString =
    locations
      .map(
        location =>
          `${location.lon},${location.lat}`
      )
      .join(';');

  const response = await axios.get(
    `${OSRM_URL}/table/v1/driving/${coordinateString}`,
    {
      params: {
        annotations: 'duration,distance'
      },
      timeout: 30000
    }
  );

  const data = response.data;

  if (
    data.code !== 'Ok' ||
    !data.distances ||
    !data.durations
  ) {
    throw new Error(
      'OSRM could not create the road matrix'
    );
  }

  return {
    distances: data.distances,
    durations: data.durations
  };
}


/* =========================================================
   OSRM FINAL ROAD ROUTE
========================================================= */

async function getFinalRoute(
  locations
) {

  const coordinateString =
    locations
      .map(
        location =>
          `${location.lon},${location.lat}`
      )
      .join(';');

  const response = await axios.get(
    `${OSRM_URL}/route/v1/driving/${coordinateString}`,
    {
      params: {
        overview: 'full',
        geometries: 'geojson',
        steps: false
      },
      timeout: 30000
    }
  );

  const data = response.data;

  if (
    data.code !== 'Ok' ||
    !data.routes ||
    !data.routes.length
  ) {
    throw new Error(
      'OSRM could not calculate the final road route'
    );
  }

  const route = data.routes[0];

  return {
    distanceKm:
      route.distance / 1000,

    durationMinutes:
      route.duration / 60,

    geometry:
      route.geometry
  };
}


/* =========================================================
   OR-TOOLS
========================================================= */

function optimizeWithORTools(
  distanceMatrix,
  timeMatrix,
  orderQuantities,
  vehicle
) {

  return new Promise((resolve, reject) => {

    const python = spawn(
      'python',
      [
        'ai/models/route_optimization/optimize_farm_route.py'
      ],
      {
        cwd: path.resolve(
          __dirname,
          '../..'
        )
      }
    );

    let output = '';
    let errorOutput = '';

    python.stdout.on(
      'data',
      data => {
        output += data.toString();
      }
    );

    python.stderr.on(
      'data',
      data => {
        errorOutput += data.toString();
      }
    );

    python.on(
      'close',
      code => {

        if (code !== 0) {
          return reject(
            new Error(
              errorOutput ||
              'OR-Tools process failed'
            )
          );
        }

        try {
          resolve(
            JSON.parse(output)
          );
        } catch (error) {
          reject(
            new Error(
              'Invalid OR-Tools response: ' +
              output
            )
          );
        }

      }
    );

    python.stdin.write(
      JSON.stringify({
        distanceMatrix,
        timeMatrix,
        orderQuantities,
        vehicle
      })
    );

    python.stdin.end();
  });
}


/* =========================================================
   MULTI-ORDER ROUTE OPTIMIZATION
========================================================= */

router.post('/multi', async (req, res) => {

  try {

    const {
      orderIds,
      origin,
      vehicle
    } = req.body;


    /* ---------- Validate request ---------- */

    if (
      !Array.isArray(orderIds) ||
      orderIds.length === 0
    ) {

      return res.status(400).json({
        success: false,
        message:
          'At least one order is required'
      });

    }


    if (
      !origin ||
      typeof origin.latitude !== 'number' ||
      typeof origin.longitude !== 'number'
    ) {

      return res.status(400).json({
        success: false,
        message:
          'Valid GPS origin is required'
      });

    }


    /* ---------- Real MongoDB orders ---------- */

    const orders = await Order.find({
      _id: {
        $in: orderIds
      },

      orderStatus: {
        $in: [
          'CONFIRMED',
          'IN TRANSIT'
        ]
      }
    });


    if (
      orders.length !== orderIds.length
    ) {

      return res.status(400).json({
        success: false,
        message:
          'One or more selected orders are unavailable'
      });

    }


    /* ---------- Validate locations ---------- */

    const broadLocations = [
      'maharashtra',
      'india',
      'mumbai metropolitan region'
    ];


    for (const order of orders) {

      if (
        !order.deliveryLocation ||
        broadLocations.includes(
          order.deliveryLocation
            .trim()
            .toLowerCase()
        )
      ) {

        return res.status(400).json({
          success: false,
          message:
            `Order ${order.orderNumber} needs a specific delivery location`
        });

      }

    }


    /* ---------- Geocode deliveries ---------- */

    const destinations = [];


    for (const order of orders) {

      const coordinates =
        await geocodeLocation(
          order.deliveryLocation
        );

      destinations.push({
        order,
        coordinates
      });

      await new Promise(
        resolve =>
          setTimeout(resolve, 1100)
      );

    }


    /* ---------- Build locations ---------- */

    const locations = [

      {
        lat: origin.latitude,
        lon: origin.longitude
      },

      ...destinations.map(
        item => ({
          lat:
            item.coordinates.latitude,

          lon:
            item.coordinates.longitude
        })
      )

    ];


    /* ---------- Real road matrix ---------- */

    const matrix =
      await getRoadMatrix(
        locations
      );


    /* ---------- OR-Tools optimization ---------- */

    const orderQuantities = orders.map(
    order => Number(order.quantityKg || 0)
    );

    const optimized =
    await optimizeWithORTools(
        matrix.distances,
        matrix.durations,
        orderQuantities,
        vehicle || 'CAR'
    );


    if (!optimized.success) {

      return res.status(400).json(
        optimized
      );

    }


    /* ---------- Optimized order ---------- */

    const optimizedIndexes =
      optimized.route
        .filter(
          index => index !== 0
        );


    const stops =
      optimizedIndexes.map(
        index => {

          const item =
            destinations[index - 1];

          return {

            orderId:
              item.order._id,

            orderNumber:
              item.order.orderNumber,

            crop:
              item.order.items?.[0]?.crop || '',

            quantityKg:
              item.order.quantityKg,

            location:
              item.order.deliveryLocation,

            latitude:
              item.coordinates.latitude,

            longitude:
              item.coordinates.longitude

          };

        }
      );


    /* ---------- Build final optimized route ---------- */

    const finalLocations = [

      locations[0],

      ...optimizedIndexes.map(
        index => locations[index]
      )

    ];


    const finalRoute =
      await getFinalRoute(
        finalLocations
      );


    /* ---------- Response ---------- */

    res.json({

      success: true,

      optimization: {

        algorithm:
          'OR-Tools Vehicle Routing Optimization',

        matrixSource:
          'OSRM road network',

        routeSource:
          'OSRM road network',

        vehicle:
          vehicle || 'CAR',

        totalDistanceKm:
          Number(
            finalRoute.distanceKm.toFixed(2)
          ),

        estimatedTravelMinutes:
          Math.round(
            finalRoute.durationMinutes
          ),

        stopCount:
          stops.length,

        stops,

        geometry:
          finalRoute.geometry

      }

    });


  } catch (error) {

    console.error(
      'Multi-route optimization error:',
      error
    );

    res.status(500).json({

      success: false,

      message:
        'Multi-order route optimization failed',

      error:
        error.message

    });

  }

});


module.exports = router;