// src/components/PokeballLoader.js
import React from 'react';

export default function PokeballLoader() {
  return (
    <div
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100vw',
        height: '100vh',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'transparent',
        zIndex: 9999,
      }}
    >
      <svg
        width="300"
        height="300"
        viewBox="0 0 100 100"
        style={{ animation: 'spin 1.5s linear infinite' }}
        xmlns="http://www.w3.org/2000/svg"
      >
        {/* Outer white circle with black border */}
        <circle cx="50" cy="50" r="48" fill="#FFFFFF" stroke="#000" strokeWidth="4" />
        {/* Top half red semicircle */}
        <path
          d="M 2 50 A 48 48 0 0 1 98 50"
          fill="#FF0000"
          stroke="#000"
          strokeWidth="4"
        />
        {/* Center white circle with black border */}
        <circle cx="50" cy="50" r="15" fill="#FFFFFF" stroke="#000" strokeWidth="4" />
        {/* Inner grey circle */}
        <circle cx="50" cy="50" r="10" fill="#C0C0C0" stroke="#000" strokeWidth="2" />
      </svg>

      <style>{`
        @keyframes spin {
          0% { transform: rotate(0deg);}
          100% { transform: rotate(360deg);}
        }
      `}</style>
    </div>
  );
}
