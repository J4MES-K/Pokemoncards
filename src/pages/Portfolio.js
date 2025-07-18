import React, { useState, useEffect } from 'react';

export default function Portfolio() {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [suggestions, setSuggestions] = useState([]);
  const [loading, setLoading] = useState(false);

  const handleSearch = async (customQuery) => {
    const input = (customQuery || query).trim();
    if (!input) return;

    setLoading(true);
    setSuggestions([]);
    let searchURL = '';
    let res, data;

    try {
      if (/^\d+\/\d+$/.test(input)) {
        // Card number format (e.g., 25/102)
        const encoded = encodeURIComponent(`number:"${input}"`);
        searchURL = `https://api.pokemontcg.io/v2/cards?q=${encoded}`;
      } else if (/^[A-Za-z\s]{3,}$/.test(input) && !/\d/.test(input)) {
        // Likely set name
        const encoded = encodeURIComponent(`set.name:"${input}"`);
        searchURL = `https://api.pokemontcg.io/v2/cards?q=${encoded}`;
      } else {
        // Default: card name
        const encoded = encodeURIComponent(`name:"${input}"`);
        searchURL = `https://api.pokemontcg.io/v2/cards?q=${encoded}`;
      }

      res = await fetch(searchURL);
      data = await res.json();

      if (data && Array.isArray(data.data)) {
        setResults(data.data);
      } else {
        setResults([]);
      }
    } catch (err) {
      console.error('Search error:', err);
      setResults([]);
    }

    setLoading(false);
  };

  useEffect(() => {
    const delayDebounce = setTimeout(async () => {
      if (query.length > 2) {
        try {
          const encoded = encodeURIComponent(`name:"${query}"`);
          const res = await fetch(`https://api.pokemontcg.io/v2/cards?q=${encoded}&pageSize=5`);
          const data = await res.json();
          if (Array.isArray(data.data)) {
            setSuggestions(data.data.map(card => card.name));
          } else {
            setSuggestions([]);
          }
        } catch (err) {
          console.error(err);
          setSuggestions([]);
        }
      } else {
        setSuggestions([]);
      }
    }, 300);

    return () => clearTimeout(delayDebounce);
  }, [query]);

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #f0f8ff, #4caf50)',
      fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif",
      color: '#2e3a2f',
      padding: 20,
      textAlign: 'center'
    }}>
      <h1 style={{ marginBottom: 24 }}>Your Portfolio</h1>

      <div style={{ position: 'relative', marginBottom: 32 }}>
        <input
          type="text"
          placeholder="Search by name, number (e.g. 25/102), or set name..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          style={{
            padding: 12,
            width: '100%',
            maxWidth: 400,
            borderRadius: 8,
            border: '1px solid #ccc',
            fontSize: 16,
            boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
          }}
        />
        {suggestions.length > 0 && (
          <ul style={{
            position: 'absolute',
            top: '100%',
            left: 0,
            right: 0,
            backgroundColor: '#fff',
            border: '1px solid #ccc',
            borderRadius: 4,
            maxHeight: 150,
            overflowY: 'auto',
            margin: 0,
            padding: 0,
            listStyle: 'none',
            zIndex: 10
          }}>
            {suggestions.map((s, i) => (
              <li
                key={i}
                onClick={() => {
                  setQuery(s);
                  handleSearch(s);
                  setSuggestions([]);
                }}
                style={{
                  padding: '10px 16px',
                  cursor: 'pointer',
                  borderBottom: '1px solid #eee',
                  textAlign: 'left'
                }}
              >
                {s}
              </li>
            ))}
          </ul>
        )}
      </div>

      <button
        onClick={() => handleSearch()}
        style={{
          backgroundColor: '#2a75bb',
          color: '#fff',
          border: 'none',
          padding: '10px 20px',
          fontSize: '1rem',
          borderRadius: '8px',
          cursor: 'pointer',
          marginBottom: 20,
          boxShadow: '0 4px 8px rgba(0,0,0,0.2)'
        }}
      >
        Search
      </button>

      {loading && <p>Loading cards...</p>}

      <div style={{
        display: 'flex',
        flexWrap: 'wrap',
        justifyContent: 'center',
        gap: 24,
        maxWidth: 1200,
        margin: '0 auto'
      }}>
        {results.map(card => (
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
            cursor: 'default'
          }}>
            <img
              src={card.images.small}
              alt={card.name}
              style={{ maxWidth: '100%', maxHeight: 140, objectFit: 'contain', marginBottom: 12 }}
            />
            <div style={{ fontWeight: 'bold', fontSize: 16, color: '#2e3a2f', textAlign: 'center' }}>
              {card.name}
            </div>
            <div style={{ marginTop: 'auto', fontSize: 14, color: '#666' }}>
              {card.set?.name || 'Unknown set'}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
