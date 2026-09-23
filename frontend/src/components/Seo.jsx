import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

const SITE_NAME = 'ISDT Kairos Club';
const DEFAULT_DESCRIPTION =
  'ISDT Kairos Club is a student idea and innovation platform for turning real problems into teams, prototypes, and impact.';

const ROUTE_META = [
  { test: (path) => path === '/', title: 'Ideas to Impact', description: DEFAULT_DESCRIPTION },
  {
    test: (path) => path === '/about',
    title: 'About Kairos',
    description: 'Learn how ISDT Kairos Club connects student talent, ideas, mentorship, and real-world impact.',
  },
  {
    test: (path) => path === '/how-it-works',
    title: 'How It Works',
    description: 'See how student ideas move from a real problem to a supported project with the right team.',
  },
  { test: (path) => path === '/projects', title: 'Projects', description: 'Explore student projects being built through ISDT Kairos Club.' },
  {
    test: (path) => path.startsWith('/projects/'),
    title: 'Project Details',
    description: 'Learn about a student project, its progress, technologies, and team on ISDT Kairos Club.',
  },
  { test: (path) => path === '/events', title: 'Events', description: 'Find workshops, hackathons, showcases, and other Kairos Club events.' },
  {
    test: (path) => path.startsWith('/events/'),
    title: 'Event Details',
    description: 'View event details and register with ISDT Kairos Club.',
  },
  { test: (path) => path === '/team', title: 'Our Team', description: 'Meet the student team behind ISDT Kairos Club.' },
  { test: (path) => path === '/contact', title: 'Contact', description: 'Contact the ISDT Kairos Club team with questions, ideas, or collaboration enquiries.' },
  { test: (path) => path === '/join', title: 'Join Kairos', description: 'Join ISDT Kairos Club and help turn student ideas into meaningful projects.' },
  { test: (path) => path === '/ideas', title: 'Explore Ideas', description: 'Discover approved student ideas and find a team where your skills can make an impact.' },
  { test: (path) => path === '/ideas/submit', title: 'Submit an Idea', description: 'Share a real-world problem and proposed solution with the Kairos Club team.' },
  { test: (path) => path === '/ideas/my', title: 'My Ideas', description: 'Track and manage your ideas on ISDT Kairos Club.' },
  { test: (path) => path.startsWith('/ideas/edit/'), title: 'Edit Idea', description: 'Update your Kairos Club idea and resubmit it for review.' },
  { test: (path) => path.startsWith('/ideas/'), title: 'Idea Details', description: 'Explore a student idea, its impact, and the skills needed to build it.' },
  { test: (path) => path === '/login', title: 'Log In', description: 'Log in to your ISDT Kairos Club account.', private: true },
  { test: (path) => path === '/register', title: 'Create Account', description: 'Create an account to submit ideas and find a project team.', private: true },
];

function setMeta(selector, attributes) {
  let element = document.head.querySelector(selector);
  if (!element) {
    element = document.createElement(selector.startsWith('link') ? 'link' : 'meta');
    document.head.appendChild(element);
  }
  Object.entries(attributes).forEach(([name, value]) => element.setAttribute(name, value));
}

function getRouteMeta(pathname) {
  const route = ROUTE_META.find((item) => item.test(pathname));
  if (route) return route;
  if (pathname.startsWith('/admin')) {
    return { title: 'Admin Dashboard', description: 'Manage the ISDT Kairos Club platform.', private: true };
  }
  if (pathname === '/dashboard' || pathname === '/requests/my') {
    return { title: 'Student Dashboard', description: 'Manage your Kairos Club activity.', private: true };
  }
  if (pathname === '/ui-kit') {
    return { title: 'UI Kit', description: 'ISDT Kairos Club interface components.', private: true };
  }
  return {
    title: 'Page Not Found',
    description: 'The page you requested could not be found.',
    private: true,
  };
}

/** Keeps document metadata in sync with client-side routes without adding a heavy SEO dependency. */
export default function Seo() {
  const { pathname } = useLocation();

  useEffect(() => {
    const route = getRouteMeta(pathname);
    const isPrivate = route.private || pathname.startsWith('/dashboard') || pathname.startsWith('/requests') || pathname.startsWith('/admin') || pathname.startsWith('/ideas/submit') || pathname.startsWith('/ideas/my') || pathname.startsWith('/ideas/edit');
    const fullTitle = route.title === 'Ideas to Impact' ? `${SITE_NAME} — Ideas to Impact` : `${route.title} | ${SITE_NAME}`;
    const canonicalUrl = `${window.location.origin}${pathname}`;

    document.title = fullTitle;
    document.documentElement.lang = 'en';

    setMeta('meta[name="description"]', { name: 'description', content: route.description });
    setMeta('meta[name="robots"]', {
      name: 'robots',
      content: isPrivate ? 'noindex, nofollow' : 'index, follow',
    });
    setMeta('meta[property="og:title"]', { property: 'og:title', content: fullTitle });
    setMeta('meta[property="og:description"]', { property: 'og:description', content: route.description });
    setMeta('meta[property="og:type"]', { property: 'og:type', content: 'website' });
    setMeta('meta[property="og:url"]', { property: 'og:url', content: canonicalUrl });
    setMeta('meta[property="og:site_name"]', { property: 'og:site_name', content: SITE_NAME });
    setMeta('meta[name="twitter:card"]', { name: 'twitter:card', content: 'summary' });
    setMeta('meta[name="twitter:title"]', { name: 'twitter:title', content: fullTitle });
    setMeta('meta[name="twitter:description"]', { name: 'twitter:description', content: route.description });
    setMeta('meta[name="twitter:url"]', { name: 'twitter:url', content: canonicalUrl });
    setMeta('link[rel="canonical"]', { rel: 'canonical', href: canonicalUrl });
  }, [pathname]);

  return null;
}
