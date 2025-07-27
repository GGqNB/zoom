const socket = io("/");
const videoGrid = document.getElementById("video-grid");
const myVideo = document.createElement("video");

myVideo.muted = true;



const user = getRandomInt(1,100);

function getRandomInt(min, max) {
  min = Math.ceil(min);
  max = Math.floor(max);
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

var peer = new Peer({
  // host: '127.0.0.1',
  host: 'intercom-rental.ru',
  port: 443,
  path: '/peerjs',
  config: {
    'iceServers': [
      { url: 'stun:stun01.sipphone.com' },
      { url: 'stun:stun.ekiga.net' },
      { url: 'stun:stunserver.org' },
      { url: 'stun:stun.softjoys.com' },
      { url: 'stun:stun.voiparound.com' },
      { url: 'stun:stun.voipbuster.com' },
      { url: 'stun:stun.voipstunt.com' },
      { url: 'stun:stun.voxgratia.org' },
      { url: 'stun:stun.xten.com' },
      {
        url: 'turn:192.158.29.39:3478?transport=udp',
        credential: 'JZEOEt2V3Qb0y27GRntt2u2PAYA=',
        username: '28224511:1379330808'
      },
      {
        url: 'turn:192.158.29.39:3478?transport=tcp',
        credential: 'JZEOEt2V3Qb0y27GRntt2u2PAYA=',
        username: '28224511:1379330808'
      }
    ]
  },

  debug: 3
});

let myVideoStream;

// Initialize PeerJS and Socket.IO independently of media stream
peer.on("open", (id) => {
    console.log('my id is' + id);
    socket.emit("join-room", ROOM_ID, id, user);
});

socket.on("user-connected", (userId) => {
    if (myVideoStream) { // Ensure myVideoStream is available
        connectToNewUser(userId, myVideoStream);
    } else {
        console.warn("Cannot connect to new user.  Media stream is not available.");
        // Optionally, display a message to the user.
    }
});

peer.on("call", (call) => {
    console.log('someone call me');
    call.answer(myVideoStream); //Use myVideoStream safely
    const video = document.createElement("video");
    call.on("stream", (userVideoStream) => {
        addVideoStream(video, userVideoStream);
    });
});

function startMedia() {
  navigator.mediaDevices.getUserMedia({
      audio: true,
      video: true,
  })
      .then((stream) => {
          myVideoStream = stream; // Assign the stream to the variable

          addVideoStream(myVideo, stream); // Call the function to display the video
      })
      .catch((err) => {
          console.error("Error accessing media devices:", err);
          alert("Unable to access camera and microphone. Please check permissions and try again.");
          // Optionally, display a placeholder video or message in the videoGrid
          const errorMessage = document.createElement("p");
          errorMessage.textContent = "Camera and microphone access denied or unavailable.";
          videoGrid.appendChild(errorMessage);
      });
}

const connectToNewUser = (userId, stream) => {
    console.log('I call someone' + userId);
    const call = peer.call(userId, stream);
    const video = document.createElement("video");
    call.on("stream", (userVideoStream) => {
        addVideoStream(video, userVideoStream);
    });
};

const addVideoStream = (video, stream) => {
    video.srcObject = stream;
    video.addEventListener("loadedmetadata", () => {
        video.play();
        videoGrid.append(video);
    });
};

let text = document.querySelector("#chat_message");
let messages = document.querySelector(".messages");
socket.on("createMessage", (message, userName) => {
    const messageDiv = document.createElement('div');
    messageDiv.classList.add('message');

    const userSpan = document.createElement('span');
    userSpan.innerHTML = `<b><i class="far fa-user-circle"></i> <span> ${userName === user ? "me" : userName}</span> </b>`;

    const messageSpan = document.createElement('span');
    messageSpan.textContent = message;

    messageDiv.appendChild(userSpan);
    messageDiv.appendChild(messageSpan);

    messages.appendChild(messageDiv);
});

startMedia();
// const showChat = document.querySelector("#showChat");
// const backBtn = document.querySelector(".header__back");
// backBtn.addEventListener("click", () => {
//   document.querySelector(".main__left").style.display = "flex";
//   document.querySelector(".main__left").style.flex = "1";
//   document.querySelector(".main__right").style.display = "none";
//   document.querySelector(".header__back").style.display = "none";
// });

// showChat.addEventListener("click", () => {
//   document.querySelector(".main__right").style.display = "flex";
//   document.querySelector(".main__right").style.flex = "1";
//   document.querySelector(".main__left").style.display = "none";
//   document.querySelector(".header__back").style.display = "block";
// });
// let send = document.getElementById("send");
// send.addEventListener("click", (e) => {
//   if (text.value.length !== 0) {
//     socket.emit("message", text.value);
//     text.value = "";
//   }
// });

// text.addEventListener("keydown", (e) => {
//   if (e.key === "Enter" && text.value.length !== 0) {
//     socket.emit("message", text.value);
//     text.value = "";
//   }
// });

// const inviteButton = document.querySelector("#inviteButton");
// const muteButton = document.querySelector("#muteButton");
// const stopVideo = document.querySelector("#stopVideo");
// muteButton.addEventListener("click", () => {
//   const enabled = myVideoStream.getAudioTracks()[0].enabled;
//   if (enabled) {
//     myVideoStream.getAudioTracks()[0].enabled = false;
//     html = `<i class="fas fa-microphone-slash"></i>`;
//     muteButton.classList.toggle("background__red");
//     muteButton.innerHTML = html;
//   } else {
//     myVideoStream.getAudioTracks()[0].enabled = true;
//     html = `<i class="fas fa-microphone"></i>`;
//     muteButton.classList.toggle("background__red");
//     muteButton.innerHTML = html;
//   }
// });

// stopVideo.addEventListener("click", () => {
//   const enabled = myVideoStream.getVideoTracks()[0].enabled;
//   if (enabled) {
//     myVideoStream.getVideoTracks()[0].enabled = false;
//     html = `<i class="fas fa-video-slash"></i>`;
//     stopVideo.classList.toggle("background__red");
//     stopVideo.innerHTML = html;
//   } else {
//     myVideoStream.getVideoTracks()[0].enabled = true;
//     html = `<i class="fas fa-video"></i>`;
//     stopVideo.classList.toggle("background__red");
//     stopVideo.innerHTML = html;
//   }
// });

// inviteButton.addEventListener("click", (e) => {
//   prompt(
//     "Copy this link and send it to people you want to meet with",
//     window.location.href
//   );
// });

