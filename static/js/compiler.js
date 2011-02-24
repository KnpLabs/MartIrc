/**
* Compiler constructor
*
* @contructor
*
*/
Compiler = function() {
    if (! (this instanceof arguments.callee)) {
        return new arguments.callee(arguments);
    }

    var self = this;
    self.init();

};


/**
* Compiler init
*
*/
Compiler.prototype.init = function() {
    var self = this;

    self.walkerRules = 
        { Message:  function( node, children ){ var msg = self.merge( children ); msg.raw = node.text(); return msg }

        , Prefix:   function( node, children ){ return children[0] }

        , Server:   function( node ){ return { server: node.text().trim() } }

        , Person:   function( node, children ){ return { person: self.merge( children ) } }
        , Nick:     function( node ){ return { nick: node.text().trim() } }
        , User:     function( node ){ return { user: node.text().slice(1).trim() } }
        , Host:     function( node ){ return { host: node.text().slice(1).trim() } }

        , Command:  function( node ){ return { command: node.text().toLowerCase() } }

        , Params:   function( node, children ){ return { params: children } }
        , Middle:   function( node ){ return node.text().trim() }
        , Trailing: function( node ){ return node.text().slice(1) }
        };
};

/**
* Compile input
*
* @param input The input to compile
*/
Compiler.prototype.compile = function(input) {
    var self = this;

    var tree = Parser.parse(input);
    return PanPG_util.treeWalker(self.walkerRules, tree);
};

Compiler.prototype.merge = function ( objects ) { var obj;
  obj = {};
  objects.forEach( function( o ){ var key, keys, i, length;
    for (i = 0, keys = Object.keys( o ), length = keys.length; i < length; i++)
      key = keys[i], obj[key] = o[key];
  })
  return obj;
}
