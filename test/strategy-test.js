var vows = require('vows');
var assert = require('assert');
var util = require('util');
var IntercomStrategy = require('passport-intercom/strategy');


vows.describe('IntercomStrategy').addBatch({

  'strategy': {
    topic: function() {
      return new IntercomStrategy({
        clientID: 'ABC123',
        clientSecret: 'secret'
      },
      function() {});
    },

    'should be named intercom': function (strategy) {
      assert.equal(strategy.name, 'intercom');
    },
  },

  'strategy when loading user profile': {
    topic: function() {
      var strategy = new IntercomStrategy({
        clientID: 'ABC123',
        clientSecret: 'secret'
      },
      function() {});

      // mock
      strategy._oauth2.get = function(url, accessToken, callback) {
        var body = ' \
          { \
            "type": "admin", \
            "id": "123456", \
            "email": "rory@gmail.com", \
            "name": "Rory Hughes", \
            "email_verified": true, \
            "app": { \
              "type": "app", \
              "id_code": "abcd1234", \
              "created_at": 1470823665, \
              "secure": true \
            }, \
            "avatar": { \
              "type": "avatar", \
              "image_url": "https://static.intercomassets.com/avatars/123/square_128/456.jpg" \
            } \
          } \
        ';
        callback(null, body, undefined);
      }

      return strategy;
    },

    'when told to load user profile': {
      topic: function(strategy) {
        var self = this;
        function done(err, profile) {
          self.callback(err, profile);
        }

        process.nextTick(function () {
          strategy.userProfile('access-token', done);
        });
      },

      'should not error' : function(err, req) {
        assert.isNull(err);
      },
      'should load profile' : function(err, profile) {
        assert.equal(profile.provider, 'intercom');
        assert.equal(profile.id, '123456');
        assert.equal(profile.displayName, 'Rory Hughes');
      },
      'should set raw property' : function(err, profile) {
        assert.isString(profile._raw);
      },
      'should set json property' : function(err, profile) {
        assert.isObject(profile._json);
      },
    },
  },

  'strategy when loading user profile and encountering an error': {
    topic: function() {
      var strategy = new IntercomStrategy({
        clientID: 'ABC123',
        clientSecret: 'secret'
      },
      function() {});

      // mock
      strategy._oauth2.get = function(url, accessToken, callback) {
        callback(new Error('something-went-wrong'));
      }

      return strategy;
    },

    'when told to load user profile': {
      topic: function(strategy) {
        var self = this;
        function done(err, profile) {
          self.callback(err, profile);
        }

        process.nextTick(function () {
          strategy.userProfile('access-token', done);
        });
      },

      'should error' : function(err, req) {
        assert.isNotNull(err);
      },
      'should wrap error in InternalOAuthError' : function(err, req) {
        assert.equal(err.constructor.name, 'InternalOAuthError');
      },
      'should not load profile' : function(err, profile) {
        assert.isUndefined(profile);
      },
    },
  },

  'strategy when loading user profile with unverified email': {
    topic: function() {
      var strategy = new IntercomStrategy({
          clientID: 'ABC123',
          clientSecret: 'secret'
        },
        function() {});

      // mock
      strategy._oauth2.get = function(url, accessToken, callback) {
        var body = ' \
          { \
            "type": "admin", \
            "id": "123456", \
            "email": "rory@gmail.com", \
            "name": "Rory Hughes", \
            "email_verified": false, \
            "app": { \
              "type": "app", \
              "id_code": "abcd1234", \
              "created_at": 1470823665, \
              "secure": true \
            }, \
            "avatar": { \
              "type": "avatar", \
              "image_url": "https://static.intercomassets.com/avatars/123/square_128/456.jpg" \
            } \
          } \
        ';
        callback(null, body, undefined);
      }

      return strategy;
    },

    'when told to load user profile': {
      topic: function(strategy) {
        var self = this;
        function done(err, profile) {
          self.callback(err, profile);
        }

        process.nextTick(function () {
          strategy.userProfile('access-token', done);
        });
      },

      'should error' : function(err, req) {
        assert.isNotNull(err);
      },
      'should wrap error in InternalOAuthError' : function(err, req) {
        assert.equal(err.constructor.name, 'InternalOAuthError');
      },
      'should not load profile' : function(err, profile) {
        assert.isUndefined(profile);
      },
    },
  },

}).export(module);
