const should = require('should');
const Bluebird = require('bluebird');

const doUndo = require('../lib');

function _wait(ms) {
  return new Bluebird((resolve, reject) => {
    setTimeout(resolve, ms);
  });
}

describe('basics', function () {

  it('undos', function (done) {

    var _tracker = {};

    var undoer = doUndo();

    undoer.do(function do1() {

      _tracker.done1 = true;

      // return undo that takes 1000 ms
      return Bluebird.resolve(function undo1() {
        return new Bluebird(function (resolve, reject) {
          setTimeout(function () {
            _tracker.done1 = false;
            resolve();
          }, 1000);
        });
      });
    })
    .then(function () {

      _tracker.done1.should.equal(true);

      undoer.undo()
        .then(function () {
          _tracker.done1.should.equal(false);
          done();
        });
    });

  });


  it('undoAll', function (done) {

    var _tracker = {};

    var undoer = doUndo();

    undoer.do(function do1() {

      _tracker.done1 = true;

      // return undo that takes 1000 ms
      return function undo1() {

        return _wait(1000)
          .then(() => {
            // undo1
            _tracker.done1 = false;
          })
      };
    })
    .then(function () {
      return undoer.do(function do2() {
        _tracker.done2 = true;

        return function undo2() {
          _tracker.done2 = false;
        }
      });
    })
    .then(function () {
      return undoer.undoAll()
    })
    .then(function () {
      _tracker.done1.should.equal(false);
      _tracker.done2.should.equal(false);

      done();
    });

  }); 

});