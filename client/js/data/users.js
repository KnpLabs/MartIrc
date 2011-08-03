Users = function() {
    if (! (this instanceof arguments.callee)) {
        return new arguments.callee(arguments);
    }

    var self = this;

    Map.prototype.constructor.call(self);
};

Users.prototype = new Map();
Users.prototype.constructor = Users;
