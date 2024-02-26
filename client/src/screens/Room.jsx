import React, { useEffect, useCallback, useState } from "react";
import ReactPlayer from "react-player";
import peer from "../service/peer";
import { useSocket } from "../context/SocketProvider";

const RoomPage = () => {
  const socket = useSocket();
  const [remoteSocketId, setRemoteSocketId] = useState(null);
  const [myStream, setMyStream] = useState();
  const [remoteStream, setRemoteStream] = useState();

  const handleUserJoined = useCallback(({ email, id }) => {
    console.log(`Email ${email} joined room`);
    setRemoteSocketId(id);
  }, []);

  const handleCallUser = useCallback(async () => {
    const stream = await navigator.mediaDevices.getUserMedia({
      audio: true,
      video: true,
    });
    const offer = await peer.getOffer();
    socket.emit("user:call", { to: remoteSocketId, offer });
    setMyStream(stream);
  }, [remoteSocketId, socket]);

  const handleIncommingCall = useCallback(
    async ({ from, offer }) => {
      setRemoteSocketId(from);
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: true,
        video: true,
      });
      setMyStream(stream);
      console.log(`Incoming Call`, from, offer);
      const ans = await peer.getAnswer(offer);
      socket.emit("call:accepted", { to: from, ans });
    },
    [socket]
  );

  const sendStreams = useCallback(() => {
    for (const track of myStream.getTracks()) {
      peer.peer.addTrack(track, myStream);
    }
  }, [myStream]);

  const handleCallAccepted = useCallback(
    ({ from, ans }) => {
      peer.setLocalDescription(ans);
      console.log("Call Accepted!");
      sendStreams();
    },
    [sendStreams]
  );

  const handleNegoNeeded = useCallback(async () => {
    const offer = await peer.getOffer();
    socket.emit("peer:nego:needed", { offer, to: remoteSocketId });
  }, [remoteSocketId, socket]);

  useEffect(() => {
    peer.peer.addEventListener("negotiationneeded", handleNegoNeeded);
    return () => {
      peer.peer.removeEventListener("negotiationneeded", handleNegoNeeded);
    };
  }, [handleNegoNeeded]);

  const handleNegoNeedIncomming = useCallback(
    async ({ from, offer }) => {
      const ans = await peer.getAnswer(offer);
      socket.emit("peer:nego:done", { to: from, ans });
    },
    [socket]
  );

  const handleNegoNeedFinal = useCallback(async ({ ans }) => {
    await peer.setLocalDescription(ans);
  }, []);

  useEffect(() => {
    peer.peer.addEventListener("track", async (ev) => {
      const remoteStream = ev.streams;
      console.log("GOT TRACKS!!");
      setRemoteStream(remoteStream[0]);
    });
  }, []);

  useEffect(() => {
    socket.on("user:joined", handleUserJoined);
    socket.on("incomming:call", handleIncommingCall);
    socket.on("call:accepted", handleCallAccepted);
    socket.on("peer:nego:needed", handleNegoNeedIncomming);
    socket.on("peer:nego:final", handleNegoNeedFinal);

    return () => {
      socket.off("user:joined", handleUserJoined);
      socket.off("incomming:call", handleIncommingCall);
      socket.off("call:accepted", handleCallAccepted);
      socket.off("peer:nego:needed", handleNegoNeedIncomming);
      socket.off("peer:nego:final", handleNegoNeedFinal);
    };
  }, [
    socket,
    handleUserJoined,
    handleIncommingCall,
    handleCallAccepted,
    handleNegoNeedIncomming,
    handleNegoNeedFinal,
  ]);

  return (
    // <div>
    //   <h1>Room Page</h1>
    //   <h4>{remoteSocketId ? "Connected" : "No one in room"}</h4>
    //   {myStream && <button onClick={sendStreams}>Send Stream</button>}
    //   {remoteSocketId && <button onClick={handleCallUser}>CALL</button>}
    //   {myStream && (
    //     <>
    //       <h1>My Stream</h1>
    //       <ReactPlayer
    //         playing
    //         muted
    //         height="300px"
    //         width="400px"
    //         url={myStream}
    //       />
    //     </>
    //   )}
    //   {remoteStream && (
    //     <>
    //       <h1>Remote Stream</h1>
    //       <ReactPlayer
    //         playing
    //         muted
    //         height="300px"
    //         width="400px"
    //         url={remoteStream}
    //       />
    //     </>
    //   )}
    // </div>
    <div className="h-screen bg-blue-600">
  <div className="grid h-[40%] justify-center">
    <h1 className="text-3xl font-bold text-white">Room Page</h1>
      <h2 className="text-xl text-white">
        {remoteSocketId ? "Connected" : "No one in room"}
      </h2>

    <div className="grid ">
    {remoteSocketId &&
      <button 
        className="rounded-full bg-white font-medium text-black m-2 "
        onClick={handleCallUser}        
      >Call
      </button>}

      {myStream &&
      <button className="rounded-full bg-white font-medium text-black m-2"
      onClick={sendStreams}>
        Send Stream
      </button>}
    </div>
  </div>
  <div className="flex h-[60%] w-full justify-between p-6 ">

  {myStream && (
         <>
            <div>
                <h3 className="text-white text-center font-medium">My Stream</h3>
              <ReactPlayer
                playing
                muted
                className="h-48 w-48 rounded-2xl mt-4 bg-white "
                height="300px"
                width="400px"
                url={myStream}
              />
            </div>
         </>
       )}
  {remoteStream && (
         <>
            <div>
                <h3 className="text-white text-center font-medium">Remote Stream</h3>
              <ReactPlayer
                playing
                muted
                className="h-48 w-48 rounded-2xl mt-4 bg-white"
                height="300px"
                width="400px"
                url={remoteStream}
              />
            </div>
         </>
       )}
      
  </div>
</div>

  );
};

export default RoomPage;
