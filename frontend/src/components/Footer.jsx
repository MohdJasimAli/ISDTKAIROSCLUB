import { Link } from 'react-router-dom';
import Logo from './Logo.jsx';

const QUICK = [
  { to: '/about', label: 'About Kairos' },
  { to: '/how-it-works', label: 'How It Works' },
  { to: '/ideas', label: 'Explore Ideas' },
  { to: '/projects', label: 'Projects' },
];
const COMMUNITY = [
  { to: '/events', label: 'Events' },
  { to: '/team', label: 'Our Team' },
  { to: '/join', label: 'Join / Volunteer' },
  { to: '/contact', label: 'Contact' },
];
const PATHWAY = ['Students', 'Kairos Club', 'ISDT', 'INTACT'];

export default function Footer() {
  return (
    <footer className="bg-slate-950 text-slate-300" aria-label="Site footer">
      <div className="border-b border-white/5">
        <nav className="container-page flex flex-wrap items-center justify-center gap-x-3 gap-y-2 py-4 text-sm" aria-label="Kairos pathway">
          {PATHWAY.map((step, index) => (
            <span key={step} className="flex items-center gap-3">
              <span className={index === 1 ? 'font-semibold text-indigo-400' : 'text-slate-400'}>{step}</span>
              {index < PATHWAY.length - 1 && <span className="text-slate-600" aria-hidden="true">→</span>}
            </span>
          ))}
        </nav>
      </div>
      <div className="container-page grid gap-10 py-12 sm:grid-cols-2 lg:grid-cols-4">
        <div>
          <Logo tone="light" subtitle={null} />
          <p className="mt-4 text-sm leading-relaxed text-slate-400">
            A student-driven development & innovation initiative — the nurturing bridge between
            talented students and ISDT, Department of Computer Science, Integral University.
          </p>
        </div>
        <FooterColumn title="Platform" links={QUICK} />
        <FooterColumn title="Community" links={COMMUNITY} />
        <section aria-labelledby="footer-contact-heading">
          <h2 id="footer-contact-heading" className="text-sm font-bold uppercase tracking-wider text-slate-400">Get in touch</h2>
          <ul className="mt-4 space-y-2 text-sm text-slate-400">
            <li>Dept. of Computer Science</li>
            <li>Integral University, Lucknow</li>
            <li>kairos@isdt.club (coming soon)</li>
          </ul>
        </section>
      </div>
      <div className="border-t border-white/5">
        <div className="safe-bottom container-page flex flex-col items-center justify-between gap-2 py-5 text-center text-xs text-slate-500 sm:flex-row sm:text-left">
          <p>© {new Date().getFullYear()} ISDT Kairos Club. Built for students, by students.</p>
          <p>Ideas + People + Technology + Development + Impact</p>
        </div>
      </div>
    </footer>
  );
}

function FooterColumn({ title, links }) {
  return (
    <nav aria-label={title}>
      <h2 className="text-sm font-bold uppercase tracking-wider text-slate-400">{title}</h2>
      <ul className="mt-4 space-y-2.5">
        {links.map((link) => (
          <li key={link.to}>
            <Link to={link.to} className="inline-flex min-h-9 items-center text-sm text-slate-400 transition hover:text-white">
              {link.label}
            </Link>
          </li>
        ))}
      </ul>
    </nav>
  );
}
