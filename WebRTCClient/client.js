var name, connectedUser;

var connection = new WebSocket('ws://localhost:8888');

var loginPage = document.querySelector('#login-page'),
    usernameInput = document.querySelector('#username'),
    loginButton = document.querySelector('#login'),
    remoteUsernameInput = document.querySelector('#remote-username')
    callButton = document.querySelector('#call'),
    callPage = document.querySelector('#call-page')
    hangUpButton = document.querySelector('#hang-up'),
    sendButton = document.querySelector('#send'),
    received = document.querySelector('#received'),
    messageInput = document.querySelector('#message'),
    fileButton = document.querySelector('#sendFile'),
    statusText = document.querySelector('#status');

var localVideo = document.querySelector('#local'),
    remoteVideo = document.querySelector('#remote'),
    localConnection,stream,sendChannel,receiveChannel;

var offerOptions = {
          offerToReceiveAudio: 1,
          offerToReceiveVideo: 1
        };

var currFile = [],
    currFileMeta;

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
       console.log(error);
       alert("Camera capture failed!")
     });
};

function setupPeerConnection(stream){
  var configuration = {
    "iceServers": [{ "urls": ["stun:stun.1.google.com:19302"]}]
  };

  localConnection = new RTCPeerConnection(configuration, {optional: [{RtpDataChannels: true}]});


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

 localConnection.ondatachannel = handleChannelCallback;

 var sendChannelOptions = {
   ordered: true,
   reliable: true
     }

  sendChannel = localConnection.createDataChannel("dl",sendChannelOptions);
  localConnection.ondatachannel = handleChannelCallback;
  sendChannel.onopen = handleDataChannelOpen;
  sendChannel.onmessage = handleDataChannelMessageReceived;
  sendChannel.onerror = handleDataChannelError;
  sendChannel.onclose = handleDataChannelClose;
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
      console.log(error);}
    );
}

  function handleDataChannelOpen (event) {
  console.log("Channel opened");
  sendChannel.send("Hiiiii");
  };

  function handleDataChannelMessageReceived (event) {
    var data = event.data;
    if (isBase64(data) || isJson(data)){

        if (isJson(data)){
          var msg = JSON.parse(data);

          switch (msg.type){
            case "start":
                currFile = [];
                currFileMeta = msg.data;
                console.log("Receiving file :",currFileMeta);
                break;

            case "end":
                saveFile(currFileMeta,currFile);
                break;
          }
        } else {
            currFile.push(atob(data));
          }


    } else {

      console.log("Got a new message:" +data);

      received.innerHTML +=  data + "<br />";
      received.scrollTop = received.scrollHeight;
    }
  };

   function handleDataChannelError (error) {
    console.log(error);
  };

   function handleDataChannelClose (event) {
    console.log("Channel closed");
  };

  function handleChannelCallback(event) {
     receiveChannel = event.channel;
     receiveChannel.onopen = handleDataChannelOpen;
     receiveChannel.onmessage = handleDataChannelMessageReceived;
     receiveChannel.onerror = handleDataChannelError;
     receiveChannel.onclose = handleDataChannelClose;
  };

  sendButton.addEventListener("click", function (event) {
    var val = messageInput.value;
    received.innerHTML += val + "<br />";
    received.scrollTop = received.scrollHeight;
    receiveChannel.send(val);
  });

  fileButton.addEventListener("click", function (event) {
     var files = document.querySelector('#files').files;

     if (files.length>0){
       sendChannel.send(JSON.stringify({
         type: "start",
         data: files[0]
       }));
     }

     sendFile(files[0])
  });

  function encodeArrayBuffer(buffer){
    var binary = '';
    var bytes = new Uint8Array(buffer);
    var len = bytes.byteLength;
    for (var i=0;i<len;i++){
      binary += String.fromCharCode( bytes[i]);
    }

    return btoa(binary);
  }

  function base64ToBlob(binData,contentType){
     contentType = contentType || '';

     var byteArrays = [], byteNums, slice;
     for (var i;i<binData.lenth;i++){
       slice = binData[i];
       byteNums = new Array(slice.length);

       for (var n=0;n<slice.length;n++){
         byteNums[n] = slice.charCodeAt(n);
       }

       var byteArray = new Uint8Array(byteNums);
       byteArrays.push(byteArray);
     }

     var blob = new Blob(byteArrays,{type: contentType});
  }

  var MAX_CHUNK = 16000;
  function sendFile(file){
    var fileReader = new FileReader();

    fileReader.onloadend = function(event){
      if (event.target.readyState = FileReader.DONE){
        var buffer = fileReader.result,
            start = 0,
            end = 0,
            last = false;

        function sendChunk(){
          end = start + MAX_CHUNK;
          if (end > file.size){
            end = file.size;
            last = true;
          }

          var percentage = Math.floor((end / file.size) * 100);
          statusText.innerHTML = "Sending... " + percentage + "%"


          sendChannel.send(encodeArrayBuffer(buffer.slice(start,end)));

          if (last===true){
            sendChannel.send(JSON.stringify({
              type: "end"
            }));
          } else {
            start = end;
            setTimeout(function(){
              sendChunk();
            },100);
          }
        }

        sendChunk();
      }
    };

    fileReader.readAsArrayBuffer(file);
  }

  function saveFile(meta,data){
     window.URL = window.URL || window.webkitURL;
     var blob = base64ToBlob(data,meta.type);

     var link = document.createElement('a');

     link.href = window.URL.createObjectURL(blob);
     link.download = meta.name;
     link.click();
  }

  function isBase64(str) {
    try {
        return btoa(atob(str)) == str;
    } catch (err) {
        return false;
    }
}

function isJson(str) {
    try {
        JSON.parse(str);
    } catch (e) {
        return false;
    }
    return true;
}
