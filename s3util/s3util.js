
var util = require('util'),
    fs = require('fs'),
    path = require('path'),
    async = require('async'),
    glob = require('glob'),
    AWS = require('aws-sdk');

AWS.config.loadFromPath('./config.json');

var s3 = new AWS.S3();

/* Get the keys out of an s3 return data */
function getKeyList( objsData ){
  var objects = objsData.Contents,
      keys = [];
  objects.forEach( function (value ){
    keys.push( value.Key );
  });
  return keys;
}

function getDeleteObjParams( bucketid, keys ){
    var objects = [], params;

    keys.forEach( function( key ){
      objects.push( { Key: key } );
    });

    params = {
      Bucket: bucketid, // required
      Delete: { // required
        Objects: objects
      }
    }
    return params;
}

/* Given a list of filepaths, invokes callback with those that are type:file */
function filterFiles( files, callback ){
  console.log( 'filtering files: ' + util.inspect( arguments ) );
  async.filter( files,
    function( file, callback ){
      fs.stat( file, function( err, stats ){
        var isFile = stats.isFile();
        callback( isFile );
      });
    },
    function ( passed ){
      callback( undefined, passed );
    }
  );
}

function uploadFile( bucketid, file, callback ){
  console.log('uploading file: ' + file );
  async.waterfall( [
    fs.readFile.bind(fs, file, {}),
    function( data, callback ){
      s3.putObject({ Bucket: bucketid, Key: stripFirstDir(file), Body: data }, callback);
    }
  ],
  function(err){
    callback( err );
  });
}

function uploadFiles( bucketid, files, callback ){
  console.log( 'uploading files: ' + files );
  var filesNum = files.length,
      stripped;

  if ( filesNum > 5 ) {
    callback(new Error( "Uploading too many files(" + filesNum + ")" ));
    return;
  }

  async.each( files,
    function ( file, callback ){
      uploadFile( bucketid, file, callback );
    },
    callback
  );
}

function stripFirstDir( file ){
  var re = /^[^\/]+\//;
  return file.replace( re, '' );
}

var s3util = {

  uploadObjs: function( bucketid, objs, callback ){
    async.each( objs,
      function( obj, callback ){
          s3.putObject( { Bucket: bucketid, Key: obj.key, Body: obj.body }, callback );
      },
      callback
    );
  },

  getBucketObjKeys: function( bucketid, callback ){
    s3.listObjects({ Bucket: bucketid }, function( err, objsData ){
      if( err ){
        callback( err, undefined );
        return;
      }
      callback( undefined, getKeyList( objsData ) );
    });
  },

  /* Delete all the keys in a bucket */
  deleteBucketObjs: function( bucketid, keys, callback ){
    async.waterfall([
        this.getBucketObjKeys,
        function( keys, callback ) {
          var params = getDeleteObjParams( bucketid, keys );
          s3.deleteObjects({ Bucket: bucketid }, function(err, data) {
            callback( err );
          });
        }]
    );
  },

  uploadDir: function( bucketid, dir, callback ){
    async.waterfall( [
        function( callback ){
          var pattern = path.join( dir, '**/*' );
          glob( pattern, {}, callback );
        },
        filterFiles,
        uploadFiles.bind(null, bucketid)
      ],
      callback
    );
  }
}

module.exports = s3util;

