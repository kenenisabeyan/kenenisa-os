import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { PlaceholderPage } from '../../pages/PlaceholderPage.js';

export const AppRouter: React.FC = () => {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<PlaceholderPage />} />
        <Route path="*" element={<PlaceholderPage />} />
      </Routes>
    </BrowserRouter>
  );
};
