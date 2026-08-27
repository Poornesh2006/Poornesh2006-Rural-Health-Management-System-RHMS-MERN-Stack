import { Link } from "react-router-dom";
import { Button } from "../../components/ui/Button";
import { EmptyState } from "../../components/ui/EmptyState";

export function NotFoundPage() {
  return (
    <div className="flex min-h-screen items-center justify-center px-4">
      <div className="w-full max-w-xl">
        <EmptyState
          action={
            <Link to="/">
              <Button size="lg" type="button">Return to dashboard</Button>
            </Link>
          }
          description="The page you requested does not exist in the current RHMS navigation map."
          title="404 - Page not found"
        />
      </div>
    </div>
  );
}

export function AccessDeniedPage() {
  return (
    <div className="space-y-6">
      <EmptyState
        action={
          <Link to="/">
            <Button size="lg" type="button">Back to safe workspace</Button>
          </Link>
        }
        description="This role-aware page is reserved for a different permission level."
        title="Access denied"
      />
    </div>
  );
}

export function LoadingPage() {
  return (
    <div className="space-y-6">
      <EmptyState
        description="This loading page is part of the app shell and can be used for route-level suspense states."
        title="Preparing workspace"
      />
    </div>
  );
}
