const debug = require('debug')('app:pokemonLookupController');
const chalk = require('chalk');
const apiHandler = require('../resources/apiHandler');

let endpoint = 'https://www.pokemon.com';
endpoint += '/us/play-pokemon/leaderboards/tcgo/api';
endpoint += '/$format';
endpoint += '/?leaderboard_type=play';
endpoint += '&leaderboard_when=CurrentWeek';
endpoint += '&leaderboard_who=';
endpoint += '&per_page=100';
endpoint += '&page=$page';
endpoint += '&include=metadata';
endpoint += '&format=json';

const countryQuery = '&zone=$country';
const formats = ['themedeck', 'standard', 'expanded', 'overall'];

async function lookup(username, url, pageStart, page, cb) {
  try {
    const myurl = url.replace('$page', page);
    const response = await apiHandler.get(myurl);
    const { records } = response.leaderboard;
    for (let i = 0; i < records.length; i += 1) {
      if (records[i].screen_name === username) {
        debug(`
          Username: ${chalk.green(username)}
          URL: ${chalk.green(url)}
          Rank: ${chalk.green(records[i].rank)}
        `);
        return {
          rank: records[i].rank,
          page
        };
        break;
      }
      if (i === records.length - 1) {
        if (page === pageStart + 19) {
          return {
            rank: 'Not found',
            page
          };
        }
        return cb(username, url, pageStart, page + 1, cb);
      }
    }
  } catch (err) {
    debug(`
      Status: ${chalk.red('Error')}
      Function: ${chalk.red('lookup')}
      Error: ${chalk.red(err)}
    `);
    return {
      error: 'An unexpected error occured'
    }
  }
}

module.exports = {
  lookupUser: async function lookupUser(username, format, countryCode) {
    try {
      if (formats.indexOf(format) < 0) {
        return {
          error: 'Invalid format'
        };
      }
      let url = endpoint.replace('$format', format);
      if (countryCode !== 'global') {
        url += countryQuery.replace('$country', countryCode);
      }
      const result = await lookup(username, url, 1, 1, lookup);
      return result;
    } catch (err) {
      return {
        error: 'An unexpected error occured'
      };
    }
  }
}
