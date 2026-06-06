import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import SEO, { getSeoForPath } from './SEO';

export default function RouteSeo() {
  const { pathname } = useLocation();
  const config = getSeoForPath(pathname);

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'instant' });
  }, [pathname]);

  return (
    <SEO
      title={config.title}
      description={config.description}
      keywords={config.keywords}
      path={config.path}
      type={config.type || 'website'}
      noindex={config.noindex}
    />
  );
}
