/*eslint-env mocha*/
/*globals is*/
var atTypesSearch = require('../index');

describe('search', function () {
  it('single word', function (done) {
    var word = 'google';
    atTypesSearch.search(word)
    .then(function (result) {
      is.array(result);
      var actual = result[0];
      is.object(actual);
      is.same(Object.keys(actual).sort(), [ 'd', 'g', 'm', 't' ]);
      is.number(actual.d);
      is.array(actual.g);
      is.array(actual.m);
      is.string(actual.t);
      is.notEqual(actual.t.indexOf(word), -1);
      done();
    }).catch(done);
  });

  it('multi word', function (done) {
    var words = [ 'react', 'redux' ];
    atTypesSearch.search(words)
    .then(function (result) {
      is.array(result);
      var actual = result[0];
      is.object(actual);
      is.same(Object.keys(actual).sort(), [ 'd', 'g', 'm', 't' ]);
      is.number(actual.d);
      is.array(actual.g);
      is.array(actual.m);
      is.string(actual.t);
      is.true(words.every(function (w) {
        return (actual.t.indexOf(w) !== -1);
      }));
      done();
    }).catch(done);
  });

  it('not applicable', function (done) {
    var words = [ 'foo', 'bar', 'baz' ];
    atTypesSearch.search(words)
    .then(function (result) {
      is.array(result);
      is.lengthOf(result, 0);
      done();
    }).catch(done);
  });

  it('null', function (done) {
    var words = null;
    atTypesSearch.search(words)
    .then(function (result) {
      is.array(result);
      is.lengthOf(result, 0);
      done();
    }).catch(done);
  });
});
