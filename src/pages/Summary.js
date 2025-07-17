// src/pages/Summary.js
import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

export default function Summary() {
  const location = useLocation();
  const navigate = useNavigate();
  const {
    frontImage,
    backImage,
    frontLines,
    backLines,
    frontZoom,
    backZoom,
    frontOffset,
    backOffset,
    frontRotation,
    backRotation,
  } = location.state || {};

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #f0f8ff, #4caf50)',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      padding: '40px 20px',
      fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif",
      color: '#2e3a2f',
      textAlign: 'center',
    }}>
      <h1 style={{ fontSize: '2.5rem', marginBottom: '1rem' }}>Summary</h1>
      <p style={{ fontSize: '1.2rem', maxWidth: 600, marginBottom: '2rem' }}>
        Here's a summary of your centering and surface inputs.
      </p>

      <div style={{
        display: 'flex',
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: '40px',
        justifyContent: 'center',
        marginBottom: '2rem',
      }}>
        {[{ label: 'Front', img: frontImage, lines: frontLines }, { label: 'Back', img: backImage, lines: backLines }].map(({ label, img, lines }) => (
          <div key={label} style={{
            backgroundColor: 'white',
            borderRadius: '10px',
            padding: '20px',
            boxShadow: '0 4px 10px rgba(0,0,0,0.1)',
            width: '300px',
            textAlign: 'center',
          }}>
            <h3 style={{ marginBottom: '10px', color: '#2a75bb' }}>{label} of Card</h3>
            {img ? (
              <img
                src={img}
                alt={`${label} of card`}
                style={{
                  width: '100%',
                  height: 'auto',
                  borderRadius: '6px',
                  marginBottom: '10px',
                }}
              />
            ) : (
              <p>No image uploaded</p>
            )}
            {lines && (
              <div style={{ fontSize: '0.9rem', color: '#555', textAlign: 'left' }}>
                <strong>Lines:</strong>
                <ul style={{ paddingLeft: '1rem' }}>
                  {Object.entries(lines).map(([key, val]) => (
                    <li key={key}>{key}: {(val * 100).toFixed(1)}%</li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        ))}
      </div>

      <button
        onClick={() => navigate("/")}
        style={{
          backgroundColor: '#ffcb05',
          color: '#2a75bb',
          border: 'none',
          padding: '12px 24px',
          fontSize: '1rem',
          borderRadius: '8px',
          cursor: 'pointer',
          boxShadow: '0 4px 8px rgba(0,0,0,0.2)',
        }}
      >
        Back to Home
      </button>
    </div>
  );
}
