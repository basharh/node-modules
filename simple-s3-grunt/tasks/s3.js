
var util = require('util'),
    exec = require('child_process').exec;

module.exports = function (grunt) {

  grunt.registerMultiTask('syncS3', 'Sync a local folder with a bucket. ', function () {
    this.files.forEach( function ( file ){
      console.log('src: ' + file.src );
      console.log('dest: ' + file.dest );
    });
  });

  grunt.registerMultiTask('s3cmdSync', 's3cmd-powered dir-to-bucket sync', function () {

    var done = this.async(),
        files = this.files;

    var srcDirArr = files && files[0] && files[0].src;

    if ( srcDirArr.length != 1 ) {
      grunt.fail.fatal('Please specify one existing directory to upload!');
    }

    var cmd = 's3cmd sync --delete-removed ' + srcDirArr[0] + '/* s3://test-sdk091983';

    var child = exec(cmd, function (error, stdout, stderr) {
        console.log('stdout: ' + stdout);
        if (error !== null) {
          grunt.fail.fatal('exec error: ' + error);
          done( false );
        }
        done( true );
    });

  });

}

function debug(){
  grunt.log.writeln( 'this: ' + util.inspect( this ) );
  grunt.log.writeln( 'arguments: ' + util.inspect( arguments ) );
}


