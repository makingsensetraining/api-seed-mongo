'use strict';
import _ from 'lodash';
import auth0 from 'auth0';
import config from '../../config/environment';

var ManagementClient = auth0.ManagementClient;

class UserAuth0Service {

  constructor() {
    this.managementClient = new ManagementClient({
      domain: config.jwt.domain,
      token: config.jwt.auth0ApiToken
    });
  }

  create(user, cb) {
    if (!user.email || !user.password) {
      //return Promise.reject(new Error('Invalid user, must have an email and a password'));
    }

    var userData = _.pick(user, 'email', 'password', 'name');
    userData.connection = 'Username-Password-Authentication';

    this.managementClient.users.create(userData, function(err, userCreated){
      if (err) {
        //return callback(new ApiError(errors.internal_server_error_500.server_error, null, err));
        cb(err);
      }

      return cb(null, userCreated);
    });
  }
}

const singleton = new UserAuth0Service();

export default singleton;
