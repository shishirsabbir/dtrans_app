// imports
const express = require('express');
const userRouter = require('./routes/userRoutes');
const transRouter = require('./routes/transRoutes');

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
app.use('/api/v1/transections', transRouter);

// exports
module.exports = app;
