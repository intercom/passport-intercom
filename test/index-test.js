var vows = require('vows');
var assert = require('assert');
var util = require('util');
var intercom = require('passport-intercom');


vows.describe('passport-intercom').addBatch({
  'module': {
    'should report a version': function (x) {
      assert.isString(intercom.version);
    }
  }
}).export(module);
