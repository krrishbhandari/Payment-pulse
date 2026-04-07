import { useEffect, useState } from 'react';
import Dashboard from './components/Dashboard';
import LandingPage from './components/LandingPage';

function AppContent() {
  const getRouteFromPath = () => (window.location.pathname === '/dashboard' ? 'dashboard' : 'landing');
  const [route, setRoute] = useState<'landing' | 'dashboard'>(getRouteFromPath);

  useEffect(() => {
    const handlePopState = () => setRoute(getRouteFromPath());

    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  const navigateTo = (nextRoute: 'landing' | 'dashboard') => {
    const nextPath = nextRoute === 'dashboard' ? '/dashboard' : '/';
    window.history.pushState({}, '', nextPath);
    setRoute(nextRoute);
  };

  if (route === 'dashboard') {
    return <Dashboard onGoHome={() => navigateTo('landing')} />;
  }

  return <LandingPage onGetStarted={() => navigateTo('dashboard')} />;
}

export default function App() {
  return <AppContent />;
}
