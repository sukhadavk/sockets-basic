var PORT = process.env.PORT || 3000;
var express = require('express');
var app = express();
var moment = require('moment');

var http = require('http').Server(app);
var io = require('socket.io')(http);

app.use(express.static(__dirname + '/public'));

var clientInfo = {};
//send current users to provided sockets
function sendCurrentUsers(socket) {
	var info = clientInfo[socket.id];
	var users = [];

	if(typeof info === 'undefined'){
		return;
	}

	Object.keys(clientInfo).forEach(function (socketId) {
		var userInfo = clientInfo[socketId];
		if(userInfo.room === info.room) {
			users.push(userInfo.name);
		}
	});
	
	socket.emit('message', {
				name: 'System',
				text: 'Current users: ' + users.join(', '),
				timestamp: moment().valueOf()		
	});
};


io.on('connection', function(socket) {
	console.log('user connected via socket.io');

	socket.on('disconnect', function() {
		var userData = clientInfo[socket.id];
		if (userData.name !== 'undefined') {
			socket.leave(userData.room);
			io.to(userData.room).emit('message', {
				name: 'System',
				text: userData.name + ' has left the room!',
				timestamp: moment().valueOf()
			});
			delete clientInfo[socket.id];
		}
	});

	socket.on('joinRoom', function(req) {
		clientInfo[socket.id] = req;
		socket.join(req.room);
		socket.broadcast.to(req.room).emit('message', {
			name: 'System',
			text: req.name + ' has joined!',
			timestamp: moment().valueOf()
		});
	});

	socket.on('message', function(message) {
		console.log('Message Received : ' + message.text);

		if (message.text === '@currentUsers') {
			sendCurrentUsers(socket);
		} else {
			message.timestamp = moment().valueOf();
			io.to(clientInfo[socket.id].room).emit('message', message);
		}
	});

	socket.emit('message', {
		name: 'System',
		text: 'Welcome to chat application!',
		timestamp: moment().valueOf()
	});
});

http.listen(PORT, function() {
	console.log('Server started')
});