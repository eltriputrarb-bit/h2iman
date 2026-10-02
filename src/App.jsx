import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Header from './components/header';
import DaftarFilm from './pages/daftarfilm';
import DetailFilm from './pages/detailfilm';
import LoginFilm from './pages/loginfilm';
import Admin from './pages/admin';
import './style.css';
import './admin.css';

function ProtectedRoute({ children }) {
  const user = localStorage.getItem('user');
  if (!user) {
    return <Navigate to="/login" replace />;
  }
  return children;
}

function LayoutWithHeader({ children }) {
  return (
    <>
      <Header />
      {children}
    </>
  );
}

export default function App() {
  return (
    <Router>
      <Routes>
        {/* Halaman Utama / User */}
        <Route 
          path="/" 
          element={
            <LayoutWithHeader>
              <DaftarFilm />
            </LayoutWithHeader>
          } 
        />

        {/* Detail Film untuk User (menampilkan detail film berdasarkan ID) */}
        <Route 
          path="/detail/:id" 
          element={
            <LayoutWithHeader>
              <DetailFilm />
            </LayoutWithHeader>
          } 
        />

        {/* Halaman Login */}
        <Route path="/login" element={<LoginFilm />} />

        {/* Dashboard Admin */}
        <Route 
          path="/admin" 
          element={
            <ProtectedRoute>
              <Admin />
            </ProtectedRoute>
          } 
        />

        {/* Form Tambah Film (Admin) */}
        <Route 
          path="/detail" 
          element={
            <ProtectedRoute>
              <DetailFilm />
            </ProtectedRoute>
          } 
        />
      </Routes>
    </Router>
  );
}