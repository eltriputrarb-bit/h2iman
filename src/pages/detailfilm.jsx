import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { moviesData } from './daftarfilm';

// Fungsi otomatis mengubah URL YouTube biasa/share menjadi link embed
const formatYoutubeEmbedUrl = (url) => {
  if (!url) return '';
  
  // Jika sudah format embed, kembalikan langsung
  if (url.includes('youtube.com/embed/')) return url;

  let videoId = '';

  // Format: https://youtu.be/yLFRQaQT0qM
  if (url.includes('youtu.be/')) {
    videoId = url.split('youtu.be/')[1]?.split('?')[0];
  } 
  // Format: https://www.youtube.com/watch?v=yLFRQaQT0qM
  else if (url.includes('youtube.com/watch')) {
    const urlParams = new URLSearchParams(url.split('?')[1]);
    videoId = urlParams.get('v');
  }

  return videoId ? `https://www.youtube.com/embed/${videoId}` : url;
};

export default function DetailFilm() {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();

  const isAdmin = location.state?.from === '/admin';
  const fromPage = location.state?.from || -1;

  const [judul, setJudul] = useState('');
  const [gambarUrl, setGambarUrl] = useState('');
  const [trailerLink, setTrailerLink] = useState('');
  const [deskripsi, setDeskripsi] = useState('');
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

    // Otomatis ubah format trailer ke link Embed sebelum dikirim ke Database
    const cleanTrailerUrl = formatYoutubeEmbedUrl(trailerLink);

    const filmData = { 
      judul, 
      gambar: gambarUrl, 
      trailer: cleanTrailerUrl, 
      deskripsi 
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

  if (loading) {
    return (
      <div style={{ textAlign: 'center', color: '#fff', paddingTop: '3rem' }}>
        <p>Memuat detail film...</p>
      </div>
    );
  }

  // TAMPILAN DASHBOARD ADMIN
  if (isAdmin) {
    return (
      <div className="detail-container" style={{ padding: '2rem', maxWidth: '600px', margin: '0 auto', color: '#fff' }}>
        <div className="detail-header" style={{ marginBottom: '1.5rem', display: 'flex', justifyContent: 'space-between' }}>
          <button onClick={handleClose} style={{ background: 'none', border: 'none', color: '#fff', cursor: 'pointer', fontSize: '1rem' }}>
            &larr; Kembali ke Dashboard
          </button>
          <h2>{id ? `Edit: ${judul}` : 'Tambah Film Baru'}</h2>
        </div>

        <form onSubmit={handleSubmit} className="detail-form" style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div>
            <label style={{ display: 'block', marginBottom: '0.5rem' }}>Judul Film</label>
            <input
              type="text"
              value={judul}
              onChange={(e) => setJudul(e.target.value)}
              style={{ width: '100%', padding: '0.8rem', borderRadius: '4px', border: '1px solid #444', background: '#222', color: '#fff' }}
              required
            />
          </div>

          <div>
            <label style={{ display: 'block', marginBottom: '0.5rem' }}>Upload Gambar Poster</label>
            <input type="file" accept="image/*" onChange={handleImageChange} style={{ color: '#fff' }} />
          </div>

          <div>
            <label style={{ display: 'block', marginBottom: '0.5rem' }}>Link Trailer YouTube</label>
            <input
              type="text"
              placeholder="Contoh: https://youtu.be/yLFRQaQT0qM"
              value={trailerLink}
              onChange={(e) => setTrailerLink(e.target.value)}
              style={{ width: '100%', padding: '0.8rem', borderRadius: '4px', border: '1px solid #444', background: '#222', color: '#fff' }}
            />
          </div>

          <div>
            <label style={{ display: 'block', marginBottom: '0.5rem' }}>Deskripsi Film</label>
            <textarea
              rows="4"
              value={deskripsi}
              onChange={(e) => setDeskripsi(e.target.value)}
              style={{ width: '100%', padding: '0.8rem', borderRadius: '4px', border: '1px solid #444', background: '#222', color: '#fff' }}
            />
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            style={{ padding: '0.8rem', borderRadius: '4px', border: 'none', background: '#e50914', color: '#fff', fontWeight: 'bold', cursor: 'pointer' }}
          >
            {isSubmitting ? 'Menyimpan...' : 'Simpan Perubahan'}
          </button>
        </form>
      </div>
    );
  }

  // TAMPILAN PENGUNJUNG BERANDA
  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#121212', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1.5rem' }}>
      <div style={{ position: 'relative', width: '100%', maxWidth: '750px', backgroundColor: '#181818', borderRadius: '12px', overflow: 'hidden', boxShadow: '0 20px 40px rgba(0,0,0,0.8)', color: '#ffffff', fontFamily: 'sans-serif' }}>
        <button onClick={handleClose} style={{ position: 'absolute', top: '16px', right: '16px', zIndex: 10, background: 'rgba(0,0,0,0.6)', border: 'none', color: '#fff', fontSize: '1.2rem', width: '36px', height: '36px', borderRadius: '50%', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          ✕
        </button>

        <div style={{ position: 'relative', width: '100%', height: '380px', backgroundColor: '#000' }}>
          {gambarUrl ? (
            <img src={gambarUrl} alt={judul} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
          ) : (
            <div style={{ display: 'flex', height: '100%', alignItems: 'center', justifyContent: 'center' }}>
              <span>Tidak Ada Gambar Poster</span>
            </div>
          )}
          <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: '120px', background: 'linear-gradient(to top, #181818, transparent)' }} />
        </div>

        <div style={{ padding: '1.5rem 2rem 2.5rem 2rem' }}>
          <h1 style={{ fontSize: '2.5rem', fontWeight: 'bold', margin: '0 0 1rem 0' }}>{judul || 'Judul Film'}</h1>

          <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center', marginBottom: '1.2rem', flexWrap: 'wrap' }}>
            <span style={{ background: '#333', padding: '4px 8px', borderRadius: '4px', fontSize: '0.85rem' }}>2026</span>
            <span style={{ background: '#333', padding: '4px 8px', borderRadius: '4px', fontSize: '0.85rem' }}>13+</span>
            <span style={{ background: '#333', padding: '4px 8px', borderRadius: '4px', fontSize: '0.85rem' }}>Film</span>
          </div>

          <p style={{ color: '#cccccc', lineHeight: '1.6', fontSize: '1rem', marginBottom: '2rem' }}>{deskripsi || 'Belum ada deskripsi untuk film ini.'}</p>

          {trailerLink ? (
            <a href={trailerLink} target="_blank" rel="noreferrer" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', backgroundColor: '#e50914', color: '#ffffff', padding: '0.8rem 1.8rem', borderRadius: '6px', textDecoration: 'none', fontWeight: 'bold', fontSize: '1.1rem' }}>
              Mulai &gt;
            </a>
          ) : (
            <button disabled style={{ backgroundColor: '#555', color: '#888', padding: '0.8rem 1.8rem', borderRadius: '6px', border: 'none', fontWeight: 'bold', fontSize: '1.1rem', cursor: 'not-allowed' }}>
              Mulai &gt;
            </button>
          )}
        </div>
      </div>
    </div>
  );
}