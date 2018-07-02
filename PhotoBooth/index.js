function hasUserMedia(){
   return !!(navigator.getUsermedia || navigator.webkitGetUserMedia
   || navigator.mozGetUserMedia || navigator.msGetUserMedia);
}

if (hasUserMedia()){
  navigator.getUserMedia = navigator.getUserMedia || navigator.webkitGetUserMedia
  || navigator.mozGetUserMedia || navigator.msGetUserMedia;

  var video = document.querySelector('video'),
      canvas = document.querySelector('canvas'),
      streaming = false;

  navigator.getUserMedia({
    video: true,
    audio: false
  }, function (stream){
    video.src = window.URL.createObjectURL(stream);
    streaming = true;
  }, function (error){
      console.log("Capturing error: ",error);
  });

  document.querySelector('#capture').addEventListener('click',function(event){
    if (streaming){
      canvas.width = video.clientWidth;
      canvas.height = video.clientHeight;
      var context = canvas.getContext('2d');
      context.drawImage(video,0,0);
    }
  });

  var filters = ['', 'grayscale','sepia','invert'], currentFilter = 0;
  document.querySelector('#capture_filter').addEventListener('click',function(event){
      if (streaming){
        canvas.width =  video.clientWidth;
        canvas.height = video.clientHeight;

        var context = canvas.getContext('2d');
        context.drawImage(video,0,0);

        currentFilter++;
        if (currentFilter > filters.length -1) currentFilter = 0;
        canvas.className = filters[currentFilter];
      }
    });

} else {
  alert("User media not supported")
}
