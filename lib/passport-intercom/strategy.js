var util = require('util'),
  OAuth2Strategy = require('passport-oauth').OAuth2Strategy,
  InternalOAuthError = require('passport-oauth').InternalOAuthError;

function Strategy(options, verify) {
  options = options || {};
  options.authorizationURL = options.authorizationURL || 'https://app.intercom.io/oauth';
  options.tokenURL = options.tokenURL || 'https://api.intercom.io/auth/eagle/token';

  OAuth2Strategy.call(this, options, verify);
  this.name = 'intercom';
}

util.inherits(Strategy, OAuth2Strategy);

Strategy.prototype.userProfile = function(accessToken, done) {
  this._oauth2._customHeaders.Accept = "application/json";
  this._oauth2.useAuthorizationHeaderforGET(true);
  this._oauth2.setAuthMethod("Basic");
  var encodedToken = new Buffer(accessToken).toString('base64');

  this._oauth2.get('https://api.intercom.io/me', encodedToken, function (err, body, res) {
    if (err) { return done(new InternalOAuthError('failed to fetch user profile', err)); }
    try {
      var json = JSON.parse(body);

      var profile = { provider: 'intercom' };
      profile.id = json.id;
      profile.displayName = json.name;
      profile.emails = [{ value: json.email, type: "default" }];
      profile.photos = [json.avatar.image_url];

      profile._raw = body;
      profile._json = json;

      done(null, profile);
    } catch(e) {
      done(e);
    }
  });
}

module.exports = Strategy;
