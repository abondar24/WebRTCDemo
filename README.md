# WebRTCDemo
Some WebRTC examples

## Run
```yaml

npm install
static
```
For server related demos
```yaml

npm install
node index.js
```

## Demos

1. UserMedia - simple app that captures sound and video from device
2. PhotoBooth - small app capturing shots from video stream
3. Bacis - WebRTC app doing local connection
4. Signalling Server - Signalling Server for WebRTC


## For testing signaling server
- To test login send: { "type": "login", "name":"Test" }. Expected response: {"type":"login","success":true}
- To test offer send: { "type": "offer","name":"Test","offer":"Hello"}. Expected response:  offer message on the second client
- To test answer send: {"type":"answer","name":"Test1","answer":"HI"}. Expected response: on the second client {"type":"answer","answer":"HI"}
- To test candidate send: { "type": "candidate", "name": "Test1","candidate":"cc"}. Expected response: on the second client {"type":"candidate","answer":"cc"}
- To test leave send: { "type": "leave", "name": "Test" }.Expected response: on the both clients {"type":"leave"}

All tests execept login require second client session and login on both sessions
