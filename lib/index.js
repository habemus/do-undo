const Bluebird = require('bluebird');

function Undoer() {

  this._undoStack = [];
}

Undoer.prototype.do = function (doFn) {
  return Bluebird.resolve(doFn())
    .then(function (undoFn) {

      if (typeof undoFn !== 'function') {
        return Bluebird.reject(new TypeError('doFn must return a teardown function'));
      }

      this._undoStack.push(undoFn);

    }.bind(this));
};

Undoer.prototype.undo = function () {
  // get last undo function added to the stack
  var undoFn = this._undoStack.pop();

  return Bluebird.resolve(undoFn())
    .catch(function (err) {

      // put it back into the _undoStack
      this._undoStack.push(undoFn);

      return Bluebird.reject(err);
    }.bind(this));
}

Undoer.prototype.undoAll = function () {

  return Bluebird.reduce(this._undoStack, function (nothing, undoFn) {

    // instead of executing the undo directly, call the undo method
    // so that errors are handled
    return this.undo();

  }.bind(this), null);
};

module.exports = function () {
  return new Undoer();
};
