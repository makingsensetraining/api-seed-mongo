'use-strict';

// LIBRARIES
import _ from 'lodash';
import async from 'async';
import mongoose from 'mongoose';
let ObjectId = mongoose.Types.ObjectId;

// MODEL
import User from './user.model';
import Role from './role.model';

// SERVICE
import UserAuth0Service from './user.auth0.service';

// ERRORS
import ApiError from '../../errors/ApiError';
import errors from '../../errors/errors';

// HELPERS
import {validations, validationsToUpdate, userValidations} from '../../utils/validations.helper';

// UTILS
import Logger from '../../utils/logger';

const SANITIZE_FIELDS = ['firstName', 'lastName', 'phone', 'email', 'password'];

function sanitize(user) {
  return _.pick(_.cloneDeep(user), SANITIZE_FIELDS);
}

function sanitizeByAdmin(user) {
  return _.pick(_.cloneDeep(user), SANITIZE_FIELDS.concat(['role', 'status']));
}

function validate(user) {
  // firstly check common validations.
  var error = validations(user);

  if (error) {
    return error;
  }

  // later user validations.
  return userValidations(user);
}

function validateUpdate(user) {
  // firstly check common validations.
  var error = validationsToUpdate(user);

  if (error) {
    return error;
  }

  // later user validations.
  return userValidations(user);
}

function isRequesterAdmin(requester) {
  return (requester.isAdmin || requester.role === 'admin');
}

function checkEmailAvailableToCreate(email, cb) {
  email = email.trim().toLowerCase();

  User.countUsersByEmail(email, function(err, count){
    if (err) {
      return cb(new ApiError(errors.internal_server_error_500.server_error, null, err));
    }

    return cb(null, count === 0);
  });
}

function checkEmailAvailableToUpdate(email, id, cb) {
  // todo: refactoring this validation.
  /*
  if (!email) {
    return Promise.resolve({'valid': true});
  }
  */
  email = email.trim().toLowerCase();

  User.checkEmailConsideringId(email, id, function(err, count) {
    if (err) {
      return cb(new ApiError(errors.internal_server_error_500.server_error, null, err));
    }

    return cb(null, count === 0);
  });
}

class UserService {
  findById(id, cb) {
    try {
      new ObjectId(id);
    } catch (err) {
      return cb(new ApiError(errors.bad_request_400.invalid_user_id, null, err));
    }

    User.getUserById(id, false, function (err, user) {
      /* istanbul ignore if */
      if (err) {
        return cb(new ApiError(errors.internal_server_error_500.server_error, null, err));
      }

      if (!user) {
        return cb(new ApiError(errors.not_found_404.user_not_found));
      }

      cb(null, user);
    });
  }

  findByAuth0Id(id, cb) {
    User.getUserByAuth0Id(id, function (err, user) {
      if (err) {
        return cb(new ApiError(errors.internal_server_error_500.server_error, null, err));
      }

      if (!user) {
        return cb(new ApiError(errors.not_found_404.user_not_found));
      }

      cb(null, user);
    });
  }

  findByEmail(email, cb) {
    User.getUserByEmail(email, function (err, user) {
      if (err) {
        return cb(new ApiError(errors.internal_server_error_500.server_error, null, err));
      }

      if (!user) {
        return cb(new ApiError(errors.not_found_404.user_not_found));
      }

      cb(null, user);
    });
  }

  findAll(cb) {
    User.getUsers(function (err, users) {
      /* istanbul ignore if */
      if (err) {
        return cb(new ApiError(errors.internal_server_error_500.server_error, null, err));
      }

      cb(null, users);
    });
  }

  update(userId, changes, ctx, cb) {
    var requester = ctx.requester;

    if (requester.status && requester.status !== 'active') {
      return cb(new ApiError(errors.forbidden_403.user_permission_denied));
    }

    changes = isRequesterAdmin(requester) ? sanitizeByAdmin(changes) : sanitize(changes);

    var hasError = validateUpdate(changes);
    if (hasError) {
      return cb(hasError);
    }

    checkEmailAvailableToUpdate(changes.email, userId, function (err, res) {
      if (!res) {
        return cb(new ApiError(errors.bad_request_400.user_email_used));
      }

      User.findOne().where('_id').equals(userId).exec(function (err, dbUser) {
        if (err) {
          Logger.log('error', `[SERVICE] [USER] Error getting User`, {err, ctx, userId});
          return cb(new ApiError(errors.internal_server_error_500.server_error, null, err));
        }

        dbUser.set('firstName', changes.firstName);
        dbUser.set('lastName', changes.lastName);

        dbUser.save(function (err, dbUser) {
          if (err) {
            Logger.log('error', `[SERVICE] [USER] Error updating User with id: ${userId}`, {err, ctx});
            return cb(new ApiError(errors.internal_server_error_500.server_error, null, err));
          }

          Logger.log('info', `[SERVICE] [USER] User with id: ${userId} has been updated`, {changes});
          return cb(null, dbUser.toObject());
        });
      });
    });
  }

  create(newUser, ctx, cb) {
    console.log('111111 >');


    newUser = sanitize(newUser);
    newUser.roleId = 2; //user
    newUser.status = 'active';

    // validations.
    var hasError = validate(newUser);
    if (hasError) {
      return cb(hasError);
    }

    async.waterfall([
      // check email available.
      function (callback) {
        checkEmailAvailableToCreate(newUser.email, function (err, res) {
          if (err) {
            callback(err);
          }

          callback(null, res);
        });
      },
      // user creation in Auth0.
      function (emailAvailable, callback) {
        if (!emailAvailable) {
          return callback(new ApiError(errors.bad_request_400.user_email_used));
        }

        UserAuth0Service.create(newUser, function (err, auth0User) {
          if (err) {
            var error = _.cloneDeep(new ApiError(errors.bad_request_400.user_auth0_integration));
            error.message = error.message.concat(`Details here: ${err.message}`);

            return callback(error);
          }

          // remove this attribute because the authentication will be handle for auth0.
          delete newUser.password;
          newUser.auth0Id = auth0User.user_id;

          const user = new User(newUser);


          callback(null, user);
        });
      },
      // user creation in the database.
      function (user, callback) {
        user.save(function (err, savedUser) {
          if (err) {
            Logger.log('error', `[SERVICE] [USER] Error creating User`, {err, ctx, newUser});
            return callback(new ApiError(errors.internal_server_error_500.server_error, null, err));
          }

          Logger.log('info', `[SERVICE] [USER] User with id: ${user.id} has been created`, {savedUser, ctx});
          callback(null, savedUser);
        });
      }
    ], function (err, user) {
      if (err) {
        return cb(err);
      }

      cb(null, user);
    });
  }

  delete(id, ctx) {
    var requester = ctx.requester || {};

    if (requester && requester.status && requester.status !== 'active') {
      return cb(new ApiError(errors.forbidden_403.user_permission_denied));
    }

    if (!id) {
      return cb(new ApiError(errors.bad_request_400.invalid_user_id));
    }

    User.findOne().where('_id').equals(id).exec(function (err, dbUser) {
      if (err) {
        Logger.log('error', `[SERVICE] [USER] Error getting User`, {err, ctx, id});
        return cb(new ApiError(errors.internal_server_error_500.server_error, null, err));
      }

      dbUser.set('status', 'inactive');

      dbUser.save(function (err, dbUser) {
        if (err) {
          Logger.log('error', `[SERVICE] [USER] Error trying to set inactive User with id: ${id}`, {err, ctx});
          return cb(new ApiError(errors.internal_server_error_500.server_error, null, err));
        }

        Logger.log('info', `[SERVICE] [USER] User with id: ${id} has been set as inactive`);
        return cb(null, dbUser.toObject());
      });

    });
  }
}

var userServiceSingleton = new UserService();

export default userServiceSingleton;
