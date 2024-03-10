// config dotenv
const dotenv = require('dotenv');
dotenv.config({ path: './config.env' });

// imports
const mongoose = require('mongoose');
const app = require('./app');

// database
const DB = process.env.DB_LOCAL;
mongoose
    .connect(DB)
    .then(() => {
        console.log('Database Connected!');
    })
    .catch((err) => {
        console.log(`Error 🧨: ${err}`);
    });

// listening to port 8000
const port = process.env.PORT;
app.listen(port, () => {
    console.log(`Listening from port ${port}...`);
});
