import { useState, useEffect } from 'react'
import './App.css'
import RangeList from './components/RangeList'
import BookingForm from './components/BookingForm'
import BookingList from './components/BookingList'

function App() {
  const [selectedRange, setSelectedRange] = useState(null);
  const [bookings, setBookings] = useState([]);
  const [view, setView] = useState('ranges'); // 'ranges', 'booking', 'bookings'

  // 예약 목록 가져오기
  const fetchBookings = () => {
    fetch('/api/bookings')
      .then(res => res.json())
      .then(data => setBookings(data))
      .catch(err => console.error("예약 조회 실패:", err));
  };

  useEffect(() => {
    fetchBookings();
  }, []);

  const handleRangeSelect = (range) => {
    setSelectedRange(range);
    setView('booking');
  };

  const handleBookingSuccess = () => {
    fetchBookings();
    setView('bookings');
  };

  const handleCancelBooking = (id) => {
    fetch(`/api/bookings/${id}`, {
      method: 'DELETE'
    })
      .then(res => res.json())
      .then(() => {
        fetchBookings();
        alert('예약이 취소되었습니다');
      })
      .catch(err => console.error("예약 취소 실패:", err));
  };

  return (
    <div className="App">
      <header className="header">
        <h1>⛳️ 골프 연습장 예약 시스템</h1>
      </header>

      <nav className="nav">
        <button 
          className={view === 'ranges' ? 'active' : ''} 
          onClick={() => setView('ranges')}
        >
          연습장 선택
        </button>
        <button 
          className={view === 'booking' ? 'active' : ''} 
          onClick={() => setView('booking')}
          disabled={!selectedRange}
        >
          예약하기
        </button>
        <button 
          className={view === 'bookings' ? 'active' : ''} 
          onClick={() => setView('bookings')}
        >
          예약 내역
        </button>
      </nav>

      <main className="main">
        {view === 'ranges' && (
          <RangeList onSelectRange={handleRangeSelect} />
        )}
        {view === 'booking' && selectedRange && (
          <BookingForm range={selectedRange} onBookingSuccess={handleBookingSuccess} />
        )}
        {view === 'bookings' && (
          <BookingList 
            bookings={bookings} 
            onCancelBooking={handleCancelBooking}
          />
        )}
      </main>
    </div>
  )
}

export default App