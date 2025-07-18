import React from "react";
import { useLocation, useNavigate } from "react-router-dom";

export default function Summary() {
  const location = useLocation();
  const navigate = useNavigate();

  const {
    frontImage,
    backImage,
    frontLines,
    backLines,
    // Removed unused variables:
    // frontZoom,
    // backZoom,
    // frontOffset,
    // backOffset,
    // frontRotation,
    // backRotation,
  } = location.state || {};

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
      <h1 style={{ marginBottom: 24 }}>Summary</h1>
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          gap: 40,
          marginBottom: 20,
          flexWrap: "wrap",
        }}
      >
        <div>
          <h2>Front Image</h2>
          <img
            src={frontImage}
            alt="Front"
            style={{ maxWidth: 300, maxHeight: 450, borderRadius: 10 }}
          />
        </div>
        <div>
          <h2>Back Image</h2>
          <img
            src={backImage}
            alt="Back"
            style={{ maxWidth: 300, maxHeight: 450, borderRadius: 10 }}
          />
        </div>
      </div>

      <div>
        <h3>Front Lines</h3>
        <pre>{JSON.stringify(frontLines, null, 2)}</pre>
      </div>

      <div>
        <h3>Back Lines</h3>
        <pre>{JSON.stringify(backLines, null, 2)}</pre>
      </div>

      <button
        onClick={() => navigate("/")}
        style={{
          marginTop: 20,
          padding: "12px 25px",
          fontSize: "1rem",
          backgroundColor: "#4caf50",
          color: "white",
          border: "none",
          borderRadius: 6,
          cursor: "pointer",
          userSelect: "none",
        }}
      >
        Back to Home
      </button>
    </div>
  );
}
