/*
 * How to setup up user models
 * Step 1: get an instance of mongoonse and mongoose.Schema
 * Step 2: export the model through mongoose.model('Name', JSONAttributes)
 */

var mongoose = require('mongoose');
var Schema = mongoose.Schema;

module.exports = mongoose.model('User', new Schema({
	name: String,
	password: String,
	admin: Boolean
}));