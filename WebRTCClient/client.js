var name, connectedUser;

var connection = new WebSocket('ws://localhost:8888');

var loginPage = document.querySelector('#login-page'),
    usernameInput = document.querySelector('#username'),
    loginButton = document.querySelector('#login'),
    remoteUsernameInput = document.querySelector('#remote-username')
    callButton = document.querySelector('#call'),
    callPage = document.querySelector('#call-page')
    hangUpButton = document.querySelector('#hang-up');

var localVideo = document.querySelector('#local'),
    remoteVideo = document.querySelector('#remote'),
    localConnection,stream;

var offerOptions = {
          offerToReceiveAudio: 1,
          offerToReceiveVideo: 1
        };

callPage.style.display = "none";


connection.onopen = function (){
  console.log("Connected to server")
}

connection.onmessage = function(message){
  console.log("Got message", message.data);

  var data = JSON.parse(message.data);
  switch (data.type) {
    case "login":
      onLogin(data.success);
      break;

    case "offer":
       onOffer(data.offer,data.name);
       break;

    case "answer":
       onAnswer(data.answer);
       break;

    case "candidate":
       onCandidate(data.candidate);
       break;

    case "leave":
      onLeave();
      break;

    default:
      break;
  }
};

connection.onerror = function(err){
  console.log("Got error",err);
}

function send(message){
  if (connectedUser){
    message.name = connectedUser;
  }

  connection.send(JSON.stringify(message))
}


loginButton.addEventListener("click",function (event){
  name = usernameInput.value;
  console.log(name)
  if (name.length > 0){

    send({
      type: "login",
      name: name
    });
   }
});

function onLogin(success) {
  if (success === false) {
    alert("Wrong username");
  } else {
    loginPage.style.display = "none";
    callPage.style.display = "block";
    startConnection();
  }
}

callButton.addEventListener("click", function() {
  var remoteUsername = remoteUsernameInput.value;

  if (remoteUsername.length > 0){
    startPeerConnection(remoteUsername);
  }
});

hangUpButton.addEventListener("click",function(){
  send({
    type: "leave"
  });

  onLeave();
});

function onOffer(offer,name){
    connectedUser = name;

    localConnection.setRemoteDescription(new RTCSessionDescription(offer));

    localConnection.createAnswer().then(function(answer){
      localConnection.setLocalDescription(answer);
      send({
        type: "answer",
        answer: answer
      });

 },function(error){
  console.log(error);
});

}

function onAnswer(answer){
  localConnection.setRemoteDescription(new RTCSessionDescription(answer)).then(function(){
    console.log("onAnswer:lc:remoteDescr");
  })
  .catch(function(error){
    console.log(error);});
}

function onCandidate(candidate){
  localConnection.addIceCandidate(new RTCIceCandidate(candidate));
}


function onLeave(){
  connectedUser = null;
  remoteVideo.srcObject = null;
  localConnection.close();
  localConnection.onicecandidate = null;
  localConnection.ontrack = null;
  setupPeerConnection(stream);

}


function startConnection(){
  navigator.mediaDevices.getUserMedia({video: true, audio:false}).then(function(myStream){
        stream = myStream;
        localVideo.srcObject = stream;
        setupPeerConnection(stream);
     }).catch(function(error){
       alert("Camera capture failed!")
     });
};

function setupPeerConnection(stream){
  var configuration = {
    "iceServers": [{ "urls": ["stun:stun.1.google.com:19302"]}]
  };

  localConnection = new RTCPeerConnection(configuration);

  localConnection.ontrack = function(e){
    remoteVideo.srcObject = e.streams[0];
  };
   stream.getTracks().forEach(
   function(track) {
     localConnection.addTrack(
       track,
       stream
     );
   });

 localConnection.onicecandidate = function(event){
  if (event.candidate) {
    send({
      type: "candidate",
      candidate: event.candidate
    });
  }
 };
};

function startPeerConnection(user){
  connectedUser = user;

  localConnection.createOffer(offerOptions).then(function(offer){
    send({
      type: "offer",
      offer: offer
    });
    localConnection.setLocalDescription(offer);
  }).catch(function(error){
      console.log(error);});;
}
