const express = require('express');
const cors = require('cors');
const app = express();
const PORT = 5000;

// 다른 도메인(React)에서 서버에 접속할 수 있게 허용
app.use(cors());
// JSON 데이터 파싱 허용
app.use(express.json());

// ========== 임시 메모리 데이터베이스 ==========

// 연습장 데이터
const ranges = [
  { id: 1, name: "서울 강북점", location: "서울시 강북구", pricePerSlot: 50000 },
  { id: 2, name: "서울 강남점", location: "서울시 강남구", pricePerSlot: 60000 },
  { id: 3, name: "인천점", location: "인천시 남동구", pricePerSlot: 45000 },
];

// 각 연습장의 타석 데이터
const slots = {
  1: [
    { id: 1, rangeId: 1, name: "1번 타석" },
    { id: 2, rangeId: 1, name: "2번 타석" },
    { id: 3, rangeId: 1, name: "3번 타석" },
    { id: 4, rangeId: 1, name: "4번 타석" },
  ],
  2: [
    { id: 5, rangeId: 2, name: "A타석" },
    { id: 6, rangeId: 2, name: "B타석" },
    { id: 7, rangeId: 2, name: "C타석" },
  ],
  3: [
    { id: 8, rangeId: 3, name: "1-1" },
    { id: 9, rangeId: 3, name: "1-2" },
  ],
};

// 예약 데이터 (ID, 연습장ID, 타석ID, 사용자명, 예약일시, 사용시간)
let bookings = [
  { 
    id: 101, 
    rangeId: 1, 
    slotId: 1, 
    userName: "김철수", 
    date: "2025-03-06", 
    startTime: "09:00", 
    endTime: "10:00", 
    duration: 1 
  },
  { 
    id: 102, 
    rangeId: 1, 
    slotId: 2, 
    userName: "이영주", 
    date: "2025-03-06", 
    startTime: "10:00", 
    endTime: "11:00", 
    duration: 1 
  },
];

let nextBookingId = 103;

// ========== API 엔드포인트 ==========

// 1. 모든 연습장 조회
app.get('/api/ranges', (req, res) => {
  res.json(ranges);
});

// 2. 특정 연습장의 타석 조회
app.get('/api/ranges/:rangeId/slots', (req, res) => {
  const { rangeId } = req.params;
  const rangeSlots = slots[rangeId] || [];
  res.json(rangeSlots);
});

// 3. 특정 연습장의 예약 가능 시간대 조회
app.get('/api/ranges/:rangeId/availability', (req, res) => {
  const { rangeId, date, slotId } = req.query;
  
  // 해당 날짜, 타석의 예약 조회
  const reservedTimes = bookings
    .filter(b => b.rangeId == rangeId && b.date === date && b.slotId == slotId)
    .map(b => ({ start: b.startTime, end: b.endTime }));
  
  // 9:00 ~ 18:00 사이의 모든 1시간 슬롯
  const timeSlots = [];
  for (let hour = 9; hour < 18; hour++) {
    const time = `${String(hour).padStart(2, '0')}:00`;
    const isAvailable = !reservedTimes.some(
      r => time >= r.start && time < r.end
    );
    timeSlots.push({ time, isAvailable });
  }
  
  res.json(timeSlots);
});

// 4. 예약 생성
app.post('/api/bookings', (req, res) => {
  const { rangeId, slotId, userName, date, startTime, duration } = req.body;
  
  // 유효성 검사
  if (!rangeId || !slotId || !userName || !date || !startTime || !duration) {
    return res.status(400).json({ error: "필수 정보가 누락되었습니다" });
  }
  
  // 시간 충돌 확인
  const hour = parseInt(startTime.split(':')[0]);
  const endTime = `${String(hour + duration).padStart(2, '0')}:00`;
  
  const conflict = bookings.some(b => 
    b.rangeId == rangeId && 
    b.slotId == slotId && 
    b.date === date &&
    ((startTime >= b.startTime && startTime < b.endTime) ||
     (endTime > b.startTime && endTime <= b.endTime))
  );
  
  if (conflict) {
    return res.status(409).json({ error: "해당 시간에 이미 예약이 있습니다" });
  }
  
  // 새 예약 생성
  const newBooking = {
    id: nextBookingId++,
    rangeId,
    slotId,
    userName,
    date,
    startTime,
    endTime,
    duration
  };
  
  bookings.push(newBooking);
  res.status(201).json(newBooking);
});

// 5. 예약 목록 조회
app.get('/api/bookings', (req, res) => {
  res.json(bookings);
});

// 6. 특정 예약 조회
app.get('/api/bookings/:id', (req, res) => {
  const booking = bookings.find(b => b.id == req.params.id);
  if (!booking) {
    return res.status(404).json({ error: "예약을 찾을 수 없습니다" });
  }
  res.json(booking);
});

// 7. 예약 취소
app.delete('/api/bookings/:id', (req, res) => {
  const index = bookings.findIndex(b => b.id == req.params.id);
  if (index === -1) {
    return res.status(404).json({ error: "예약을 찾을 수 없습니다" });
  }
  
  const cancelled = bookings.splice(index, 1);
  res.json({ message: "예약이 취소되었습니다", booking: cancelled[0] });
});

app.listen(PORT, () => {
  console.log(`서버가 http://localhost:${PORT} 에서 실행 중입니다!`);
});