var db = require('../config');
var bcrypt = require('bcrypt-nodejs');
var Promise = require('bluebird');
const saltRounds = 10;

var User = db.Model.extend({
  tablename: 'users',
  initialize: function () {
    this.on('creating', function (model, attrs, options) {
      // console.log('model is');
      // console.log(model);
      // console.log('attrs is');
      // console.log(attrs);
      // console.log('options is');
      // console.log(options);
      var salt = bcrypt.genSaltSync();
      bcrypt.hash(model.get('password'), salt, null, function (err, hash) {
        if (err) {
          console.log(err);
        } else {
          const username = model.get('username');
          model.set({ username: username, password: hash });
        }
      });
    });
  }
});

module.exports = User;

//   this.on('creating', function(model, attrs, options) {
//     console.log('------------------>Got here');
//     console.log('MODEL', model);
//     bcrypt.hash(model.get('password'), saltRounds)
//       .then(function (hash) {
//         // Store hash in your password DB.
//         console.log('------------------>Got here too'); // PROBLEM
//         const username = model.get('username');
//         model.set({'username': username, 'password': hash});
//       })
//       .catch(function(err) {
//         console.log('ERROR-------------> ', err);
//       });
//   });
// }