const debug = require('debug')('app:server');
const chalk = require('chalk');
const app = require('./src/app');

app.listen(3000, (err) => {
  if (err) {
    debug(`
      Status: ${chalk.red('Error')}
      Port: ${chalk.red('3000')}
      Error: ${chalk.red(err)}
    `);
  } else {
    debug(`
      Status: ${chalk.green('Listening')}
      Port: ${chalk.green('3000')}
    `);
  }
});
