import React, { useEffect, useState, useRef } from "react";
import "./App.css";
import io from "socket.io-client";
import Peer from "simple-peer";
import styled from "styled-components";

const Container = styled.div`
  height: 100vh;
  width: 100%;
  display: flex;
  flex-direction: column;
`;

const Row = styled.div`
  display: flex;
  width: 100%;
`;

const Video = styled.video`
  border: 1px solid blue;
  width: 50%;
  height: 50%;
`;

function App() {
  const [yourID, setYourID] = useState("");
  const [users, setUsers] = useState({});
  const [stream, setStream] = useState();
  const [receivingCall, setReceivingCall] = useState(false);
  const [caller, setCaller] = useState("");
  const [callerSignal, setCallerSignal] = useState();
  const [callAccepted, setCallAccepted] = useState(false);

  const userVideo = useRef();
  const partnerVideo = useRef();
  const socket = useRef();
  const pc = useRef();

  useEffect(() => {
    socket.current = io("http://localhost:8000");
    navigator.mediaDevices
      .getUserMedia({ video: true, audio: true })
      .then((stream) => {
        setStream(stream);
        if (userVideo.current) {
          userVideo.current.srcObject = stream;
        }
      });

    socket.current.on("yourID", (id) => {
      setYourID(id);
    });
    socket.current.on("allUsers", (users) => {
      setUsers(users);
    });

    socket.current.on("hey", (data) => {
      setReceivingCall(true);
      setCaller(data.from);
      setCallerSignal(data.signal);
    });
  }, []);

  console.log(pc.current, "pccccccc");

  function callPeer(id) {
    pc.current = new RTCPeerConnection();
    stream.getTracks().forEach((track) => pc.current.addTrack(track, stream));
    pc.current.ontrack = (e) => {
      console.log("hellloooooostreamm", e);
      partnerVideo.current.srcObject = e.streams[0];
    };  
    pc.current
      .createOffer()
      .then((offer) => pc.current.setLocalDescription(offer))
      .then(() => {
        socket.current.emit("callUser", {
          userToCall: id,
          signalData: pc.current.localDescription,
          from: yourID,
        });
      })
      .catch((reason) => {
        // An error occurred, so handle the failure to connect
        console.log(reason, "reasonerror");
      });

    socket.current.on("callAccepted", (signal) => {
      pc.current.ontrack = (e) => {
        console.log(e.streams);
        partnerVideo.current.srcObject = e.streams[0];
      };
      console.log("received answerrr", signal);
      setCallAccepted(true);
      pc.current.setRemoteDescription(signal);
    });
  }

  function acceptCall() {
    setCallAccepted(true);
    pc.current = new RTCPeerConnection();
    stream.getTracks().forEach((track) => pc.current.addTrack(track, stream));
    pc.current.ontrack = (e) => {
      console.log("hellloooooostreamm111", e);
      partnerVideo.current.srcObject = e.streams[0];
    };  
    pc.current
      .setRemoteDescription(callerSignal)
      .then(() => pc.current.createAnswer())
      .then((ontrack) => {
        console.log("ontrack", ontrack);
      })
      .then((answer) => pc.current.setLocalDescription(answer))
      .then(() => {
        socket.current.emit("acceptCall", {
          signal: pc.current.localDescription,
          to: caller,
        });
      })
      .catch((reason) => {
        console.log(reason, "reasonerror");
        // An error occurred, so handle the failure to connect
      });
  }

  let UserVideo;
  if (stream) {
    UserVideo = <Video playsInline muted ref={userVideo} autoPlay />;
  }

  let PartnerVideo;
  if (callAccepted) {
    PartnerVideo = <Video playsInline ref={partnerVideo} autoPlay />;
  }

  let incomingCall;
  if (receivingCall) {
    incomingCall = (
      <div>
        <h1>{caller} is calling you</h1>
        <button onClick={acceptCall}>Accept</button>
      </div>
    );
  }
  return (
    <Container>
      <Row>
        {UserVideo}
        {PartnerVideo}
      </Row>
      <Row>
        {Object.keys(users).map((key) => {
          if (key === yourID) {
            return null;
          }
          return <button onClick={() => callPeer(key)}>Call {key}</button>;
        })}
      </Row>
      <Row>{incomingCall}</Row>
    </Container>
  );
}

export default App;
