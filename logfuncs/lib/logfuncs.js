
var colors = require('colors'),
    escodegen = require('escodegen'),
    esprima = require('esprima'),
    fs = require('fs'),
    util = require('util');

function isArray( val ){
    return ( Object.prototype.toString.call( val ) === '[object Array]' );
}

function process( node ){
    console.log( node.type );
}

/*  st: syntax tree
 *  process: function to read the node
 */
function walkTree( node ){
    var children = node.body;

    if ( !children ){
        process( node );
        return;
    }

    if ( isArray( children ) ){
        children.forEach( function( child ){
            walkTree( child );
        });
    } else {
        walkTree ( children ); // children is a single node
    }

    process( node );
}

exports.logfile = function( filename ){
    var content = fs.readFileSync(filename, { encoding: 'utf-8' });
    //console.log( content );
    var st = esprima.parse( content, { loc: false } );
    console.log( util.inspect( st, { depth: 6 } ));
    walkTree( st );
}

