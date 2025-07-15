import React from 'react';
import { useNavigate } from 'react-router-dom';

export default function Home() {
  const navigate = useNavigate();

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #f0f8ff, #4caf50)',
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'center',
      alignItems: 'center',
      padding: '20px',
      fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif",
      color: '#2e3a2f',
      textAlign: 'center',
    }}>
      <h1 style={{ fontSize: '3rem', marginBottom: '0.5rem' }}>
        Pokémon Card Pre-Grading
      </h1>
      <p style={{ fontSize: '1.2rem', maxWidth: 500, marginBottom: '2rem' }}>
        Quickly get a pre-grade estimate for your Pokémon cards to help decide if they're ready for professional grading.
      </p>
      <button
        style={{
          backgroundColor: '#ffcb05',
          color: '#2a75bb',
          border: 'none',
          padding: '15px 30px',
          fontSize: '1.2rem',
          borderRadius: '8px',
          cursor: 'pointer',
          boxShadow: '0 4px 8px rgba(0,0,0,0.2)',
        }}
        onClick={() => navigate('/centering')}
      >
        Start Pre-Grading
      </button>
    </div>
  );
}
