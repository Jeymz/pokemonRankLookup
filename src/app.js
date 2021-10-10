const debug = require('debug')('app:app');
const chalk = require('chalk');
const express = require('express');
const config = require('config');
const bodyParser = require('body-parser');
const path = require('path');

const app = express();

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'assets', 'views'));
app.use(bodyParser.urlencoded({ extended: false }));

app.use('/js', express.static(path.join(__dirname, 'assets', 'js')));

const pokemonLookupRouter = require('./routers/pokemonLookupRouter')();

app.use('/pokemonLookup', pokemonLookupRouter);

module.exports = app;
