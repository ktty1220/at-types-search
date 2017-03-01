var fs = require('fs');
var path = require('path');
var userHome = require('user-home');
var request = require('request');
var Promise = require('es6-promise');

var getMtime = function (target) {
  try {
    return fs.statSync(target).mtime;
  } catch (e) {
    return 0;
  }
};

var getAppDir = function () {
  var dir = path.resolve(userHome, '.at-types-search');
  if (! getMtime(dir)) {
    fs.mkdirSync(dir, 0o755);
  }
  return dir;
};

var normalize = function (s) {
  return (s || '').trim().toLowerCase();
};

var atTypesSearch = {
  loadIndex: function (forceRefresh) {
    return new Promise(function (resolve, reject) {
      var indexJson = path.resolve(getAppDir(), 'search-index.json');
      var ttl = 1000 * 60 * 60 * 24;

      if (! forceRefresh && new Date().getTime() - getMtime(indexJson) < ttl) {
        resolve(JSON.parse(fs.readFileSync(indexJson, 'utf-8')));
        return;
      }

      request({
        method: 'get',
        uri: 'https://typespublisher.blob.core.windows.net/typespublisher/data/search-index-min.json',
        gzip: true
      }, function (err, res, body) {
        if (err) {
          return reject(err);
        }
        var data = JSON.parse(body).map(function (d) {
          // t: string;    types package name
          // g: string[];  globals
          // m: string[];  modules
          // p: string;    project name
          // l: string;    library name
          // d: number;    downloads in the last month from NPM
          delete d.p;
          delete d.l;
          return d;
        });

        fs.writeFileSync(indexJson, JSON.stringify(data), 'utf-8');
        return resolve(data);
      });
    });
  },

  search: function (words, forceRefresh) {
    if (! (words instanceof Array)) {
      words = [ words ];
    }

    return this.loadIndex(forceRefresh)
    .then(function (index) {
      var swords = words.map(function (w) {
        return normalize(w);
      }).filter(function (w) {
        return w;
      });
      if (swords.length === 0) {
        return [];
      }

      var prev = null;
      return index.filter(function (item) {
        var name = normalize(item.t);
        if (prev === name) {
          return false;
        }
        prev = name;
        var globals = '|' + normalize(item.g.join('|'));
        var modules = '|' + normalize(item.m.join('|'));
        return swords.every(function (sw) {
          return (name.indexOf(sw) !== -1) ||
            (globals.indexOf('|' + sw) !== -1) ||
            (modules.indexOf('|' + sw) !== -1);
        });
      });
    });
  }
};

module.exports = atTypesSearch;
