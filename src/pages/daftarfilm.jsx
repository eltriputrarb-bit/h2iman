import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import Lightbox from '../components/Lightbox';

export const moviesData = [
  {
    id: '1',
    title: "pacrifim",
    genre: "Action / Sci-Fi",
    // 1. Gambar dari folder public/images/ironman.jpg
    image: "/images/robot.jpg", 
    // ATAU 2. URL langsung ke file .jpg di internet:
    // image: "https://example.com/poster-ironman.jpg",
    description: "robot",
    trailerEmbed: "https://www.youtube.com/embed/GUO2RjbaPnc?si=RjCx5soztIi2rcOp"
  },
  {
    id: '2',
    title: "insterstellar",
    genre: "Action / Sci-Fi",
    // 1. Gambar dari folder public/images/ironman.jpg
    image: "/images/polz.jpg", 
    // ATAU 2. URL langsung ke file .jpg di internet:
    // image: "https://example.com/poster-ironman.jpg",
    description: "bumi",
    trailerEmbed: "https://www.youtube.com/embed/zSWdZVtXT7E"
  },
  {
    id: '3',
    title: "itu saya",
    genre: "SCHOSL",
    // 1. Gambar dari folder public/images/puji-syukur.jpg
    image: "/images/katolik.jpg",
    // ATAU 2. URL langsung ke file .jpg di internet:
    // image: "https://example.com/poster-puji-syukur.jpg",
    description: "sad",
    trailerEmbed: "https://www.youtube.com/embed/mFea21VooJ4?si=VoEYqrxRgTxvogs8"
  }
];

export default function DaftarFilm() {
  const [activeVideo, setActiveVideo] = useState(null);

  return (
    <div className="page-container">
      <div className="section-header">
        <h2 className="section-title">Daftar Film Popular</h2>
      </div>
      
      <div className="movie-grid">
        {moviesData.map((film) => (
          <div key={film.id} className="movie-card">
            {/* Mengklik gambar akan membuka player video */}
            <div 
              style={{ position: 'relative', cursor: 'pointer' }}
              onClick={() => setActiveVideo(film)}
            >
              <img 
                src={film.image} 
                alt={film.title} 
              />
              {/* Overlay ikon play */}
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
                fontSize: '1.5rem'
              }}>
                ▶
              </div>
            </div>

            <div className="movie-card-content">
              <h3>{film.title}</h3>
              <p className="genre-text">{film.genre}</p>
              <Link to={`/detail/${film.id}`} className="detail-btn">
                DETAIL &gt;
              </Link>
            </div>
          </div>
        ))}
      </div>

      {/* Pop-up Modal Lightbox Video */}
      <Lightbox 
        isOpen={Boolean(activeVideo)} 
        onClose={() => setActiveVideo(null)}
        videoUrl={activeVideo?.trailerEmbed}
        title={activeVideo?.title}
      />
    </div>
  );
}