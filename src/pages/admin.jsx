import React, { useState, useEffect } from 'react';

export default function Admin() {
  const [films, setFilms] = useState([]);
  const [isEditing, setIsEditing] = useState(false);
  const [editId, setEditId] = useState(null);

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

  const fetchFilms = () => {
    fetch('/api/films?full=true')
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data)) setFilms(data);
      })
      .catch((err) => console.error(err));
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

  const handleSubmit = async (e) => {
    e.preventDefault();
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
        fetchFilms();
      } else {
        const errData = await res.json();
        alert(`Gagal: ${errData.message}`);
      }
    } catch (err) {
      alert(`Error: ${err.message}`);
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
          />
        </div>

        <div className="form-row">
          <div className="form-group">
            <label>Tahun</label>
            <input type="text" name="tahun" value={form.tahun} onChange={handleChange} />
          </div>
          <div className="form-group">
            <label>Rating Usia</label>
            <input type="text" name="rating" value={form.rating} onChange={handleChange} />
          </div>
        </div>

        <div className="form-row">
          <div className="form-group">
            <label>Kategori</label>
            <input type="text" name="kategori" value={form.kategori} onChange={handleChange} />
          </div>
          <div className="form-group">
            <label>Bintang (1 - 5)</label>
            <select name="bintang" value={form.bintang} onChange={handleChange}>
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
          <input type="file" accept="image/*" onChange={handleImageUpload} />
          {form.gambar && (
            <img src={form.gambar} alt="Preview" className="admin-poster-preview" />
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
          />
        </div>

        <div className="form-actions">
          <button type="submit" className="submit-btn">
            {isEditing ? 'Simpan Perubahan' : 'Tambah Film'}
          </button>
          {isEditing && (
            <button type="button" onClick={resetForm} className="cancel-btn">
              Batal
            </button>
          )}
        </div>
      </form>

      <div className="admin-table-wrapper">
        <h3>Daftar Film Terdaftar</h3>
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
            {films.map((f) => (
              <tr key={f._id}>
                <td>
                  <img src={f.gambar} alt={f.judul} className="table-thumb" />
                </td>
                <td>{f.judul}</td>
                <td>{f.tahun}</td>
                <td>★ {f.bintang || 5}</td>
                <td>
                  <div className="action-btns">
                    <button onClick={() => handleEdit(f)} className="edit-btn">Edit</button>
                    <button onClick={() => handleDelete(f._id)} className="delete-btn">Hapus</button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}