
var hostname = '0.0.0.0';
var port = process.env.PORT || 3000;
var express = require('express');
var app = express();
var cookie = require('cookie');
var cookieParser = require('cookie-parser');

app.use(cookieParser());
//app.use(express.static('static'));
app.use("/static", express.static(__dirname + '/static'));

var http = require('http');
var server = http.Server(app);

var io = require('socket.io')(server);

var mongodb = require('mongodb');

app.get('/', function(req, res){
	res.sendfile('login.html');
});

app.get('/signup.html', function(req, res){
	res.sendfile('signup.html');
});


app.get('/index.html', function(req, res){
	var cookies = cookie.parse(req.headers.cookie || '');
	//var cookies = cookie.parse(req.header.cookie);
	console.log(cookies);
	console.log('Cookies: ', req.cookies)
	var goahead = cookies.goahead;
	console.log(goahead);

	if (goahead == 'true') {
		res.sendfile('index.html');
	}

});


var uri = 'mongodb://user1:user1@ds145302.mlab.com:45302/gameblocks';


io.on('connection', function(socket) {
	
	socket.on('signup', function (msg) {

		var username = msg[0];
		var email = msg[1];
		var pw = msg[2];

		mongodb.MongoClient.connect(uri, function (err, db) {

			console.log("signing up")

			if (err) throw err;

			var signup = db.collection('signup');

			signup.insert({username: msg[0],email: msg[1],password: msg[2]}, function (err, result) {

				if (err) throw err;
			});


		});

		console.log('signup initiated' + msg);

	});

	socket.on('verify_creds', function (msg) {

		var username = msg[0];
		var pw = msg[1];

		console.log(msg[0]);
		console.log(msg[1]);



		mongodb.MongoClient.connect(uri, function (err, db) {
			
			if (err) throw err;

			var signup = db.collection('signup');

			signup.findOne({username: msg[0],password: msg[1]}, function (err, result) {
				console.log(result);
				if(result !== null){
					socket.authenticated = true;
					socket.emit('found one','found the record');
				}
				else{

					socket.emit('did not find credentials','found the record');
				}

				if (err) throw err;
			});


		});

		console.log('verify credentials initiated' + msg);

	});

});

server.listen(port, hostname, function(){
	console.log('listening on ' + hostname + ':' + port);
});