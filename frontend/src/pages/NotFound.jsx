import { Link } from 'react-router-dom';
import EmptyState from '../components/ui/EmptyState.jsx';
import { buttonStyles } from '../components/ui/Button.jsx';

export default function NotFound() {
  return (
    <div className="container-page py-24">
      <h1 className="sr-only">Page not found</h1>
      <EmptyState
        title="Page not found"
        description="The page you’re looking for may have moved, or the link may be incorrect."
        action={
          <Link to="/" className={buttonStyles()}>
            Back to home
          </Link>
        }
      />
    </div>
  );
}
