/*
 * Server constructor
 *
 * @constructor
 */
Server = function(){
    if (! (this instanceof arguments.callee)) {
        return new arguments.callee(arguments);
    }

    var self = this;

    self.id = 'server';
};

Server.prototype = new Base();
Server.prototype.constructor = Server;

Server.prototype.focus = function(){
    var self = this;

    var title = self.name ? "Server : "+self.name : 'Server';
    Base.prototype.focus.call(self, title);

    self.hideUsersTab();
    self.hideClosingIcon();
};

Server.prototype.addMessage = function(message){
    var self = this;

    if(self.lastMessageSender != 'Server'){
	Base.prototype.addMessage.call(self, 'Server', message, 'span-20', 'span-18', 'nick-server');
	self.lastMessageSender = 'Server';
    } else {
	self.appendToLastMessage(message, 'span-18');
    }
};

Server.prototype.addCommand = function(command){
    var self = this;

    if(self.lastMessageSender != 'Command'){
	Base.prototype.addMessage.call(self, 'Command', command, 'span-20', 'span-18', 'nick-command');
	self.lastMessageSender = 'Command';
    } else {
	self.appendToLastMessage(message, 'span-18');
    }
};
