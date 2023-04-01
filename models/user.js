const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
    username: {
        type: String,
        required: true,
    },
    password: {
        type: String,
        required: true,
    },
    token: {
        type: String,
        defaultValue: '',
    }
});

module.exports = mongoose.model("userman", userSchema);