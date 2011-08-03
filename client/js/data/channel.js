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
    self.users = new Users();
};

Channel.prototype = new Base();
Channel.prototype.constructor = Channel;

Channel.prototype.addUser = function(nickname){
    var self = this;

    var user = new User(nickname);

    self.users.setElement(user.nickname, user);
};

Channel.prototype.removeUser = function(nickname) {
    var self = this;

    self.users.removeElement(nickname);
};

Channel.prototype.hasUser = function(nickname) {
    var self = this;

    return self.users.hasElement(nickname);
};

Channel.prototype.renameUser = function(oldNickname, newNickname) {
    var self = this;

    self.removeUser(oldNickname);
    self.addUser(newNickname);
};
