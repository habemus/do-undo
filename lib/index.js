const Bluebird = require('bluebird');

function TestLifecycle() {
  this.teardownCallbacks = [];
}

/**
 * Sets up an assets object that is ready for the tests
 * @return {[type]} [description]
 */
TestLifecycle.prototype.setup = function (setupFn) {

  var self = this;

  return Bluebird.resolve(setupFn())
    .then(function (teardownFn) {

      if (typeof teardownFn !== 'function') {
        return Bluebird.reject(new TypeError('setupFn must return a teardown function'));
      }

      self.registerTeardown(teardownFn);
    });
};

/**
 * Register a teardown function to be executed by the teardown
 * The function should return a promise
 */
TestLifecycle.prototype.registerTeardown = function (teardown) {
  this.teardownCallbacks.push(teardown);
};

/**
 * Executes all functions listed at this.teardownCallbacks
 */
TestLifecycle.prototype.teardown = function () {

  var self = this;

  return Bluebird.all(self.teardownCallbacks.map(function (fn) {
    return fn();
  }))
  .then(function () {
    self.teardownCallbacks = [];
  });
};

module.exports = TestLifecycle;
