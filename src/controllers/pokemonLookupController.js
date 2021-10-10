const debug = require('debug')('app:pokemonLookupController');
const chalk = require('chalk');
const apiHandler = require('../resources/apiHandler');

let endpoint = 'https://www.pokemon.com';
endpoint += '/us/play-pokemon/leaderboards/tcgo/api';
endpoint += '/$format';
endpoint += '/?leaderboard_type=play';
endpoint += '&leaderboard_when=$timePeriod';
endpoint += '&leaderboard_who=';
endpoint += '&per_page=100';
endpoint += '&page=$page';
endpoint += '&include=metadata';
endpoint += '&format=json';

const countryQuery = '&zone=$country';
const formats = ['themedeck', 'standard', 'expanded', 'overall'];
const timePeriods = ['CurrentWeek', 'LastCurrentWeek', 'CurrentMonth', 'LastCurrentMonth', 'CurrentSeason', 'LastCurrentSeason'];
const countryCodes = {
  us: {
    label: 'United States',
    code: 'US'
  },
  au: {
    label: 'Australia',
    code: 'AU'
  },
  br: {
    label: 'Brazil',
    code: 'BR'
  },
  ca: {
    label: 'Canada',
    code: 'CA'
  },
  fr: {
    label: 'France',
    code: 'FR'
  },
  de: {
    label: 'Germany',
    code: 'DE'
  },
  it: {
    label: 'Italy',
    code: 'IT'
  },
  mx: {
    label: 'Mexico',
    code: 'MX'
  },
  es: {
    label: 'Spain',
    code: 'ES'
  },
  gb: {
    label: 'United Kingdom (Great Britain)',
    code: 'GB'
  }
};

async function lookup(username, url, startPage, page, cb) {
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
      }
      if (page === startPage + 19 && i === records.length - 1) {
        return {
          page
        };
      }
    }
    if (records.length === 0) {
      return {
        rank: 'Not Ranked',
        page,
        end: true
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

module.exports = {
  lookupUser: async function lookupUser(lookupInfo) {
    try {
      const {
        username,
        format,
        timePeriod,
        countryCode,
        region,
        startPage
      } = lookupInfo;
      if (formats.indexOf(format) < 0) {
        return {
          error: 'Invalid format provided'
        };
      }
      if (timePeriods.indexOf(timePeriod) < 0) {
        return {
          error: 'Invlalid time period procided'
        };
      }
      let url = endpoint.replace('$format', format);
      url = url.replace('$timePeriod', timePeriod);
      if (countryCode && countryCode !== 'global') {
        if (Object.keys(countryCodes).indexOf(countryCode.toLowerCase()) < 0) {
          return {
            error: 'Invalid country code provided'
          };
        }
        url += countryQuery.replace('$country', countryCode);
      }
      if (region && typeof region === 'number') {
        if (region > 0 && region < 6) {
          url += countryQuery.replace('$country', region.toString());
        } else {
          return {
            error: 'Invalid region provided'
          };
        }
      } else if (region) {
        return {
          error: 'Invalid region provided'
        };
      }
      const result = await lookup(username, url, startPage + 1, 1, lookup);
      return result;
    } catch (err) {
      debug(`
        Status: ${chalk.red('Error')}
        Function: ${chalk.red('lookupUser')}
        Error: ${chalk.red(err)}
      `);
      return {
        error: 'An unexpected error occured'
      };
    }
  }
};
