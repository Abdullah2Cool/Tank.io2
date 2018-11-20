"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const Player_1 = require("./server/Player");
var express = require('express');
var app = express();
var server = require('http').createServer(app);
app.get('/', function (req, res) {
    res.sendFile(__dirname + '/client/index.html');
});
app.get('/*', function (req, res) {
    var file = req.params[0];
    // console.log('\t :: Express :: file requested : ' + file);
    res.sendFile(__dirname + "/client/" + file);
});
server.listen(process.env.PORT || 3000);
console.log("Server started on localhost:3000");
var io = require('socket.io')(server, {});
var ALL_SOCKETS = {};
var ALL_PLAYERS = {};
var controller = null;
var controller_assigned = false;
var controller_player_id = null;
io.on('connect', function (socket) {
    try {
        console.log("Socket connected:", socket.id);
        ALL_SOCKETS[socket.id] = socket;
        socket.on("registerController", function (data) {
            console.log(`Controller Found`);
            controller = socket;
            controller_assigned = false;
            controller_player_id = null;
            console.log(`${data['message']}`);
        });
        var player;
        socket.on("start", function (data) {
            player = new Player_1.Player(socket.id, data.name);
            console.log("Recieved Name:", data.name);
            // tell the client their own id and the rest of the player
            socket.emit("serverState", {
                id: socket.id,
                otherPlayers: ALL_PLAYERS
            });
            ALL_PLAYERS[socket.id] = player;
            // tell everyone else that their is a new player
            socket.broadcast.emit("newPlayer", {
                id: socket.id,
                newPlayer: player,
                name: data.name
            });
        });
        socket.on("position", function (data) {
            if (ALL_PLAYERS[socket.id]) {
                ALL_PLAYERS[socket.id].x = data.x;
                ALL_PLAYERS[socket.id].y = data.y;
                ALL_PLAYERS[socket.id].r = data.r;
                ALL_PLAYERS[socket.id].health = data.health;
            }
            // console.log("ID:", socket.id, "Received health:", data.health);
        });
        socket.on('shoot', function (data) {
            socket.broadcast.emit('shoot', { id: socket.id });
        });
        socket.on("requestController", function (data) {
            console.log(`${socket.id} requested controller.`);
            if (controller != null && controller_assigned == false) {
                socket.emit("assign_controller", { controller: true });
                controller_assigned = true;
                controller_player_id = socket.id;
                console.log(`Controller Assigned.`);
            }
            else {
                socket.emit("assign_controller", { controller: false });
                console.log(`Controller Not Available`);
            }
        });
        socket.on("disconnect", function () {
            if (controller != null && socket.id == controller.id) {
                // if the controller goes offline
                console.log(`Lost Controller`);
                ALL_SOCKETS[controller_player_id].emit("controllerOffline", {});
                controller_player_id = null;
                controller_assigned = false;
                controller = null;
            }
            else {
                delete ALL_SOCKETS[socket.id];
                delete ALL_PLAYERS[socket.id];
                // if the player goes offline
                if (socket.id == controller_player_id) {
                    console.log(`Player with controller left.`);
                    controller_player_id = null;
                    controller_assigned = false;
                }
                socket.broadcast.emit("removed", {
                    id: socket.id
                });
            }
            console.log("Socket disconnected:", socket.id);
        });
    }
    catch (e) {
        console.log(e);
    }
});
setInterval(function () {
    var pack = {};
    for (var i in ALL_PLAYERS) {
        var player;
        player = ALL_PLAYERS[i];
        pack[i] = {
            x: player.x,
            y: player.y,
            r: player.r,
            health: player.health,
        };
    }
    for (var i in ALL_SOCKETS) {
        var socket = ALL_SOCKETS[i];
        socket.emit("update", pack);
    }
}, 1000 / 30);
setInterval(function () {
    // console.log("Debug Info:");
    // for (var i in ALL_PLAYERS) {
    //     let p = ALL_PLAYERS[i];
    //     console.log("id:", p.id);
    //     // console.log(p.bulletInfo);
    // }
}, 2000);
