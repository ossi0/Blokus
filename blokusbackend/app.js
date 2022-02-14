const express = require("express");
const app = express();
var server = require('http').createServer(app);  
var io = require('socket.io')(server);
const PORT = process.env.PORT || 3000;
const cors = require('cors');

var servergrid;
var serverplacementorder;
var serverpiecehistory;
var servermoveorder = [];
var serverwhoseturn;
var clientcount = 0;
var serversides = [undefined, undefined, undefined, undefined];

// Set index.html to default page on first load
const static_options = {
	extensions: ['html'],
	index: 'index.html'
}

app.use(cors());

io.on('connection', function(client) {
    console.log('Client connected...');
    client.on('join', function(data) {
        clientcount++;
       console.log(clientcount + " players in game");
       client.emit('initdata', [servergrid, serverplacementorder, serverpiecehistory, servermoveorder, serverwhoseturn, serversides]);
    });
    client.on('clientdata', function(data) {
        servergrid = data[0];
        serverplacementorder = data[1];
        serverpiecehistory = data[2];
        servermoveorder = data[3];
        serverwhoseturn = data[4];
        serversides = data[5];
        client.broadcast.emit('serverdata', [servergrid, serverplacementorder, serverpiecehistory, servermoveorder, serverwhoseturn]);
    });
    client.on('clientside', function(data) {
        serversides = data;
        client.broadcast.emit('serversides', data);
    });
    client.on('clientreset', function(data) {
        servergrid = undefined;
        serverplacementorder = undefined;
        serverpiecehistory = undefined;
        servermoveorder = [];
        serverwhoseturn = undefined;
        serversides = [undefined, undefined, undefined, undefined];
        client.broadcast.emit('resetdata', 'reset the data');
    });
    client.on('disconnect', () => {
        console.log('Client disconnected...');
        clientcount--;
        console.log(clientcount + ' players remaining');
        if (clientcount === 0) {
            console.log("Initializing data");
            servergrid = undefined;
            serverplacementorder = undefined;
            serverpiecehistory = undefined;
            servermoveorder = [];
            serverwhoseturn = undefined;
            serversides = [undefined, undefined, undefined, undefined];
        }
    });
});

server.listen(PORT, () => console.log(`Listening on port ${PORT}`));

app.use(express.static('public', static_options));