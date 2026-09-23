import { useEffect } from 'react';

/** Adds lightweight structured data for a loaded student project. */
export default function ProjectSchema({ project }) {
  useEffect(() => {
    const existing = document.getElementById('kairos-project-schema');
    if (!project) {
      existing?.remove();
      return undefined;
    }

    const script = existing ?? document.createElement('script');
    script.id = 'kairos-project-schema';
    script.type = 'application/ld+json';
    script.textContent = JSON.stringify({
      '@context': 'https://schema.org',
      '@type': 'CreativeWork',
      name: project.name,
      description: project.description,
      url: window.location.href,
      creator: { '@type': 'Organization', name: 'ISDT Kairos Club' },
    });
    if (!existing) document.head.appendChild(script);

    return () => script.remove();
  }, [project]);

  return null;
}
