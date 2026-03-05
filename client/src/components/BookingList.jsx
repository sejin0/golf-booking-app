import { useState, useEffect } from 'react'

export default function BookingList({ bookings, onCancelBooking }) {
  const [ranges, setRanges] = useState({});

  // 범위 정보 캐싱
  useEffect(() => {
    fetch('/api/ranges')
      .then(res => res.json())
      .then(data => {
        const rangeMap = {};
        data.forEach(r => rangeMap[r.id] = r.name);
        setRanges(rangeMap);
      })
      .catch(err => console.error("연습장 정보 조회 실패:", err));
  }, []);

  if (bookings.length === 0) {
    return (
      <div className="booking-list-container">
        <h2>예약 내역</h2>
        <p className="empty-message">예약 내역이 없습니다</p>
      </div>
    );
  }

  // 최신순으로 정렬
  const sortedBookings = [...bookings].sort((a, b) => b.id - a.id);

  return (
    <div className="booking-list-container">
      <h2>예약 내역</h2>
      <div className="booking-table-wrapper">
        <table className="booking-table">
          <thead>
            <tr>
              <th>예약번호</th>
              <th>이름</th>
              <th>연습장</th>
              <th>타석</th>
              <th>날짜</th>
              <th>시간</th>
              <th>관리</th>
            </tr>
          </thead>
          <tbody>
            {sortedBookings.map(booking => (
              <tr key={booking.id}>
                <td>#{booking.id}</td>
                <td>{booking.userName}</td>
                <td>{ranges[booking.rangeId] || '로딩중...'}</td>
                <td>{booking.slotId}번</td>
                <td>{booking.date}</td>
                <td>
                  {booking.startTime} ~ {booking.endTime}
                  <span className="duration">({booking.duration}h)</span>
                </td>
                <td>
                  <button
                    className="cancel-btn"
                    onClick={() => {
                      if (confirm('정말 취소하시겠습니까?')) {
                        onCancelBooking(booking.id);
                      }
                    }}
                  >
                    취소
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
