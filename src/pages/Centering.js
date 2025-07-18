import React, { useRef, useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";

const DraggableLine = ({
  axis,
  pixelPos,
  onLineDrag,
  containerRef,
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
      axis === "horizontal" ? e.clientY - rect.top : e.clientX - rect.left;
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

  const style = {
    position: "absolute",
    backgroundColor: lineType === "inner" ? "blue" : "red",
    cursor: axis === "horizontal" ? "row-resize" : "col-resize",
    zIndex: 10,
  };

  if (axis === "horizontal") {
    Object.assign(style, { top: pixelPos, left: 0, right: 0, height: 2 });
  } else {
    Object.assign(style, { left: pixelPos, top: 0, bottom: 0, width: 2 });
  }

  return <div style={style} onMouseDown={handleMouseDown} />;
};

const getLineType = (key) => (key.endsWith("1") ? "outer" : "inner");

function calculateRatios(lines) {
  // lines are relative (0 to 1)
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
}

export default function Centering() {
  const navigate = useNavigate();
  const containerSize = { width: 400, height: 600 };

  const createImageState = () => ({
    image: null,
    zoom: 1,
    offset: { x: 0, y: 0 },
    rotation: 0,
    dragging: false,
    startDrag: null,
    // lines stored as relative positions (0 to 1)
    lines: {
      top1: 0.13,
      top2: 0.18,
      bottom1: 0.83,
      bottom2: 0.78,
      left1: 0.13,
      left2: 0.18,
      right1: 0.88,
      right2: 0.83,
    },
  });

  const [front, setFront] = useState(createImageState());
  const [back, setBack] = useState(createImageState());
  const frontRef = useRef(null);
  const backRef = useRef(null);
  const [frontNaturalSize, setFrontNaturalSize] = useState({ width: 0, height: 0 });
  const [backNaturalSize, setBackNaturalSize] = useState({ width: 0, height: 0 });

  const computeZoom = (naturalSize) => {
    if (!naturalSize.width || !naturalSize.height) return 1;
    return Math.min(
      containerSize.width / naturalSize.width,
      containerSize.height / naturalSize.height
    );
  };

  const handleUpload = (e, setState, setNaturalSize) => {
    const file = e.target.files[0];
    if (file) {
      const url = URL.createObjectURL(file);
      const img = new Image();
      img.onload = () => {
        setNaturalSize({ width: img.width, height: img.height });
        const zoom = computeZoom({ width: img.width, height: img.height });
        const offsetX = (containerSize.width - img.width * zoom) / 2;
        const offsetY = (containerSize.height - img.height * zoom) / 2;
        setState((prev) => ({
          ...prev,
          image: url,
          zoom,
          offset: { x: offsetX, y: offsetY },
          rotation: 0,
        }));
      };
      img.src = url;
    }
  };

  const handleMouseMove = useCallback((e, state, setState) => {
    if (!state.dragging || !state.startDrag) return;
    const dx = e.clientX - state.startDrag.x;
    const dy = e.clientY - state.startDrag.y;
    setState((prev) => ({
      ...prev,
      offset: { x: prev.offset.x + dx, y: prev.offset.y + dy },
      startDrag: { x: e.clientX, y: e.clientY },
    }));
  }, []);

  const handleMouseUp = (setState) => {
    setState((prev) => ({ ...prev, dragging: false, startDrag: null }));
  };

  const handleWheel = (e, setState) => {
    e.preventDefault();
    const delta = e.deltaY < 0 ? 0.05 : -0.05;
    setState((prev) => ({
      ...prev,
      zoom: Math.max(0.1, prev.zoom + delta),
    }));
  };

  // Converts relative line position to pixel position on screen
  function getPixelPos(lineKey, relPos, naturalSize, zoom, offset) {
    if (lineKey.startsWith("top") || lineKey.startsWith("bottom")) {
      return offset.y + relPos * naturalSize.height * zoom;
    } else if (lineKey.startsWith("left") || lineKey.startsWith("right")) {
      return offset.x + relPos * naturalSize.width * zoom;
    }
    return 0;
  }

  // Converts pixel position back to relative line position (0 to 1)
  function getRelativePos(lineKey, pixelPos, naturalSize, zoom, offset) {
    if (lineKey.startsWith("top") || lineKey.startsWith("bottom")) {
      return (pixelPos - offset.y) / (naturalSize.height * zoom);
    } else if (lineKey.startsWith("left") || lineKey.startsWith("right")) {
      return (pixelPos - offset.x) / (naturalSize.width * zoom);
    }
    return 0;
  }

  const renderImageBlock = (label, state, setState, ref, naturalSize) => {
    const ratios = calculateRatios(state.lines);

    const baseWidth = naturalSize.width || containerSize.width;
    const baseHeight = naturalSize.height || containerSize.height;

    return (
      <div
        style={{
          margin: 20,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          position: "relative",
        }}
        key={label}
      >
        <div style={{ fontWeight: "bold", marginBottom: 8 }}>
          Left/Right: {ratios.horizontalRatio[0]}% / {ratios.horizontalRatio[1]}%
          <br />
          Top/Bottom: {ratios.verticalRatio[0]}% / {ratios.verticalRatio[1]}%
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
            backgroundColor: "#f9f9f9",
          }}
          onWheel={(e) => handleWheel(e, setState)}
          onMouseDown={(e) =>
            setState((prev) => ({
              ...prev,
              dragging: true,
              startDrag: { x: e.clientX, y: e.clientY },
            }))
          }
        >
          {state.image && (
            <img
              src={state.image}
              alt="card"
              style={{
                position: "absolute",
                left: state.offset.x,
                top: state.offset.y,
                width: naturalSize.width * state.zoom,
                height: naturalSize.height * state.zoom,
                pointerEvents: "none",
                transform: `rotate(${state.rotation}deg)`,
                transformOrigin: "center center",
              }}
              draggable={false}
            />
          )}

          {Object.entries(state.lines).map(([key, relPos]) => {
            const pixelPos = (() => {
              if (state.image) {
                return getPixelPos(key, relPos, naturalSize, state.zoom, state.offset);
              } else {
                if (key.startsWith("top") || key.startsWith("bottom")) {
                  return relPos * baseHeight;
                } else if (key.startsWith("left") || key.startsWith("right")) {
                  return relPos * baseWidth;
                }
                return 0;
              }
            })();

            return (
              <DraggableLine
                key={key}
                axis={key.startsWith("left") || key.startsWith("right") ? "vertical" : "horizontal"}
                pixelPos={pixelPos}
                onLineDrag={(newPixelPos) => {
                  let newRelPos;
                  if (state.image) {
                    newRelPos = getRelativePos(key, newPixelPos, naturalSize, state.zoom, state.offset);
                  } else {
                    if (key.startsWith("top") || key.startsWith("bottom")) {
                      newRelPos = newPixelPos / baseHeight;
                    } else if (key.startsWith("left") || key.startsWith("right")) {
                      newRelPos = newPixelPos / baseWidth;
                    } else {
                      newRelPos = 0;
                    }
                  }
                  newRelPos = Math.min(1, Math.max(0, newRelPos));
                  setState((prev) => ({
                    ...prev,
                    lines: { ...prev.lines, [key]: newRelPos },
                  }));
                }}
                containerRef={ref}
                lineType={getLineType(key)}
              />
            );
          })}
        </div>

        <input
          type="file"
          onChange={(e) =>
            label === "Front of Card"
              ? handleUpload(e, setFront, setFrontNaturalSize)
              : handleUpload(e, setBack, setBackNaturalSize)
          }
          style={{ marginTop: 10 }}
          accept="image/*"
        />

        {/* Rotation slider */}
        <div style={{ marginTop: 10, width: "100%" }}>
          <label style={{ fontWeight: "bold" }}>Rotation: </label>
          <input
            type="range"
            min={-15}
            max={15}
            step={0.1}
            value={state.rotation}
            onChange={(e) =>
              setState((prev) => ({
                ...prev,
                rotation: parseFloat(e.target.value),
              }))
            }
            style={{ width: "100%" }}
          />
          <div style={{ fontSize: "0.9em", textAlign: "center" }}>{state.rotation.toFixed(1)}°</div>
        </div>
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
        frontRotation: front.rotation,
        backRotation: back.rotation,
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
        gap: 40,
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
      <div
        style={{
          width: 220,
          backgroundColor: "rgba(255, 255, 255, 0.9)",
          borderRadius: 10,
          padding: 20,
          fontSize: 16,
          lineHeight: 1.4,
          boxShadow: "0 4px 8px rgba(0,0,0,0.1)",
          color: "#333",
          userSelect: "none",
          height: "fit-content",
          fontWeight: "bold",
        }}
      >
        PSA 10 - Front of Card
        <br />
        55/45% (Within 10%)
      </div>

      {renderImageBlock("Front of Card", front, setFront, frontRef, frontNaturalSize)}
      {renderImageBlock("Back of Card", back, setBack, backRef, backNaturalSize)}

      <div
        style={{
          width: 300,
          backgroundColor: "rgba(255, 255, 255, 0.9)",
          borderRadius: 10,
          padding: 20,
          fontSize: 14,
          lineHeight: 1.5,
          boxShadow: "0 4px 8px rgba(0,0,0,0.1)",
          color: "#333",
          userSelect: "none",
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
