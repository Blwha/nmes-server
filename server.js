const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');

const app = express();
app.use(cors()); // 다른 도메인(클라이언트)에서 접근 가능하도록 허용

// HTTP 서버 생성 및 Socket.io 연결
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: "*", // 실제 서비스 시에는 클라이언트 도메인만 허용하도록 변경하세요
    methods: ["GET", "POST"]
  }
});

// 연결된 유저 정보를 저장할 임시 메모리 변수
let connectedUsers = 0;

// 클라이언트가 Socket.io로 연결되었을 때 실행되는 이벤트
io.on('connection', (socket) => {
  connectedUsers++;
  console.log(`새로운 유저 접속! (ID: ${socket.id}) - 현재 접속자 수: ${connectedUsers}`);

  // 1. 유저가 메시지를 보냈을 때 (텍스트, 사진, 영상 포함)
  socket.on('send_message', (data) => {
    console.log('메시지 수신:', data);
    
    // 메시지 데이터 구조 예시:
    // { senderName: '유저1', text: '안녕하세요', type: 'text'|'image'|'video', mediaUrl: '...' }
    
    const messageData = {
      id: Date.now().toString(),
      ...data,
      timestamp: Date.now()
    };

    // 자신을 포함한 모든 접속자에게 메시지 브로드캐스트
    io.emit('receive_message', messageData);
  });

  // 2. 유저가 접속을 해제했을 때
  socket.on('disconnect', () => {
    connectedUsers--;
    console.log(`유저 접속 종료 (ID: ${socket.id}) - 현재 접속자 수: ${connectedUsers}`);
  });
});

// 서버 포트 설정
const PORT = process.env.PORT || 3001;

server.listen(PORT, () => {
  console.log(`=========================================`);
  console.log(`🚀 메신저 소켓 서버가 실행되었습니다.`);
  console.log(`📡 포트 번호: ${PORT}`);
  console.log(`=========================================`);
});