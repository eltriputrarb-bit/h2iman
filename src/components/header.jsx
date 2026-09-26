import React from 'react';
import { Link } from 'react-router-dom';

export default function Header() {
  return (
    <header className="navbar">
      <Link to="/" className="brand-title">🎬 Daftar Film</Link>
      <Link to="/login" className="login-btn">LOGIN</Link>
    </header>
  );
}