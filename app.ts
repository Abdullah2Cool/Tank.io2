// app.js
var express = require('express');
var app = express();
var server = require('http').createServer(app);

app.get('/', function (req, res, next) {
    res.sendFile(__dirname + '/client/index.html');
});
app.get('/*', function (req, res, next) {
    var file = req.params[0];
    console.log('\t :: Express :: file requested : ' + file);
    res.sendFile(__dirname + "/client/" + file);
});
app.use('/client', express.static(__dirname + '/client'));
server.listen(process.env.PORT || 3000);
console.log('Server Started on localhost:3000')

var io = require('socket.io')(server, {});

var ALL_SOCKETS = {};

io.sockets.on('connection', function (socket) {
    console.log("Socket connected:", socket.id);

    ALL_SOCKETS[socket.id] = socket.id;

    socket.emit("ready", {
        id: socket.id,
        others: ALL_SOCKETS
    });

    socket.broadcast.emit("newPlayer", {
        id: socket.id
    });

    socket.on('disconnect', function () {
        delete ALL_SOCKETS[socket.id];
        socket.broadcast.emit("removed", {
            id: socket.id
        });
        console.log("Socket disconnected:", socket.id);
    });
});