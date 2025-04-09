const express = require('express');
const {register, login} = require('../controllers/authController');

const router = express.Router();


//Route for user registration
router.post('/register',register );
// Route for user login
router.post('/login',login )

// Route for token verification
// router.get('/verify', authController.verifyToken);


module.exports = router;



