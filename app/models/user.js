var db = require('../config');
var bcrypt = require('bcrypt-nodejs');
var Promise = require('bluebird');

var User = db.Model.extend({
  tablename: 'users',
  initialize: function () {
    this.on('creating', function (model, attrs, options) {
      // var salt = bcrypt.genSaltSync();
      return new Promise((resolve, reject) => {
        bcrypt.hash(model.get('password'), null, null, function (err, hash) {
          if (err) {
            reject(err);
          } else {
            model.set('password', hash);
            resolve(hash);
          }
        });
      });
    })
      .catch(err => console.log(err));
  }
});

module.exports = User;
