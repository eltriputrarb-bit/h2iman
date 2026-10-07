import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Lightbox from '../components/Lightbox';

export const moviesData = [
  {
    id: '1',
    title: "pacrifim",
    genre: "Action / Sci-Fi",
    tahun: "2026",
    rating: "13+",
    kategori: "Film",
    image: "/images/robot.jpg",
    description: "robot",
    trailerEmbed: "https://www.youtube.com/embed/GUO2RjbaPnc?si=RjCx5soztIi2rcOp"
  },
  {
    id: '2',
    title: "insterstellar",
    genre: "Action / Sci-Fi",
    tahun: "2014",
    rating: "13+",
    kategori: "Film",
    image: "/images/polz.jpg",
    description: "bumi",
    trailerEmbed: "https://www.youtube.com/embed/zSWdZVtXT7E"
  },
  {
    id: '3',
    title: "itu saya",
    genre: "SCHOSL",
    tahun: "2025",
    rating: "SU",
    kategori: "Film",
    image: "/images/katolik.jpg",
    description: "sad",
    trailerEmbed: "https://www.youtube.com/embed/mFea21VooJ4?si=VoEYqrxRgTxvogs8"
  },
  {
    id: '4',
    title: "Doraemon",
    genre: "Animation / Family",
    tahun: "2020",
    rating: "SU",
    kategori: "Film",
    image: "/images/doraemon.jpg",
    description: "alone",
    trailerEmbed: "https://www.youtube.com/embed/rn1UFjNMAxA?si=lCFEQc4x3OWOF1xV"
  },
  {
    id: '5',
    title: "fast and furious",
    genre: "Action",
    tahun: "2021",
    rating: "17+",
    kategori: "Film",
    image: "/images/ptc.jpg",
    description: "ptc",
    trailerEmbed: "https://www.youtube.com/embed/0Xy9fh1G4z8?si=0yep3ZL55_d7jHwq"
  }
];

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

export default function DaftarFilm() {
  const [films, setFilms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeVideo, setActiveVideo] = useState(null);

  // --- FITUR PAGINATION / HALAMAN ---
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 6;

  useEffect(() => {
    fetch('/api/films')
      .then((res) => {
        if (!res.ok) throw new Error('Gagal mengambil data dari server');
        return res.json();
      })
      .then((data) => {
        if (Array.isArray(data) && data.length > 0) {
          setFilms(data);
        } else {
          setFilms(moviesData);
        }
        setLoading(false);
      })
      .catch((err) => {
        console.warn('Backend server tidak aktif / error, menggunakan data dummy:', err.message);
        setFilms(moviesData);
        setLoading(false);
      });
  }, []);

  const indexOfLastFilm = currentPage * itemsPerPage;
  const indexOfFirstFilm = indexOfLastFilm - itemsPerPage;
  const currentFilms = films.slice(indexOfFirstFilm, indexOfLastFilm);
  const totalPages = Math.ceil(films.length / itemsPerPage);

  if (loading) {
    return (
      <div className="page-container">
        <div className="section-header">
          <div className="skeleton" style={{ width: '180px', height: '28px', margin: '0 auto' }}></div>
        </div>

        {/* Skeleton Grid */}
        <div className="movie-grid">
          {Array.from({ length: 6 }).map((_, idx) => (
            <div key={idx} className="skeleton-card">
              <div className="skeleton skeleton-img"></div>
              <div className="skeleton-content">
                <div className="skeleton skeleton-title"></div>
                <div className="skeleton skeleton-text"></div>
                <div className="skeleton skeleton-btn"></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="page-container">
      <div className="section-header">
        <h2 className="section-title">Daftar Film</h2>
      </div>

      <div className="movie-grid">
        {currentFilms.map((film) => {
          const filmId = film._id || film.id;
          const filmTitle = film.judul || film.title;
          const filmImage = film.gambar || film.image;
          const filmGenre = film.kategori || film.genre || 'Film';
          const rawTrailer = film.trailer || film.trailerEmbed;
          const embedTrailer = getEmbedUrl(rawTrailer);

          return (
            <div key={filmId} className="movie-card">
              <div
                style={{
                  position: 'relative',
                  cursor: 'pointer',
                  width: '100%',
                  height: '220px',
                  backgroundColor: '#111',
                  overflow: 'hidden',
                  borderRadius: '8px 8px 0 0'
                }}
                onClick={() => setActiveVideo({ trailerEmbed: embedTrailer, title: filmTitle })}
              >
                <img
                  src={filmImage}
                  alt={filmTitle}
                  style={{
                    width: '100%',
                    height: '100%',
                    objectFit: 'cover',
                    display: 'block'
                  }}
                  onError={(e) => {
                    e.target.onerror = null;
                    e.target.src = 'https://via.placeholder.com/300x400?text=No+Image';
                  }}
                />
                <div style={{
                  position: 'absolute',
                  top: '50%',
                  left: '50%',
                  transform: 'translate(-50%, -50%)',
                  backgroundColor: 'rgba(0,0,0,0.6)',
                  borderRadius: '50%',
                  width: '50px',
                  height: '50px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#fff',
                  fontSize: '1.2rem',
                  boxShadow: '0 0 10px rgba(0,0,0,0.5)'
                }}>
                  ▶
                </div>
              </div>

              <div className="movie-card-content">
                <h3>{filmTitle}</h3>
                <p className="genre-text">{filmGenre}</p>
                <Link to={`/detail/${filmId}`} className="detail-btn">
                  DETAIL &gt;
                </Link>
              </div>
            </div>
          );
        })}
      </div>

      {/* --- NAVIGASI HALAMAN --- */}
      {totalPages > 1 && (
        <div style={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          gap: '8px',
          marginTop: '2.5rem',
          paddingBottom: '2rem'
        }}>
          <button
            onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
            disabled={currentPage === 1}
            style={{
              padding: '8px 14px',
              borderRadius: '4px',
              border: '1px solid #444',
              backgroundColor: '#222',
              color: '#fff',
              cursor: currentPage === 1 ? 'not-allowed' : 'pointer',
              opacity: currentPage === 1 ? 0.4 : 1
            }}
          >
            &lt;
          </button>

          {Array.from({ length: totalPages }, (_, index) => {
            const pageNum = index + 1;
            return (
              <button
                key={pageNum}
                onClick={() => setCurrentPage(pageNum)}
                style={{
                  padding: '8px 14px',
                  borderRadius: '4px',
                  border: 'none',
                  backgroundColor: currentPage === pageNum ? '#e2c41aff' : '#333',
                  color: '#fff',
                  fontWeight: currentPage === pageNum ? 'bold' : 'normal',
                  cursor: 'pointer',
                  transition: '0.2s'
                }}
              >
                {pageNum}
              </button>
            );
          })}

          <button
            onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
            disabled={currentPage === totalPages}
            style={{
              padding: '8px 14px',
              borderRadius: '4px',
              border: '1px solid #444',
              backgroundColor: '#222',
              color: '#fff',
              cursor: currentPage === totalPages ? 'not-allowed' : 'pointer',
              opacity: currentPage === totalPages ? 0.4 : 1
            }}
          >
            &gt;
          </button>
        </div>
      )}

      {/* Lightbox Popup Video */}
      <Lightbox
        isOpen={Boolean(activeVideo)}
        onClose={() => setActiveVideo(null)}
        videoUrl={activeVideo?.trailerEmbed}
        title={activeVideo?.title}
      />
    </div>
  );
}