// services/websocketService.js
class WebSocketService {
  constructor() {
    this.socket = null;
    this.callbacks = new Map();
  }

  connect(conversationId) {
    if (this.socket?.readyState === WebSocket.OPEN) return;

    const wsUrl = `ws://${window.location.host}/ws/chat/${conversationId}/`;
    this.socket = new WebSocket(wsUrl);

    this.socket.onopen = () => console.log('WebSocket connected');
    
    this.socket.onmessage = (event) => {
      const data = JSON.parse(event.data);
      this.callbacks.get(data.type)?.(data);
    };

    this.socket.onclose = () => {
      console.log('WebSocket disconnected');
      setTimeout(() => this.connect(conversationId), 3000);
    };

    this.socket.onerror = (error) => console.error('WebSocket error:', error);
  }

  disconnect() {
    this.socket?.close();
    this.socket = null;
    this.callbacks.clear();
  }

  send(data) {
    this.socket?.readyState === WebSocket.OPEN && this.socket.send(JSON.stringify(data));
  }

  sendTyping(isTyping) {
    this.send({ type: 'typing', is_typing: isTyping });
  }

  sendReadReceipt(messageId) {
    this.send({ type: 'read_receipt', message_id: messageId });
  }

  sendMessageStatus(messageId, status) {
    this.send({ type: 'message_status', message_id: messageId, status });
  }

  on(event, callback) {
    this.callbacks.set(event, callback);
  }

  off(event) {
    this.callbacks.delete(event);
  }
}

export default new WebSocketService();