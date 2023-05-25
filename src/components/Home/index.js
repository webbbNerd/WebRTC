import React, { useEffect, useState, useRef } from "react";
import "../../App.css";
import io from "socket.io-client";
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

function Home() {
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

    navigator.webkitGetUserMedia(
      { video: true, audio: true },
      function (myStream) {
        setStream(stream);

        //displaying local video stream on the page
        userVideo.current.srcObject = myStream;

        //using Google public stun server
        var configuration = {
          iceServers: [{ url: "stun:stun2.1.google.com:19302" }],
        };

        pc.current = new RTCPeerConnection(configuration);

        // setup stream listening
        pc.current.addStream(myStream);

        //when a remote user adds stream to the peer connection, we display it
        pc.current.onaddstream = function (e) {
          partnerVideo.current.srcObject = e.stream;
        };

        // Setup ice handling
        socket.current.on("candidate", (candidate) => {
          console.log("CANDIDATE RECEIVED", candidate);
          pc.current
            .addIceCandidate(candidate)
            .catch((error) => console.error(error));
          // this.remotePeerConnection.addIceCandidate(candidate).catch(error => console.error(error));
        });
        // pc.current.onicecandidate = function (event) {
        //   if (event.candidate) {
        //     pc.current.addIceCandidate(new RTCIceCandidate(event.candidate));
        //   }
        // };
      },
      function (error) {
        console.log(error);
      }
    );

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

  function callPeer(id) {
    pc.current.onicecandidate = (e) => {
      const iceCandidate = e.candidate;
      socket.current.emit("candidate", { to: id, candidate: iceCandidate });
      console.log("candidate generated", e.candidate);
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
      console.log("received answerrr", signal);
      setCallAccepted(true);
      pc.current.setRemoteDescription(new RTCSessionDescription(signal));
    });
  }

  function acceptCall() {
    setCallAccepted(true);
    pc.current.onicecandidate = (e) => {
      const iceCandidate = e.candidate;
      socket.current.emit("candidate", { to: caller, candidate: iceCandidate });
      console.log("candidate generated", e.candidate);
    };
    pc.current
      .setRemoteDescription(new RTCSessionDescription(callerSignal))
      .then(() => pc.current.createAnswer())
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
  // if (stream) {
  UserVideo = <Video playsInline muted ref={userVideo} autoPlay />;
  // }

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

export default Home;
