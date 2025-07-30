export const sendSocketMessage = (ws, message) => {
  if (ws && ws.readyState === WebSocket.OPEN) {
    try {
      ws.send(JSON.stringify(message));
    } catch (err) {
      console.error("Error sending message:", err.message);
    }
  } else {
    console.warn("WebSocket is not open. Cannot send message.");
  }
};
