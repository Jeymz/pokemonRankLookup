const debug = require('debug')('app:ptcgoRankRouter');
const chalk = require('chalk');
const express = require('express');
const controller = require('../controllers/ptcgoRankController');

const router = express.Router();

module.exports = (args) => {
  router.route('/')
    .get((req, res) => {
      const renderInfo = {
        endpoint: '/'
      };
      res.render('ptcgoRank', renderInfo);
    });

  router.route('/lookup')
    .get(async (req, res) => {
      try {
        if (!req.query) {
          res.send({ error: 'Invalid Request' });
          return;
        }
        if (!req.query.user || !req.query.format || !req.query.region || !req.query.duration) {
          res.send({ error: 'Invalid Request' });
          return;
        }
        const requestObject = {
          username: req.query.user.toString(),
          format: req.query.format.toString(),
          region: req.query.region.toString(),
          duration: req.query.duration.toString()
        };
        if (req.query.startPage) {
          requestObject.startPage = parseInt(req.query.startPage.toString(), 10);
        } else {
          requestObject.startPage = 0;
        }
        const response = await controller.lookupUser(requestObject);
        if (response.error) {
          args.visitor.event('Pokemon Rank Query', 'Failure', `${JSON.stringify(req.query)},${JSON.stringify(response)}`).send();
        } else {
          args.visitor.event('Pokemon Rank Query', 'Success', JSON.stringify(req.query)).send();
        }
        res.send(response);
      } catch (err) {
        debug(`
          Status: ${chalk.red('Error')}
          Endpoint: ${chalk.green(req.originalUrl)}
          Method: ${chalk.green(req.method)}
        `);
        args.visitor.event('Pokemon Rank Query', 'Failure', 'An unexpected error occured.').send();
        res.send({ error: 'An unexpected error occured.' });
      }
    });

  router.route('/asyncLookup')
    .get(async (req, res) => {
      if (!req.query) {
        res.send({ error: 'Invalid Request' });
        return;
      }
      if (
        !req.query.username
        || !req.query.format
        || !req.query.region
        || !req.query.duration
        || !req.query.page
      ) {
        res.send({ error: 'Invalid Request' });
        return;
      }
      const requestObject = {
        username: req.query.username.toString(),
        format: req.query.format.toString(),
        region: req.query.region.toString(),
        duration: req.query.duration.toString(),
        page: parseInt(req.query.page.toString(), 10)
      };
      const response = await controller.scanPage(requestObject);
      res.send(response);
    });

  router.route('/patchNotes')
    .get((req, res) => {
      debug(req.baseUrl);
      const renderInfo = {
        endpoint: 'ptcgoRankPatchNotes'
      };
      res.render('ptcgoRankPatchNotes', renderInfo);
    });

  return router;
};
