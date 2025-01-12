const socket = io('/')
const videoGrid = document.querySelector('#video-grid')
const myPeer = new Peer(undefined, {
    host: '/',
    port: '3001'
})

const myVideo = document.createElement('video')
//Mute our own microphone not to hear ourselves
myVideo.muted = true

//When peer connection is on and a unique id is given, run this function
myPeer.on('open', id => {
    socket.emit('join-room', ROOM_ID, id)
})

const peers = {}

navigator.mediaDevices.getUserMedia({
    video: true,
    audio: true
}).then(stream => {
    addVideoStream(myVideo, stream)

    myPeer.on('call', call => {
        call.answer(stream)
        const video= document.createElement('video')
        call.on('stream', userVideoStream => {
            addVideoStream(video,userVideoStream)
        })
    })

    socket.on('user-connected', userId => {
        connectToNewUser(userId, stream)
    })
})

socket.on('user-connected', userId => {
    console.log('User connected: '+ userId)
} )

socket.on('user-disconnected', userId => {
    if (peers[userId]) peers[userId].close()
  })

function connectToNewUser(userId, stream) {
    const call = myPeer.call(userId, stream)
    const video = document.createElement('video')
    call.on('stream', userVideoStream =>  {
        addVideoStream(userVideoStream)
    })
    call.on('close', ()=> {
        video.remove()
    })
    peers[userId] = call
}

function addVideoStream(video, stream) {
    video.srcObject = stream
    video.addEventListener('loadedmetadata', ()=> {
        video.play()
    })
    videoGrid.append(video)
}