import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import PokeballLoader from '../components/PokeballLoader';

export default function SetCollecting() {
  const navigate = useNavigate();

  const { data: sets, isLoading, isError } = useQuery({
    queryKey: ['sets'],
    queryFn: async () => {
      const res = await fetch('https://api.pokemontcg.io/v2/sets');
      if (!res.ok) throw new Error('Network response was not ok');
      const json = await res.json();
      // Sort newest to oldest by releaseDate
      return json.data.sort(
        (a, b) => new Date(b.releaseDate) - new Date(a.releaseDate)
      );
    },
  });

  if (isLoading) return <PokeballLoader />;
  if (isError) return <div>Error loading sets.</div>;

  return (
    <div
      style={{
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #f0f8ff, #4caf50)',
        fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif",
        color: '#2e3a2f',
        padding: 20,
        textAlign: 'center',
      }}
    >
      <h1 style={{ marginBottom: 24 }}>Sets</h1>

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(3, 1fr)',
          gap: 24,
          justifyContent: 'center',
          maxWidth: 900,
          margin: '0 auto',
        }}
      >
        {sets.map((set) => (
          <div
            key={set.id}
            onClick={() => navigate(`/set/${set.id}`)}
            style={{
              cursor: 'pointer',
              border: '2px solid #4caf50',
              borderRadius: 10,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              padding: 12,
              backgroundColor: 'white',
              boxShadow: '0 4px 8px rgba(0,0,0,0.1)',
              transition: 'transform 0.2s',
            }}
            onMouseEnter={(e) => (e.currentTarget.style.transform = 'scale(1.05)')}
            onMouseLeave={(e) => (e.currentTarget.style.transform = 'scale(1)')}
          >
            <img
              src={set.images.logo}
              alt={`${set.name} logo`}
              style={{
                maxWidth: '100%',
                maxHeight: 100,
                objectFit: 'contain',
                marginBottom: 12,
              }}
            />
            <div
              style={{
                textAlign: 'center',
                fontWeight: 'bold',
                fontSize: 18,
                color: '#2e3a2f',
              }}
            >
              {set.name}
            </div>
            <div style={{ marginTop: 'auto', fontSize: 14, color: '#666' }}>
              Release: {set.releaseDate || 'N/A'}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
