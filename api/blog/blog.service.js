'use strict';

// LIBRARIES
import _ from 'lodash';

// MODEL
import Post from './post.model';

// SERVICE

// ERRORS
import ApiError from '../../errors/ApiError';
import errors from '../../errors/errors';

// HELPERS
import {postValidations} from '../../utils/validations.helper';

// UTILS

const SANITIZE_FIELDS = ['title', 'text'];

function sanitize(post) {
  return _.pick(_.cloneDeep(post), SANITIZE_FIELDS);
}

function validate(post) {
  // Post validations.
  return postValidations(post);
}

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
        return cb(new ApiError(errors.not_found_404.post_not_found));
      }

      cb(null, post);
    });
  }

  create(post, ctx, cb) {
    post = sanitize(post);

    // validations.
    var hasError = validate(post);
    if (hasError) {
      return cb(hasError);
    }

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
    if (!id) {
      return cb(new ApiError(errors.bad_request_400.invalid_post_id));
    }

    Post.getPostById(id, false, function (err, post) {

      if (err) {
        return cb(new ApiError(errors.internal_server_error_500.server_error, null, err));
      }

      if (!post) {
        return cb(new ApiError(errors.not_found_404.post_not_found));
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
    sanitize(changes);

    var hasError = validate(changes);
    if (hasError) {
      return cb(hasError);
    }

    if (!postId) {
      return cb(new ApiError(errors.bad_request_400.invalid_post_id));
    }

    Post.getPostById(postId, false, function (err, post) {

      if (err) {
        return cb(new ApiError(errors.internal_server_error_500.server_error, null, err));
      }

      if (!post) {
        return cb(new ApiError(errors.not_found_404.post_not_found));
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
