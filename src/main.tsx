import { StrictMode, Suspense } from 'react';
import { createRoot } from 'react-dom/client';
import { HashRouter, Navigate, Route, Routes } from 'react-router-dom';
import '@fontsource/secular-one';
import '@fontsource/suez-one';
import '@fontsource-variable/rubik';
import '@fontsource-variable/fredoka';
import '@fontsource/amatic-sc/700.css';
import '@fontsource/ibm-plex-mono';
import './i18n';
import './global.css';
import Home from './pages/Home';
import Journal from './pages/Journal';
import { adventures } from './adventures';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <HashRouter>
      <Suspense fallback={null}>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/journal" element={<Journal />} />
          {adventures.map(({ id, path, Page }) =>
            path && Page ? <Route key={id} path={path} element={<Page />} /> : null
          )}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Suspense>
    </HashRouter>
  </StrictMode>
);
