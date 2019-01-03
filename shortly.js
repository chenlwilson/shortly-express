var express = require('express');
var util = require('./lib/utility');
var partials = require('express-partials');
var bodyParser = require('body-parser');
var session = require('express-session');


var db = require('./app/config');
var Users = require('./app/collections/users');
var User = require('./app/models/user');
var Links = require('./app/collections/links');
var Link = require('./app/models/link');
var Click = require('./app/models/click');

var app = express();

app.set('views', __dirname + '/views');
app.set('view engine', 'ejs');
app.use(partials());
// Parse JSON (uniform resource locators)
app.use(bodyParser.json());
// Parse forms (signup/login)
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static(__dirname + '/public'));
app.use(session({
  secret: 'shortly test',
  resave: false,
  saveUnitialized: true
}));


app.get('/', util.checkUser,
  function (req, res) {
    res.render('index');
  });

app.get('/create', util.checkUser,
  function (req, res) {
    res.render('index');
  });

app.get('/links',
  function (req, res) {
    Links.reset().fetch().then(function (links) {
      res.status(200).send(links.models);
    });
  });

app.get('/login', (req, res) => {
  res.render('login');
});

app.get('/signup', (req, res) => {
  res.render('signup');
});

app.post('/links',
  function (req, res) {
    var uri = req.body.url;

    if (!util.isValidUrl(uri)) {
      console.log('Not a valid url: ', uri);
      return res.sendStatus(404);
    }

    new Link({ url: uri }).fetch().then(function (found) {
      if (found) {
        res.status(200).send(found.attributes);
      } else {
        util.getUrlTitle(uri, function (err, title) {
          if (err) {
            console.log('Error reading URL heading: ', err);
            return res.sendStatus(404);
          }

          Links.create({
            url: uri,
            title: title,
            baseUrl: req.headers.origin
          })
            .then(function (newLink) {
              res.status(200).send(newLink);
            });
        });
      }
    });
  });

/************************************************************/
// Write your authentication routes here
/************************************************************/
// Allow users to register for a new account, or to login - build pages for login
// and sign up, and add routes to process the form data using POST actions.

app.post('/signup', (req, res) => {
  // create user with encrypted password
  var username = req.body.username;
  var password = req.body.password;
  console.log('got to line 99');
  var newUser = new User({ username: username, password: password });
  console.log('newUser is');
  console.log(newUser);

  newUser.save();

  // Users.create(newUser, (err, result) => {
  //   if (err) {
  //     console.log(err);
  //   } else {
  //     console.log(result);
  //   }
  // });

  // newUser.fetch().then(function (found) {
  //   console.log('got to line 101');
  //   if (found) {
  //     res.redirect('/login');
  //   } else {
  //     console.log('got to line 104');
  //     Users.create({
  //       username: username,
  //       password: password
  //     })
  //       .then(function (newUser) {
  //         req.session.regenerate(() => {
  //           req.session.user = newUser.username;
  //           res.redirect('/links');
  //         });
  //       });
  //   }
  // })
  // .catch(err => console.log(err));
});

app.post('/login', (req, res) => {
  var username = req.body.username;
  var password = req.body.password;
  new User({ username: username }).fetch().then(function (found) {
    if (found) {
      bcrypt.compare(password, found.get('password'), (err, res) => {
        if (err) {
          console.log(err);
        } else {
          req.session.regenerate(() => {
            req.session.found = found.username;
          });
        }
      });
    } else {
      res.redirect('/signup');
    }
  });
});

/************************************************************/
// Handle the wildcard route last - if all other routes fail
// assume the route is a short code and try and handle it here.
// If the short-code doesn't exist, send the user to '/'
/************************************************************/

app.get('/*', function (req, res) {
  new Link({ code: req.params[0] }).fetch().then(function (link) {
    if (!link) {
      res.redirect('/');
    } else {
      var click = new Click({
        linkId: link.get('id')
      });

      click.save().then(function () {
        link.set('visits', link.get('visits') + 1);
        link.save().then(function () {
          return res.redirect(link.get('url'));
        });
      });
    }
  });
});

module.exports = app;
