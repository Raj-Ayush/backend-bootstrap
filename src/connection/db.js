const {Sequelize} = require('sequelize');
const logger = require('../features/logger');
const config = require('../../config/config');
const httpStatus = require('http-status');
const ApiError = require('../features/error');

// Initialize Sequelize without specifying a database
let sequelize = new Sequelize(config.database.dbname, config.database.db_user, config.database.db_password, {
    host: config.database.host,
    dialect: config.database.type,
    logging: config.debug_sequelize ? msg => logger.info(msg) : false,
    dialectOptions: {
        connectTimeout: 60000,
    },
});

const connectDB = async () => {
    try {
        // Step 1: Check if the database exists and create it if it doesn't
        await sequelize.query(`CREATE DATABASE IF NOT EXISTS \`${config.database.dbname}\`;`);
        logger.info(`Database '${config.database.dbname}' ensured to exist.`);

        // Step 2: Re-initialize Sequelize with the specified database
        sequelize = new Sequelize(config.database.dbname, config.database.db_user, config.database.db_password, {
            host: config.database.host,
            dialect: config.database.type,
            logging: config.debug_sequelize ? msg => logger.info(msg) : false,
            dialectOptions: {
                connectTimeout: 60000,
            },
        });

        // Step 3: Test the connection
        await sequelize.authenticate();
        logger.info('Database connected successfully');

        // Step 4: Sync models
        const {syncModels} = require('../models'); // Import the syncModels function
        await syncModels();

        return sequelize;
    } catch (err) {
        logger.error('Database connection error:', err);

        // Step 5: Handle specific Sequelize errors
        if (err instanceof Sequelize.ConnectionError) {
            throw new ApiError(httpStatus.SERVICE_UNAVAILABLE, 'Database connection error');
        } else if (err instanceof Sequelize.TimeoutError) {
            throw new ApiError(httpStatus.REQUEST_TIMEOUT, 'Database connection timed out');
        } else if (err instanceof Sequelize.ValidationError) {
            throw new ApiError(httpStatus.BAD_REQUEST, 'Database validation error');
        } else {
            throw new ApiError(httpStatus.INTERNAL_SERVER_ERROR, 'An unexpected error occurred during database connection');
        }
    }
};

module.exports = {connectDB, sequelize};
