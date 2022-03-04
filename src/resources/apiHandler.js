const debug = require('debug')('app:apiHandler');
const fetch = require('node-fetch');

module.exports = {
  get: async function get(url) {
    try {
      const response = await fetch(url);
      const data = await response.json();
      return data;
    } catch (err) {
      debug(err);
      return false;
    }
  }
};
