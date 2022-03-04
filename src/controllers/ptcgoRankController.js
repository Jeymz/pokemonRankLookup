const debug = require('debug')('app:ptcgoRankController');
const chalk = require('chalk');
const apiHandler = require('../resources/apiHandler');

let endpoint = 'https://www.pokemon.com';
endpoint += '/us/play-pokemon/leaderboards/tcgo/api';
endpoint += '/$format';
endpoint += '/?leaderboard_type=play';
endpoint += '&leaderboard_when=$duration';
endpoint += '&leaderboard_who=';
endpoint += '&per_page=100';
endpoint += '&page=$page';
endpoint += '&include=metadata';
endpoint += '&format=json';

const countryQuery = '&zone=$country';
const formats = ['themedeck', 'standard', 'expanded', 'overall'];
const durations = [
  'CurrentWeek',
  'LastCurrentWeek',
  'CurrentMonth',
  'LastCurrentMonth',
  'CurrentSeason',
  'LastCurrentSeason'
];
const regions = [
  'global',
  'us',
  'au',
  'br',
  'ca',
  'dr',
  'de',
  'it',
  'mx',
  'es',
  'gb',
  '1',
  '2',
  '3',
  '4',
  '5'
];

async function lookup(username, url, startPage, page, cb) {
  try {
    const myurl = url.replace('$page', page);
    const response = await apiHandler.get(myurl);
    const { records } = response.leaderboard;
    for (let i = 0; i < records.length; i += 1) {
      if (typeof records[i].screen_name === 'string' && records[i].screen_name.toLowerCase() === username.toLowerCase()) {
        debug(`
          Username: ${chalk.green(username)}
          URL: ${chalk.green(url)}
          Rank: ${chalk.green(records[i].rank)}
        `);
        return {
          rank: records[i].rank,
          page
        };
      }
      if (page === startPage + 19 && i === records.length - 1) {
        return {
          page
        };
      }
    }
    if (records.length === 0) {
      return {
        end: true,
        page
      };
    }
    return cb(username, url, startPage, page + 1, cb);
  } catch (err) {
    debug(`
      Status: ${chalk.red('Error')}
      Function: ${chalk.red('lookup')}
      Error: ${chalk.red(err)}
    `);
    return {
      error: 'An unexpected error occured'
    };
  }
}

async function checkPage(username, url) {
  try {
    const response = await apiHandler.get(url);
    if (response.error) {
      return {
        error: 'Failed to make call to PTCGO Leaderboards'
      };
    }
    const { records } = response.leaderboard;
    if (records.length < 1) {
      return {
        end: true
      };
    }
    for (let i = 0; i < records.length; i += 1) {
      if (records[i].screen_name.toString().toLowerCase() === username.toLowerCase()) {
        debug(`
          Username: ${chalk.green(username)}
          URL: ${chalk.green(url)}
          Rank: ${chalk.green(records[i].rank)}
        `);
        return {
          rank: records[i].rank,
        };
      }
    }
    return {
      lastSeenRank: records[records.length - 1].rank
    };
  } catch (err) {
    debug(`
      Status: ${chalk.red('Error')}
      Function: ${chalk.red('checkPage')}
      Error: ${chalk.red(err)}
    `);
    return {
      error: 'An unexpected error occured'
    };
  }
}

module.exports = {
  lookupUser: async function lookupUser(requestObject) {
    try {
      const {
        username,
        format,
        region,
        duration,
        startPage
      } = requestObject;
      if (formats.indexOf(format) < 0) {
        return {
          error: 'Invalid format provided'
        };
      }
      if (durations.indexOf(duration) < 0) {
        return {
          error: 'Invalid duration provided'
        };
      }
      if (regions.indexOf(region) < 0) {
        debug(region);
        return {
          error: 'Invalid region provided'
        };
      }
      let url = endpoint.replace('$format', format);
      url = url.replace('$duration', duration);
      if (region !== 'global') {
        url += countryQuery.replace('$country', region);
      }
      const result = await lookup(username, url, startPage + 1, 1, lookup);
      return result;
    } catch (err) {
      return {
        error: 'An unexpected error occured'
      };
    }
  },
  scanPage: async function scanPage(requestObject) {
    const {
      username,
      format,
      region,
      duration,
      page
    } = requestObject;
    if (formats.indexOf(format) < 0) {
      return {
        error: 'Invalid format provided'
      };
    }
    if (durations.indexOf(duration) < 0) {
      return {
        error: 'Invalid duration provided'
      };
    }
    if (regions.indexOf(region) < 0) {
      debug(region);
      return {
        error: 'Invalid region provided'
      };
    }
    let url = endpoint.replace('$format', format);
    url = url.replace('$duration', duration);
    url = url.replace('$page', page);
    if (region !== 'global') {
      url += countryQuery.replace('$country', region);
    }
    const result = await checkPage(username, url);
    if (!result.error) {
      result.page = page;
    }
    return result;
  }
};
