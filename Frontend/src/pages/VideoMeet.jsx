import React, { useEffect, useRef, useState } from "react";
import { io } from "socket.io-client";
import TextField from "@mui/material/TextField";
import Button from "@mui/material/Button";

import "../styles/VideoComponent.css";

const server_url = "http://localhost:8000";

// WebRTC configuration
const peerConfigConnections = {
  iceServers: [
    { urls: "stun:stun.l.google.com:19302" },
  ],
};

export default function VideoMeetComponent() {
  // Ref declarations
  const socketRef = useRef(null);
  const socketIdRef = useRef(null);
  const localVideoRef = useRef(null); // Ref attached to local video element

  // State declarations
  const [videoAvailable, setVideoAvailable] = useState(true);
  const [audioAvailable, setAudioAvailable] = useState(true);
  
  // Use booleans for media control states
  const [video, setVideo] = useState(true);
  const [audio, setAudio] = useState(true);
  const [screenAvailable, setScreenAvailable] = useState(false);

  const [messages, setMessages] = useState([]);
  const [message, setMessage] = useState("");
  const [newMessages, setNewMessages] = useState(0);

  const [askForUsername, setAskForUserName] = useState(true); // Controls UI view
  const [username, setUsername] = useState("");

  const videoRef = useRef([]); 
  const [videos, setVideos] = useState([]); // To track remote streams

  // Store connections object (used as a ref for RTCPeerConnection instances)
  const connectionsRef = useRef({});

  // ============================
  // PERMISSIONS & MEDIA SETUP
  // ============================
  const getPermissions = async () => {
    let hasVideo = false;
    let hasAudio = false;
    let userMediaStream = null;

    try {
      // 1. Check/Get Video Stream Availability
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: false });
        stream.getTracks().forEach((track) => track.stop()); 
        hasVideo = true;
      } catch (err) {
        hasVideo = false;
      }
      setVideoAvailable(hasVideo);

      // 2. Check/Get Audio Stream Availability
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true, video: false });
        stream.getTracks().forEach((track) => track.stop());
        hasAudio = true;
      } catch (err) {
        hasAudio = false;
      }
      setAudioAvailable(hasAudio);
      
      // 3. Check screen share availability
      if (navigator.mediaDevices && navigator.mediaDevices.getDisplayMedia) {
        setScreenAvailable(true);
      } else {
        setScreenAvailable(false);
      }

      // 4. Request the final, persistent stream using the determined availability
      if (hasVideo || hasAudio) {
        userMediaStream = await navigator.mediaDevices.getUserMedia({
          video: hasVideo,
          audio: hasAudio,
        });

        if (userMediaStream) {
          window.localStream = userMediaStream;
          // Apply stream to the initial "Local Preview" video element
          if (localVideoRef.current) {
            localVideoRef.current.srcObject = userMediaStream;
          }
        }
      }
    } catch (err) {
      console.log("Final Stream Request Error:", err);
      setVideoAvailable(false);
      setAudioAvailable(false);
    }
  };

  useEffect(() => {
    if (navigator.mediaDevices) {
      getPermissions();
    }
  }, []);

  const getUserMediaHandler = () => {
    // Media toggle logic (for turning camera/mic on/off mid-call)
    if ((video && videoAvailable) || (audio && audioAvailable)) {
      navigator.mediaDevices
        .getUserMedia({ video, audio })
        .then((stream) => {
          // Logic to update tracks on peer connections goes here
        })
        .catch((e) => console.log(e));
    } else {
      try {
        if (localVideoRef.current && localVideoRef.current.srcObject) {
          let tracks = localVideoRef.current.srcObject.getTracks();
          tracks.forEach((track) => track.stop());
        }
      } catch (e) {}
    }
  };

  useEffect(() => {
    if (video !== undefined && audio !== undefined && !askForUsername) {
      getUserMediaHandler();
    }
  }, [video, audio, askForUsername]);

  // ============================
  // SIGNALING HANDLERS
  // ============================

  let gotMessageFromServer = (fromId, message) => {
    try {
        var signal = JSON.parse(message);
    } catch (e) {
        console.error("Invalid signal format:", e);
        return;
    }

    if (fromId !== socketIdRef.current) {
        if (signal.sdp) {
            if (connectionsRef.current[fromId]) {
                connectionsRef.current[fromId].setRemoteDescription(new RTCSessionDescription(signal.sdp))
                    .then(() => {
                        if (signal.sdp.type === "offer") {
                            connectionsRef.current[fromId].createAnswer()
                                .then((description) => {
                                    connectionsRef.current[fromId].setLocalDescription(description)
                                        .then(() => {
                                            socketRef.current.emit(
                                                "signal",
                                                fromId,
                                                JSON.stringify({ "sdp": connectionsRef.current[fromId].localDescription })
                                            );
                                        }).catch(e => console.log("SetLocalDescription failed:", e));
                                }).catch(e => console.log("CreateAnswer failed:", e));
                        }
                    }).catch(e => console.log("SetRemoteDescription failed:", e));
            }
        } else if (signal.ice) {
            if (connectionsRef.current[fromId]) {
                connectionsRef.current[fromId].addIceCandidate(new RTCIceCandidate(signal.ice))
                    .catch(e => console.log("AddIceCandidate failed:", e));
            }
        }
    }
  };

  const addMessage = (msg) => {
    setMessages((prev) => [...prev, msg]);
  };

  // ============================
  // SOCKET CONNECTION
  // ============================
  const connectToSocketServer = () => {
    socketRef.current = io.connect(server_url, { secure: false });

    socketRef.current.on("signal", gotMessageFromServer);

    socketRef.current.on("connect", () => {
      socketIdRef.current = socketRef.current.id;

      socketRef.current.emit("join-call", window.location.href);

      socketRef.current.on("chat-message", addMessage);

      socketRef.current.on("user-left", (id) => {
        setVideos((videos) => videos.filter((v) => v.socketId !== id));
        delete connectionsRef.current[id];
      });

      socketRef.current.on("user-joined", (id, clients) => {
        if (clients && Array.isArray(clients)) {
          clients.forEach((socketListId) => {
            // 1. Create RTCPeerConnection for each existing client
            connectionsRef.current[socketListId] = new RTCPeerConnection(peerConfigConnections);

            // 2. Set up ICE candidate handler
            connectionsRef.current[socketListId].onicecandidate = (event) => {
                if(event.candidate != null){
                    socketRef.current.emit("signal", socketListId, JSON.stringify({'ice': event.candidate}))
                }
            }

            // 3. Set up remote stream handler (when remote stream is added)
            connectionsRef.current[socketListId].onaddstream = (event) => {
                let videoExists = videos.find(video => video.socketId === socketListId); 
                
                if(!videoExists){
                    let newVideo = {
                        socketId: socketListId,
                        stream: event.stream,
                        autoPlay:true,
                        playsinline: true
                    }

                    setVideos(prevVideos => [...prevVideos, newVideo]);
                }
            };
            
            // 4. Add local stream to the new connection
            if (window.localStream) {
              connectionsRef.current[socketListId].addStream(window.localStream);
            }
          });
        }
        
        // 5. Send offers to existing clients
        if (id === socketIdRef.current) {
          for (let id2 in connectionsRef.current) {
            if (id2 === socketIdRef.current) continue; 

            connectionsRef.current[id2].createOffer().then((description) => {
              connectionsRef.current[id2].setLocalDescription(description).then(() => {
                socketRef.current.emit(
                  "signal",
                  id2,
                  JSON.stringify({ sdp: connectionsRef.current[id2].localDescription })
                );
              }).catch(e => console.log(e));
            }).catch(e => console.log(e));
          }
        }
      });
    });
  };

  // ============================
  // CONNECT AFTER USERNAME (MODIFIED)
  // ============================
  const applyLocalStream = () => {
      // Re-apply the stream after the component re-renders and the ref is updated.
      if (window.localStream && localVideoRef.current) {
          localVideoRef.current.srcObject = window.localStream;
      }
  }

  const getMedia = () => {
    setVideo(videoAvailable);
    setAudio(audioAvailable);
    connectToSocketServer();
  };

  const connect = () => {
    if (!username.trim()) {
      alert("Please enter username");
      return;
    }
    
    // 1. Change state to switch the UI view
    setAskForUserName(false); 
    
    // 2. Connect to media/socket
    getMedia(); 
    
    // 3. FIX: Wait briefly for the DOM to update, then re-apply the stream 
    // to the newly rendered video element.
    setTimeout(applyLocalStream, 50); 
  };

  // ============================
  // RENDER UI
  // ============================
  return (
    <div style={{ padding: "20px", minHeight: "100vh" }}>
      {askForUsername ? (
        // UI for entering username (Local Preview Video)
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: "20px",
            maxWidth: "500px",
            margin: "0 auto",
          }}
        >
          <h2>Enter into lobby</h2>

          <TextField
            id="outlined-basic"
            label="Username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            variant="outlined"
          />

          <Button variant="contained" onClick={connect}>
            Connect
          </Button>

          <div>
            <h3>Local Preview</h3>
            <video
              ref={localVideoRef} // Ref is attached here initially
              autoPlay
              muted
              style={{
                width: "100%",
                maxWidth: "400px",
                backgroundColor: "#000",
                borderRadius: "8px",
              }}
            ></video>
          </div>
        </div>
      ) : (
        // UI after connection (Your Video + Remote Videos)
        <div>
          <h2>Connected as {username}</h2>

          {/* Local Video Stream */}
          <div style={{ marginBottom: '20px' }}>
            <h3>Your Video (Muted)</h3>
            <video
              ref={localVideoRef} // Ref is re-attached here after re-render
              autoPlay
              muted
              style={{
                width: "100%",
                maxWidth: "400px",
                backgroundColor: "#000",
                borderRadius: "8px",
              }}
            ></video>
          </div>
          
          {/* Remote Video Streams */}
          <div style={{ display: "flex", flexWrap: "wrap", gap: "20px" }}>
            {videos.map((v) => (
              <div key={v.socketId}>
                <h3>Remote User: {v.socketId}</h3>
                <video
                  // Callback ref to assign the remote stream
                  ref={(el) => {
                    if (el && v.stream) {
                      el.srcObject = v.stream;
                    }
                  }}
                  autoPlay
                  playsInline
                  style={{
                    width: "100%",
                    maxWidth: "400px",
                    backgroundColor: "#333",
                    borderRadius: "8px",
                  }}
                ></video>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}