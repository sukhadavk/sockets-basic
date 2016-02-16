var PORT = process.env.PORT || 3000;
var express = require('express');
var app = express();
var moment = require('moment');

var http = require('http').Server(app);
var io = require('socket.io')(http);

app.use(express.static(__dirname + '/public'));

io.on('connection', function(socket) {
	console.log('user connected via socket.io');

	socket.on('message', function(message) {
		console.log('Message Received : ' + message.text);

		message.timestamp =  moment().valueOf();
		//io.emit -  vereyone including sender
		io.emit('message', message);
		//excluding sender
		//socket.broadcast.emit('message', message);
	});

	socket.emit('message', {
		text: 'Welcome to chat application!',
		timestamp: moment().valueOf()
	});
});

http.listen(PORT, function() {
	console.log('Server started')
});