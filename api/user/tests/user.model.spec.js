'use strict';

import app from '../../..';
import User from './../user.model.js';

// ERRORS.
import errors from '../../../errors/errors';

var user;

var genUser = function() {
  user = new User({
    firstName: 'User',
    lastName: 'Test',
    email: 'test@test.org'
  });

  return user;
};

describe('[Model] [Users]', function() {
  beforeEach(genUser);

  afterEach(function() {
    User.remove({});
  });

  it('should begin with no users', function() {
    User.getUsers(function(err, users){
      users.should.have.length(0);
    });
  });

  it('should allow you to save a user with minimal information', function() {
        const user = new User({
        firstName: "john",
        userName: "bill",
        email: "jhon.bill@mail.com"
      });

      user.save(function(err, userSaved) {
        should.not.exist(err);
        should.exist(userSaved);

        User.getUsers(function (err, users) {
          users.should.have.length(1);
        });
      });

  });

});
