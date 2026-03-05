import { useState, useEffect } from 'react'

export default function BookingForm({ range, onBookingSuccess }) {
  const [slots, setSlots] = useState([]);
  const [timeSlots, setTimeSlots] = useState([]);
  const [formData, setFormData] = useState({
    userName: '',
    date: new Date().toISOString().split('T')[0],
    slotId: '',
    startTime: '',
    duration: 1
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // 타석 목록 가져오기
  useEffect(() => {
    fetch(`http://localhost:5000/api/ranges/${range.id}/slots`)
      .then(res => res.json())
      .then(data => {
        setSlots(data);
        if (data.length > 0) {
          setFormData(prev => ({ ...prev, slotId: data[0].id }));
        }
      })
      .catch(err => console.error("타석 조회 실패:", err));
  }, [range.id]);

  // 실시간 노가동 시간대 가져오기
  useEffect(() => {
    if (formData.slotId) {
      fetch(`http://localhost:5000/api/ranges/${range.id}/availability?date=${formData.date}&slotId=${formData.slotId}`)
        .then(res => res.json())
        .then(data => setTimeSlots(data))
        .catch(err => console.error("시간대 조회 실패:", err));
    }
  }, [range.id, formData.date, formData.slotId]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'duration' ? parseInt(value) : value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const response = await fetch('http://localhost:5000/api/bookings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          rangeId: range.id,
          slotId: parseInt(formData.slotId),
          userName: formData.userName,
          date: formData.date,
          startTime: formData.startTime,
          duration: formData.duration
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || '예약 실패');
      }

      const result = await response.json();
      alert(`예약이 완료되었습니다! (예약번호: ${result.id})`);
      onBookingSuccess();
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const selectedSlot = slots.find(s => s.id == formData.slotId);

  return (
    <div className="booking-form-container">
      <h2>{range.name} 예약</h2>
      
      <form onSubmit={handleSubmit} className="booking-form">
        <div className="form-group">
          <label>🏌️ 이름</label>
          <input
            type="text"
            name="userName"
            value={formData.userName}
            onChange={handleChange}
            placeholder="이름을 입력하세요"
            required
          />
        </div>

        <div className="form-group">
          <label>📅 날짜</label>
          <input
            type="date"
            name="date"
            value={formData.date}
            onChange={handleChange}
            min={new Date().toISOString().split('T')[0]}
            required
          />
        </div>

        <div className="form-group">
          <label>🎯 타석</label>
          <select
            name="slotId"
            value={formData.slotId}
            onChange={handleChange}
            required
          >
            {slots.map(slot => (
              <option key={slot.id} value={slot.id}>
                {slot.name}
              </option>
            ))}
          </select>
        </div>

        <div className="form-group">
          <label>⏰ 시작 시간</label>
          <select
            name="startTime"
            value={formData.startTime}
            onChange={handleChange}
            required
          >
            <option value="">시간을 선택하세요</option>
            {timeSlots.map(slot => (
              <option 
                key={slot.time} 
                value={slot.time}
                disabled={!slot.isAvailable}
              >
                {slot.time} {slot.isAvailable ? '(예약가능)' : '(예약됨)'}
              </option>
            ))}
          </select>
        </div>

        <div className="form-group">
          <label>⌛ 이용 시간</label>
          <select
            name="duration"
            value={formData.duration}
            onChange={handleChange}
          >
            <option value={1}>1시간</option>
            <option value={2}>2시간</option>
            <option value={3}>3시간</option>
            <option value={4}>4시간</option>
          </select>
        </div>

        {error && <div className="error-message">{error}</div>}

        <button 
          type="submit" 
          disabled={loading || !formData.userName || !formData.startTime}
          className="submit-btn"
        >
          {loading ? '예약 중...' : '예약하기'}
        </button>
      </form>
    </div>
  );
}
