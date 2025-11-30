const mongoose = require('mongoose');
const Joi = require('joi');

// Mongoose Schema
const userSchema = new mongoose.Schema({
    email: {
        type: String,
        required: true,
        unique: true,
        trim: true,
    },
    fullName: {
        firstName: {
            type: String,
            required: true,
            trim: true,
        },
        lastName: {
            type: String,
            required: true,
            trim: true,
        },
    },
    password: {
        type: String,
        required: true,
    },
}, {
    timestamps: true
});

// Joi Validation Function
const validateUser = (userData) => {
    const schema = Joi.object({
        email: Joi.string().email().required(),
        fullName: Joi.object({
            firstName: Joi.string().min(2).max(30).required(),
            lastName: Joi.string().min(2).max(30).required(),
        }).required(),
        password: Joi.string().min(6).max(50).required(),
    });
    return schema.validate(userData);
};
const userModel = mongoose.model('User', userSchema)

module.exports = {
    userModel,
    validateUser
}