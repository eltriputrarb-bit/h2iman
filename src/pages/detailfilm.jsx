import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { moviesData } from './daftarfilm';

export default function DetailFilm() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [judul, setJudul] = useState('');
  const [gambarUrl, setGambarUrl] = useState('');
  const [trailerLink, setTrailerLink] = useState('');
  const [deskripsi, setDeskripsi] = useState('');
  const [loading, setLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false); // State untuk loading submit

  useEffect(() => {
    if (id) {
      setLoading(true);

      const isValidMongoId = /^[0-9a-fA-F]{24}$/.test(id);

      if (isValidMongoId) {
        fetch(`/api/films?id=${id}`)
          .then((res) => {
            if (!res.ok) throw new Error('Film tidak ditemukan di Database Server');
            return res.json();
          })
          .then((apiFilm) => {
            if (apiFilm) {
              setJudul(apiFilm.judul || apiFilm.title || '');
              setGambarUrl(apiFilm.gambar || apiFilm.image || '');
              setDeskripsi(apiFilm.deskripsi || apiFilm.description || '');
              setTrailerLink(apiFilm.trailer || '');
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
          setTrailerLink(localFilm.trailer || '');
        }
        setLoading(false);
      }
    } else {
      setJudul('');
      setGambarUrl('');
      setTrailerLink('');
      setDeskripsi('');
      setLoading(false);
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
      reader.onloadend = () => {
        setGambarUrl(reader.result);
      };
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
        alert(`Data film "${judul}" berhasil disimpan!`);
        navigate('/');
      } else {
        const errData = await response.json().catch(() => ({}));
        throw new Error(errData.message || `Gagal menyimpan (Status ${response?.status})`);
      }
    } catch (error) {
      console.error('Error simpan data:', error);
      alert(`Gagal menyimpan ke server: ${error.message}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="detail-container" style={{ textAlign: 'center', color: '#fff', paddingTop: '2rem' }}>
        <p>Memuat data film...</p>
      </div>
    );
  }

  return (
    <div className="detail-container">
      <div className="detail-header">
        <button
          onClick={() => navigate(-1)}
          className="back-link"
          style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}
        >
          &larr; Kembali
        </button>
        <h2 className="detail-heading">{id ? `Detail: ${judul}` : 'Tambah Film'}</h2>
      </div>

      <div className="preview-box">
        {gambarUrl ? (
          <img src={gambarUrl} alt={judul} className="preview-img" />
        ) : (
          <div className="placeholder-text">
            <span style={{ fontSize: '1.8rem' }}>🎬</span>
            <p>Upload Foto Film</p>
          </div>
        )}
      </div>

      <form onSubmit={handleSubmit} className="detail-form">
        <div className="form-group">
          <label>Judul</label>
          <input
            type="text"
            placeholder="Masukkan judul film"
            value={judul}
            onChange={(e) => setJudul(e.target.value)}
            className="form-input"
            required
          />
        </div>

        <div className="form-group">
          <label>Gambar</label>
          <input
            type="file"
            accept="image/*"
            onChange={handleImageChange}
            className="form-file"
          />
        </div>

        <div className="form-group">
          <label>Trailer</label>
          <input
            type="text"
            placeholder="Masukkan link trailer YouTube..."
            value={trailerLink}
            onChange={(e) => setTrailerLink(e.target.value)}
            className="form-input"
          />
        </div>

        <div className="form-group">
          <label>Deskripsi</label>
          <textarea
            rows="3"
            placeholder="Masukkan deskripsi film..."
            value={deskripsi}
            onChange={(e) => setDeskripsi(e.target.value)}
            className="form-textarea"
          />
        </div>

        <button type="submit" className="btn-submit" disabled={isSubmitting}>
          {isSubmitting ? 'Menyimpan data loading...' : (id ? 'Simpan Perubahan' : 'Tambah Film')}
        </button>
      </form>
    </div>
  );
}
