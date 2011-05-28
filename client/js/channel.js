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

    self.id = 'channel-'+self.utils.createUUID();
    self.name = name;
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

    Base.prototype.addMessage.call(self,nickname, message, self.id, color+' nick');
};

Channel.prototype.focus = function(){
    var self = this;

    self.hideActiveElements();
    self.setActiveElements();
    self.showActiveElements();

    self.showUsersTab();
    self.showClosingIcon();

    $("#chat .current-title span").text('Public channel : '+self.name);
};

Channel.prototype.addUser = function(user){
    var self = this;

    self.users[user.nickname] = user;

    $('#users .'+self.id).append($('<a>').addClass(user.id).text(user.nickname));

    $('.'+user.id).addClass(user.color);
};

Channel.prototype.removeUser = function(nickname) {
    var self = this;

    var user = self.users[nickname];

    $('#users .'+self.id+' a.'+user.id).remove();

    delete self.users[nickname];
};

Channel.prototype.destroy = function(){
    var self = this;

    if(!self.id){
	return;
    }

    $('#channels  #' + self.id + ', #chat .' + self.id + ', #users .' + self.id).remove();
};