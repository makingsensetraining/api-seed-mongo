'use strict';

// LIBRARIES

// SERVICES
import BlogService from './blog.service';

// ERRORS
import ApiError from '../../errors/ApiError';
import errors from '../../errors/errors';

class BlogController {
  /**
   * Get list of users
   * restriction: 'admin'
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

  // /**
  //  * Creates a new user
  //  */
  // create(req, res, next) {
  //   var user = req.body;
  //   var ctx = req.ctx;
  //
  //   UserService.create(user, ctx, function(err, user){
  //     if (err) {
  //       err.setReq(req);
  //       return next(err);
  //     }
  //
  //     res.status(201).json({user});
  //   });
  // }
  //
  // /**
  //  * Updates a single user
  //  */
  // update(req, res, next) {
  //   var user = req.user;
  //   var changes = req.body;
  //   var ctx = req.ctx;
  //
  //   ctx.requester = user;
  //
  //   UserService.update(user, changes, ctx, function(err, updatedUser){
  //     if (err) {
  //       err.setReq(req);
  //       return next(err);
  //     }
  //
  //     res.json({user: updatedUser});
  //   });
  // }
  //
  // /**
  //  * Get a single user
  //  */
  // show(req, res, next) {
  //   const user = req.user;
  //   const token = req.token;
  //   let id = req.params.user;
  //
  //   if (id === 'self' || id === 'me') {
  //     if (token && !user) { //user is authenticated but not registered
  //       return next(new ApiError(errors.not_found_404.user_not_signed_up));
  //     }
  //
  //     id = user.id;
  //   }
  //
  //   /*
  //    if (user.id !== id && !user.isAdmin) {
  //    return next(new ApiError(errors.foridden_403.user_permission_denied));
  //    }
  //    */
  //
  //   UserService.findById(id, function(err,user){
  //     if (err) {
  //       err.setReq(req);
  //       return next(err);
  //     }
  //
  //     if (!user) {
  //       throw new ApiError(errors.not_found_404.user_not_found);
  //     }
  //
  //     res.status(201).json({user});
  //   });
  // }
  //
  // /**
  //  * Deletes a user
  //  * restriction: 'admin'
  //  */
  // destroy(req, res, next) {
  //   const ctx = req.ctx;
  //   const id = req.params.id;
  //
  //   ctx.requester = req.user;
  //
  //   UserService.delete(id, ctx, function(err){
  //     if (err) {
  //       err.setReq(req);
  //       return next(err);
  //     }
  //
  //     res.status(204).json({user});
  //   });
  // }
}

var blogController = new BlogController();

export default blogController;
