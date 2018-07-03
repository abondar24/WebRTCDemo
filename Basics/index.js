var localVideo = document.querySelector('#local'),
    remoteVideo = document.querySelector('#remote'),
    localConnection,remoteConnection;

    var offerOptions = {
      offerToReceiveAudio: 1,
      offerToReceiveVideo: 1
    };

navigator.mediaDevices.getUserMedia({video: true, audio:false}).then(function(stream){
      localVideo.srcObject = stream;
      startPeerConnection(stream);
   }).catch(function(error){
     alert("Camera capture failed!")
   });

function startPeerConnection(stream){
  var configuration = null
  // {
  //  "iceServers": [{ "url": "stun:stun.1.google.com:19302" },{ "url": "stun:127.0.0.1:9876" }]
//  };
  localConnection = new RTCPeerConnection(configuration);
  remoteConnection = new RTCPeerConnection(configuration);

  remoteConnection.ontrack = function(e){
    remoteVideo.srcObject = e.streams[0];
  };

   stream.getTracks().forEach(
   function(track) {
     localConnection.addTrack(
       track,
       stream
     );
   }
);

localConnection.onicecandidate = function(event){
    remoteConnection.addIceCandidate(event.candidate)
      .then(function(){
        console.log('Connected');
      },function(err){
        console.log(err);
      });
};

remoteConnection.onicecandidate = function(event){
    localConnection.addIceCandidate(event.candidate)
    .then(function(){
      console.log('Connected');
    },function(err){
      console.log(err);
    });
};

localConnection.createOffer(offerOptions).then(function(descr){
  localConnection.setLocalDescription(descr).then(function(){
    console.log("Local description for local connection set");
  },function(error){
    console.log(error);
  });

  remoteConnection.setRemoteDescription(descr).then(function(){
    console.log("Remote description for remote connection set");
  },function(error){
    console.log(error);
  });


  remoteConnection.createAnswer().then(function(descr){
    remoteConnection.setLocalDescription(descr).then(function(){
      console.log("Local description for remote connection set");
    },function(error){
      console.log(error);
    });

    localConnection.setRemoteDescription(descr).then(function(){
      console.log("Remote description for local connection set");
    },function(error){
      console.log(error);
    });
  });
});
}
