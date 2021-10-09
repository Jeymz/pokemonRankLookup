const debug = require('debug')('app:pokemonLookupRouter');
const chalk = require('chalk');
const express = require('express');
const controller = require('../controllers/pokemonLookupController');

const router = express.Router();

module.exports = () => {
  router.route('/')
    .get((req, res) => {
      res.render('pokemonLookup');
    });

  router.route('/lookup')
    .get(async (req, res) => {
      try {
        if (!req.query) {
          res.send({error: 'Invalid Request'});
        }
        if (!req.query.user || !req.query.format || !req.query.countryCode) {
          res.send({error: 'Invalid Request'})
        }
        const username = req.query.user.toString();
        const format = req.query.format.toString();
        const countryCode = req.query.countryCode.toString();
        const response = await controller.lookupUser(username, format, countryCode);
        res.send(response);
      } catch (err) {
        res.send({error: 'An unexpected error occured.'});
      }
    });
  return router;
}
