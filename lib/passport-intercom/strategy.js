// Load modules.
var util = require('util'),
  OAuth2Strategy = require('passport-oauth').OAuth2Strategy,
  InternalOAuthError = require('passport-oauth').InternalOAuthError,
  pjson = require('../../package.json');

/**
 * `Strategy` constructor.
 *
 * The Intercom authentication strategy authenticates requests by delegating to
 * Intercom using the OAuth 2.0 protocol.
 *
 * Applications must supply a `verify` callback which accepts an `accessToken`,
 * `refreshToken` and service-specific `profile`, and then calls the `cb`
 * callback supplying a `user`, which should be set to `false` if the
 * credentials are not valid.  If an exception occured, `err` should be set.
 *
 * Options:
 *   - `clientID`      your Intercom application's App ID
 *   - `clientSecret`  your Intercom application's App Secret
 *   - `callbackURL`   URL to which Intercom will redirect the user after granting authorization
 *
 * Examples:
 *
 *     passport.use(new IntercomStrategy({
 *         clientID: '123abc',
 *         clientSecret: 'mysecret'
 *         callbackURL: 'https://www.example.net/auth/intercom/callback'
 *       },
 *       function(accessToken, refreshToken, profile, cb) {
 *         User.findOrCreate(..., function (err, user) {
 *           cb(err, user);
 *         });
 *       }
 *     ));
 *
 * @constructor
 * @param {object} options
 * @param {function} verify
 * @access public
 */

function Strategy(options, verify) {
  options = options || {};
  options.authorizationURL = options.authorizationURL || 'https://app.intercom.io/oauth';
  options.tokenURL = options.tokenURL || 'https://api.intercom.io/auth/eagle/token';

  OAuth2Strategy.call(this, options, verify);
  this.name = 'intercom';
}

// Inherit from `OAuth2Strategy`.
util.inherits(Strategy, OAuth2Strategy);

/**
 * Retrieve user profile from Intercom.
 *
 * This function constructs a normalized profile, with the following properties:
 *
 *   - `provider`         always set to `Intercom`
 *   - `id`               the user's Intercom ID
 *   - `displayName`      the user's full name
 *   - `profileUrl`       the URL of the profile for the user on Intercom
 *   - `emails`           the proxied or contact email address granted by the user
 *   - `photos`           the user's photo
 *
 * @param {string} accessToken
 * @param {function} done
 * @access protected
 */
Strategy.prototype.userProfile = function(accessToken, done) {
  this._oauth2._customHeaders.Accept = "application/json";
  this._oauth2._customHeaders['User-Agent'] = "passport-intercom/" + pjson.version;
  this._oauth2.useAuthorizationHeaderforGET(true);
  this._oauth2.setAuthMethod("Basic");
  var encodedToken = new Buffer(accessToken).toString('base64');

  this._oauth2.get('https://api.intercom.io/me', encodedToken, function (err, body, res) {
    if (err) {
      return done(new InternalOAuthError('failed to fetch user profile', err));
    }

    var json;

    try {
      var json = JSON.parse(body);
    } catch(e) {
      return done(e);
    }

    if (json.email_verified != true) {
      return done(new InternalOAuthError('user email not verified'));
    }

    var profile = { provider: 'intercom' };
    profile.id = json.id;
    profile.displayName = json.name;
    profile.emails = [{ value: json.email, type: "default" }];
    profile.photos = [json.avatar.image_url];

    profile._raw = body;
    profile._json = json;

    done(null, profile);
  });
};

// Expose constructor.
module.exports = Strategy;
