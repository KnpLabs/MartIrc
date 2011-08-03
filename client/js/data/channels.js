Channels = function() {
    if (! (this instanceof arguments.callee)) {
        return new arguments.callee(arguments);
    }

    var self = this;

    self.activeChannel = null;

    Map.prototype.constructor.call(self);
};

Channels.prototype = new Map();
Channels.prototype.constructor = Channels;

Channels.prototype.setActiveChannel = function(channelName) {
    var self = this;

    self.activeChannel = channelName;
};

Channels.prototype.getActiveChannel = function() {
    var self = this;

    return self.data[self.activeChannel]; 
};
