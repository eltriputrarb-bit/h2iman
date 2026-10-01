import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { moviesData } from './daftarfilm';

const getDirectYoutubeUrl = (url) => {
  if (!url) return '';
  if (url.includes('youtube.com/embed/')) {
    const videoId = url.split('youtube.com/embed/')[1]?.split('?')[0];
    return videoId ? `https://www.youtube.com/watch?v=${videoId}` : url;
  }
  return url;
};

export default function DetailFilm() {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();

  const isAdmin = location.state?.from === '/admin';
  const fromPage = location.state?.from || -1;

  // State Form Film
  const [judul, setJudul] = useState('');
  const [gambarUrl, setGambarUrl] = useState('');
  const [trailerLink, setTrailerLink] = useState('');
  const [deskripsi, setDeskripsi] = useState('');

  // State Tag & Rating Bintang
  const [tahun, setTahun] = useState('2026');
  const [rating, setRating] = useState('13+');
  const [kategori, setKategori] = useState('Film');
  const [bintang, setBintang] = useState(5);

  const [loading, setLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (id) {
      setLoading(true);
      const isValidMongoId = /^[0-9a-fA-F]{24}$/.test(id);

      if (isValidMongoId) {
        fetch(`/api/films?id=${id}&full=true`)
          .then((res) => {
            if (!res.ok) throw new Error('Film tidak ditemukan di Server');
            return res.json();
          })
          .then((apiFilm) => {
            if (apiFilm) {
              setJudul(apiFilm.judul || apiFilm.title || '');
              setGambarUrl(apiFilm.gambar || apiFilm.image || '');
              setDeskripsi(apiFilm.deskripsi || apiFilm.description || '');
              setTrailerLink(apiFilm.trailer || apiFilm.trailerEmbed || '');
              setTahun(apiFilm.tahun || '2026');
              setRating(apiFilm.rating || '13+');
              setKategori(apiFilm.kategori || apiFilm.genre || 'Film');
              setBintang(apiFilm.bintang || 5);
            }
            setLoading(false);
          })
          .catch((err) => {
            console.warn('Gagal memuat film dari server:', err.message);
            setLoading(false);
          });
      } else {
        const localFilm = moviesData.find((m) => String(m.id) === String(id));
        if (localFilm) {
          setJudul(localFilm.title || localFilm.judul || '');
          setGambarUrl(localFilm.image || localFilm.gambar || '');
          setDeskripsi(localFilm.description || localFilm.deskripsi || '');
          setTrailerLink(localFilm.trailerEmbed || localFilm.trailer || '');
          setTahun(localFilm.tahun || '2026');
          setRating(localFilm.rating || '13+');
          setKategori(localFilm.kategori || localFilm.genre || 'Film');
          setBintang(localFilm.bintang || 5);
        }
        setLoading(false);
      }
    }
  }, [id]);

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        alert('Ukuran gambar terlalu besar! Pilih gambar di bawah 5MB.');
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => setGambarUrl(reader.result);
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    const filmData = { 
      judul, 
      gambar: gambarUrl, 
      trailer: trailerLink, 
      deskripsi,
      tahun,
      rating,
      kategori,
      bintang
    };

    const isValidMongoId = id && /^[0-9a-fA-F]{24}$/.test(id);

    try {
      let response;
      if (isValidMongoId) {
        response = await fetch(`/api/films?id=${id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(filmData),
        });
      } else {
        response = await fetch('/api/films', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(filmData),
        });
      }

      if (response && response.ok) {
        navigate(typeof fromPage === 'string' ? fromPage : -1);
      } else {
        const errData = await response.json().catch(() => ({}));
        throw new Error(errData.message || 'Gagal menyimpan');
      }
    } catch (error) {
      console.error('Error simpan data:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    if (typeof fromPage === 'string') {
      navigate(fromPage);
    } else {
      navigate(-1);
    }
  };

  const renderStars = (count) => {
    const stars = [];
    for (let i = 1; i <= 5; i++) {
      stars.push(
        <span 
          key={i} 
          className={`star-icon ${i <= count ? 'active' : ''}`}
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

  // TAMPILAN FORM ADMIN
  if (isAdmin) {
    return (
      <div className="detail-page-wrapper">
        <div className="detail-card admin-mode">
          <div className="admin-header">
            <button onClick={handleClose} className="back-btn">
              &larr; Kembali ke Dashboard
            </button>
            <h2>{id ? `Edit: ${judul}` : 'Tambah Film Baru'}</h2>
          </div>

          <form onSubmit={handleSubmit} className="admin-form">
            <div className="form-group">
              <label>Judul Film</label>
              <input
                type="text"
                value={judul}
                onChange={(e) => setJudul(e.target.value)}
                className="form-input"
                required
              />
            </div>

            <div className="form-grid-4">
              <div className="form-group">
                <label>Tahun</label>
                <input
                  type="text"
                  placeholder="2026"
                  value={tahun}
                  onChange={(e) => setTahun(e.target.value)}
                  className="form-input"
                />
              </div>
              <div className="form-group">
                <label>Rating Usia</label>
                <input
                  type="text"
                  placeholder="13+"
                  value={rating}
                  onChange={(e) => setRating(e.target.value)}
                  className="form-input"
                />
              </div>
              <div className="form-group">
                <label>Kategori</label>
                <input
                  type="text"
                  placeholder="Film"
                  value={kategori}
                  onChange={(e) => setKategori(e.target.value)}
                  className="form-input"
                />
              </div>
              <div className="form-group">
                <label>Bintang (1 - 5)</label>
                <select
                  value={bintang}
                  onChange={(e) => setBintang(Number(e.target.value))}
                  className="form-input"
                >
                  <option value={1}>1 Bintang</option>
                  <option value={2}>2 Bintang</option>
                  <option value={3}>3 Bintang</option>
                  <option value={4}>4 Bintang</option>
                  <option value={5}>5 Bintang</option>
                </select>
              </div>
            </div>

            <div className="form-group">
              <label>Upload Gambar Poster</label>
              <input type="file" accept="image/*" onChange={handleImageChange} className="file-input" />
            </div>

            <div className="form-group">
              <label>Link Trailer YouTube</label>
              <input
                type="text"
                placeholder="Tempelkan link YouTube di sini"
                value={trailerLink}
                onChange={(e) => setTrailerLink(e.target.value)}
                className="form-input"
              />
            </div>

            <div className="form-group">
              <label>Deskripsi Film</label>
              <textarea
                rows="4"
                value={deskripsi}
                onChange={(e) => setDeskripsi(e.target.value)}
                className="form-input"
              />
            </div>

            <button type="submit" disabled={isSubmitting} className="detail-start-btn submit-btn">
              {isSubmitting ? 'Menyimpan...' : 'Simpan Perubahan'}
            </button>
          </form>
        </div>
      </div>
    );
  }

  // TAMPILAN PENGUNJUNG
  const directUrl = getDirectYoutubeUrl(trailerLink);

  return (
    <div className="detail-page-wrapper">
      <div className="detail-card">
        <button className="detail-close-btn" onClick={handleClose}>
          ✕
        </button>

        <div className="detail-poster-wrapper">
          {gambarUrl ? (
            <img src={gambarUrl} alt={judul} className="detail-poster-img" />
          ) : (
            <div className="detail-no-image">
              <span>Tidak Ada Gambar Poster</span>
            </div>
          )}
          <div className="detail-poster-overlay" />
        </div>

        <div className="detail-content">
          <h1 className="detail-title">{judul || 'Judul Film'}</h1>

          <div className="detail-tags">
            <span className="detail-tag">{tahun || '2026'}</span>
            <span className="detail-tag">{rating || '13+'}</span>
            <span className="detail-tag">{kategori || 'Film'}</span>
          </div>

          <p className="detail-description">{deskripsi || 'Belum ada deskripsi untuk film ini.'}</p>

          <div className="action-rating-container">
            {directUrl ? (
              <a href={directUrl} target="_blank" rel="noreferrer" className="detail-start-btn">
                Mulai &gt;
              </a>
            ) : (
              <button disabled className="detail-start-btn disabled">
                Mulai &gt;
              </button>
            )}

            <div className="stars-container">
              {renderStars(bintang)}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}