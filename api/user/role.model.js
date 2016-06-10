"use strict";

import mongoose from 'mongoose';
let Schema = mongoose.Schema;

let roleSchema = new Schema({
  name: String
});

export default mongoose.model('Role', roleSchema);
