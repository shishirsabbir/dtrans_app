// imports
const express = require('express');
const transController = require('./../controllers/transController');
const userController = require('./../controllers/userController');

// router
const router = express.Router();

// routes
router
    .route('/')
    .get(userController.protect, transController.getAllTrans)
    .post(userController.protect, transController.createTrans);

// exports
module.exports = router;
