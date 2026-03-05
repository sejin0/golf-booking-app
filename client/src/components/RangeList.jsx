import { useState, useEffect } from 'react'

export default function RangeList({ onSelectRange }) {
  const [ranges, setRanges] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/ranges')
      .then(res => res.json())
      .then(data => {
        setRanges(data);
        setLoading(false);
      })
      .catch(err => {
        console.error("연습장 조회 실패:", err);
        setLoading(false);
      });
  }, []);

  if (loading) {
    return <div className="loading">연습장 정보를 불러오는 중...</div>;
  }

  return (
    <div className="range-list">
      <h2>연습장을 선택하세요</h2>
      <div className="range-grid">
        {ranges.map(range => (
          <div key={range.id} className="range-card">
            <h3>{range.name}</h3>
            <p className="location">📍 {range.location}</p>
            <p className="price">💰 {range.pricePerSlot.toLocaleString()}원/시간</p>
            <button 
              className="select-btn"
              onClick={() => onSelectRange(range)}
            >
              선택
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
