
var colors = require('colors'),
    escodegen = require('escodegen'),
    esprima = require('esprima'),
    fs = require('fs'),
    util = require('util');

var start_func = {
    type: 'ExpressionStatement',
    expression: {
        type: 'CallExpression',
        callee: { type: 'Identifier', name: 'function_start' },
        arguments: []
    }
}

var end_func = {
    type: 'ExpressionStatement',
    expression: {
        type: 'CallExpression',
        callee: { type: 'Identifier', name: 'function_end' },
        arguments: []
    }
}

function process( node ){
    //if ( node.type == 'BlockStatement' ){
    if ( node.type == 'FunctionDeclaration' ){
        node.body.body.unshift( start_func );
        node.body.body.push( end_func );
        return;
    }

    if ( node.type == 'FunctionExpression' ){
        node.body.body.unshift( start_func );
        node.body.body.push( end_func );
        return;
    }
}

/*  st: syntax tree
 *  process: function to read the node
 */
function walkTree( node ){
    var children = [],
        body = node.body,
        prop;

    // add body nodes
    if(Array.isArray( body )){
        children = children.concat( body );
    }
    else if ( body && body.type ) {
        children.push( body );
    }

    // add any property of the node that are nodes themselves
    for ( var key in node ){
        if ( node.hasOwnProperty(key) ){
            prop = node[key];
            if ( prop && prop['type'] )
                children.push( prop );
        }
    }

    children.forEach( function( child ){
        walkTree( child );
    });

    process( node );
}

exports.logfile = function( filename ){
    var content = fs.readFileSync(filename, { encoding: 'utf-8' });
    var st = esprima.parse( content, { loc: false } );
    //console.log( util.inspect( st, { depth: 60 } ));
    walkTree( st );
    console.log( escodegen.generate( st ) );
}

