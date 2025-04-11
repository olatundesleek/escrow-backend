
const mongoose = require('mongoose');

const PORT = process.env.PORT || 3000;
const app = require('./app');




// Load environment variables based on the current NODE_ENV (default: development)

if (process.env.NODE_ENV !== "production") {
    const envFile = `.env.${process.env.NODE_ENV || "development"}`;
    require("dotenv").config({ path: envFile });
  }



// Database connection
mongoose.connect(process.env.MONGODB_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
})
.then(() => {
    console.log('MongoDB connected');
})
.catch(err => {
    console.error('MongoDB connection error:', err);
});

// Start server
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});