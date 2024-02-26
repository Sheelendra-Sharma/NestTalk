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
    
    <div>
      <form onSubmit={handleSubmitForm}>
      <div className="bg-blue-700 h-screen grid">
        <div className="flex items-center justify-center">
          <h1 className="text-white text-4xl font-bold">Webrtc Video Calling System</h1>
        </div>
        <div className="flex justify-center items-center">
        <div className="bg-white rounded-lg sm:p-4 max-w-lg inline-block"> 
        <div className="flex justify-center font-bold text-2xl sm:p-0 pt-4">Login</div>
        <br />
          <div className="m-4 flex justify-between items-center">
            <label htmlFor="email">Email</label>
            <input className="border border-gray-500 m-2 rounded-lg bg-gray-200" 
              type="text" 
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              />
          </div>
          <div className="m-4 flex justify-between items-center">
          <label htmlFor="room">Room No.</label>
            <input className="border border-gray-500 m-2 rounded-lg bg-gray-200" 
              type="text" 
              id="room"
              value={room}
              onChange={(e) => setRoom(e.target.value)}
            />
          </div>
        </div>
        </div>
        <div className="flex justify-center">
          <button className="border px-5 py-2.5 h-fit border-gray-700 text-white bg-gradient-to-br from-green-400 to-blue-600 rounded-full font-medium">Join</button>
        </div>
    </div>
      </form>
    </div>
  );
};

export default LobbyScreen;
