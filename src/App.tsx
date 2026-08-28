import React from 'react';
import { useHashRoute } from './lib/router';
import Landing from './Landing';
import Dashboard from './dashboard/Dashboard';

const App: React.FC = () => {
  const route = useHashRoute();

  if (route === '/dashboard') {
    return <Dashboard />;
  }

  return <Landing />;
};

export default App;