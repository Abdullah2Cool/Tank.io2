import Game = Phaser.Game;

class TankTrouble extends Phaser.Game {
    constructor(divID: string) {
        super("100%", "100%", Phaser.AUTO, divID);
        this.state.add("WelcomeState", new WelcomeState(), true);
        this.state.add("GameState", new GameState());
        console.log("New Game object created.");
    }
}

const socket = io();

var peer = 0;
var myID;
var others = {};
var bReady: boolean = false;
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
        console.log("No previous players.")
    } else {
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
    })
}

function onConnection(conn) {
    console.log("Connection successful.");
}

function createGame() {
    console.log("Game Triggered.");
    var game = new TankTrouble("content");
}

window.onload = () => {
    if (bReady) {
        var game = new TankTrouble("content");
    }
};

