import PageHeader from '../../components/PageHeader.jsx';
import Card from '../../components/ui/Card.jsx';
import SectionHeading from '../../components/ui/SectionHeading.jsx';
import Logo from '../../components/Logo.jsx';

// Mission pillars — short, scannable "what we're here to do" statements.
const MISSION_PILLARS = [
  { title: 'Discover', desc: 'Find curious, skilled students — and the real problems worth solving.' },
  { title: 'Connect', desc: 'Match idea owners with the teammates, mentors, and guidance they lack.' },
  { title: 'Develop', desc: 'Take projects from rough idea to working, tested prototype.' },
  { title: 'Bridge', desc: 'Carry the strongest work toward ISDT, industry, and research.' },
];

function IconBulb(props) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} aria-hidden="true" {...props}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 18v-5.25m0 0a6.01 6.01 0 0 0 1.5-.189m-1.5.189a6.01 6.01 0 0 1-1.5-.189m3.75 7.478a12.06 12.06 0 0 1-4.5 0m3.75 2.383a14.4 14.4 0 0 1-3 0M14.25 18v-.192c0-.983.658-1.823 1.508-2.316a7.5 7.5 0 1 0-7.517 0c.85.493 1.509 1.333 1.509 2.316V18" />
    </svg>
  );
}

function IconUsers(props) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} aria-hidden="true" {...props}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M18 18.72a9.09 9.09 0 0 0 3.741-.479 3 3 0 0 0-4.682-2.72m.94 3.198.001.031c0 .225-.012.447-.037.666A11.94 11.94 0 0 1 12 21c-2.17 0-4.207-.576-5.963-1.584A6.06 6.06 0 0 1 6 18.719m12 0a5.97 5.97 0 0 0-.941-3.197m0 0A6 6 0 0 0 12 12.75a6 6 0 0 0-5.058 2.772m0 0a3 3 0 0 0-4.681 2.72 8.99 8.99 0 0 0 3.74.477m.94-3.197a5.97 5.97 0 0 0-.94 3.197M15 6.75a3 3 0 1 1-6 0 3 3 0 0 1 6 0Zm6 3a2.25 2.25 0 1 1-4.5 0 2.25 2.25 0 0 1 4.5 0Zm-13.5 0a2.25 2.25 0 1 1-4.5 0 2.25 2.25 0 0 1 4.5 0Z" />
    </svg>
  );
}

function IconRocket(props) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} aria-hidden="true" {...props}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M15.59 14.37a6 6 0 0 1-5.84 7.38v-4.8m5.84-2.58a15 15 0 0 0 6.16-12.12A15 15 0 0 0 9.63 8.41m5.96 5.96a14.93 14.93 0 0 1-5.841 2.58m-.119-8.54a6 6 0 0 0-7.381 5.84h4.8m2.581-5.84a14.93 14.93 0 0 0-2.58 5.84m2.699 2.7c-.103.021-.207.041-.311.06a15.09 15.09 0 0 1-2.448-2.448 14.9 14.9 0 0 1 .06-.312m-2.24 2.39a4.49 4.49 0 0 0-1.757 4.306 4.49 4.49 0 0 0 4.306-1.758M16.5 9a1.5 1.5 0 1 1-3 0 1.5 1.5 0 0 1 3 0Z" />
    </svg>
  );
}

function IconTrend(props) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} aria-hidden="true" {...props}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 18 9 11.25l4.306 4.306a11.95 11.95 0 0 1 5.814-5.518l2.74-1.22m0 0-5.94-2.28m5.94 2.28-2.28 5.941" />
    </svg>
  );
}

const VALUES = [
  { title: 'Ideas first', desc: 'Every submission is a chance worth reviewing — no idea is too small.', Icon: IconBulb },
  { title: 'Build together', desc: 'Collaboration across skills beats solo effort, always.', Icon: IconUsers },
  { title: 'Ship real impact', desc: 'We measure ourselves by what actually works in the world.', Icon: IconRocket },
  { title: 'Grow everyone', desc: 'Mentorship flows in every direction — seniors, juniors, alumni.', Icon: IconTrend },
];

const PURPOSE = [
  { title: 'Discover talent', desc: 'Find students who are curious, skilled, or simply eager to build.' },
  { title: 'Surface real problems', desc: 'Identify innovative ideas grounded in real-world needs.' },
  { title: 'Level up skills', desc: 'Improve technical and creative ability through hands-on development.' },
  { title: 'Connect complementary people', desc: 'Match idea-owners with developers, designers, and researchers.' },
  { title: 'Form teams', desc: 'Help students combine into balanced, capable project teams.' },
  { title: 'Ship real projects', desc: 'Turn promising ideas into working software & hardware.' },
  { title: 'Mentor & guide', desc: 'Provide mentorship, review, and development support along the way.' },
  { title: 'Bridge to ISDT', desc: 'Identify strong students/projects for ISDT — and beyond, toward INTACT.' },
];

const PATHWAY = [
  { step: 'Students', desc: 'Bring curiosity, ideas, and skills from across the department.' },
  { step: 'ISDT Kairos Club', desc: 'Nurture, review, team-up, and develop — the bridging platform.' },
  { step: 'ISDT', desc: 'Integral Student Development Team — mentorship and deeper involvement.' },
  { step: 'INTACT', desc: 'Industry-level and research-oriented opportunities for the strongest work.' },
];

export default function About() {
  return (
    <div>
      <PageHeader
        eyebrow="About Kairos"
        title="The nurturing bridge between students and ISDT"
        description="ISDT Kairos Club is a student-driven development and innovation initiative of the Department of Computer Science, Integral University — connected with ISDT (Integral Student Development Team)."
      />

      <section className="container-page py-16">
        <div className="grid gap-6 lg:grid-cols-3">
          <Card tone="dark" className="relative self-start overflow-hidden lg:col-span-1 lg:sticky lg:top-24">
            <div
              className="pointer-events-none absolute -right-12 -top-12 size-40 rounded-full bg-indigo-600/25 blur-2xl"
              aria-hidden="true"
            />
            <div className="relative">
              <Logo size="xl" to={null} tone="light" showWordmark={false} title={null} subtitle={null} />
              <p className="mt-5 text-xs font-bold uppercase tracking-widest text-indigo-400">Our mission</p>
              <p className="mt-3 text-lg font-semibold leading-relaxed">
                To give every student a real shot at building something that matters — by connecting
                ideas with the skills, teammates, and mentorship needed to turn them into working,
                impactful projects.
              </p>
              <ul className="mt-5 space-y-3 border-t border-white/10 pt-4">
                {MISSION_PILLARS.map((p) => (
                  <li key={p.title} className="flex gap-3">
                    <span
                      className="mt-1 size-2 shrink-0 rounded-full bg-gradient-to-br from-indigo-400 to-violet-400"
                      aria-hidden="true"
                    />
                    <span>
                      <span className="block text-sm font-bold">{p.title}</span>
                      <span className="block text-sm leading-relaxed text-slate-400">{p.desc}</span>
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          </Card>
          <div className="lg:col-span-2">
            <SectionHeading
              align="left"
              eyebrow="What we do"
              title="A bridging platform, not just a club"
            />
            <div className="mt-6 grid gap-4 sm:grid-cols-2">
              {PURPOSE.map((p) => (
                <Card key={p.title} padded={false} className="p-4">
                  <h3 className="text-sm font-bold">{p.title}</h3>
                  <p className="mt-1 text-sm leading-relaxed text-slate-500">{p.desc}</p>
                </Card>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="bg-white py-16 ring-1 ring-slate-200/60">
        <div className="container-page">
          <SectionHeading
            eyebrow="The pathway"
            title="Students → Kairos → ISDT → INTACT"
            description="Kairos is stage one of a longer development journey. Being connected with ISDT means a project has been identified for further review and mentorship — not automatic admission."
          />
          <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {PATHWAY.map((p, i) => (
              <Card key={p.step} className="relative">
                <span className="text-xs font-bold text-indigo-600">STEP {i + 1}</span>
                <h3 className="mt-1.5 text-lg font-extrabold">{p.step}</h3>
                <p className="mt-1.5 text-sm leading-relaxed text-slate-500">{p.desc}</p>
                {i < PATHWAY.length - 1 && (
                  <span className="absolute -right-3 top-1/2 hidden -translate-y-1/2 text-xl text-slate-300 lg:block">
                    →
                  </span>
                )}
              </Card>
            ))}
          </div>
        </div>
      </section>

      <section className="container-page py-16">
        <SectionHeading eyebrow="Values" title="What we stand for" />
        <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {VALUES.map((v) => (
            <Card key={v.title}>
              <span className="flex size-10 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-600 to-violet-600 text-white shadow-sm shadow-indigo-600/30">
                <v.Icon className="size-5" />
              </span>
              <h3 className="mt-4 text-base font-bold">{v.title}</h3>
              <p className="mt-1 text-sm leading-relaxed text-slate-500">{v.desc}</p>
            </Card>
          ))}
        </div>
      </section>
    </div>
  );
}
