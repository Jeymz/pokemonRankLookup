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
          res.send({
            error: 'The request was missing query parameters'
          });
          return;
        }
        if (!req.query.user || !req.query.format || !req.query.timePeriod) {
          res.send({
            error: 'Some query parameters were missing'
          });
          return;
        }
        if (!req.query.countryCode && !req.query.region) {
          res.send({
            error: 'No region or country code provided'
          });
          return;
        }
        if (req.query.countryCode && req.query.region) {
          res.send({
            error: 'Both a region and country code were provided'
          });
        }
        const lookupInfo = {
          username: req.query.user.toString(),
          format: req.query.format.toString(),
          timePeriod: req.query.timePeriod.toString()
        };
        if (req.query.region) {
          lookupInfo.region = parseInt(req.query.region.toString(), 10);
        }
        if (req.query.countryCode) {
          lookupInfo.countryCode = req.query.countryCode.toString();
        }
        if (req.query.startPage) {
          lookupInfo.startPage = parseInt(req.query.startPage.toString(), 10);
        } else {
          lookupInfo.startPage = 0;
        }
        const response = await controller.lookupUser(lookupInfo);
        res.send(response);
      } catch (err) {
        debug(`
          Status: ${chalk.red('Error')}
          Endpoint: ${chalk.red(req.originalUrl)}
          Method: ${chalk.red(req.method)}
          Error: ${chalk.red(err)}
        `);
        res.send({
          error: 'An unexpected error occured.'
        });
      }
    });
  return router;
};
