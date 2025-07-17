import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

import Home from './pages/Home';
import Centering from './pages/Centering';
import SurfaceChecker from './pages/SurfaceChecker';
import SetCollecting from './pages/SetCollecting';
import SetDetails from './pages/SetDetails';
import Summary from './pages/Summary';

// Create a React Query client instance
const queryClient = new QueryClient();

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <Router>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/centering" element={<Centering />} />
          <Route path="/surfacechecker" element={<SurfaceChecker />} />
          <Route path="/set-collecting" element={<SetCollecting />} />
          <Route path="/set/:setId" element={<SetDetails />} />
          <Route path="/summary" element={<Summary />} />
        </Routes>
      </Router>
    </QueryClientProvider>
  );
}

export default App;
