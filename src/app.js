const express = require('express');
const bodyParser = require('body-parser');
const path = require('path');

const app = express();

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'assets', 'views'));
app.use(bodyParser.urlencoded({ extended: false }));

app.use('/js', express.static(path.join(__dirname, 'assets', 'js')));
app.use('/css', express.static(path.join(__dirname, 'assets', 'css')));

const pokemonLookupRouter = require('./routers/ptgcoRankRouter')();

app.use('/', pokemonLookupRouter);

module.exports = app;
