# Overview

NodeJS wrapper to IRC using Websockets. It allows to connect to IRC using a browser supporting websockets. It's just a POC for now.

# Requirements

Obviously you should first install [node.JS](https://github.com/ry/node). Really, this will help. Then you will need to install [npm](http://npmjs.org/), the node package manager.

# Installation

    git clone git://github.com/knplabs/MartIrc.git
    cd MartIrc
    git submodule init
    git submodule update

    npm install express
    npm install coloured
    npm install log

# Running the server

    node server.js

# Connecting to the server with you browser

Open `static/client.html` in your browser. The application will try to connect to the node server on `localhost:3000`.  
Then you should be connected to `#martirc` and `#knplabs` on Freenode`.`

You can send and receive messages.


# Credits

This work was started by [Abronte](https://github.com/abronte/WebIRC).
