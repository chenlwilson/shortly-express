var db = require('../config');
var bcrypt = require('bcrypt-nodejs');
var Promise = require('bluebird');
const saltRounds = 10;

var User = db.Model.extend({
  tablename: 'users',
  initialize: () => {
    this.on('creating', (model, attrs, options) => {
      bcrypt.hash(model.get('password'), saltRounds)
        .then(function (hash) {
          // Store hash in your password DB.
          const username = model.get('username');
          model.set({'username': username, 'password': hash});
        })
        .catch(err => {
          console.log('ERROR-------------> ', err);

        });
    });
  }
});

module.exports = User;