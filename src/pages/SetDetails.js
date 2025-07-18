import React from 'react';
import { useParams } from 'react-router-dom';
import PokeballLoader from '../components/PokeballLoader';

export default function SetDetails() {
  const { setId } = useParams();
  const [cards, setCards] = React.useState([]);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    setLoading(true);
    fetch(`/api/cards?setId=${setId}`)
      .then(res => res.json())
      .then(data => {
        setCards(data || []);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [setId]);

  if (loading) return <PokeballLoader />;

  return (
    <div style={{ 
      minHeight: '100vh', 
      background: 'linear-gradient(135deg, #f0f8ff, #4caf50)', 
      fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif",
      color: '#2e3a2f',
      padding: 20,
      textAlign: 'center'
    }}>
      <h1 style={{ marginBottom: 24 }}>Cards in Set</h1>
      <div style={{ 
        display: 'flex', 
        flexWrap: 'wrap', 
        justifyContent: 'center', 
        gap: 24, 
        maxWidth: 1200, 
        margin: '0 auto',
      }}>
        {cards.length === 0 ? (
          <p>No cards found for this set.</p>
        ) : (
          cards.map(card => (
            <div key={card.id} style={{
              border: '2px solid #4caf50',
              borderRadius: 10,
              width: 200,
              height: 280,
              backgroundColor: 'white',
              boxShadow: '0 4px 8px rgba(0,0,0,0.1)',
              padding: 12,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              cursor: 'default',
            }}>
              <img
                src={card.images?.small}
                alt={card.name}
                style={{ maxWidth: '100%', maxHeight: 140, objectFit: 'contain', marginBottom: 12 }}
              />
              <div style={{ fontWeight: 'bold', fontSize: 16, color: '#2e3a2f', textAlign: 'center' }}>
                {card.name}
              </div>
              <div style={{ marginTop: 'auto', fontSize: 14, color: '#666' }}>
                {card.rarity || 'Unknown rarity'}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
