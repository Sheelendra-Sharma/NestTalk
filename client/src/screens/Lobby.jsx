import React, { useState, useCallback, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useSocket } from "../context/SocketProvider";
import '../App.css'

const LobbyScreen = () => {
  const [email, setEmail] = useState("");
  const [room, setRoom] = useState("");

  const socket = useSocket();
  const navigate = useNavigate();

  const handleSubmitForm = useCallback(
    (e) => {
      e.preventDefault();
      socket.emit("room:join", { email, room });
    },
    [email, room, socket]
  );

  const handleJoinRoom = useCallback(
    (data) => {
      const { email, room } = data;
      navigate(`/room/${room}`);
    },
    [navigate]
  );

  useEffect(() => {
    socket.on("room:join", handleJoinRoom);
    return () => {
      socket.off("room:join", handleJoinRoom);
    };
  }, [socket, handleJoinRoom]);

  return (
    // <div >
    //   <h1 >Lobby</h1>
    //   <form onSubmit={handleSubmitForm}>
    //     <label htmlFor="email">Email ID</label>
    //     <input
    //       type="email"
    //       id="email"
    //       value={email}
    //       onChange={(e) => setEmail(e.target.value)}
    //     />
    //     <br />
    //     <label htmlFor="room">Room Number</label>
    //     <input
    //       type="text"
    //       id="room"
    //       value={room}
    //       onChange={(e) => setRoom(e.target.value)}
    //     />
    //     <br />
    //     <button>Join</button>
    //   </form>
    // </div>

    <div>
      <form onSubmit={handleSubmitForm}>
      <div className="bg-blue-700 h-screen min-h-screen flex items-center justify-center">
      <div className="relative">
        {/* <h1>Webrtc Video Calling System</h1> */}
      </div>
      <div className="bg-white rounded-lg p-4 max-w-lg"> 
      <div className="flex justify-center font-bold text-2xl">Login</div>
      <br />
        <div className="m-4">
          <label htmlFor="email">Email</label>
          <input className="border border-gray-500 m-2 rounded-lg bg-gray-200" 
            type="text" 
            id="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            />
        </div>
        <div className="m-4">
        <label htmlFor="room">Room No.</label>
          <input className="border border-gray-500 m-2 rounded-lg bg-gray-200" 
            type="text" 
            id="room"
            value={room}
            onChange={(e) => setRoom(e.target.value)}
          />
        </div>
        <button className="border p-1 border-gray-700 rounded-lg">Join</button>
      </div>
    </div>
      </form>
    </div>
  );
};

export default LobbyScreen;
