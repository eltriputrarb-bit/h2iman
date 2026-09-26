import React from 'react';

export default function Lightbox({ isOpen, onClose, imageSrc, videoUrl, title }) {
  if (!isOpen) return null;

  return (
    <div 
      style={{
        position: 'fixed',
        top: 0, left: 0, right: 0, bottom: 0,
        backgroundColor: 'rgba(0,0,0,0.85)',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        zIndex: 1000,
        padding: '1rem'
      }} 
      onClick={onClose}
    >
      <div 
        onClick={(e) => e.stopPropagation()} 
        style={{ 
          position: 'relative', 
          textAlign: 'center', 
          width: '100%', 
          maxWidth: videoUrl ? '800px' : '90vw' 
        }}
      >
        {/* Render Video YouTube jika videoUrl ada */}
        {videoUrl ? (
          <div 
            style={{ 
              position: 'relative', 
              paddingBottom: '56.25%', 
              height: 0, 
              overflow: 'hidden', 
              borderRadius: '8px',
              backgroundColor: '#000'
            }}
          >
            <iframe 
              src={videoUrl} 
              title={title || "YouTube video player"} 
              style={{
                position: 'absolute',
                top: 0,
                left: 0,
                width: '100%',
                height: '100%',
                border: 0
              }}
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" 
              referrerPolicy="strict-origin-when-cross-origin" 
              allowFullScreen
            />
          </div>
        ) : (
          /* Render Gambar jika videoUrl tidak ada */
          <img 
            src={imageSrc} 
            alt={title} 
            style={{ maxWidth: '90vw', maxHeight: '75vh', borderRadius: '8px', objectFit: 'contain' }} 
          />
        )}

        {title && (
          <p style={{ color: '#fff', marginTop: '1rem', fontSize: '1.2rem', fontWeight: '500' }}>
            {title}
          </p>
        )}

        <button 
          onClick={onClose}
          style={{
            marginTop: '0.5rem',
            padding: '0.5rem 1rem',
            backgroundColor: '#e11d48',
            color: '#fff',
            border: 'none',
            borderRadius: '6px',
            cursor: 'pointer',
            fontWeight: 'bold'
          }}
        >
          Tutup
        </button>
      </div>
    </div>
  );
}