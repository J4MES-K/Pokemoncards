import React, { useRef, useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

const DraggableLine = ({
  axis,
  linePos,
  onLineDrag,
  containerRef,
  imgTransform,
  lineType,
}) => {
  const [dragging, setDragging] = useState(false);

  const handleMouseDown = (e) => {
    e.stopPropagation();
    setDragging(true);
  };

  const handleMouseMove = (e) => {
    if (!dragging || !containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();

    const pos =
      axis === "horizontal"
        ? (e.clientY - rect.top - imgTransform.offsetY) / imgTransform.scale
        : (e.clientX - rect.left - imgTransform.offsetX) / imgTransform.scale;

    onLineDrag(pos);
  };

  const handleMouseUp = () => setDragging(false);

  useEffect(() => {
    if (dragging) {
      window.addEventListener("mousemove", handleMouseMove);
      window.addEventListener("mouseup", handleMouseUp);
    }
    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseup", handleMouseUp);
    };
  }, [dragging]);

  const pos =
    axis === "horizontal"
      ? imgTransform.offsetY + linePos * imgTransform.scale
      : imgTransform.offsetX + linePos * imgTransform.scale;

  const style = {
    position: "absolute",
    backgroundColor: lineType === "inner" ? "blue" : "red",
    cursor: axis === "horizontal" ? "row-resize" : "col-resize",
    zIndex: 10,
  };

  if (axis === "horizontal") {
    Object.assign(style, { top: pos, left: 0, right: 0, height: 2 });
  } else {
    Object.assign(style, { left: pos, top: 0, bottom: 0, width: 2 });
  }

  return <div style={style} onMouseDown={handleMouseDown} />;
};

const getLineType = (key) => (key.endsWith("1") ? "outer" : "inner");

// Calculate ratios left/right top/bottom from pixel lines & image size
const calculateRatios = (lines) => {
  const left = lines.left2 - lines.left1;
  const right = lines.right1 - lines.right2;
  const top = lines.top2 - lines.top1;
  const bottom = lines.bottom1 - lines.bottom2;
  const horizontalTotal = left + right;
  const verticalTotal = top + bottom;

  return {
    horizontalRatio:
      horizontalTotal > 0
        ? [
            Math.round((left / horizontalTotal) * 100),
            Math.round((right / horizontalTotal) * 100),
          ]
        : [0, 0],
    verticalRatio:
      verticalTotal > 0
        ? [
            Math.round((top / verticalTotal) * 100),
            Math.round((bottom / verticalTotal) * 100),
          ]
        : [0, 0],
  };
};

// Convert lines from pixel values to ratios relative to image size
const pixelsToRatios = (lines, size) => ({
  left1: lines.left1 / size.width,
  left2: lines.left2 / size.width,
  right1: lines.right1 / size.width,
  right2: lines.right2 / size.width,
  top1: lines.top1 / size.height,
  top2: lines.top2 / size.height,
  bottom1: lines.bottom1 / size.height,
  bottom2: lines.bottom2 / size.height,
});

// Convert ratios back to pixel positions for current image size
const ratiosToPixels = (ratios, size) => ({
  left1: ratios.left1 * size.width,
  left2: ratios.left2 * size.width,
  right1: ratios.right1 * size.width,
  right2: ratios.right2 * size.width,
  top1: ratios.top1 * size.height,
  top2: ratios.top2 * size.height,
  bottom1: ratios.bottom1 * size.height,
  bottom2: ratios.bottom2 * size.height,
});

export default function Centering() {
  const navigate = useNavigate();
  const containerSize = { width: 400, height: 600 };

  // Create initial image state
  const createImageState = () => ({
    image: null,
    naturalSize: { width: 0, height: 0 },
    zoom: 1,
    offset: { x: 0, y: 0 },
    rotate: 0,
    dragging: false,
    startDrag: null,
    lines: {
      left1: 0,
      left2: 0,
      right1: 0,
      right2: 0,
      top1: 0,
      top2: 0,
      bottom1: 0,
      bottom2: 0,
    },
    linesRatio: null,
  });

  const [front, setFront] = useState(createImageState());
  const [back, setBack] = useState(createImageState());

  const frontRef = useRef(null);
  const backRef = useRef(null);

  // Upload handler with lines initialization and ratio management
  const handleUpload = (e, state, setState) => {
    const file = e.target.files[0];
    if (file) {
      const url = URL.createObjectURL(file);
      const img = new Image();

      img.onload = () => {
        setState((prev) => {
          let newLines;
          let newRatios;

          // Check if this is first upload (lines all zero)
          const firstUpload = Object.values(prev.lines).every((pos) => pos === 0);

          if (firstUpload) {
            // Initialize lines as sensible borders relative to image size
            const w = img.width;
            const h = img.height;
            newLines = {
              left1: w * 0.05,
              left2: w * 0.25,
              right1: w * 0.95,
              right2: w * 0.75,
              top1: h * 0.05,
              top2: h * 0.25,
              bottom1: h * 0.95,
              bottom2: h * 0.75,
            };
            newRatios = pixelsToRatios(newLines, { width: w, height: h });
          } else if (prev.linesRatio) {
            // Use stored ratios to calculate lines for new image size
            newLines = ratiosToPixels(prev.linesRatio, { width: img.width, height: img.height });
            newRatios = prev.linesRatio;
          } else {
            // Fallback to same as first upload initialization
            const w = img.width;
            const h = img.height;
            newLines = {
              left1: w * 0.05,
              left2: w * 0.25,
              right1: w * 0.95,
              right2: w * 0.75,
              top1: h * 0.05,
              top2: h * 0.25,
              bottom1: h * 0.95,
              bottom2: h * 0.75,
            };
            newRatios = pixelsToRatios(newLines, { width: w, height: h });
          }

          return {
            ...prev,
            image: url,
            naturalSize: { width: img.width, height: img.height },
            zoom: Math.min(containerSize.width / img.width, containerSize.height / img.height),
            offset: { x: 0, y: 0 },
            lines: newLines,
            linesRatio: newRatios,
          };
        });
      };

      img.src = url;
    }
  };

  const handleMouseDown = (e, state, setState) => {
    setState((prev) => ({
      ...prev,
      dragging: true,
      startDrag: { x: e.clientX, y: e.clientY },
    }));
  };

  const handleMouseMove = (e, state, setState) => {
    if (!state.dragging || !state.startDrag) return;
    const dx = e.clientX - state.startDrag.x;
    const dy = e.clientY - state.startDrag.y;
    setState((prev) => ({
      ...prev,
      offset: { x: prev.offset.x + dx, y: prev.offset.y + dy },
      startDrag: { x: e.clientX, y: e.clientY },
    }));
  };

  const handleMouseUp = (setState) => {
    setState((prev) => ({ ...prev, dragging: false, startDrag: null }));
  };

  const handleWheel = (e, state, setState) => {
    e.preventDefault();
    const delta = e.deltaY < 0 ? 0.05 : -0.05;
    setState((prev) => ({ ...prev, zoom: Math.max(0.1, prev.zoom + delta) }));
  };

  const handleLineDrag = (key, newPos, state, setState) => {
    // Clamp lines within image bounds
    const maxX = state.naturalSize.width;
    const maxY = state.naturalSize.height;

    let clampedPos = newPos;
    if (key.startsWith("left") || key.startsWith("right")) {
      clampedPos = Math.min(Math.max(newPos, 0), maxX);
    } else {
      clampedPos = Math.min(Math.max(newPos, 0), maxY);
    }

    // Update lines and also update ratios to keep relative positions
    const updatedLines = { ...state.lines, [key]: clampedPos };
    const updatedRatios = pixelsToRatios(updatedLines, state.naturalSize);

    setState((prev) => ({
      ...prev,
      lines: updatedLines,
      linesRatio: updatedRatios,
    }));
  };

  // Render single image container block
  const renderImageBlock = (label, state, setState, ref) => {
    const transform = {
      scale: state.zoom,
      offsetX: state.offset.x,
      offsetY: state.offset.y,
    };

    const ratios = calculateRatios(state.lines);

    // Calculate displayed image width/height maintaining aspect ratio, fitting container
    let displayedWidth = state.naturalSize.width * state.zoom;
    let displayedHeight = state.naturalSize.height * state.zoom;

    // Center image inside container (position relative to container top-left)
    // We use offset to allow user drag
    // Image is absolutely positioned relative to container

    return (
      <div
        style={{
          margin: 20,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          position: "relative",
        }}
      >
        <div style={{ fontWeight: "bold", marginBottom: 10 }}>{label}</div>

        <input
          type="range"
          min={-15}
          max={15}
          step={0.01}
          value={state.rotate}
          onChange={(e) => setState((prev) => ({ ...prev, rotate: Number(e.target.value) }))}
          style={{ marginBottom: 8, width: 300 }}
        />
        <div style={{ marginBottom: 8 }}>
          Left/Right Border: {ratios.horizontalRatio[0]}% / {ratios.horizontalRatio[1]}%
        </div>
        <div style={{ marginBottom: 8 }}>
          Top/Bottom Border: {ratios.verticalRatio[0]}% / {ratios.verticalRatio[1]}%
        </div>

        <div
          ref={ref}
          style={{
            width: containerSize.width,
            height: containerSize.height,
            border: "2px solid black",
            position: "relative",
            overflow: "hidden",
            cursor: state.dragging ? "grabbing" : "grab",
            userSelect: "none",
          }}
          onWheel={(e) => handleWheel(e, state, setState)}
          onMouseDown={(e) => handleMouseDown(e, state, setState)}
        >
          {state.image ? (
            <img
              src={state.image}
              alt="uploaded"
              style={{
                position: "absolute",
                left: state.offset.x,
                top: state.offset.y,
                width: displayedWidth,
                height: displayedHeight,
                userSelect: "none",
                transformOrigin: "center center",
                transform: `rotate(${state.rotate}deg)`,
                pointerEvents: "none",
              }}
              draggable={false}
            />
          ) : (
            <div
              style={{
                position: "absolute",
                left: 0,
                top: 0,
                width: containerSize.width,
                height: containerSize.height,
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                color: "#888",
              }}
            >
              Upload an image
            </div>
          )}

          {Object.entries(state.lines).map(([key, pos]) => (
            <DraggableLine
              key={key}
              axis={key.startsWith("left") || key.startsWith("right") ? "vertical" : "horizontal"}
              linePos={pos}
              onLineDrag={(newPos) => handleLineDrag(key, newPos, state, setState)}
              containerRef={ref}
              imgTransform={transform}
              lineType={getLineType(key)}
            />
          ))}
        </div>

        <input
          type="file"
          onChange={(e) => handleUpload(e, state, setState)}
          style={{ marginTop: 10 }}
        />
      </div>
    );
  };

  const handleNext = () => {
    if (!front.image || !back.image) {
      alert("Please upload both front and back images before continuing.");
      return;
    }

    navigate("/surfacechecker", {
      state: {
        frontImage: front.image,
        backImage: back.image,
        frontLines: front.lines,
        backLines: back.lines,
        frontZoom: front.zoom,
        backZoom: back.zoom,
        frontOffset: front.offset,
        backOffset: back.offset,
      },
    });
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "linear-gradient(135deg, #f0f8ff, #4caf50)",
        display: "flex",
        flexDirection: "row",
        justifyContent: "center",
        alignItems: "flex-start",
        padding: 40,
        fontFamily: "Arial",
        color: "#2e3a2f",
      }}
      onMouseMove={(e) => {
        handleMouseMove(e, front, setFront);
        handleMouseMove(e, back, setBack);
      }}
      onMouseUp={() => {
        handleMouseUp(setFront);
        handleMouseUp(setBack);
      }}
      onMouseLeave={() => {
        handleMouseUp(setFront);
        handleMouseUp(setBack);
      }}
    >
      <div style={{ display: "flex", flexDirection: "column" }}>
        {renderImageBlock("Front of Card", front, setFront, frontRef)}
      </div>

      <div style={{ display: "flex", flexDirection: "column" }}>
        {renderImageBlock("Back of Card", back, setBack, backRef)}
      </div>

      <div
        style={{
          width: 300,
          marginLeft: 40,
          backgroundColor: "rgba(255, 255, 255, 0.9)",
          borderRadius: 10,
          padding: 20,
          fontSize: 14,
          lineHeight: 1.5,
          boxShadow: "0 4px 8px rgba(0,0,0,0.1)",
          color: "#333",
          userSelect: "none",
          alignSelf: "center",
          height: "fit-content",
        }}
      >
        <p>
          <b style={{ color: "red" }}>Red outer border:</b> Align with the actual edge of your card.
        </p>
        <p>
          <b style={{ color: "blue" }}>Blue inner border:</b> Align with the edge of the printed image area on your card.
        </p>
        <p>These borders are crucial for calculating centering percentages.</p>

        <button
          onClick={handleNext}
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
          Next
        </button>
      </div>
    </div>
  );
}
