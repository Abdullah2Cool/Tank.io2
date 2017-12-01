var __extends = (this && this.__extends) || (function () {
    var extendStatics = Object.setPrototypeOf ||
        ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
        function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
var Game = Phaser.Game;
var TankTrouble = /** @class */ (function (_super) {
    __extends(TankTrouble, _super);
    function TankTrouble(divID) {
        var _this = _super.call(this, "100%", "100%", Phaser.AUTO, divID) || this;
        _this.state.add("WelcomeState", new WelcomeState(), true);
        _this.state.add("GameState", new GameState());
        console.log("New Game object created.");
        return _this;
    }
    return TankTrouble;
}(Phaser.Game));
var socket = io();
var peer = 0;
var myID;
var others = {};
var bReady = false;
// var connected = {}
socket.on("ready", onReady);
socket.on("newPlayer", onNewPlayer);
socket.on("removed", onRemoved);
function onReady(data) {
    myID = data.id;
    others = data.others;
    delete others[myID];
    peer = new Peer(myID, {
        key: 'peerjs',
        host: 'peer-server-tanktrouble.herokuapp.com',
        secure: true,
        port: 443
    });
    peer.on('open', onOpen);
    console.log("My ID:", data.id);
    if (Object.keys(others).length === 0) {
        console.log("No previous players.");
    }
    else {
        // console.log("Previous Players:", others);
        // connected = others;
        for (var x in others) {
            console.log("Attempting to connect to:", others[x]);
            peer.connect(others[x]);
        }
    }
}
function onNewPlayer(data) {
    console.log("Found new player:", data.id);
    others[data.id] = data.id;
    console.log("Attempting to connect to:", data.id);
    peer.connect(data.id);
    // connected[data.id] = data.id;
    // console.log("Other Players:", others);
}
function onRemoved(data) {
    delete others[data.id];
    console.log("Player Removed:", data.id);
    console.log("New Player List:", others);
}
function onOpen(id) {
    console.log("Peer object created with id:", id);
    createGame();
    peer.on('connection', onConnection);
    peer.on('error', function (error) {
        console.log(error);
    });
    peer.on("disconnected", function () {
        console.log("Connection lost.");
    });
}
function onConnection(conn) {
    console.log("Connection successful.");
}
function createGame() {
    console.log("Game Triggered.");
    var game = new TankTrouble("content");
}
window.onload = function () {
    if (bReady) {
        var game = new TankTrouble("content");
    }
};
//# sourceMappingURL=main.js.map