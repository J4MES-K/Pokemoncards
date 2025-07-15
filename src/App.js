import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Home from "./Home";
import Centering from "./Centering";
import SurfaceChecker from "./SurfaceChecker";

export default function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/centering" element={<Centering />} />
        <Route path="/surfacechecker" element={<SurfaceChecker />} />
      </Routes>
    </Router>
  );
}
