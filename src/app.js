/* eslint-disable no-unused-vars */
const createError = require('http-errors');
const express = require('express');
const path = require('path');
const cookieParser = require('cookie-parser');
const logger = require('morgan');
const swaggerUi = require('swagger-ui-express');
const swaggerFile = require('./swagger_output.json');

// global features importing
const v1Routes = require('./routes/v1');

const {errorConverter, errorHandler} = require('./features/error');

const app = express();

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({extended: false}));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

// Define Version-specific routes
app.use('/api/v1', v1Routes);

// Swagger documentation route
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerFile));

// Error handling
app.use(errorConverter);
app.use(errorHandler);
module.exports = app;
