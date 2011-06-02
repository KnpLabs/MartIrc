/**
* The url driver will parse the request url
* and configure the client
*
* Available request parameter:
*  bool connect: connect to the server
*  string join: join a room when connected
*
*  Example usage:
*  client.html?connect=1&nick=superdupont&join=knplabs
*
*  Connect to a server without SASL, for 3G or Tor users:
*  client.html?connect=1&server=irc.quakenode.net&join=linux
*/
MartIrcUrlDriver = function() {
    if (! (this instanceof arguments.callee)) {
        return new arguments.callee(arguments);
    }

    // merge defaults with url parameters
    this.options = $.extend(this.defaults, this.parseUrl(location.search));

    this.validateOptions();
};

/**
* Default configuration
*/
MartIrcUrlDriver.prototype.defaults = {
    'connect': false,
    'server': 'irc.freenode.net',
    'join': '',
    'nick': ''
};

/**
* Run the configured actions
*/
MartIrcUrlDriver.prototype.run = function() {
    if (this.options['server']) {
        this.configureServerHost(this.options['server']);
    }
    if (this.options['nick']) {
        this.configureNick(this.options['nick']);
    }
    if (this.options['connect']) {
        this.connect();
        if (this.options['join']) {
            this.join(this.options['join'], this.options['nick']);
        }
    }
};

/**
* Selects a server host
*/
MartIrcUrlDriver.prototype.configureServerHost = function(server) {
    $('#ircServerHost').val(server);
}

/**
* Changes the nickname
*/
MartIrcUrlDriver.prototype.configureNick = function(nick) {
    $('#nickname').val(nick);
}

/**
* Connects to the server
*/
MartIrcUrlDriver.prototype.connect = function() {
    $('#connectButton').click();
};

/**
* Joins a channel
* Waits for the greeting string to be displayed on the server window
* before attempting to join the channel
*/
MartIrcUrlDriver.prototype.join = function(chan, nick) {
    var greetingString = 'MODE '+nick;
    var joinInterval = setInterval(function() {
        if ( - 1 != $('#chat .server').text().indexOf(greetingString)) {
            $('#prompt input.text').val(':j #' + chan);
            $('#prompt button').click();
            clearInterval(joinInterval);
        }
    },
500);
};

/**
* Parses the url query string and returns
* an array of query parameters
*/
MartIrcUrlDriver.prototype.parseUrl = function(url) {
    var result = {},
    queryString = url.substring(1),
    re = /([^&=]+)=([^&]*)/g;

    while (m = re.exec(queryString)) {
        result[decodeURIComponent(m[1])] = decodeURIComponent(m[2]);
    }

    return result;
}

/**
* Validates the options
*/
MartIrcUrlDriver.prototype.validateOptions = function() {
    if (this.options.connect && ! this.options.nick) {
        alert('A nick is required to autoconnect. ?connect=1&nick=superdupont');
        this.options.connect = false;
    }
}

$(function() {
    new MartIrcUrlDriver().run();
});

