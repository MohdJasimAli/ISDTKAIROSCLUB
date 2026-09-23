import { Suspense, useEffect, useRef } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import Navbar from '../components/Navbar.jsx';
import Footer from '../components/Footer.jsx';
import RouteLoading from '../components/RouteLoading.jsx';
import Seo from '../components/Seo.jsx';

function ScrollToTop() {
  const { pathname } = useLocation();

  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: 'auto' });
  }, [pathname]);

  return null;
}

export default function PublicLayout() {
  const { pathname } = useLocation();
  const mainRef = useRef(null);
  const firstRender = useRef(true);

  useEffect(() => {
    if (firstRender.current) {
      firstRender.current = false;
      return undefined;
    }
    const frame = window.setTimeout(() => mainRef.current?.focus({ preventScroll: true }), 0);
    return () => window.clearTimeout(frame);
  }, [pathname]);

  return (
    <div className="flex min-h-screen min-h-dvh flex-col">
      <Seo />
      <ScrollToTop />
      <a className="skip-link" href="#main-content">Skip to main content</a>
      <Navbar />
      <main ref={mainRef} id="main-content" aria-label="Main content" tabIndex={-1} className="flex-1 focus:outline-none">
        <Suspense fallback={<RouteLoading />}>
          <Outlet />
        </Suspense>
      </main>
      <Footer />
    </div>
  );
}
