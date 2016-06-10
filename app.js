'use strict';

import express from 'express';
import config from './config/environment';
import http from 'http';
import mongoose from 'mongoose';

// Setup server
var app = express();
var server = http.createServer(app);

require('./config/express').default(app);
require('./routes.js').default(app);

// Start server
function startServer() {
  const options = {
    server : {socketOptions: {keepAlive: 1, connectTimeoutMS: 30000}},
    replset: {socketOptions: {keepAlive: 1, connectTimeoutMS: 30000}}
  };

  mongoose.connect(config.database.uri, options);

  mongoose.connection.once('open', function () {
    console.log('Mongoose default connection open to ' +  config.database.host);

    app.apiInstance = server.listen(config.port, config.ip, function() {
      console.log(`Express server listening on ${config.port}, in ${app.get('env')} mode using database: ${config.database.database}`);
    });

  });


  // CONNECTION EVENTS
// If the connection throws an error
  mongoose.connection.on('error', function (err) {
    console.error('Mongoose default connection error.', err);
  });

// When the connection is disconnected
  mongoose.connection.on('disconnected', function () {
    console.error('Mongoose default connection disconnected');
    process.exit(1);
  });

// If the Node process ends, close the Mongoose connection
  process.on('SIGINT', function () {
    mongoose.connection.close(function () {
      console.log('Mongoose default connection disconnected through app termination');
      process.exit(0);
    });
  });
}

startServer();

// Expose app
export default app;
