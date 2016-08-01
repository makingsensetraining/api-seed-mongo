"use strict";

// LIBRARIES
import mongoose from 'mongoose';
import * as uuid from "node-uuid";

let Schema = mongoose.Schema;

let postSchema = new Schema({
  _id: String,
  title: { type: String },
  text: { type: String }
});

postSchema.pre('save', function (next) {
  if (this._id === undefined) {
    this._id = uuid.v1();
  }
  next();
});

postSchema.statics.getPosts = function(cb){
  this.model('Post').find()
    .exec(cb);
};

postSchema.statics.getPostById = function(id, lean, cb){
  let query = this.model('Post')
    .findOne()
    .where('_id').equals(id);

  if(lean){
    query.lean();
  }

  query.exec(cb);
};

export default mongoose.model('Post', postSchema);
