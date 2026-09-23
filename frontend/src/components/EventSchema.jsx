import { useEffect } from 'react';

/** Adds an Event JSON-LD block once event data is available. */
export default function EventSchema({ event }) {
  useEffect(() => {
    const existing = document.getElementById('kairos-event-schema');
    if (!event) {
      existing?.remove();
      return undefined;
    }

    const script = existing ?? document.createElement('script');
    script.id = 'kairos-event-schema';
    script.type = 'application/ld+json';
    script.textContent = JSON.stringify({
      '@context': 'https://schema.org',
      '@type': 'Event',
      name: event.title,
      description: event.description,
      startDate: event.startsAt,
      endDate: event.endsAt || event.startsAt,
      eventStatus: 'https://schema.org/EventScheduled',
      eventAttendanceMode: 'https://schema.org/OfflineEventAttendanceMode',
      location: event.venue ? { '@type': 'Place', name: event.venue } : undefined,
      url: window.location.href,
    });
    if (!existing) document.head.appendChild(script);

    return () => script.remove();
  }, [event]);

  return null;
}
