# WebRTCDemo
Some WebRTC examples

## Demos

1. UserMedia - simple app that captures sound and video from device
### Run
```yaml

npm install
static

in browser: localhost:8080/media.html
```

2. PhotoBooth - small app capturing shots from video stream
### Run
```yaml

npm install
static

in browser: localhost:8080/photo.html
```

3. Bacis - WebRTC app doing local connection
### Run
```yaml

npm install
static

in browser: localhost:8080/basics.html
```

4. Signalling Server - Signalling Server for WebRTC
### Run
```yaml

npm install
node server.js
```
For testing the server
- To test login send: { "type": "login", "name":"Test" }. Expected response: {"type":"login","success":true}
- To test offer send: { "type": "offer","name":"Test","offer":"Hello"}. Expected response:  offer message on the second client
- To test answer send: {"type":"answer","name":"Test1","answer":"HI"}. Expected response: on the second client {"type":"answer","answer":"HI"}
- To test candidate send: { "type": "candidate", "name": "Test1","candidate":"cc"}. Expected response: on the second client {"type":"candidate","candidate":"cc"}
- To test leave send: { "type": "leave"}.Expected response: on the both clients {"type":"leave"}

All tests execept login require second client session and login on both sessions

5. WebRTCClient - Client app for making calls

### Run
```yaml

npm install
static
in browser: localhost:8080/client.html
```

Running signalling server required.
For testing:

Open client in two browser tabs ,login and make a call.
