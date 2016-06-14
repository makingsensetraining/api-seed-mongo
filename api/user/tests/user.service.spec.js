'use strict';

import app from '../../..';
import UserService from './../user.service.js';

// ERRORS
import errors from '../../../errors/errors';
function getUser() {
  let user = {
    firstName: 'User',
    lastName: 'Test',
    email: getRandomEmail(),
    password: '123456'
  };

  return user;
};

function getRandomEmail(){
  return `${Math.random().toString(36).substring(7)}@test.com`;
};

describe('[Service] [Users]', function() {

  it('should create users', function() {
    const user = getUser();

    UserService.create(user, null, function(err, userCreated){
      UserService.findAll(function(err, users){
        users.length.should.equal(1);
      });
    });
  });

  it('should create users with a phone number valid', function() {
    const user = getUser();
    user.phone = '+1 650-253-0000';

    UserService.create(user, null, function(err, userCreated){
      UserService.findAll(function(err, users){
        users.length.should.equal(1);
      });
    });
  });

  it('should not allow you to create users without a valid email', function() {
    const user = getUser();
    delete user.email;

    UserService.create(user, null, function(err){
      err.message.should.equal(errors.bad_request_400.invalid_email.message);
    });
  });

  it('should not allow you to create users without a first name', function() {
    const user = getUser();
    delete user.firstName;

    UserService.create(user, null, function(err){
      err.message.should.equal(errors.bad_request_400.invalid_first_name.message);
    });
  });

  it('should not allow you to create users without a first name', function() {
    const user = getUser();
    delete user.lastName;

    UserService.create(user, null, function(err){
      err.message.should.equal(errors.bad_request_400.invalid_last_name.message);
    });
  });

  it('should not allow you to create users with a phone number < 2 chars', function() {
    const user = getUser();
    user.phone = '1';

    UserService.create(user, null, function(err, userCreated){
      err.message.should.equal(errors.bad_request_400.invalid_phone.message);
    });
  });

  it('should not allow you to create users with a phone number > 45 chars', function() {
    const user = getUser();
    user.phone = '12300029291929394944 292929291 939393333333 9944494949494949494900000';

    UserService.create(user, null, function(err, userCreated){
      err.message.should.equal(errors.bad_request_400.invalid_phone.message);
    });
  });

});
