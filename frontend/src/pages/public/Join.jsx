import { Link } from 'react-router-dom';
import PageHeader from '../../components/PageHeader.jsx';
import Card from '../../components/ui/Card.jsx';
import SectionHeading from '../../components/ui/SectionHeading.jsx';
import { buttonStyles } from '../../components/ui/Button.jsx';

const PATHS = [
  {
    title: 'Kairos Member',
    desc: 'Full club membership — participate in reviews, events, and project teams.',
    tag: 'Most popular',
  },
  {
    title: 'Volunteer',
    desc: 'Help organize events, content, outreach, and logistics without a heavy time commitment.',
    tag: '',
  },
  {
    title: 'Technical contributor',
    desc: 'Jump straight into project teams as a developer, designer, researcher, or hardware tinkerer.',
    tag: '',
  },
];

const CRITERIA = ['Interest', 'Skills', 'Participation', 'Performance', 'Contribution'];

export default function Join() {
  return (
    <div>
      <PageHeader
        eyebrow="Join / Volunteer"
        title="Bring yourself to Kairos"
        description="Registration is an expression of interest — not automatic selection. The Kairos team reviews every applicant and picks based on fit."
      />

      <section className="container-page py-14">
        <div className="grid gap-5 lg:grid-cols-3">
          {PATHS.map((p) => (
            <Card key={p.title} className="relative">
              {p.tag && (
                <span className="absolute right-5 top-5 rounded-full bg-gradient-to-r from-indigo-600 to-violet-600 px-2.5 py-1 text-[10px] font-bold uppercase text-white">
                  {p.tag}
                </span>
              )}
              <h2 className="text-lg font-extrabold">{p.title}</h2>
              <p className="mt-2 text-sm leading-relaxed text-slate-500">{p.desc}</p>
            </Card>
          ))}
        </div>

        <div className="mt-12 grid gap-8 lg:grid-cols-2">
          <div>
            <SectionHeading align="left" eyebrow="Selection" title="How students are chosen" />
            <div className="mt-5 flex flex-wrap gap-2">
              {CRITERIA.map((c) => (
                <span key={c} className="rounded-full bg-slate-900 px-4 py-1.5 text-sm font-semibold text-white">
                  {c}
                </span>
              ))}
            </div>
            <p className="mt-4 text-sm leading-relaxed text-slate-500">
              Strong contributors may eventually be connected with <strong>ISDT</strong> — the
              Integral Student Development Team — for mentorship and bigger opportunities.
              Registration alone never guarantees selection; consistent contribution does.
            </p>
          </div>

          <Card tone="dark">
            <h2 className="text-lg font-extrabold">Ready?</h2>
            <p className="mt-2 text-sm text-slate-400">
              Create an account (2 minutes), complete your profile with your skills, and the team
              will take it from there. Already have one? Just log in.
            </p>
            <div className="mt-5 flex flex-wrap gap-3">
              <Link to="/register" className={buttonStyles()}>Create account</Link>
              <Link to="/login" className={buttonStyles({ variant: 'secondary' })}>Log in</Link>
            </div>
          </Card>
        </div>
      </section>
    </div>
  );
}
