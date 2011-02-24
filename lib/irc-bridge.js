// http://www.faqs.org/rfcs/rfc1459.html :)
// http://irchelp.org/irchelp/rfc/ :D

/** 
 *  class IrcBridge
 *  derived from IRC class: https://github.com/gf3/IRC-js/
 *  
 *  An IrcBridge library for node.js
**/

var net = require( 'net' )
  , path = require( 'path' )
  , fs = require( 'fs' )
  , ColouredLog = require( 'coloured-log' )
  , Log
  , deps

require.paths.unshift( path.join( __dirname ) )

/* ------------------------------ Init Junk ------------------------------ */

Log = new ColouredLog( ColouredLog.DEBUG )

/* ------------------------------ MISCELLANEOUS ------------------------------ */
function if_exists( data, no_pad, pad_char ) {
  return data ? param( data, no_pad, pad_char ) : ''
}

function param( data, no_pad, pad_char ) {
  return ( no_pad ? '' : ( pad_char ? pad_char : ' ' ) ) + data.toString()
}

function not_blank( item ) {
  return ( !!item && item.toString().replace( /\s/g, '' ) != '' )
}

function $w( item ) {
  return item.toString().split( /\s+/ ).filter( not_blank )
}

/* ------------------------------ IrcBridge Class ------------------------------ */
/**
 * new IrcBridge( options )
 * - options ( Object ): Options for specific instance.
 * 
 * Creates a new `IrcBridge` instance.
 * 
 * ### Examples
 * 
 *     var irc = new IrcBridge( { server: 'irc.freenode.net', nick: 'lolbot' });
**/
function IrcBridge( options ) {
  // Options
  var internal = 
        { buffer: ''
        , connected: false
        , privmsg_queue: []
        , listener_cache: {}
        , single_listener_cache: {}
        , cache: {}
        , locks: {}
        }
    , emitter  = new process.EventEmitter()
    , stream

  ( this.options = options || {} ).__proto__ = IrcBridge.options

  // Connect
  function do_connect() {
    internal.connected = true
    internal.connected_since = +new Date

    if ( this.options.pass !== undefined )
      this.pass( this.options.pass )

    this
      .nick( this.options.nick )
      .user( this.options.user.username, this.options.user.wallops, this.options.user.invisible, this.options.user.realname )

    // Privmsg queue for flood protection
    internal.privmsg_queue_timer = setInterval( function tick() { var m
      if ( m = internal.privmsg_queue.pop() )
        privmsg.call( this, m.receiver, m.message )
    }.bind( this ), 200 )

    emitter.emit( 'connected' )
  }

  // Disconnect
  function do_disconnect() {
    clearTimeout( internal.privmsg_queue_timer )
    internal.privmsg_queue = []
    internal.connected = false
    stream.end()
    emitter.emit( 'disconnected' )
  }

  // Parse incoming messages
  function parseMessage( data ) { var buffer, last, message, command, i
    internal.last_message = +new Date
    
    // Apply previous buffer, split, re-buffer
    if ( !!internal.buffer ) {
      data = internal.buffer + data
      internal.buffer = ''
    }
    buffer = data.split( /\r\n/ )
    if ( last = buffer.pop() )
      internal.buffer = last
    
    // Emit!
    for ( i = 0; i < buffer.length; i++ ) {
      try {
        message = buffer[i] + "\r\n";

        if ( this.options.log )
          Log.info( "[BRIDGE RECV]  " + buffer[i] )

        if ( !internal.connected )
          do_connect.call( this ) // We're "connected" once we receive data

        // Emit event
        emitter.emit( "message" , message )
      }
      catch ( err ) {
        Log.error( "[ERROR] Failed parsing '" + buffer[i] + "'" )
        if ( this.options.log )
          throw err
      }
    }
  }
  
  /* ------------------------------ Basic Methods ------------------------------ */
  
  /**
   * IrcBridge#connect( [hollaback] ) -> self
   * - hollaback ( Function ): Optional callback to be executed when the
   *                         connection is established an ready.
   * 
   * Connect to the server.
  **/
  this.connect = function( hollaback ) {
    // Client setup
    var not_open
    if ( !stream || ( not_open = ( ['open', 'opening'].indexOf( stream.readyState ) < 0 ) ) ) {
      if ( not_open ) {
        stream.end()
        stream.removeAllListeners()
        stream = null
      }

      stream = new net.Stream()
      stream.setEncoding( this.options.encoding )
      stream.setTimeout( 0 )

      // Forward network errors
      stream.addListener( 'error', function( er ) {
        emitter.emit( 'error', er )
        emitter.emit( 'error:network', er )
      })

      // Receive data
      stream.addListener( 'data', parseMessage.bind( this ) )

      // Timeout
      stream.addListener( 'timeout', do_disconnect.bind( this ) )

      // End
      stream.addListener( 'end', do_disconnect.bind( this ) )

      stream.connect(this.options.port, this.options.server)
    }

    // Holla
    if ( typeof hollaback === 'function' )
      this.listenOnce( 'connected', hollaback )
    return this;
  }
  
  /**
   * IrcBridge#disconnect() -> self
   * 
   * Disconnect from the server. It is best practices to use the `quit`
   * convenience method.
  **/
  this.disconnect = function() {
    do_disconnect.call( this )
    return this
  }
  
  /**
   * IrcBridge#raw( data ) -> self
   * - data ( String ): Raw IrcBridge command to be sent to server
   * 
   * Send a raw IrcBridge command to the server. Used internally by the convenience
   * methods. Note: It is not recommended to use this method, convenience
   * methods should be used instead to ensure data consistency.
   * 
   * ### Examples
   * 
   *     irc_instance.raw( ':YourNick TOPIC #channel :LOL This is awesome!' ); // Set a channel topic
  **/
  this.raw = function( data ) {
    if ( stream.readyState == 'open' ) {
      data = data.slice( 0, 509 )
      if ( !/\r\n$/.test( data ) )
        data += "\r\n"
      stream.write( data )
      if ( this.options.log )
        Log.info( "[SENT]  " + data.replace( /\r\n$/, "" ) )
    }
    return this
  }
  
  /**
   * IrcBridge#addListener( event, listener ) -> null
   * - event ( String ): Event to listen for
   * - listener ( Function ): Event listener, called when event is emitted.
   * 
   * Listen for incoming IrcBridge messages.
   * 
   * ### Examples
   * 
   *     irc_instance.addListener( 'PING', pingListener ); // Listens for the PING message from server
  **/
  this.addListener = function( event, hollaback ) {
    var bound = hollaback.bind( this )

    if ( !internal.listener_cache[event] )
      internal.listener_cache[event] = []

    internal.listener_cache[event].push( bound )
    emitter.addListener( event, bound )
    return this
  }
  
  /**
   * IrcBridge#removeListener( event, listener ) -> null
   * - event ( String ): Event to stop listening for
   * - listener ( Function ): Event listener to unregister
   * 
   * Stop listening for incoming IrcBridge messages.
   * 
   * ### Examples
   * 
   *     irc_instance.removeListener( 'PING', pingListener ); // Stops listening for the PING message from server
  **/
  this.removeListener = function( event, hollaback ) { var eventCache, i
    if ( internal.listener_cache[event] ) {
      eventCache = internal.listener_cache[event]
      for ( i = 0; i < eventCache.length; i++ ) {
        if ( eventCache[i] === hollaback ) {
          // If last element.
          if ( i+1 === eventCache.length )
            eventCache.pop()
          else
            eventCache[i] = eventCache.pop() // Replace index with last element.
          emitter.removeListener( event, eventCache[i] )
        }
      }
    }
    return this
  }
  
  /**
   * IrcBridge#listenOnce( event, listener ) -> null
   * - event ( String ): Event to listen for
   * - listener ( Function ): Event listener, called when event is emitted.
   * 
   * Listen only once for an incoming IrcBridge message.
   * 
   * ### Examples
   * 
   *     irc_instance.listenOnce( 'PING', pingListener ); // Listens for the *next* PING message from server, then unregisters itself
  **/
  this.listenOnce = function( event, hollaback ) {
    // Store reference and wrap
    internal.single_listener_cache[hollaback] = function( hollaback, message ) {
      // Call function
      hollaback.call( this, message )
      
      // Unregister self
      setTimeout( function() {
        emitter.removeListener( event, internal.single_listener_cache[hollaback] )
        delete internal.single_listener_cache[hollaback]
      }, 0 )
    }.bind( this, hollaback )
    
    // Listen
    emitter.addListener( event, internal.single_listener_cache[hollaback] )
  }

  /* ------------------------------ Convenience Methods ------------------------------ */

  /**
   * IRC#nick( nickname ) -> self
   * - nickname ( String ): Desired nick name.
   * 
   * Used to set or change a user's nick name.
   * 
   * ### Examples
   * 
   *     irc_instance.nick( 'Jeff' ); // Set user's nickname to `Jeff`
  **/
  this.nick = function( nickname ) {
    // 4.1.2
    this.raw( ( internal.nick === undefined ? '' : ':' + internal.nick + ' ' ) + 'NICK' + param( nickname ) )
    return this
  }
  
  /**
   * IRC#user( username, wallops, invisible, realname ) -> self
   * - username ( String ): User name
   * - wallops ( Boolean ): Set +w on connect
   * - invisible ( Boolean ): Set +i on connect
   * - realname ( String ): Real name
   * 
   * Specify user's identify to the server. `username` must not contain spaces,
   * but `realname` may. 
   * 
   * ### Examples
   * 
   *     irc_instance.user( 'king', false, true, 'Lion King' );
  **/
  this.user = function( username, wallops, invisible, realname ) { var mode
    // 4.1.3
    // TODO GIANNI: Consider not making this public
    mode = ( wallops ? 4 : 0 ) + ( invisible ? 8 : 0 )
    return this.raw( 'USER ' + [ username, mode, '*' ].join(' ') + param( realname, null, ' :' ) )
  }  
  

  /**
   * IRC#quit( [message] ) -> self
   * - message ( String ): Quit message
   * 
   * Quit the server, passing an optional message. Note: the `disconnect`
   * method is called internally from `quit`.
   * 
   * ### Examples
   * 
   *     irc_instance.quit(); // Quit without a message
   *     irc_instance.quit( 'LOLeaving!' ); // Quit with a hilarious exit message
  **/
  this.quit = function( message ) {
    // 4.1.6
    this.raw( 'QUIT' + if_exists( message, null, ' :' ) ).disconnect()
    return this
  }
}
/**
 * IrcBridge.options
 *
 * Default global options, all instances will inherit these options.
 *
 * ### Defaults
 *
 *      IrcBridge.options =
 *        { server:   '127.0.0.1'
 *        , port:     6667
 *        , encoding: 'ascii'
 *        , nick:     'js-irc'
 *        , user:
 *          { username:   'js-irc'
 *          , hostname:   'thetubes'
 *          , servername: 'tube1'
 *          , realname:   'Javascript Bot'
 *          }
 *        }
**/
IrcBridge.options =
  { server:   '127.0.0.1'
  , port:     6667
  , encoding: 'ascii'
  , nick:     'js-irc'
  , log:      true
  , user:
    { username:   'js-irc'
    , hostname:   'thetubes'
    , servername: 'tube1'
    , realname:   'Javascript Bot'
    }
  }

// Numeric error codes
IrcBridge.errors = {}

// Numeric reply codes
IrcBridge.replies = {}

/* ------------------------------ EXPORTS ------------------------------ */
module.exports = IrcBridge

