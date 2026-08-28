import { useEffect, useState } from 'react';

export const PATH = {
  home: '#/',
  dashboard: '#/dashboard',
};

export const go = (path: string) => {
  window.location.hash = path;
};

export const useHashRoute = (): string => {
  const get = () => window.location.hash.replace(/^#/, '');
  const [route, setRoute] = useState<string>(get);
  useEffect(() => {
    const onChange = () => setRoute(get());
    window.addEventListener('hashchange', onChange);
    return () => window.removeEventListener('hashchange', onChange);
  }, []);
  return route;
};