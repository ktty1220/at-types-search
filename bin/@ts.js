#!/usr/bin/env node

var pkg = require('../package.json');
var atTypesSearch = require('../index');
var columnify = require('columnify');
var clc = require('cli-color');
var argv = require('yargs')
.usage([
  clc.yellow(pkg.description),
  'Usage: @ts WORD1 WORD2 WORD3 ...'
].join('\n'))
.demand(1)
.example('@ts google')
.example('@ts react redux')
.options({
  r: {
    alias: 'refresh',
    demand: false,
    describe: 'Force refresh index cache',
    type: 'boolean'
  }
})
.version(function () {
  return pkg.version;
})
.alias('v', 'version')
.help('h')
.alias('h', 'help')
.locale('en')
.argv;

atTypesSearch.search(argv._, argv.refresh)
.then(function (result) {
  if (result.length === 0) {
    console.info(clc.magenta('Not applicable'));
    return;
  }

  var headers = {
    t: 'NAME',
    d: 'DOWNLOADS'
  };
  var getHeader = function (h) {
    return clc.blue(headers[h]);
  };

  console.info(columnify(result, {
    columns: Object.keys(headers),
    config: {
      t: {
        headingTransform: getHeader
      },
      d: {
        align: 'right',
        headingTransform: getHeader
      }
    }
  }));
})
.catch(console.error);
