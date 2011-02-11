var irc = require('IRC-js/lib/irc'),
    io = require('Socket.IO-node'),
    sys  = require('sys');

function MartIrc(options) {
    if (! (this instanceof arguments.callee)) {
        return new arguments.callee(arguments);
    }

    var self = this;

    self.settings = {
        port: options.port,
        encoding: options.encoding
    };

    self.init();
};


MartIrc.prototype.init = function() {
    var self = this;

    self.webClients = [];

    self.httpServer = self.createHTTPServer();
    self.httpServer.listen(self.settings.port);
    sys.log('Server started on PORT ' + self.settings.port);

}

MartIrc.prototype.createHTTPServer = function() {
    var self = this;

    var app = require('express/lib/express').createServer();
    var socket = io.listen(app);

    socket.on('connection', function(client){

        client.on('message', function(clientMessage){
            console.log("got a message :: "+ clientMessage.type);

            switch(clientMessage.type)
        {
            case 'connect':

                var server = new irc({
                    server: clientMessage.data.ircHost,
                    port: clientMessage.data.ircPort,
                    nick: clientMessage.data.nick,
                    encoding: self.settings.encoding
                });

                channels = clientMessage.data.channels;

                server.connect(function() {
                    setTimeout(function() {
                        for(i in channels) {
                            server.join(channels[i]);
                        }
                    }, 2000);
                });

                server.addListener('privmsg', function(msg) {
                    nick = msg.person.nick;
                    chan = msg.params[0];
                    message = msg.params[1];

                    var data = {channel: chan, from:nick, msg:message};

                    console.log("IRC new: "+msg.params[0]+" - "+msg.person.nick+":"+msg.params[1]+"\n");


                    if(self.webClients.length != 0) {
                        for(i in self.webClients) {
                            self.webClient = self.webClients[i];

                            if(self.webClient.server == this) {

                                for(j in self.webClient.channels) {

                                    if(chan.toLowerCase() == self.webClient.channels[j].toLowerCase()) {

                                        self.webClient.client.send(data);

                                    }
                                }
                            }
                        }
                    }


                });

                self.webClients.push({session:client.sessionId,client:client, server:server, channels: channels});
                console.log("got a client :: "+client.sessionId+" :: "+self.webClients.length);

                client.send({msgs:[],channels: channels});

                break;

            case 'privmsg':
                console.log("got a message for " + clientMessage.data.channel + " :: "+ clientMessage.data.message);

                if(self.webClients.length != 0) {
                    for(i in self.webClients) {
                        self.webClient = self.webClients[i];

                        if(self.webClient.session == client.sessionId) {
                            //TODO: change the from nickname
                            self.webClient.client.send({channel: clientMessage.data.channel, from:'me', msg:clientMessage.data.message});
                            self.webClient.server.privmsg(clientMessage.data.channel, clientMessage.data.message);
                        }
                    }
                }

                break;

        }
        });

        client.on('disconnect', function(){ 
            for(i in self.webClients) {
                if(self.webClients[i].session == client.sessionId) {
                    self.webClients[i].server.quit("Leaving");
                    self.webClients.splice(i,1);
                }
            }
            console.log("disconnect");
        });
    });


    return app;


};

module.exports = MartIrc;
