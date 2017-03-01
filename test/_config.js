var path = require('path');
var userHome = require('user-home');

var config = {};
config.appDir = path.resolve(userHome, '.at-types-search');
config.indexJson = path.join(config.appDir, 'search-index.json');
config.ttl = 86400000;

module.exports = config;
