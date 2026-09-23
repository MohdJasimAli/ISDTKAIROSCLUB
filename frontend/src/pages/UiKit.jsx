import { useState } from 'react';
import Button from '../components/ui/Button.jsx';
import Card from '../components/ui/Card.jsx';
import Badge from '../components/ui/Badge.jsx';
import Input from '../components/ui/Input.jsx';
import Textarea from '../components/ui/Textarea.jsx';
import Select from '../components/ui/Select.jsx';
import Field from '../components/ui/Field.jsx';
import Modal from '../components/ui/Modal.jsx';
import Spinner, { LoadingState } from '../components/ui/Spinner.jsx';
import Alert from '../components/ui/Alert.jsx';
import EmptyState from '../components/ui/EmptyState.jsx';
import SectionHeading from '../components/ui/SectionHeading.jsx';
import { IDEA_CATEGORIES, PROJECT_STATUSES } from '../utils/constants.js';

/** Dev-only showcase of every reusable design-system component. */
export default function UiKit() {
  const [modalOpen, setModalOpen] = useState(false);

  return (
    <div className="container-page py-14">
      <h1 className="sr-only">Kairos Club UI kit</h1>
      <SectionHeading
        eyebrow="Design system"
        title="UI Kit"
        description="Every reusable component, live. Used across the Kairos Club experience."
      />

      <section className="mt-10 space-y-4">
        <h2 className="text-lg font-bold">Buttons</h2>
        <div className="flex flex-wrap gap-3">
          <Button>Primary</Button>
          <Button variant="secondary">Secondary</Button>
          <Button variant="outline">Outline</Button>
          <Button variant="ghost">Ghost</Button>
          <Button variant="danger">Danger</Button>
          <Button isLoading>Saving…</Button>
          <Button size="sm">Small</Button>
          <Button size="lg">Large</Button>
        </div>
      </section>

      <section className="mt-10 space-y-4">
        <h2 className="text-lg font-bold">Badges — status themes</h2>
        <div className="flex flex-wrap gap-2">
          {PROJECT_STATUSES.map((s) => (
            <Badge key={s.value} status={s.value}>
              {s.label}
            </Badge>
          ))}
          <Badge variant="gradient">Gradient</Badge>
          <Badge variant="danger" dot>Error dot</Badge>
        </div>
      </section>

      <section className="mt-10 space-y-4">
        <h2 className="text-lg font-bold">Forms</h2>
        <Card className="grid gap-5 sm:grid-cols-2">
          <Field label="Full name" htmlFor="f-name" required hint="As per university records">
            <Input id="f-name" placeholder="Jane Student" />
          </Field>
          <Field label="Category" htmlFor="f-cat">
            <Select id="f-cat" defaultValue="">
              <option value="" disabled>Choose…</option>
              {IDEA_CATEGORIES.map((c) => (
                <option key={c.value} value={c.value}>{c.label}</option>
              ))}
            </Select>
          </Field>
          <Field label="Email" htmlFor="f-email" error="Enter a valid university email" className="sm:col-span-2">
            <Input id="f-email" type="email" invalid placeholder="bad-email" defaultValue="not-an-email" />
          </Field>
          <Field label="Problem statement" htmlFor="f-prob" className="sm:col-span-2">
            <Textarea id="f-prob" placeholder="What real-world problem does this solve?" />
          </Field>
        </Card>
      </section>

      <section className="mt-10 space-y-4">
        <h2 className="text-lg font-bold">Feedback states</h2>
        <div className="grid gap-3">
          <Alert variant="info" title="Heads up">This is an informational message.</Alert>
          <Alert variant="success" title="Approved">Your idea was approved and is now public.</Alert>
          <Alert variant="warning" title="Changes requested">Please revise the expected impact section.</Alert>
          <Alert variant="error" title="Submission failed">Something went wrong. Try again.</Alert>
        </div>
        <div className="flex items-center gap-6">
          <span className="flex items-center gap-2 text-sm text-slate-500">
            <Spinner size="sm" className="border-indigo-200 border-t-indigo-600" /> Spinner
          </span>
          <Button variant="secondary" onClick={() => setModalOpen(true)}>Open modal</Button>
        </div>
        <LoadingState label="Loading ideas…" />
        <EmptyState
          title="No ideas yet"
          description="Be the first — submit an idea and let the club help you build it."
          action={<Button>Submit an idea</Button>}
        />
      </section>

      <Modal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        title="Example modal"
        footer={
          <>
            <Button variant="secondary" onClick={() => setModalOpen(false)}>Cancel</Button>
            <Button onClick={() => setModalOpen(false)}>Confirm</Button>
          </>
        }
      >
        <p className="text-sm text-slate-600">
          Escape key and backdrop clicks close this dialog. Body scroll is locked while open.
        </p>
      </Modal>
    </div>
  );
}
