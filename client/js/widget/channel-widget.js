/*
 * ChannelWidget constructor
 *
 * @constructor
 */
ChannelWidget = function(data){
    if (! (this instanceof arguments.callee)) {
        return new arguments.callee(arguments);
    }

    var self = this;

    BaseWidget.prototype.constructor.call(self, data);
};

ChannelWidget.prototype = new BaseWidget();
ChannelWidget.prototype.constructor = ChannelWidget;

ChannelWidget.prototype.create = function(){
    var self = this;

    $('#channels').append($('<a>').attr('id', self.data.id).addClass('channel').text(self.data.name));
    $('#chat').append($('<div>').addClass(self.data.id));
    $("#users").append($('<div>').addClass('list ' + self.data.id));
};

ChannelWidget.prototype.addMessage = function(nickname, message){
    var self = this;

    var color = 'current-user';

    if(self.data.users.hasElement(nickname)){
        color = self.data.users.getElement(nickname).color;
    }

    if(self.data.lastMessageSender != nickname){
	BaseWidget.prototype.addMessage.call(self, nickname, message, 'span-16', 'span-14', color+' nick');

	self.data.lastMessageSender = nickname;
    } else {
	self.appendToLastMessage(message, 'span-14');
    }
};

ChannelWidget.prototype.focus = function(){
    var self = this;

    BaseWidget.prototype.focus.call(self, 'Public channel : '+self.data.name);

    self.showUsersTab();
    self.showClosingIcon();

    if(self.data.topic){
	$("#chat .current-info .title").prop('title', self.data.topic);
    }
};

ChannelWidget.prototype.addUser = function(nickname) {
    var self = this;

    var user = self.data.users.getElement(nickname);
    
    if(!user) {
        return null;
    }

    $('#users .'+self.data.id).append($('<a>').addClass(user.id + ' ' + user.color).text(user.nickname));
};

ChannelWidget.prototype.removeUser = function(nickname) {
    var self = this;

    var user = self.data.users.getElement(nickname);

    if(!user) {
        return null;
    }

    self.data.users.getPreviousElement(nickname);

    $('#users .'+self.data.id+' a.'+user.id).remove();
};

ChannelWidget.prototype.renameUser = function(oldNickname, newNickname) {
    var self = this;

    var userWidget = new UserWidget(newNickname);
    userWidget.rename(oldNickname);
};

ChannelWidget.prototype.populateUsers = function() {
    var self = this;

    for(nickname in self.data.users.getSorted()) {
        self.addUser(nickname);
    }
};

ChannelWidget.prototype.destroy = function(){
    var self = this;

    if(!self.data.id){
        return null;
    }

    $('#channels  #' + self.data.id + ', #chat .' + self.data.id + ', #users .' + self.data.id).remove();
};
