/*
 * ServerWidget constructor
 *
 * @constructor
 */
ServerWidget = function(data){
    if (! (this instanceof arguments.callee)) {
        return new arguments.callee(arguments);
    }

    var self = this;

    BaseWidget.prototype.constructor.call(self, data);
};

ServerWidget.prototype = new BaseWidget;
ServerWidget.prototype.constructor = ServerWidget;

ServerWidget.prototype.focus = function(){
    var self = this;

    var title = self.data.name ? "Server : "+self.data.name : 'Server';
    BaseWidget.prototype.focus.call(self, title);

    self.hideUsersTab();
    self.hideClosingIcon();
};

ServerWidget.prototype.addMessage = function(message){
    var self = this;

    if(self.data.lastMessageSender != 'Server'){
	BaseWidget.prototype.addMessage.call(self, 'Server', message, 'span-20', 'span-18', 'nick-server');
	self.data.lastMessageSender = 'Server';
    } else {
	self.appendToLastMessage(message, 'span-18');
    }
};

ServerWidget.prototype.addCommand = function(command){
    var self = this;

    if(self.data.lastMessageSender != 'Command'){
	BaseWidget.prototype.addMessage.call(self, 'Command', command, 'span-20', 'span-18', 'nick-command');
	self.data.lastMessageSender = 'Command';
    } else {
	self.appendToLastMessage(message, 'span-18');
    }
};
