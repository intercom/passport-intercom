# Passport Intercom

[Passport](https://github.com/jaredhanson/passport) strategy for authenticating
with [Intercom](http://intercom.io/) using the OAuth 2.0 API.

This module lets you authenticate using Intercom in your Node.js applications.
By plugging into Passport, Intercom authentication can be easily and
unobtrusively integrated into any application or framework that supports
[Connect](http://www.senchalabs.org/connect/)-style middleware, including
[Express](http://expressjs.com/).

## Install

```js
$ npm install passport-intercom
```

## Usage

#### Configure Strategy

The Intercom authentication strategy authenticates users using a Intercom
account and OAuth 2.0 tokens.  The strategy requires a `verify` callback, which
accepts these credentials and calls `done` providing a user, as well as
`options` specifying a client ID, client secret, and callback URL.

```js
passport.use(new IntercomStrategy({
    clientID: INTERCOM_CLIENT_ID,
    clientSecret: INTERCOM_CLIENT_SECRET,
    callbackURL: "http://localhost:3000/auth/intercom/callback"
  },
  function(accessToken, refreshToken, profile, done) {
    User.findOrCreate({ intercomAdminId: profile.id }, function (err, user) {
      return done(err, user);
    });
  }
));
```

#### Authenticate Requests

Use `passport.authenticate()`, specifying the `'intercom'` strategy, to
authenticate requests.

For example, as route middleware in an [Express](http://expressjs.com/)
application:

```js
app.get('/auth/intercom',
  passport.authenticate('intercom'));

app.get('/auth/intercom/callback',
  passport.authenticate('intercom', { failureRedirect: '/login' }),
  function(req, res) {
    // Successful authentication, redirect home.
    res.redirect('/');
  });
```

## Examples

For a complete, working example, refer to [passport-intercom-example-app](https://github.com/intercom/passport-intercom-example-app).

## Tests

```bash
$ npm install --dev
$ make test
```

## Credits

Inspired by [Jared Hanson](http://github.com/jaredhanson)'s passport plugins.

## License

[The MIT License](http://opensource.org/licenses/MIT)
