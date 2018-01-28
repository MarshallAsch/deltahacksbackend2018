var express = require("express");
var path = require("path");
var logger = require("morgan");
var cookieParser = require("cookie-parser");
var bodyParser = require("body-parser");
var http = require("http");
var mysql = require("mysql");

var index = require(__dirname + "/routes/index");
var objects = require(__dirname + "/routes/objects");

var app = express();

require('dotenv').config({path: "config.env"});

// Load the values from the environment variables
var port = process.env.PORT || 3000;
var dbHost = process.env.DBHOST || "localhost";
var dbUser = process.env.DBUSERNAME || "deltaHacks";
var dbPass = process.env.DBPASSWORD || "awsomeHack";
var dbName = process.env.DBNAME || "deltahacks";


// view engine setup
app.set("views", path.join(__dirname, "views"));
app.set("view engine", "jade");

app.use(logger("dev"));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, "public")));

//Database connection
app.use(function(req, res, next){
    res.locals.connection = mysql.createConnection({
        host     : dbHost,
        user     : dbUser,
        password : dbPass,
        database : dbName
    });
    res.locals.connection.connect();
    next();
});


// define the data route handlers
app.use("/", index);
app.use("/v1/objects", objects);




// catch 404 and forward to error handler
app.use(function(req, res, next) {
    var err = new Error("Not Found");
    err.status = 404;
    next(err);
});

// capture all of the errors and resturn the error payload
app.use(function(err, req, res, next) {
    res.status(err.status || 500);
    res.send({"status": err.status || 500, "error": {message:  err.message || "Unknown Error", code: err.code || "err-unknown", error: err.error || err}, "response": null});

});

module.exports = app;

var server = http.createServer(app);

server.listen(port, 'localhost');
server.on('listening', function() {
    console.log('Express server started on port %s at %s', server.address().port, server.address().address);
});
