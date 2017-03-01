/*eslint-env mocha*/
/*globals is*/
var fs = require('fs');
var rimraf = require('rimraf');
var atTypesSearch = require('../index');
var config = require('./_config');

xdescribe('loadIndex', function () {
  it('download search-index.json to ~/.at-types-search', function (done) {
    rimraf(config.appDir, function () {
      atTypesSearch.loadIndex()
      .then(function (index) {
        is.date(fs.statSync(config.indexJson).mtime);
        done();
      }).catch(done);
    });
  });

  it('index.json contains [{ t, g, m, d }, ...]', function (done) {
    atTypesSearch.loadIndex()
    .then(function (index) {
      is.array(index);
      var actual = index[0];
      is.object(actual);
      is.same(Object.keys(actual).sort(), [ 'd', 'g', 'm', 't' ]);
      is.number(actual.d);
      is.array(actual.g);
      is.array(actual.m);
      is.string(actual.t);
      done();
    }).catch(done);
  });

  it('use cache until 24 hours', function (done) {
    var past = new Date(new Date().getTime() - config.ttl + 300000);
    fs.utimesSync(config.indexJson, past, past);
    var before = fs.statSync(config.indexJson).mtime;
    atTypesSearch.loadIndex()
    .then(function (index) {
      is.equal(fs.statSync(config.indexJson).mtime.getTime(), before.getTime());
      done();
    }).catch(done);
  });

  it('update cache after 24 hours', function (done) {
    var past = new Date(new Date().getTime() - config.ttl);
    fs.utimesSync(config.indexJson, past, past);
    var before = fs.statSync(config.indexJson).mtime;
    atTypesSearch.loadIndex()
    .then(function (index) {
      is.greater(fs.statSync(config.indexJson).mtime.getTime(), before.getTime());
      done();
    }).catch(done);
  });

  it('force update cache with forceRefresh flag', function (done) {
    var past = new Date(new Date().getTime() - config.ttl + 300000);
    fs.utimesSync(config.indexJson, past, past);
    var before = fs.statSync(config.indexJson).mtime;
    atTypesSearch.loadIndex(true)
    .then(function (index) {
      is.greater(fs.statSync(config.indexJson).mtime.getTime(), before.getTime());
      done();
    }).catch(done);
  });
});
