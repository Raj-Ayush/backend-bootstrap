const {DataTypes} = require('sequelize');
const {sequelize} = require('../connection/db');

const User = sequelize.define('User', {
    id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
    },
    email: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true,
        validate: {
            isEmail: true,
        },
    },
    password: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    firstName: {
        type: DataTypes.STRING,
        allowNull: false,
        validate: {
            len: [2, 100], // Validate length between 2 and 100 characters
        },
    },
    lastName: {
        type: DataTypes.STRING,
        allowNull: false,
        validate: {
            len: [2, 100], // Validate length between 2 and 100 characters
        },
    },
    dob: {
        type: DataTypes.DATE,
        allowNull: false,
        validate: {
            isDate: true, // Ensure it's a valid date
            isOldEnough(value) {
                const today = new Date();
                const age = today.getFullYear() - value.getFullYear();
                if (age < 18) {
                    throw new Error('User must be at least 18 years old.');
                }
            },
        },
    },
    isActive: {
        type: DataTypes.BOOLEAN,
        defaultValue: true,
    },
    refreshToken: {
        type: DataTypes.TEXT,
        allowNull: true,
    },
}, {
    timestamps: true,
    tableName: 'Users',
});

module.exports = User;
