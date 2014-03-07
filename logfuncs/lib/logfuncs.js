
var colors = require('colors'),
    escodegen = require('escodegen'),
    esprima = require('esprima'),
    fs = require('fs'),
    util = require('util');

var node;
var lastBlock; // the last seen block element
var lastExpression;

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

function getLogCallFunc(func_call, args){
    var args_string = [],
        log_arg;

    args.forEach( function ( arg ){
        args_string.push( escodegen.generate( arg ) );
    });

    log_arg = func_call + '(' + args_string.join(', ') + ')';

    var log_call_func = {
        type: 'ExpressionStatement',
        expression: {
            type: 'CallExpression',
            callee: {
                type: 'MemberExpression',
                computed: false,
                object: { type: 'Identifier', name: 'funclogger' },
                property: { type: 'Identifier', name: 'log' }
            },
            arguments: [ { type: 'Literal', value: log_arg, index: 0 } ]
        }
    }
    return log_call_func;
}


// return a node that logs the call expression
function getCallExpressionLog( callExpression ){
    var callee = callExpression.callee;
    var args = callExpression.arguments;

    if ( callee.type == 'MemberExpression' ){
        var objName = callee.object.name;
        var funcName = callee.property.name;
        return getLogCallFunc( objName + '.' + funcName, args );
    } else if ( callee.type == 'Identifier' ){
        name = callee.name;
        return getLogCallFunc( name, args );
    }

}

function handleFunctionDeclaration(){
    node.body.body.unshift( start_func );
    node.body.body.push( end_func );
}

function handleFunctionExpression(){
    node.body.body.unshift( start_func );
    node.body.body.push( end_func );
}

function handleBlockStatement(){
    var body = node.body,
        newBlock = [];

    body.forEach( function ( el, index ){
        if ( el.type === 'ExpressionStatement'
            && el.expression.type == 'CallExpression'){
            logNode = getCallExpressionLog( el.expression );
            newBlock.push( logNode );
            newBlock.push( el );
            return;
        }
        newBlock.push( el ); // if not call expression, add it.
    });
    node.body = newBlock;
}

function handleExpressionStatement(){
    lastExpression = node;
}

function handleCallExpression(){

}


function logBoundaries( currentNode ){
    node = currentNode;

    if ( node.type == 'FunctionDeclaration' ){
        handleFunctionDeclaration();
    }

    if ( node.type == 'FunctionExpression' ){
        handleFunctionExpression();
    }
}
function logcalls( currentNode ){
    node = currentNode;

    if ( node.type == 'BlockStatement' ){
        handleBlockStatement();
    }
}

// st: syntax tree
function walkTree( node, process ){
    var children = [],
        prop;

    /* Check if any of the node's properties are nodes, or if they're
     * arrays, check to see if those arrays hold nodes and add them.
     * Nodes can have array properties in the case of 'body' or
     * arguments. */
    for ( var key in node ){
        if ( node.hasOwnProperty(key) ){
            prop = node[key];

            if ( prop && prop['type'] ){
                children.push( prop );
                continue;
            }

            if ( prop && Array.isArray(prop)){
                prop.forEach( function( el, index ){
                    if ( el.type ){
                        el.index = index; // give the element an index
                        children.push( el );
                    }
                });
            }
        }
    }

    process( node );
    children.forEach( function( child ){
        walkTree( child, process );
    });
}

exports.logfile = function( filename ){
    var content = fs.readFileSync(filename, { encoding: 'utf-8' });
    var st = esprima.parse( content, { loc: false } );
    //console.log( util.inspect( st, { depth: 60 } ));
    walkTree( st, logcalls );
    walkTree( st, logBoundaries );
    //console.log( util.inspect( st, { depth: 60 } ));
    console.log( escodegen.generate( st ) );
}

