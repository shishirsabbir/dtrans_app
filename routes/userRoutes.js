// imports
const express = require('express');
const userController = require('./../controllers/userController');

// router
const router = express.Router();

// routes
router.route('/login').post(userController.login);
router.route('/signup').post(userController.signup);

// exports
module.exports = router;
