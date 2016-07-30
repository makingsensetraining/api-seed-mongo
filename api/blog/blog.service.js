'use strict';

// LIBRARIES
import _ from 'lodash';
import async from 'async';
import mongoose from 'mongoose';

// MODEL
import Post from './post.model';

// SERVICE

// ERRORS
import ApiError from '../../errors/ApiError';
import errors from '../../errors/errors';

// HELPERS
import {validations, validationsToUpdate, userValidations} from '../../utils/validations.helper';

// UTILS
import Logger from '../../utils/logger';

// const SANITIZE_FIELDS = ['firstName', 'lastName', 'phone', 'email', 'password'];
//
// function sanitize(user) {
//   return _.pick(_.cloneDeep(user), SANITIZE_FIELDS);
// }
//
// function sanitizeByAdmin(user) {
//   return _.pick(_.cloneDeep(user), SANITIZE_FIELDS.concat(['role', 'status']));
// }

// function validate(user) {
//   // firstly check common validations.
//   var error = validations(user);
//
//   if (error) {
//     return error;
//   }
//
//   // later user validations.
//   return userValidations(user);
// }

class BlogService {

  findAll(cb) {
    Post.getPosts(function (err, posts) {

      if (err) {
        return cb(new ApiError(errors.internal_server_error_500.server_error, null, err));
      }

      cb(null, posts);
    });
  }

  findById(id, cb) {
    Post.getPostById(id, false, function (err, post) {

      if (err) {
        return cb(new ApiError(errors.internal_server_error_500.server_error, null, err));
      }

      if (!post) {
        return cb(new ApiError(errors.not_found_404.user_not_found));
      }

      cb(null, post);
    });
  }

  create(post, ctx, cb) {
    // newPost = sanitize(newPost);
    //id ? ToDo: check!

    // // validations.
    // var hasError = validate(newUser);
    // if (hasError) {
    //   return cb(hasError);
    // }

    var newPost = new Post({
      title: post.title,
      text: post.text
    });

    newPost.save(function(err, result){
      if (err) {
        return cb(new ApiError(errors.internal_server_error_500.server_error, null, err));
      }
      return cb(null, result);
    });
  }

  delete(id, ctx, cb) {
    var requester = ctx.requester || {};

    if (!id) {
      return cb(new ApiError(errors.bad_request_400.invalid_user_id));
    }

    Post.getPostById(id, false, function (err, post) {

      if (err) {
        return cb(new ApiError(errors.internal_server_error_500.server_error, null, err));
      }

      if (!post) {
        return cb(new ApiError(errors.not_found_404.user_not_found));
      }

      Post.remove({ _id: id}, function(err){
        if (err) {
          return cb(new ApiError(errors.internal_server_error_500.server_error, null, err));
        }

        return cb(null, true);
      });
    });
  }


  update(postId, changes, ctx, cb) {
    var requester = ctx.requester;

    // sanitize(changes);

    // var hasError = validateUpdate(changes);
    // if (hasError) {
    //   return cb(hasError);
    // }

    if (!postId) {
      return cb(new ApiError(errors.bad_request_400.invalid_user_id));
    }

    Post.getPostById(postId, false, function (err, post) {

      if (err) {
        return cb(new ApiError(errors.internal_server_error_500.server_error, null, err));
      }

      if (!post) {
        return cb(new ApiError(errors.not_found_404.user_not_found));
      }

      post.set('title', changes.title);
      post.set('text', changes.text);

      post.save(function(err, result){
        if (err) {
          return cb(new ApiError(errors.internal_server_error_500.server_error, null, err));
        }
        return cb(null, result);
      });
    });
  }
}

var blogServiceSingleton = new BlogService();

export default blogServiceSingleton;
