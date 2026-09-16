/* ===========================================================
   FarmLink AI — Backend Server
   Express server · MongoDB connection
   =========================================================== */

const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();


const app = express();
const PORT = 5000;

const path = require('path');

app.use(express.static(path.join(__dirname, '../frontend')));

app.get('/', (req, res) => {
  res.sendFile(
    path.join(__dirname, '../frontend/farmer/index.html')
  );
});

const listingRoutes = require('./routes/listings');
const authRoutes = require('./routes/auth');
const requirementRoutes = require('./routes/requirements');
const connectionRoutes = require('./routes/connections');
const orderRoutes = require('./routes/orders');
const paymentRoutes = require('./routes/payments');
const shipmentRoutes = require('./routes/shipments');
const aiRoutes = require('./routes/ai');
const routeOptimizationRoutes =
  require('./routes/routeOptimization');


/* ---------- Middleware ---------- */

app.use(express.json());
app.use(cors());

app.use('/api/listings', listingRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/requirements', requirementRoutes);
app.use('/api/connections', connectionRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/payments', paymentRoutes);
app.use('/api/shipments', shipmentRoutes);
app.use('/api/ai', aiRoutes);
app.use(
  '/api/route-optimization',
  routeOptimizationRoutes
);


/* ---------- Basic Route ---------- */

app.get('/', (req, res) => {
  res.redirect('/farmer/index.html');
});


/* ---------- MongoDB Connection ---------- */

async function connectDatabase(){
  try{
    await mongoose.connect(process.env.MONGODB_URI, {
      dbName: 'farmlink'
    });

    console.log('MongoDB connected successfully');
  }catch(error){
    console.error('MongoDB connection failed:', error.message);
    process.exit(1);
  }
}


/* ---------- Start Server ---------- */

async function startServer(){
  await connectDatabase();

  app.listen(PORT, () => {
    console.log(`FarmLink AI backend running on http://localhost:${PORT}`);
  });
}


startServer();