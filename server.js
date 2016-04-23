 // All the packages we need
var express = require('express');
var app = express();
var bodyParser = require('body-parser');
var morgan = require('morgan');
var mongoose = require('mongoose');

var jwt = require('jsonwebtoken');
var config = require('./config');
var User = require('./app/models/user');



var port = process.env.PORT || 3000;
mongoose.connect(config.database); //contains the URI of our mongoose database
app.set('superSecret', config.secret);

// The body parser library is used to remove information from the POST requests
app.use(bodyParser.urlencoded( {extended:false}));
app.use(bodyParser.json());


// Morgan is a library that apparently makes the looging of requests look muc more readable.
// Only time will tell how useful this actually is.
app.use(morgan('dev'));


// Home route for m entire application to rest on
app.get('/', function(req, res) {

	res.send('Hello! the API is at http://localhost:' + port +'/api');
})


app.get('/setup', function(req, res) {

	var nick = new User({
		name:'Nick',
		password:'password',
		admin:true
	});

	nick.save(function(err) {

		if(err) throw err;

		console.log('User saved successfully');
		res.json({ success : true });
	});
});

// Here I need to set up my actual API routes
var apiRoutes = express.Router();

apiRoutes.use(function(req, res, next) {
	//get the token
	var token = req.body.token || req.query.token || req.headers['x-access-token'];

	// check if token exists
	if(token) {
		jwt.verify(token, app.get('superSecret'), function(err, decoded) {
			if (err) {
    		    return res.json({ success: false, message: 'Failed to authenticate token.' });    
   		   	} else {
        		// if everything is good, save to request for use in other routes
		        req.decoded = decoded;    
		        next();
		    }

		});

	}else {

    // if there is no token
    // return an error
	    return res.status(403).send({ 
	        success: false, 
	        message: 'No token provided.' 
	    });
	}
});

apiRoutes.get('/', function(req, res) {
	res.json({ message: 'Welcome to the coolest API on earth'});
});

apiRoutes.get('/users', function(req, res) {
	User.find({}, function(err, users) {
		res.json(users);
	});
});

apiRoutes.post('/authenticate', function(req, res) {

	User.findOne({
		name :  req.body.name
	}, function(err, user){
		if(err) throw err;

		if(!user) {
			res.json({ success: false, message: 'Authentication failed. User not found'});
		}else if(user) {
			if (user.password!=req.body.password) {
				res.json({ success : false, message:'Authentication failed. Incorrect password'});
			}else {
				var token = jwt.sign(user, app.get('superSecret'), {
					expireInMinutes: 1440
				});

				res.json({
					success: true,
					message: 'Enjoy your token',
					token : token
				})

			}
		}

	});
});

app.use('/api', apiRoutes);

// Making the app listen on a specific route.
app.listen(port, function() {
	console.log('starting server on port:' + port);
})