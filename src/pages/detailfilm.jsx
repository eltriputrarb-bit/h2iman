import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import Lightbox from '../components/Lightbox';

const getEmbedUrl = (url) => {
  if (!url) return '';
  if (url.includes('youtube.com/embed/')) return url;

  let videoId = '';
  if (url.includes('youtu.be/')) {
    videoId = url.split('youtu.be/')[1]?.split('?')[0];
  } else if (url.includes('youtube.com/watch')) {
    const urlParams = new URLSearchParams(url.split('?')[1]);
    videoId = urlParams.get('v');
  }

  return videoId ? `https://www.youtube.com/embed/${videoId}` : url;
};

export default function DetailFilm() {
  const { id } = useParams();
  const [film, setFilm] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isTrailerOpen, setIsTrailerOpen] = useState(false);

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

  const embedUrl = getEmbedUrl(film.trailer);

  return (
    <div className="detail-page-wrapper">
      <Link to="/" className="back-link">
        &lt; Kembali
      </Link>

      <div className="detail-card">
        {/* Gambar Poster tunggal yang akan terisi penuh rapi di sebelah kiri */}
        <div className="detail-poster-wrapper">
          <img src={film.gambar} alt={film.judul} className="detail-poster" />
          <div className="detail-poster-overlay"></div>
        </div>

        <div className="detail-info">
          <h1 className="detail-title">{film.judul}</h1>

          <div className="detail-badges">
            <span className="badge">{film.tahun || '2026'}</span>
            <span className="badge badge-outline">{film.rating || '13+'}</span>
            <span className="badge badge-kategori">{film.kategori || 'Film'}</span>
          </div>

          <div className="detail-rating">
            {renderStars(film.bintang)}
          </div>

          <p className="detail-description">
            {film.deskripsi || 'Tidak ada deskripsi tersedia.'}
          </p>

          {embedUrl && (
            <button 
              onClick={() => setIsTrailerOpen(true)} 
              className="watch-trailer-btn"
            >
              ▶ Tonton Trailer
            </button>
          )}
        </div>
      </div>

      <Lightbox 
        isOpen={isTrailerOpen} 
        onClose={() => setIsTrailerOpen(false)} 
        videoUrl={embedUrl} 
        title={film.judul}
      />
    </div>
  );
}