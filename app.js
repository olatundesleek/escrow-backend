const express = require('express');
const app = express();
const bodyParser = require('body-parser');


const cookieParser = require('cookie-parser');
app.use(bodyParser.json());
app.use(cookieParser());


const authRoutes = require('./routes/authRoutes');
// const escrowRoutes = require('./routes/escrowRoutes');
// const paymentRoutes = require('./routes/paymentRoutes');
// const disputeRoutes = require('./routes/disputeRoutes');
// const authMiddleware = require('./middleware/authMiddleware');



// Routes
app.use('/api/auth', authRoutes);
// app.use('/api/escrow', escrowRoutes);
// app.use('/api/payment', paymentRoutes);
// app.use('/api/dispute', disputeRoutes);



module.exports = app