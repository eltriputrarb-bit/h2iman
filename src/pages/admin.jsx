import React, { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import Lightbox from '../components/Lightbox';
import { moviesData } from './daftarfilm';

export default function Admin() {
  const [films, setFilms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedFilm, setSelectedFilm] = useState(null); 
  const navigate = useNavigate();

  const fetchFilms = () => {
    setLoading(true);

    // Ditambahkan parameter ?full=true agar data Base64 gambar terkirim penuh ke Admin
    fetch('/api/films?full=true')
      .then((res) => {
        if (!res.ok) throw new Error('Network response status was not ok');
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
        console.warn('Backend server tidak aktif, memuat data lokal dummy:', err.message);
        setFilms(moviesData);
        setLoading(false);
      });
  };

  useEffect(() => {
    const user = localStorage.getItem('user');
    if (!user) {
      navigate('/login');
      return;
    }

    fetchFilms();
  }, [navigate]);

  const handleDelete = async (id) => {
    if (window.confirm('Yakin ingin menghapus film ini?')) {
      const isLocal = moviesData.some((m) => String(m.id) === String(id));

      if (isLocal) {
        setFilms((prevFilms) => prevFilms.filter((f) => String(f.id || f._id) !== String(id)));
        alert('Film lokal berhasil dihapus dari tampilan!');
        return;
      }

      try {
        const res = await fetch(`/api/films?id=${id}`, {
          method: 'DELETE',
        });
        if (res.ok) {
          alert('Film berhasil dihapus!');
          fetchFilms();
        } else {
          alert('Gagal menghapus film di server.');
        }
      } catch (err) {
        console.error('Error hapus film:', err);
        setFilms((prevFilms) => prevFilms.filter((f) => String(f.id || f._id) !== String(id)));
        alert('Gagal terhubung ke server. Film dihapus dari daftar tampilan lokal.');
      }
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('user');
    alert('Berhasil Logout!');
    navigate('/login');
  };

  return (
    <div className="admin-wrapper">
      <div className="admin-container">
        <div className="admin-header">
          <h1 className="admin-title">Dashboard Admin</h1>
          <button onClick={handleLogout} className="btn-logout">
            LOGOUT
          </button>
        </div>

        <div className="admin-actions">
          <Link to="/detail" className="btn-add-film">
            + Tambah Film
          </Link>
        </div>

        {loading ? (
          <p className="admin-loading">Memuat data admin...</p>
        ) : (
          <>
            <div className="admin-table-wrapper">
              <table className="admin-table">
                <thead>
                  <tr>
                    <th className="col-title">Judul</th>
                    <th className="col-center">Gambar</th>
                    <th className="col-trailer">Trailer</th>
                    <th className="col-desc">Deskripsi</th>
                    <th className="col-center">Aksi</th>
                  </tr>
                </thead>
                <tbody>
                  {films.length > 0 ? (
                    films.map((film) => {
                      const imgUrl = film.gambar || film.image;
                      const filmTitle = film.judul || film.title;
                      const filmId = film._id || film.id;
                      const trailerUrl = film.trailer || film.trailerEmbed;

                      return (
                        <tr key={filmId}>
                          <td className="col-title">{filmTitle}</td>
                          <td className="col-center">
                            {imgUrl ? (
                              <img 
                                src={imgUrl} 
                                alt={filmTitle} 
                                onClick={() => setSelectedFilm({ src: imgUrl, title: filmTitle })}
                                className="admin-thumb"
                                title="Klik untuk memperbesar"
                              />
                            ) : (
                              <span className="no-img-text">Tidak Ada Gambar</span>
                            )}
                          </td>
                          <td className="col-trailer">
                            {trailerUrl ? (
                              <a href={trailerUrl} target="_blank" rel="noreferrer" className="trailer-link">
                                Lihat Trailer
                              </a>
                            ) : '-'}
                          </td>
                          <td className="col-desc">
                            {film.deskripsi || film.description}
                          </td>
                          <td className="col-center">
                            <button 
                              onClick={() => handleDelete(filmId)}
                              className="btn-delete"
                            >
                              Hapus
                            </button>
                          </td>
                        </tr>
                      );
                    })
                  ) : (
                    <tr>
                      <td colSpan="5" className="empty-table">
                        Belum ada data film di database.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            <div className="admin-mobile-list">
              {films.length > 0 ? (
                films.map((film) => {
                  const imgUrl = film.gambar || film.image;
                  const filmTitle = film.judul || film.title;
                  const filmId = film._id || film.id;
                  const trailerUrl = film.trailer || film.trailerEmbed;

                  return (
                    <div key={filmId} className="admin-card-item">
                      <div className="admin-card-body">
                        {imgUrl && (
                          <img 
                            src={imgUrl} 
                            alt={filmTitle} 
                            onClick={() => setSelectedFilm({ src: imgUrl, title: filmTitle })}
                            className="mobile-card-thumb"
                          />
                        )}
                        <div className="admin-card-info">
                          <h3 className="mobile-film-title">{filmTitle}</h3>
                          <p className="mobile-film-desc">{film.deskripsi || film.description}</p>
                          {trailerUrl && (
                            <a href={trailerUrl} target="_blank" rel="noreferrer" className="trailer-link">
                              ▶ Lihat Trailer
                            </a>
                          )}
                        </div>
                      </div>
                      <div className="admin-card-footer">
                        <button 
                          onClick={() => handleDelete(filmId)}
                          className="btn-delete-mobile"
                        >
                          Hapus Film
                        </button>
                      </div>
                    </div>
                  );
                })
              ) : (
                <p className="empty-table">Belum ada data film di database.</p>
              )}
            </div>
          </>
        )}

        <Lightbox 
          isOpen={Boolean(selectedFilm)} 
          onClose={() => setSelectedFilm(null)} 
          imageSrc={selectedFilm?.src} 
          title={selectedFilm?.title} 
        />
      </div>
    </div>
  );
}