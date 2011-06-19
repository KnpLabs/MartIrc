/*
 * Channel constructor
 *
 * @constructor
 */
Channel = function(name){
    if (! (this instanceof arguments.callee)) {
        return new arguments.callee(arguments);
    }

    var self = this;

    self.id = 'channel-'+$.sha1(name);
    self.name = name;
    self.topic = null;
    self.users = new Array();
};

Channel.prototype = new Base();
Channel.prototype.constructor = Channel;

Channel.prototype.create = function(){
    var self = this;

    $('#channels').append($('<a>').attr('id', self.id).addClass('channel').text(self.name));
    $('#chat').append($('<div>').addClass(self.id));
    $("#users").append($('<div>').addClass('list ' + self.id));
};

Channel.prototype.addMessage = function(nickname, message){
    var self = this;

    var color = 'current-user';

    if(self.users[nickname]){
        color = self.users[nickname].color;
    }

    if(self.lastMessageSender != nickname){
	Base.prototype.addMessage.call(self, nickname, message, 'span-16', 'span-14', color+' nick');

	self.lastMessageSender = nickname;
    } else {
	self.appendToLastMessage(message, 'span-14');
    }
};

Channel.prototype.focus = function(){
    var self = this;

    Base.prototype.focus.call(self, 'Public channel : '+self.name);

    self.showUsersTab();
    self.showClosingIcon();

    if(self.topic){
	$("#chat .current-title span").prop('title', self.topic);
    }
};

Channel.prototype.addUser = function(user){
    var self = this;

    self.users[user.nickname] = user;

    $('#users .'+self.id).append($('<a>').addClass(user.id).text(user.nickname));

    $('#users .'+user.id).addClass(user.color);
};

Channel.prototype.removeUser = function(nickname) {
    var self = this;

    var user = self.users[nickname];

    $('#users .'+self.id+' a.'+user.id).remove();

    delete self.users[nickname];
};

Channel.prototype.hasUser = function(nickname) {
    var self = this;

    return self.users[nickname] ? true : false;
};

Channel.prototype.renameUser = function(oldNickname, newNickname) {
    var self = this;

    self.users[newNickname] = self.users[oldNickname];
    self.users[newNickname].rename(newNickname);

    delete self.users[oldNickname];
};

Channel.prototype.destroy = function(){
    var self = this;

    if(!self.id){
        return;
    }

    $('#channels  #' + self.id + ', #chat .' + self.id + ', #users .' + self.id).remove();
};
