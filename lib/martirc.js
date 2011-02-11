var app = require('express/lib/express').createServer(),
    irc = require('IRC-js/lib/irc'),
    io = require('Socket.IO-node'),
    faye = require('faye/faye-node'),
    socket = io.listen(app);

var opts = {
    encoding: "utf-8",
};
var webClients = [];
var servers = [];

function MartIrc(options) {
    if (! (this instanceof arguments.callee)) {
        return new arguments.callee(arguments);
    }

    var self = this;

    self.settings = {
        port: options.port
    };



    self.init();
};

MartIrc.prototype.init = function() {
    var self = this;


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
                    encoding: opts.encoding
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


                    if(webClients.length != 0) {
                        for(i in webClients) {
                            webClient = webClients[i];

                            if(webClient.server == this) {

                                for(j in webClient.channels) {

                                    if(chan.toLowerCase() == webClient.channels[j].toLowerCase()) {

                                        webClient.client.send(data);

                                    }
                                }
                            }
                        }
                    }


                });

                webClients.push({session:client.sessionId,client:client, server:server, channels: channels});
                console.log("got a client :: "+client.sessionId+" :: "+webClients.length);

                client.send({msgs:[],channels: channels});

                break;

            case 'privmsg':
                console.log("got a message for " + clientMessage.data.channel + " :: "+ clientMessage.data.message);

                if(webClients.length != 0) {
                    for(i in webClients) {
                        webClient = webClients[i];

                        if(webClient.session == client.sessionId) {
                            //TODO: change the from nickname
                            webClient.client.send({channel: clientMessage.data.channel, from:'me', msg:clientMessage.data.message});
                            webClient.server.privmsg(clientMessage.data.channel, clientMessage.data.message);
                        }
                    }
                }

                break;

        }
        });

        client.on('disconnect', function(){ 
            for(i in webClients) {
                if(webClients[i].session == client.sessionId) {
                    webClients[i].server.quit("Leaving");
                    webClients.splice(i,1);
                }
            }
            console.log("disconnect");
        });
    });


    app.listen(self.settings.port);


};

module.exports = MartIrc;
