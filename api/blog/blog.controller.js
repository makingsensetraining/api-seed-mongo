'use strict';

// LIBRARIES

// SERVICES
import BlogService from './blog.service';

// ERRORS

class BlogController {

  /**
   * Get list of posts
   */
  index(req, res, next) {
    BlogService.findAll(function(err, posts){
      if (err) {
        err.setReq(req);
        return next(err);
      }

      res.status(200).json({posts});
    });
  }

  /**
   * Get a single post by ID
   */
  show(req, res, next) {
    let id = req.params.post;

    BlogService.findById(id, function(err,post){
      if (err) {
        err.setReq(req);
        return next(err);
      }

      if (!post) {
        err.setReq(req);
        return next(err);
      }

      res.status(201).json({post});
    });
  }

  /**
   * Creates a new post
   */
  create(req, res, next) {
    var post = req.body;
    var ctx = req.ctx;

    BlogService.create(post, ctx, function(err, post){
      if (err) {
        err.setReq(req);
        return next(err);
      }

      res.status(201).json({post});
    });
  }

  /**
   * Deletes a post
   */
  destroy(req, res, next) {
    const ctx = req.ctx;
    const id = req.params.post;

    ctx.requester = req.post;

    BlogService.delete(id, ctx, function(err, ret){
      if (err) {
        err.setReq(req);
        return next(err);
      }

      res.status(204).json({ status: ret });
    });
  }

  /**
   * Updates a single post
   */
  update(req, res, next) {
    var post = req.params.post;
    var changes = req.body;
    var ctx = req.ctx;

    ctx.requester = post;

    BlogService.update(post, changes, ctx, function(err, updatedPost){
      if (err) {
        err.setReq(req);
        return next(err);
      }

      res.json({post: updatedPost});
    });
  }

}

var blogController = new BlogController();

export default blogController;
