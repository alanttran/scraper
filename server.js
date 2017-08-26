// Dependencies
const express = require("express");
const bodyParser = require("body-parser");
const logger = require("morgan");
const mongoose = require("mongoose");
// Requiring our Note and Article models
//const Note = require("./models/Note.js");
const Article = require("./models/Article.js");
const Comment = require("./models/Comment.js");
// Our scraping tools
const request = require("request");
const cheerio = require("cheerio");
// Set mongoose to leverage built in JavaScript ES6 Promises
mongoose.Promise = Promise;


// Initialize Express
const app = express();

// Use morgan and body parser with our app
app.use(logger("dev"));
app.use(bodyParser.urlencoded({
    extended: false
}));

// Make public a static dir
app.use(express.static("public"));

// Database configuration with mongoose
mongoose.connect("mongodb://heroku_ddxh53kx:35kaq628jgdblh5qu5hgmvm1vc@ds161503.mlab.com:61503/heroku_ddxh53kx");
//mongoose.connect("mongodb://localhost/scrapermongoose");
const db = mongoose.connection;

// Show any mongoose errors
db.on("error", function(error) {
    console.log("Mongoose Error: ", error);
});

// Once logged in to the db through mongoose, log a success message
db.once("open", function() {
    console.log("Mongoose connection successful.");
});


// Routes
// ======

// A GET request to scrape the echojs website
app.get("/scrape", (req, res) => {
    // First, we grab the body of the html with request
    const website = "https://www.gamespot.com/news/";
    console.log('homepage!');
    request(website, function(error, response, html) {
        // Then, we load that into cheerio and save it to $ for a shorthand selector
        const $ = cheerio.load(html);
        // Now, we grab every h2 within an article tag, and do the following:
        $(".media-article").each(function(i, element) {

            // Save an empty result object
            var result = {};

            // Add the text and href of every link, and save them as properties of the result object
            result.title = $(this).children().children().children(".media-title").text();
            result.body = $(this).children().children().children(".media-deck").text();
            result.link = website.replace('/news/','') + $(this).children('.js-event-tracking').attr('href');

            // Using our Article model, create a new entry
            // This effectively passes the result object to the entry (and the title and link)
            var entry = new Article(result);

            // Now, save that entry to the db
            entry.save(function(err, doc) {
                // Log any errors
                if (err) {
                    console.log(err);
                }
                // Or log the doc
                else {
                    console.log(doc);
                }
            });

        });
    });

    // Tell the browser that we finished scraping the text
    console.log("Scrape complete");
    res.send("whee")
});

// This will get the articles we scraped from the mongoDB
app.get("/articles", function(req, res) {


    // TODO: Finish the route so it grabs all of the articles

    Article.find({}, function(error,doc) {
        if (error) {
            console.log(error);
        }
        // Or log the doc
        else {
           res.send(doc);
        }
    })


});

// This will grab an article by it's ObjectId
app.get("/articles/:id", function(req, res) {

    
    Article.findOne({_id:req.params.id})
    .populate("comment")
    .exec(function(error,doc){
      if (error) {
            console.log(error);
        }
        // Or log the doc
        else {
           res.json(doc);
        }
    }) 
});

app.delete("/comments/:id", function(req, res) {
    Article.findOne({_id:req.params.id})
    .exec(function(error,doc){
        console.log("comment id" + doc.comment);
        Comment.find({_id:doc.comment}).remove().exec(function(error,doc){
            console.log("comment" + doc);
        })
    })   
    res.send("whee");
});

// Create a new note or replace an existing note
app.post("/articles/:id", function(req, res) {

    newComment = new Comment(req.body);

    newComment.save(function(err,doc){
      if(err) res.send(err)
      else{
        Article.findOneAndUpdate({"_id":req.params.id},{"comment": doc._id}, function(error,doc){

          if(error) res.send(error)
            else res.send(doc);
        })
      }
    })
   
});


// Listen on port 3000
app.listen(3000, function() {
    console.log("App running on port 3000!");
});