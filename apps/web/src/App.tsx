import React from 'react';
import { AppProviders } from './app/providers/index.js';
import { AppRouter } from './app/router/index.js';

export const App: React.FC = () => {
  return (
    <AppProviders>
      <AppRouter />
    </AppProviders>
  );
};

export default App;
