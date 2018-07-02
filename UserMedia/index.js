function hasUserMedia(){
  return !! (navigator.getUserMedia || navigator.webkitGetUserMedia
  || navigator.mozGetUserMedia || navigator.msGetUserMedia);
}

if (hasUserMedia()){
  navigator.getUserMedia = navigator.getUserMedia || navigator.webkitGetUserMedia
  || navigator.mozGetUserMedia || navigator.msGetUserMedia;

// the dummiest way:
//  navigator.getUserMedia({video: true, audio: true});
var constraints = {
  video:{
      mandatory:{
        minAspectRatio: 1.777,
        maxAspectRatio: 1.778
       },
    optional: [
       { maxWidht: 1920},
       { maxHeight: 1080}
     ]
   },
    audio: true
 };

if (/Android|webOS|iPhone|Opera Mini/i.test(navigator.getUserAgent)){
       constraints = {
         video: {
           mandatory:{
               minWidth: 480,
               minHeight: 320,
               maxWidht: 1024,
               maxHeight: 768
              }
         },
         audio: true
       };
     }

navigator.getUserMedia(constraints,function(stream){
         var video = document.querySelector('video');
         video.src = window.URL.createObjectURL(stream);
       },function(err){
         console.log("Capturing Error:",error)
       });

} else {
       alert("Browser doesn'r support user media")
     };
