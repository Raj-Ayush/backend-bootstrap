const {sequelize} = require('../connection/db');
const User = require('./user.model'); // Import all your models here
const Session = require('./session.model'); // Import all your models here

// If you have associations, define them here
// e.g., User.hasMany(Post);

const syncModels = async () => {
    try {
        await sequelize.sync({alter: true}); // `alter: true` updates the tables to match the models
        console.log('All models were synchronized successfully.');
    } catch (error) {
        console.error('Error synchronizing models:', error);
        throw error;
    }
};

module.exports = {
    User,
    Session,
    syncModels,
};
