// SurfaceChecker.js
import React, { useEffect, useRef, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";

export default function SurfaceChecker() {
  const location = useLocation();
  const navigate = useNavigate();

  const { frontImage, backImage } = location.state || {};

  const frontCanvasRef = useRef(null);
  const backCanvasRef = useRef(null);

  const [frontFiltered, setFrontFiltered] = useState(false);
  const [backFiltered, setBackFiltered] = useState(false);

  const [zoomFront, setZoomFront] = useState(null);
  const [zoomBack, setZoomBack] = useState(null);
  const [offsetFront, setOffsetFront] = useState({ x: 0, y: 0 });
  const [offsetBack, setOffsetBack] = useState({ x: 0, y: 0 });

  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [dragImage, setDragImage] = useState(null);

  const [frontNotes, setFrontNotes] = useState({ corners: "", edges: "", surface: "" });
  const [backNotes, setBackNotes] = useState({ corners: "", edges: "", surface: "" });

  const defaultZoom = useRef({ front: null, back: null });

  useEffect(() => {
    if (!frontImage || !backImage) {
      navigate("/centering");
    }
  }, [frontImage, backImage, navigate]);

  useEffect(() => {
    drawCanvas(frontImage, frontCanvasRef.current, frontFiltered, zoomFront, offsetFront, setZoomFront, "front");
  }, [frontImage, frontFiltered, zoomFront, offsetFront]);

  useEffect(() => {
    drawCanvas(backImage, backCanvasRef.current, backFiltered, zoomBack, offsetBack, setZoomBack, "back");
  }, [backImage, backFiltered, zoomBack, offsetBack]);

  function getInitialZoom(imgWidth, imgHeight, containerWidth, containerHeight) {
    return Math.min(containerWidth / imgWidth, containerHeight / imgHeight);
  }

  function applyUnsharpMask(imageData) {
    const width = imageData.width;
    const height = imageData.height;
    const src = imageData.data;
    const output = new Uint8ClampedArray(src);
    const kernel = [0, -1, 0, -1, 5, -1, 0, -1, 0];

    for (let y = 1; y < height - 1; y++) {
      for (let x = 1; x < width - 1; x++) {
        for (let c = 0; c < 3; c++) {
          let i = (y * width + x) * 4 + c;
          let sum = 0;
          for (let ky = -1; ky <= 1; ky++) {
            for (let kx = -1; kx <= 1; kx++) {
              let ni = ((y + ky) * width + (x + kx)) * 4 + c;
              let ki = (ky + 1) * 3 + (kx + 1);
              sum += src[ni] * kernel[ki];
            }
          }
          output[i] = Math.min(255, Math.max(0, sum));
        }
      }
    }

    for (let i = 0; i < output.length; i += 4) {
      output[i + 3] = src[i + 3];
    }

    imageData.data.set(output);
    return imageData;
  }

  function drawCanvas(src, canvas, filtered, zoom, offset, setZoom, side) {
    if (!src || !canvas) return;
    const ctx = canvas.getContext("2d");
    ctx.imageSmoothingEnabled = false;

    const img = new Image();
    img.crossOrigin = "anonymous";

    img.onload = () => {
      const containerWidth = 400;
      const containerHeight = 600;
      const initialZoom = getInitialZoom(img.width, img.height, containerWidth, containerHeight);

      if (!zoom) {
        zoom = initialZoom;
        setZoom(initialZoom);
        if (side) defaultZoom.current[side] = initialZoom;
      }

      canvas.width = containerWidth;
      canvas.height = containerHeight;

      ctx.setTransform(1, 0, 0, 1, 0, 0);
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      ctx.setTransform(zoom, 0, 0, zoom, offset.x, offset.y);
      ctx.drawImage(img, 0, 0);

      if (filtered) {
        let imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        let data = imageData.data;

        const contrast = 1.6;
        for (let i = 0; i < data.length; i += 4) {
          data[i] = (data[i] - 128) * contrast + 128;
          data[i + 1] = (data[i + 1] - 128) * contrast + 128;
          data[i + 2] = (data[i + 2] - 128) * contrast + 128;
        }

        for (let i = 0; i < data.length; i += 4) {
          let avg = 0.299 * data[i] + 0.587 * data[i + 1] + 0.114 * data[i + 2];
          data[i] = data[i + 1] = data[i + 2] = avg;
        }

        imageData = applyUnsharpMask(imageData);
        ctx.putImageData(imageData, 0, 0);
      }
    };

    img.src = src;
  }

  function handleWheel(e, isFront) {
    e.preventDefault();
    const zoomSetter = isFront ? setZoomFront : setZoomBack;
    zoomSetter((z) => Math.max(0.1, Math.min(5, z + (e.deltaY < 0 ? 0.1 : -0.1))));
  }

  function handleMouseDown(e, which) {
    setIsDragging(true);
    setDragStart({ x: e.clientX, y: e.clientY });
    setDragImage(which);
  }

  function handleMouseMove(e) {
    if (!isDragging) return;
    const dx = e.clientX - dragStart.x;
    const dy = e.clientY - dragStart.y;

    if (dragImage === "front") {
      setOffsetFront((prev) => ({ x: prev.x + dx, y: prev.y + dy }));
    } else if (dragImage === "back") {
      setOffsetBack((prev) => ({ x: prev.x + dx, y: prev.y + dy }));
    }
    setDragStart({ x: e.clientX, y: e.clientY });
  }

  function handleMouseUp() {
    setIsDragging(false);
    setDragImage(null);
  }

  function resetView(which) {
    if (which === "front") {
      setZoomFront(defaultZoom.current.front);
      setOffsetFront({ x: 0, y: 0 });
    } else {
      setZoomBack(defaultZoom.current.back);
      setOffsetBack({ x: 0, y: 0 });
    }
  }

  function renderCanvasBlock(label, canvasRef, isFiltered, toggleFilter, zoom, onWheel, onMouseDown, which, notes, setNotes) {
    return (
      <div style={{ margin: 20, display: "flex", flexDirection: "column", alignItems: "center" }}>
        <div>{label}</div>
        <div
          onWheel={onWheel}
          onMouseDown={onMouseDown}
          style={{
            width: 400,
            height: 600,
            border: "2px solid black",
            overflow: "hidden",
            position: "relative",
            cursor: isDragging ? "grabbing" : "grab",
          }}
        >
          <canvas ref={canvasRef} style={{ position: "absolute", top: 0, left: 0 }} />
        </div>
        <div style={{ marginTop: 10 }}>
          <button onClick={toggleFilter} style={{ marginRight: 10 }}>
            {isFiltered ? "Disable Filters" : "Enable Filters"}
          </button>
          <button onClick={() => resetView(which)}>Reset View</button>
        </div>
        <div style={{ marginTop: 20, width: "100%", maxWidth: 400 }}>
          <label>Corners:</label>
          <input type="text" value={notes.corners} onChange={(e) => setNotes({ ...notes, corners: e.target.value })} style={{ width: "100%" }} />
          <label>Edges:</label>
          <input type="text" value={notes.edges} onChange={(e) => setNotes({ ...notes, edges: e.target.value })} style={{ width: "100%" }} />
          <label>Surface Marks/Scratches:</label>
          <input type="text" value={notes.surface} onChange={(e) => setNotes({ ...notes, surface: e.target.value })} style={{ width: "100%" }} />
        </div>
      </div>
    );
  }

  const handleNext = () => {
    navigate("/summary");
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "linear-gradient(135deg, #f0f8ff, #4caf50)",
        fontFamily: "Arial",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        padding: 40,
      }}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp}
    >
      <h2>Surface Checker</h2>
      <div style={{ display: "flex" }}>
        {renderCanvasBlock(
          "Front of Card",
          frontCanvasRef,
          frontFiltered,
          () => setFrontFiltered((prev) => !prev),
          zoomFront,
          (e) => handleWheel(e, true),
          (e) => handleMouseDown(e, "front"),
          "front",
          frontNotes,
          setFrontNotes
        )}
        {renderCanvasBlock(
          "Back of Card",
          backCanvasRef,
          backFiltered,
          () => setBackFiltered((prev) => !prev),
          zoomBack,
          (e) => handleWheel(e, false),
          (e) => handleMouseDown(e, "back"),
          "back",
          backNotes,
          setBackNotes
        )}
      </div>

      {/* ✅ New "Next" Button */}
      <button
        onClick={handleNext}
        style={{
          marginTop: 30,
          padding: "12px 25px",
          fontSize: "1rem",
          backgroundColor: "#4caf50",
          color: "white",
          border: "none",
          borderRadius: 6,
          cursor: "pointer",
        }}
      >
        Next
      </button>
    </div>
  );
}
