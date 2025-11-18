import { useEffect, useState } from "react";
import { io } from "socket.io-client";

const socket = io("http://localhost:5000");

function App() {
  const [username, setUsername] = useState("");
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState([]);
  const [onlineUsers, setOnlineUsers] = useState([]);
  const [typingUser, setTypingUser] = useState("");

  useEffect(() => {
    // Listen for messages
    socket.on("receiveMessage", (msg) => {
      setMessages((prev) => [...prev, msg]);
    });

    // Listen for notifications
    socket.on("notification", (note) => {
      setMessages((prev) => [...prev, { user: "System", text: note }]);
    });

    // Listen for online users
    socket.on("onlineUsers", (users) => {
      setOnlineUsers(users);
    });

    // Listen for typing indicator
    socket.on("typing", (user) => {
      setTypingUser(user);
      setTimeout(() => setTypingUser(""), 2000); // Clear after 2 sec
    });

    return () => {
      socket.disconnect();
    };
  }, []);

  const handleJoin = () => {
    if (username) {
      socket.emit("join", username);
    }
  };

  const handleSend = () => {
    if (message) {
      const msg = { user: username, text: message, time: new Date().toLocaleTimeString() };
      socket.emit("sendMessage", msg);
      setMessages((prev) => [...prev, msg]);
      setMessage("");
    }
  };

  const handleTyping = () => {
    socket.emit("typing", username);
  };

  return (
    <div style={{ padding: "20px", fontFamily: "Arial" }}>
      {!username ? (
        <div>
          <h2>Enter Username</h2>
          <input value={username} onChange={(e) => setUsername(e.target.value)} />
          <button onClick={handleJoin}>Join Chat</button>
        </div>
      ) : (
        <div>
          <h2>Global Chat</h2>
          <div>
            <strong>Online Users:</strong> {onlineUsers.join(", ")}
          </div>
          <div style={{ border: "1px solid #ccc", padding: "10px", height: "300px", overflowY: "scroll", margin: "10px 0" }}>
            {messages.map((msg, idx) => (
              <div key={idx}>
                <strong>{msg.user}:</strong> {msg.text} <small>{msg.time}</small>
              </div>
            ))}
          </div>
          {typingUser && <div>{typingUser} is typing...</div>}
          <input
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyPress={handleTyping}
            placeholder="Type a message..."
          />
          <button onClick={handleSend}>Send</button>
        </div>
      )}
    </div>
  );
}

export default App;
