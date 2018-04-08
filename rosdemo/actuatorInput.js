var window = {}
importScripts('http://192.168.33.10:5000/static/plugins/ROSLIB/eventemitter2.min.js')
var EventEmitter2 = window.EventEmitter2
importScripts('http://192.168.33.10:5000/static/plugins/ROSLIB/roslib.min.js')

var ros = new ROSLIB.Ros({url: 'ws://cdb58a0c.ngrok.io'})
ros.on('connection', function () {
  console.log('Connected to websocket server.')
}) 
ros.on('close', function () {
  console.log('Connection to websocket server closed.')
})
ros.on('error', function (error) {
  console.log('Error connecting to websocket server: ', error)
})

// topic to publish to
var actionTopic = new ROSLIB.Topic({
  ros: ros,
  name: '/cmd_vel',
  messageType: 'geometry_msgs/Twist'
})

// topic to subscribe to
var sensorTopic = new ROSLIB.Topic({
  ros: ros,
  name: '/tag_detections',
  messageType: 'apriltags_ros/AprilTagDetectionArray'
})

// publish
function sendLinearVelocity (x, y, z) {
  actionTopic.publish(new ROSLIB.Message({
    linear: {x, y, z},
    angular: {x: 0, y: 0, z: 0}
  }))
}
function sendAngularVelocity (x, y, z) {
  actionTopic.publish(new ROSLIB.Message({
    linear: {x: 0, y: 0, z: 0},
    angular: {x, y, z}
  }))
}
function changeDirection (isTrue) {
  if (isTrue) {
    console.log('backward')
    sendLinearVelocity(-0.01, 0, 0)
    // var now = new Date().getTime()
    // while (new Date().getTime() < now + 200) {}
    // console.log('turn')
    // sendAngularVelocity(0, 0, 0.01)
  }
}

function senseColor () {
  sensorTopic.subscribe(function (message) {
    console.log(message)
    if (message.detections && message.detections.length > 0) {
      var newObj = {}
      message.detections.map(function (id) {
        newObj[id] = true
      })
      postMessage(newObj)
    }
  })
}

function receivedAct (name, isTrue) {
  var actFuncs = {forward: function (isTrue) {
    if (isTrue) { 
      console.log('forward')
      sendLinearVelocity(0.01, 0, 0)
    }
  }, back: function (isTrue) {
    if (isTrue) { 
      console.log('back')
      sendLinearVelocity(-0.01, 0, 0)
    }
  }, left: function (isTrue) {
    if (isTrue) { 
      console.log('left')
      sendLinearVelocity(0, 0.01, 0)
    }  
  }, right: function (isTrue) {
    if (isTrue) { 
      console.log('right')
      sendLinearVelocity(0, -0.01, 0)
    }
  }, stop: function (isTrue) {
    if (isTrue) { 
      console.log('stop')
      sendLinearVelocity(0, 0, 0)
    }
  }}
  if (actFuncs[name]) {
    actFuncs[name](isTrue)
  }
}

onmessage = function (e) {
  receivedAct(e.data[0], e.data[1])
}
senseColor()
