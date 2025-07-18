import React from "react";
import { useNavigate } from "react-router-dom";
import PokeballLoader from "../components/PokeballLoader";

export default function SetCollecting() {
  const navigate = useNavigate();
  const [sets, setSets] = React.useState([]);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState(null);

  React.useEffect(() => {
    fetch("/api/sets")
      .then((res) => {
        if (!res.ok) throw new Error("Failed to fetch sets");
        return res.json();
      })
      .then((data) => {
        // Sort newest to oldest by releaseDate
        const sorted = data.sort(
          (a, b) => new Date(b.releaseDate) - new Date(a.releaseDate)
        );
        setSets(sorted);
        setLoading(false);
      })
      .catch((err) => {
        setError(err.message);
        setLoading(false);
      });
  }, []);

  if (loading) return <PokeballLoader />;

  if (error)
    return (
      <div style={{ textAlign: "center", marginTop: 50, color: "red" }}>
        Error loading sets: {error}
      </div>
    );

  if (!sets.length)
    return (
      <div style={{ textAlign: "center", marginTop: 50 }}>
        No sets found.
      </div>
    );

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "linear-gradient(135deg, #f0f8ff, #4caf50)",
        fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif",
        color: "#2e3a2f",
        padding: 20,
        textAlign: "center",
      }}
    >
      <h1 style={{ marginBottom: 24 }}>Sets</h1>
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(3, 1fr)",
          gap: 24,
          maxWidth: 1000,
          margin: "0 auto",
          justifyContent: "center",
        }}
      >
        {sets.map((set) => (
          <div
            key={set.id}
            onClick={() => navigate(`/set/${set.id}`)}
            role="button"
            tabIndex={0}
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === " ") {
                navigate(`/set/${set.id}`);
              }
            }}
            style={{
              cursor: "pointer",
              border: "2px solid #4caf50",
              borderRadius: 10,
              padding: 12,
              backgroundColor: "white",
              boxShadow: "0 4px 8px rgba(0,0,0,0.1)",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              userSelect: "none",
              width: set.images?.logo ? 200 : 220,
              height: set.images?.logo ? 260 : 280,
              transition: "transform 0.2s",
            }}
            onMouseEnter={(e) => (e.currentTarget.style.transform = "scale(1.05)")}
            onMouseLeave={(e) => (e.currentTarget.style.transform = "scale(1)")}
          >
            {set.images?.logo ? (
              <img
                src={set.images.logo}
                alt={`${set.name} logo`}
                style={{
                  maxWidth: "100%",
                  maxHeight: 100,
                  objectFit: "contain",
                  marginBottom: 12,
                }}
              />
            ) : (
              <div
                style={{
                  height: 100,
                  width: "100%",
                  marginBottom: 12,
                  backgroundColor: "#eee",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  color: "#999",
                }}
              >
                No Logo
              </div>
            )}
            <div
              style={{
                fontWeight: "bold",
                fontSize: 18,
                color: "#2e3a2f",
                textAlign: "center",
              }}
            >
              {set.name}
            </div>
            <div style={{ marginTop: "auto", fontSize: 14, color: "#666" }}>
              Release:{" "}
              {set.releaseDate
                ? new Date(set.releaseDate).toLocaleDateString()
                : "N/A"}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
