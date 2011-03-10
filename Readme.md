# Overview

NodeJS wrapper to IRC using Websockets. It allows to connect to IRC using a browser supporting websockets. It's just a POC for now.

# The elevator pitch

How you should be able to explain what is MartIRC to your boss, in 30 seconds.

**For** end users wanting to connect to IRC
**Who** need an easy way to chat
**MartIRC**
**is a** web application
**that** works out of the box in your browser
**unlike** JAVA applets that requires the JAVA plugin or basic IRC clients that require installation and configuration
**our software** will allow users to connect to IRC through their browser in one click. No third-party plugin needed, fully web based interface and a chat relying on a well known and opensource chat network: IRC.


# Requirements

Obviously you should first install [node.JS](https://github.com/ry/node). Really, this will help. Then you will need to install [npm](http://npmjs.org/), the node package manager.

# Installation

    git clone git://github.com/knplabs/MartIrc.git
    cd MartIrc
    git submodule init
    git submodule update

    npm install coloured
    npm install log

# Running the server

    node server.js

# Connecting to the server with you browser

Open `static/client.html` in your browser. The application will try by default to connect to the node server on `localhost:3000`.
You can send and receive (raw) messages. There is no channel management for the moment, just the server tab.

To join a channel :

    join #channel

To change your nick :

    nick mynewnick

To talk to a channel :

    privmsg #channel My beautiful message

To talk in private :

    privmsg targetNick Hi bro!


# Credits

MartIrc has been inspired by the work of [Abronte](https://github.com/abronte/WebIRC) and [Gf3](https://github.com/gf3/IRC-js), thanks to them!
