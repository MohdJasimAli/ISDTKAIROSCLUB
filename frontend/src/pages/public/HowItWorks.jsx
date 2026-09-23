import { Link } from 'react-router-dom';
import PageHeader from '../../components/PageHeader.jsx';
import Card from '../../components/ui/Card.jsx';
import Badge from '../../components/ui/Badge.jsx';
import SectionHeading from '../../components/ui/SectionHeading.jsx';
import { buttonStyles } from '../../components/ui/Button.jsx';
import { SUPPORT_OPTIONS, IDEA_STAGES } from '../../utils/constants.js';

const IDEA_JOURNEY = [
  { title: 'Submit your idea', desc: 'Problem, solution, impact, skills needed — one structured form.' },
  { title: 'Kairos reviews it', desc: 'The team studies feasibility, impact, and scope (usually within a week).' },
  { title: 'Approval', desc: 'Approved ideas become public and visible to potential teammates.' },
  { title: 'Find your team', desc: 'Students click “I’m Interested”; admins help match the right people.' },
  { title: 'Develop', desc: 'Build with guidance, resources, and check-ins from the Kairos team.' },
  { title: 'Prototype & showcase', desc: 'Ship a working demo and present it at club showcases & events.' },
  { title: 'Toward ISDT', desc: 'Strong projects may be recommended for ISDT review & mentorship.' },
];

const SKILLS_JOURNEY = [
  { title: 'Explore ideas', desc: 'Browse approved ideas looking for a problem you care about.' },
  { title: 'Find an interesting project', desc: 'Check the skills it needs against what you offer.' },
  { title: 'Express interest', desc: 'One click + a short message about what you bring.' },
  { title: 'Join the team', desc: 'Admins review matches and add you to the project team.' },
  { title: 'Build together', desc: 'Develop, learn, and grow your portfolio with a real team.' },
];

const STAGE_NOTE = 'Team formation is admin-assisted — no automatic assignment. Kairos reviews every match to keep teams balanced.';

export default function HowItWorks() {
  return (
    <div>
      <PageHeader
        eyebrow="How it works"
        title="Two journeys. One platform."
        description="Whether you have an idea or you have skills, there is a clear path for you at Kairos."
      />

      <section className="container-page py-16">
        <div className="grid gap-8 lg:grid-cols-2">
          {/* Journey 1 */}
          <div>
            <Badge variant="gradient">Journey A · I have an idea</Badge>
            <h2 className="mt-4 text-2xl font-extrabold">From idea to ISDT</h2>
            <ol className="mt-6 space-y-4">
              {IDEA_JOURNEY.map((s, i) => (
                <li key={s.title} className="flex gap-4">
                  <span className="flex size-8 shrink-0 items-center justify-center rounded-full bg-indigo-600 text-sm font-bold text-white">
                    {i + 1}
                  </span>
                  <Card padded={false} className="flex-1 p-4">
                    <p className="text-sm font-bold">{s.title}</p>
                    <p className="mt-1 text-sm text-slate-500">{s.desc}</p>
                  </Card>
                </li>
              ))}
            </ol>
          </div>

          {/* Journey 2 */}
          <div>
            <Badge variant="info">Journey B · I have skills</Badge>
            <h2 className="mt-4 text-2xl font-extrabold">From browsing to building</h2>
            <ol className="mt-6 space-y-4">
              {SKILLS_JOURNEY.map((s, i) => (
                <li key={s.title} className="flex gap-4">
                  <span className="flex size-8 shrink-0 items-center justify-center rounded-full bg-violet-600 text-sm font-bold text-white">
                    {i + 1}
                  </span>
                  <Card padded={false} className="flex-1 p-4">
                    <p className="text-sm font-bold">{s.title}</p>
                    <p className="mt-1 text-sm text-slate-500">{s.desc}</p>
                  </Card>
                </li>
              ))}
            </ol>
            <p className="mt-4 rounded-xl bg-sky-50 p-4 text-sm text-sky-800 ring-1 ring-inset ring-sky-600/20">
              {STAGE_NOTE}
            </p>
          </div>
        </div>
      </section>

      <section className="bg-white py-16 ring-1 ring-slate-200/60">
        <div className="container-page grid gap-10 lg:grid-cols-2">
          <div>
            <SectionHeading align="left" eyebrow="Development stages" title="Where ideas are today" />
            <div className="mt-6 flex flex-wrap gap-2">
              {IDEA_STAGES.map((s) => (
                <Badge key={s.value} variant="info">{s.label}</Badge>
              ))}
            </div>
            <p className="mt-4 text-sm leading-relaxed text-slate-500">
              Every submitted idea starts as <strong>Pending review</strong> and moves through
              review → approval → team formation → development → testing → prototype → showcase.
            </p>
          </div>
          <div>
            <SectionHeading align="left" eyebrow="Support available" title="What you can ask for" />
            <div className="mt-6 flex flex-wrap gap-2">
              {SUPPORT_OPTIONS.map((s) => (
                <Badge key={s} variant="default">{s}</Badge>
              ))}
            </div>
            <p className="mt-4 text-sm leading-relaxed text-slate-500">
              Select everything relevant when submitting — it helps us match mentors and teammates
              to your project faster.
            </p>
          </div>
        </div>
      </section>

      <section className="container-page py-16 text-center">
        <h2 className="text-2xl font-extrabold">Ready to start?</h2>
        <div className="mt-6 flex flex-wrap justify-center gap-3">
          <Link to="/ideas/submit" className={buttonStyles({ size: 'lg' })}>Submit your idea</Link>
          <Link to="/ideas" className={buttonStyles({ variant: 'secondary', size: 'lg' })}>Explore ideas</Link>
        </div>
      </section>
    </div>
  );
}
