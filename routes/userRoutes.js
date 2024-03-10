// imports
const express = require('express');
const userController = require('./../controllers/userController');

// router
const router = express.Router();

// routes
router.route('/').post(userController.signup);

// exports
module.exports = router;
