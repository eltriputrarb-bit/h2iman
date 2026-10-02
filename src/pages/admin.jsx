import React, { useState, useEffect } from 'react';
import './admin.css';

const LOGO_SRC = '/images/logo.jpg';

export default function Admin({ onLogout }) {
  const [films, setFilms] = useState([]);
  const [isEditing, setIsEditing] = useState(false);
  const [editId, setEditId] = useState(null);
  const [activeTab, setActiveTab] = useState('form');
  const [sidebarOpen, setSidebarOpen] = useState(false);
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

  // Helper untuk mendapatkan token autentikasi
  const getAuthHeaders = () => {
    const token = localStorage.getItem('token') || localStorage.getItem('admin_token');
    return {
      'Content-Type': 'application/json',
      'Authorization': token ? `Bearer ${token}` : ''
    };
  };

  // Helper terpusat untuk menangani respons 401 (Sesi Berakhir / Token Dicuri / Diganti)
  const handleAuthError = (status) => {
    if (status === 401 || status === 403) {
      localStorage.removeItem('token');
      localStorage.removeItem('admin_token');
      sessionStorage.setItem('auth_error', 'Sesi berakhir atau token tidak valid. Silakan login ulang.');
      
      if (typeof onLogout === 'function') {
        onLogout();
      } else {
        window.location.href = '/login';
      }
      return true;
    }
    return false;
  };

  const fetchFilms = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/films?full=true&t=${Date.now()}`, {
        headers: getAuthHeaders()
      });

      if (handleAuthError(res.status)) return;

      if (!res.ok) throw new Error(`HTTP error! Status: ${res.status}`);
      const data = await res.json();
      setFilms(Array.isArray(data) ? data : []);
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

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);

    const url = isEditing ? `/api/films?id=${editId}` : '/api/films';
    const method = isEditing ? 'PUT' : 'POST';

    try {
      const res = await fetch(url, {
        method,
        headers: getAuthHeaders(),
        body: JSON.stringify(form)
      });

      if (handleAuthError(res.status)) return;

      if (res.ok) {
        alert(isEditing ? 'Film berhasil diperbarui!' : 'Film berhasil ditambahkan!');
        resetForm();
        await fetchFilms();
        setActiveTab('list');
      } else {
        const errData = await res.json().catch(() => ({}));
        alert(`Gagal: ${errData.message || 'Terjadi kesalahan'}`);
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
    setActiveTab('form');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Yakin ingin menghapus film ini?')) return;

    try {
      const res = await fetch(`/api/films?id=${id}`, {
        method: 'DELETE',
        headers: getAuthHeaders()
      });

      if (handleAuthError(res.status)) return;

      if (res.ok) {
        alert('Film berhasil dihapus!');
        fetchFilms();
      } else {
        const errData = await res.json().catch(() => ({}));
        alert(`Gagal menghapus: ${errData.message || 'Terjadi kesalahan'}`);
      }
    } catch (err) {
      alert(`Gagal menghapus: ${err.message}`);
    }
  };

  const handleLogoutClick = () => {
    if (window.confirm('Yakin ingin keluar dari akun admin?')) {
      localStorage.removeItem('token');
      localStorage.removeItem('admin_token');
      if (typeof onLogout === 'function') {
        onLogout();
      } else {
        window.location.href = '/login';
      }
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

  const handleNavClick = (tab) => {
    setActiveTab(tab);
    setSidebarOpen(false);
  };

  return (
    <div className="adm-admin-layout">
      {/* MOBILE TOPBAR */}
      <header className="adm-mobile-header">
        <button 
          className="adm-hamburger-btn" 
          onClick={() => setSidebarOpen(true)}
          aria-label="Open Menu"
        >
          ☰
        </button>
        <h2 className="adm-mobile-logo">
          <img src={LOGO_SRC} alt="Film Logo" className="adm-logo-img" />
        </h2>
      </header>

      {/* OVERLAY BACKDROP */}
      {sidebarOpen && (
        <div 
          className="adm-sidebar-overlay" 
          onClick={() => setSidebarOpen(false)} 
        />
      )}

      {/* SIDEBAR NAVIGATION */}
      <aside className={`adm-admin-sidebar ${sidebarOpen ? 'open' : ''}`}>
        <div className="adm-sidebar-logo">
          <h2>
            <img src={LOGO_SRC} alt="Film Logo" className="adm-logo-img" />
          </h2>
          <button 
            className="adm-close-sidebar-btn" 
            onClick={() => setSidebarOpen(false)}
          >
            ✕
          </button>
        </div>
        <nav className="adm-sidebar-menu">
          <button 
            className={`adm-menu-item ${activeTab === 'form' ? 'active' : ''}`}
            onClick={() => handleNavClick('form')}
          >
            <span>Data Film</span>
            <span className="adm-arrow">›</span>
          </button>
          <button 
            className={`adm-menu-item ${activeTab === 'list' ? 'active' : ''}`}
            onClick={() => handleNavClick('list')}
          >
            <span>Daftar Film Terdaftar</span>
            <span className="adm-arrow">›</span>
          </button>
          <button 
            className="adm-menu-item"
            style={{ color: '#ff4d4d', marginTop: 'auto' }}
            onClick={handleLogoutClick}
          >
            <span>Keluar (Logout)</span>
            <span className="adm-arrow">➔</span>
          </button>
        </nav>
      </aside>

      {/* MAIN CONTENT AREA */}
      <main className="adm-admin-content">
        {activeTab === 'form' ? (
          <div className="adm-content-section">
            <h2 className="adm-section-title">{isEditing ? 'Edit Film' : 'Kelola Data Film'}</h2>
            <form onSubmit={handleSubmit} className="adm-admin-form">
              <div className="adm-form-group">
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

              <div className="adm-form-row">
                <div className="adm-form-group">
                  <label>Tahun</label>
                  <input type="text" name="tahun" value={form.tahun} onChange={handleChange} disabled={submitting} />
                </div>
                <div className="adm-form-group">
                  <label>Rating Usia</label>
                  <input type="text" name="rating" value={form.rating} onChange={handleChange} disabled={submitting} />
                </div>
              </div>

              <div className="adm-form-row">
                <div className="adm-form-group">
                  <label>Kategori</label>
                  <input type="text" name="kategori" value={form.kategori} onChange={handleChange} disabled={submitting} />
                </div>
                <div className="adm-form-group">
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

              <div className="adm-form-group">
                <label>Upload Gambar Poster</label>
                <input type="file" accept="image/*" onChange={handleImageUpload} disabled={submitting} />
                {form.gambar && (
                  <div className="adm-preview-container">
                    <img src={form.gambar} alt="Preview" className="adm-admin-poster-preview" />
                  </div>
                )}
              </div>

              <div className="adm-form-group">
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

              <div className="adm-form-group">
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

              <div className="adm-form-actions">
                <button type="submit" className="adm-submit-btn" disabled={submitting}>
                  {submitting 
                    ? (isEditing ? 'Menyimpan...' : 'Menambahkan...') 
                    : (isEditing ? 'Simpan Perubahan' : 'Tambah Film')
                  }
                </button>
                {isEditing && (
                  <button type="button" onClick={resetForm} className="adm-cancel-btn" disabled={submitting}>
                    Batal
                  </button>
                )}
              </div>
            </form>
          </div>
        ) : (
          <div className="adm-content-section">
            <div className="adm-admin-table-wrapper">
              <div className="adm-table-header-row">
                <h2 className="adm-section-title" style={{ margin: 0 }}>Daftar Film Terdaftar</h2>
                <button 
                  type="button" 
                  onClick={fetchFilms} 
                  className="adm-refresh-btn" 
                  disabled={loading}
                >
                  {loading ? 'Memuat...' : '🔄 Refresh Data'}
                </button>
              </div>

              {/* VIEW 1: TABEL UNTUK DESKTOP */}
              <table className="adm-desktop-only-table">
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
                          {f.gambar ? (
                            <img src={f.gambar} alt={f.judul} className="adm-table-thumb" />
                          ) : (
                            <div className="adm-table-thumb-placeholder">No Image</div>
                          )}
                        </td>
                        <td>{f.judul}</td>
                        <td>{f.tahun}</td>
                        <td>★ {f.bintang || 5}</td>
                        <td>
                          <div className="adm-action-btns">
                            <button onClick={() => handleEdit(f)} className="adm-edit-btn" disabled={submitting}>Edit</button>
                            <button onClick={() => handleDelete(f._id)} className="adm-delete-btn" disabled={submitting}>Hapus</button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>

              {/* VIEW 2: KERTAS / CARD UNTUK MOBILE */}
              <div className="adm-mobile-cards-container">
                {loading ? (
                  <div className="adm-card-empty-state">Sedang memuat data film...</div>
                ) : films.length === 0 ? (
                  <div className="adm-card-empty-state">Belum ada film terdaftar.</div>
                ) : (
                  films.map((f) => (
                    <div className="adm-sketch-card" key={f._id}>
                      <div className="adm-card-row">
                        <div className="adm-card-label">Poster</div>
                        <div className="adm-card-value">
                          {f.gambar ? (
                            <img src={f.gambar} alt={f.judul} className="adm-table-thumb" />
                          ) : (
                            <div className="adm-table-thumb-placeholder">No Image</div>
                          )}
                        </div>
                      </div>

                      <div className="adm-card-row">
                        <div className="adm-card-label">Judul</div>
                        <div className="adm-card-value">{f.judul}</div>
                      </div>

                      <div className="adm-card-row">
                        <div className="adm-card-label">Tahun</div>
                        <div className="adm-card-value">{f.tahun}</div>
                      </div>

                      <div className="adm-card-row">
                        <div className="adm-card-label">Bintang</div>
                        <div className="adm-card-value">★ {f.bintang || 5}</div>
                      </div>

                      <div className="adm-card-row">
                        <div className="adm-card-label">Aksi</div>
                        <div className="adm-card-value">
                          <div className="adm-action-btns">
                            <button onClick={() => handleEdit(f)} className="adm-edit-btn" disabled={submitting}>Edit</button>
                            <button onClick={() => handleDelete(f._id)} className="adm-delete-btn" disabled={submitting}>Hapus</button>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>

            </div>
          </div>
        )}
      </main>
    </div>
  );
}