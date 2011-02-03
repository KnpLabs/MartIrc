# Overview

NodeJS wrapper to IRC using Websockets. It allows to connect to IRC using a browser supporting websockets. It's just a POC for now.

# Requirements

Obviously you should first install [node.JS](https://github.com/ry/node). Really, this will help.

To install the dependencies, you should install [npm](https://github.com/isaacs/npm) a package manager for node.JS, then:

    npm install express
    npm install coloured-log

# Installation

    git clone git://github.com/knplabs/MartIrc.git
    cd MartIrc
    git submodule init
    git submodule update

# Running the server

    node app.js

# Connecting to the server with you browser

Open `static/client.html` in your browser. The application will try to connect to the node server on `localhost:3000`.  
Then you should be connected to `#martirc` and `#knplabs` on Freenode`.`

You can only see messages, you can't send one for the moment.


# Greetings

Thiw work was started by [Abronte](https://github.com/abronte/WebIRC).
