const express = require('express');
const mongoose = require('mongoose');
const dotenv = require('dotenv');

dotenv.config();
mongoose.connect(process.env.DB_CONNECTION_STRING);

const app = express();

app.get('/test', (req, res) => {
    res.json('test ok');
});

app.post('/register', (req, res) => {

})

app.listen(4040);
