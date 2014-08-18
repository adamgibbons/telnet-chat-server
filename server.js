// telnet chat server using node.js

var net = require('net')
  , port = process.env.port || 3000;

var server = net.createServer()
  , clientList = [];

server.on('connection', function(client) {
  handleNewClient(client);

  client.on('data', function(data) {
    broadcast(data, client);
  });

  client.on('end', function() {
    clientList.splice(clientList.indexOf(client), 1);
    broadcast(client.name + ' left the room.\r\n', client);
  });

  client.on('error', function(err) {
    console.log(err);
  });
  
});

function handleNewClient(client) {
  client.name = client.remoteAddress + ':' + client.remotePort;
  clientList.push(client);
  client.write('Welcome, ' + client.name + '!\r\n');
  broadcast(client.name + ' entered the room.\r\n', client);
};

function broadcast(msg, sendingClient) {
  var trash = [];
  clientList.forEach(function(client, idx) {
    if (sendingClient !== client) {
      // If a client isn't writable, mark it for garbage collection.
      if (client.writable) {
        client.write(sendingClient.name + ': ' + msg.toString());
      } else {
        trash.push(client);
        client.destroy();
      }
    }
  });

  // Take out garbage.
  trash.forEach(function(can, idx) {
    clientList.splice(clientList.indexOf(can), 1);
  });
};

server.listen(port);
console.log('Listening on port ' + port);