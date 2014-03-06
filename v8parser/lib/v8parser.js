
var pat = /Content-Length: (\d+)/;

exports.sayHello = function(){
  console.log('hello world');
}

function getContentLength( data ){
  var res = pat.exec(data);

  if ( res === null )
    return null;

 return {
    len: res[0].length,
    val: parseInt( res[1] ),
    index: parseInt( res.index )
  }
}

// remove everything before the first content-length
function removeLeadingNonContent( s ){
  var header = 'Content-Length:';
  var first = s.search( header );

  if ( first == -1 )
    return null;

  return s.slice(first);
}

exports.getContent = function( data ){
  data = removeLeadingNonContent( data )
  if ( data === null )
    return null;

  var content_start,
      content_end,
      header = getContentLength( data );

  // If we couldn't find the header
  if ( header === null )
    return null;

  content_start = header.index + header.len + 1; // one more for the newline
  content_end = content_start + header.val; // length of content + 1

  // check to see if we have enough data to extract
  if( content_end > data.length ){
    return { content: null, data: data };
  }

  var content = data.slice( content_start, content_end );
  var data = data.slice( content_end );

  return {
    content: content,
    data: data
  }

}

exports.removeLeadingNonContent = removeLeadingNonContent;

