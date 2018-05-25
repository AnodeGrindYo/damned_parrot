// app.js
const express = require('express');  
const app = express();

app.use('/', express.static('.'));
app.use('/public', express.static('./public'));
app.use('/public/css', express.static('./public/css'));
app.use('/public/js', express.static('./public/js'));

module.exports = app;  