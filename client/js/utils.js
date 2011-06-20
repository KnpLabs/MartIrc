/**
 * Utils constructor
 *
 * @contructor
 *
 */
Utils = function() {
    if (! (this instanceof arguments.callee)) {
        return new arguments.callee(arguments);
    }

    var self = this;
};

/**
* Converts HTML to safe text
*/
Utils.prototype.escape = function(html) {
    var self = this;

    return $('<div/>').text(html).html();
};
