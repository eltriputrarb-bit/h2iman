import React, { useState, useEffect } from 'react';

export default function Admin() {
  const [films, setFilms] = useState([]);
  const [isEditing, setIsEditing] = useState(false);
  const [editId, setEditId] = useState(null);
  
  // State untuk loading data & simpan form
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const [form, setForm] = useState({
    judul: '',
    gambar: '',
    trailer: '',
    deskripsi: '',
    tahun: '2026',
    rating: '13+',
    kategori: 'Film',
    bintang: 5
  });

  // Fetch data film dengan indicator loading
  const fetchFilms = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/films?full=true');
      const data = await res.json();
      if (Array.isArray(data)) setFilms(data);
    } catch (err) {
      console.error('Error fetching films:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFilms();
  }, []);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setForm((prev) => ({ ...prev, gambar: reader.result }));
      };
      reader.readAsDataURL(file);
    }
  };

  // Submit Handler dengan status Submitting
  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);

    const url = isEditing ? `/api/films?id=${editId}` : '/api/films';
    const method = isEditing ? 'PUT' : 'POST';

    try {
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form)
      });

      if (res.ok) {
        alert(isEditing ? 'Film berhasil diperbarui!' : 'Film berhasil ditambahkan!');
        resetForm();
        await fetchFilms(); // Refresh tabel setelah submit
      } else {
        const errData = await res.json();
        alert(`Gagal: ${errData.message}`);
      }
    } catch (err) {
      alert(`Error: ${err.message}`);
    } finally {
      setSubmitting(false);
    }
  };

  const handleEdit = (film) => {
    setIsEditing(true);
    setEditId(film._id);
    setForm({
      judul: film.judul || '',
      gambar: film.gambar || '',
      trailer: film.trailer || '',
      deskripsi: film.deskripsi || '',
      tahun: film.tahun || '2026',
      rating: film.rating || '13+',
      kategori: film.kategori || 'Film',
      bintang: film.bintang || 5
    });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Yakin ingin menghapus film ini?')) return;

    try {
      const res = await fetch(`/api/films?id=${id}`, { method: 'DELETE' });
      if (res.ok) {
        alert('Film berhasil dihapus!');
        fetchFilms();
      }
    } catch (err) {
      alert(`Gagal menghapus: ${err.message}`);
    }
  };

  const resetForm = () => {
    setIsEditing(false);
    setEditId(null);
    setForm({
      judul: '',
      gambar: '',
      trailer: '',
      deskripsi: '',
      tahun: '2026',
      rating: '13+',
      kategori: 'Film',
      bintang: 5
    });
  };

  return (
    <div className="page-container admin-container">
      <h2 className="section-title">{isEditing ? 'Edit Film' : 'Kelola Data Film'}</h2>

      <form onSubmit={handleSubmit} className="admin-form">
        <div className="form-group">
          <label>Judul Film</label>
          <input 
            type="text" 
            name="judul" 
            value={form.judul} 
            onChange={handleChange} 
            required 
            placeholder="Masukkan judul film"
            disabled={submitting}
          />
        </div>

        <div className="form-row">
          <div className="form-group">
            <label>Tahun</label>
            <input type="text" name="tahun" value={form.tahun} onChange={handleChange} disabled={submitting} />
          </div>
          <div className="form-group">
            <label>Rating Usia</label>
            <input type="text" name="rating" value={form.rating} onChange={handleChange} disabled={submitting} />
          </div>
        </div>

        <div className="form-row">
          <div className="form-group">
            <label>Kategori</label>
            <input type="text" name="kategori" value={form.kategori} onChange={handleChange} disabled={submitting} />
          </div>
          <div className="form-group">
            <label>Bintang (1 - 5)</label>
            <select name="bintang" value={form.bintang} onChange={handleChange} disabled={submitting}>
              <option value={5}>5 Bintang</option>
              <option value={4}>4 Bintang</option>
              <option value={3}>3 Bintang</option>
              <option value={2}>2 Bintang</option>
              <option value={1}>1 Bintang</option>
            </select>
          </div>
        </div>

        <div className="form-group">
          <label>Upload Gambar Poster</label>
          <input type="file" accept="image/*" onChange={handleImageUpload} disabled={submitting} />
          {form.gambar && (
            <div className="preview-container">
              <img src={form.gambar} alt="Preview" className="admin-poster-preview" />
            </div>
          )}
        </div>

        <div className="form-group">
          <label>Link Trailer YouTube</label>
          <input 
            type="text" 
            name="trailer" 
            value={form.trailer} 
            onChange={handleChange} 
            placeholder="Tempelkan link YouTube di sini"
            disabled={submitting}
          />
        </div>

        <div className="form-group">
          <label>Deskripsi Film</label>
          <textarea 
            name="deskripsi" 
            rows="4" 
            value={form.deskripsi} 
            onChange={handleChange} 
            placeholder="Tulis deskripsi..."
            disabled={submitting}
          />
        </div>

        {/* Action Buttons dengan Loading State */}
        <div className="form-actions">
          <button type="submit" className="submit-btn" disabled={submitting}>
            {submitting 
              ? (isEditing ? 'Menyimpan...' : 'Menambahkan...') 
              : (isEditing ? 'Simpan Perubahan' : 'Tambah Film')
            }
          </button>
          {isEditing && (
            <button type="button" onClick={resetForm} className="cancel-btn" disabled={submitting}>
              Batal
            </button>
          )}
        </div>
      </form>

      {/* Tabel Data Film dengan Tombol Refresh & Loading */}
      <div className="admin-table-wrapper">
        <div className="table-header-row">
          <h3>Daftar Film Terdaftar</h3>
          <button 
            type="button" 
            onClick={fetchFilms} 
            className="refresh-btn" 
            disabled={loading}
          >
            {loading ? 'Memuat...' : '🔄 Refresh Data'}
          </button>
        </div>

        <table className="admin-table">
          <thead>
            <tr>
              <th>Poster</th>
              <th>Judul</th>
              <th>Tahun</th>
              <th>Bintang</th>
              <th>Aksi</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan="5" style={{ textAlign: 'center', padding: '2rem', color: '#aaa' }}>
                  Sedang memuat data film...
                </td>
              </tr>
            ) : films.length === 0 ? (
              <tr>
                <td colSpan="5" style={{ textAlign: 'center', padding: '1.5rem', color: '#888' }}>
                  Belum ada film terdaftar.
                </td>
              </tr>
            ) : (
              films.map((f) => (
                <tr key={f._id}>
                  <td>
                    <img src={f.gambar} alt={f.judul} className="table-thumb" />
                  </td>
                  <td>{f.judul}</td>
                  <td>{f.tahun}</td>
                  <td>★ {f.bintang || 5}</td>
                  <td>  
                    <div className="action-btns">
                      <button onClick={() => handleEdit(f)} className="edit-btn" disabled={submitting}>Edit</button>
                      <button onClick={() => handleDelete(f._id)} className="delete-btn" disabled={submitting}>Hapus</button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}