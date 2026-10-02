import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';

const getWatchUrl = (url) => {
  if (!url) return '#';
  if (url.includes('youtube.com/embed/')) {
    const videoId = url.split('youtube.com/embed/')[1]?.split('?')[0];
    return `https://www.youtube.com/watch?v=${videoId}`;
  }
  return url;
};

export default function DetailFilm() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [film, setFilm] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`/api/films?id=${id}`)
      .then((res) => {
        if (!res.ok) throw new Error('Film tidak ditemukan');
        return res.json();
      })
      .then((data) => {
        setFilm(data);
        setLoading(false);
      })
      .catch((err) => {
        console.error('Error fetching detail:', err.message);
        setLoading(false);
      });
  }, [id]);

  const renderStars = (count) => {
    const starCount = Number(count) || 5;
    const stars = [];
    for (let i = 1; i <= 5; i++) {
      stars.push(
        <span 
          key={i} 
          className={`star-icon ${i <= starCount ? 'active' : ''}`}
        >
          ★
        </span>
      );
    }
    return stars;
  };

  if (loading) {
    return (
      <div className="detail-page-wrapper">
        <p className="loading-text">Memuat detail film...</p>
      </div>
    );
  }

  if (!film) {
    return (
      <div className="detail-page-wrapper">
        <div className="detail-card" style={{ padding: '2rem', textAlign: 'center' }}>
          <h2 style={{ color: '#fff' }}>Film Tidak Ditemukan</h2>
          <Link to="/" className="watch-trailer-btn" style={{ marginTop: '1rem', display: 'inline-block' }}>
            Kembali ke Beranda
          </Link>
        </div>
      </div>
    );
  }

  const youtubeUrl = getWatchUrl(film.trailer);

  return (
    <div className="detail-page-wrapper" onClick={() => navigate('/')}>
      <div className="detail-card" onClick={(e) => e.stopPropagation()}>
        
        {/* Tombol Tutup Silang (✕) */}
        <button 
          className="detail-close-btn" 
          onClick={() => navigate('/')}
          aria-label="Tutup Detail Film"
        >
          ✕
        </button>

        {/* Banner Gambar Atas */}
        <div className="detail-poster-wrapper">
          <img src={film.gambar} alt={film.judul} className="detail-poster" />
          <div className="detail-poster-overlay"></div>
        </div>

        {/* Informasi Detail Film */}
        <div className="detail-info">
          <h1 className="detail-title">{film.judul}</h1>

          <div className="detail-badges">
            <span className="badge">{film.tahun || '2026'}</span>
            <span className="badge badge-outline">{film.rating || '18+'}</span>
            <span className="badge badge-outline">Film</span>
            <span className="badge badge-kategori">{film.kategori || 'Dokumenter'}</span>
          </div>

          <div className="detail-rating">
            {renderStars(film.bintang)}
          </div>

          <p className="detail-description">
            {film.deskripsi || 'Tidak ada deskripsi tersedia.'}
          </p>

          {film.trailer && (
            <a 
              href={youtubeUrl} 
              target="_blank" 
              rel="noopener noreferrer" 
              className="watch-trailer-btn"
            >
              Mulai &gt;
            </a>
          )}
        </div>

      </div>
    </div>
  );
}