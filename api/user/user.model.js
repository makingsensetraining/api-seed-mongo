"use strict";

// LIBRARIES
import _ from 'lodash';
import mongoose from 'mongoose';

let Schema = mongoose.Schema;
let Document = mongoose.Document;
let ObjectId = mongoose.Types.ObjectId;

let userSchema = new Schema({
  firstName: String,
  lastName : String,
  email    : String,
  phone    : String,
  status   : String,
  auth0Id  : String,
  _roleId  :{type: Schema.Types.ObjectId, ref: 'User'}
});

export default mongoose.model('User', userSchema);
