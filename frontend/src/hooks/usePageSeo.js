import { useEffect } from 'react';

const SITE_NAME = 'ISDT Kairos Club';

function setMeta(selector, attributes) {
  let element = document.head.querySelector(selector);
  if (!element) {
    element = document.createElement(selector.startsWith('link') ? 'link' : 'meta');
    document.head.appendChild(element);
  }
  Object.entries(attributes).forEach(([name, value]) => element.setAttribute(name, value));
}

/** Optional page-level metadata for records that load after the route shell renders. */
export default function usePageSeo({ title, description, type = 'website' } = {}) {
  useEffect(() => {
    if (!title) return;
    const fullTitle = `${title} | ${SITE_NAME}`;
    const rawDescription = typeof description === 'string' ? description.trim() : '';
    const cleanDescription = rawDescription || `Explore this ${title.toLowerCase()} on ${SITE_NAME}.`;

    document.title = fullTitle;
    setMeta('meta[name="description"]', { name: 'description', content: cleanDescription.slice(0, 160) });
    setMeta('meta[property="og:title"]', { property: 'og:title', content: fullTitle });
    setMeta('meta[property="og:description"]', { property: 'og:description', content: cleanDescription.slice(0, 160) });
    setMeta('meta[property="og:type"]', { property: 'og:type', content: type });
    setMeta('meta[name="twitter:title"]', { name: 'twitter:title', content: fullTitle });
    setMeta('meta[name="twitter:description"]', { name: 'twitter:description', content: cleanDescription.slice(0, 160) });
    setMeta('meta[name="twitter:url"]', { name: 'twitter:url', content: window.location.href });
  }, [title, description, type]);
}
