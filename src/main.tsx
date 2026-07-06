import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { HashRouter, Route, Routes } from 'react-router-dom';
import '@fontsource/secular-one';
import '@fontsource-variable/rubik';
import '@fontsource/ibm-plex-mono';
import './i18n';
import './global.css';
import Home from './pages/Home';
import HilbertHotel from './pages/HilbertHotel';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <HashRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/infinity" element={<HilbertHotel />} />
      </Routes>
    </HashRouter>
  </StrictMode>
);
