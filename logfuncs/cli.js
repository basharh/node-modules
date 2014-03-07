#!env node

var logfuncs,
    filepath;


if ( ( filepath = process.argv[2] ) === undefined ){
    console.log('please provide a file to inject logging');
}

try{
    logfuncs = require('logfuncs');
} catch (e) {
    logfuncs = require('./lib/logfuncs.js');
}

logfuncs.logfile( filepath );

