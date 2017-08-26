// Require mongoose
var mongoose = require("mongoose");
// Create a schema class
var Schema = mongoose.Schema;

// Create the Note schema
var CommentSchema = new Schema({
  // Just a string
  // Just a string
  body: {
    type: String
  }
});

var Comment = mongoose.model("Comment", CommentSchema);

module.exports = Comment;
