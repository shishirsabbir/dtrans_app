// imports
const express = require('express');
const userRouter = require('./routes/userRoutes');

// app
const app = express();

// middleware
app.use((req, res, next) => {
    req.requestTime = new Date().toISOString();
    next();
});

// json-parser middleware
app.use(express.json());

// mount routers
app.use('/api/v1/users', userRouter);

// exports
module.exports = app;
