/**
 * Base ui constructor
 *
 * @contructor
 *
 */
Base = function() {
    if (! (this instanceof arguments.callee)) {
        return new arguments.callee(arguments);
    }

    var self = this;

    self.id = null;
    self.name = null;
    self.utils = new Utils();

    self.lastMessageSender = null;
};