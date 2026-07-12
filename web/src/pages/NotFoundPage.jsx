import { Link, useNavigate } from "react-router-dom";
import { ArrowLeft, Compass } from "lucide-react";
import { Button } from "@/components/ui/button";

const NotFoundPage = () => {
  const navigate = useNavigate();

  return (
    <div className="flex min-h-svh flex-col items-center justify-center gap-6 p-6 text-center">
      <div className="rounded-full border border-border p-4">
        <Compass size={26} aria-hidden="true" className="text-muted-foreground" />
      </div>

      <div>
        <p className="text-sm font-medium text-muted-foreground">404</p>
        <h1 className="mt-1 text-2xl font-semibold tracking-tight">Page not found</h1>
        <p className="mt-2 max-w-sm text-sm text-muted-foreground">
          That page doesn&apos;t exist, or your role doesn&apos;t have access to it.
        </p>
      </div>

      <div className="flex gap-2">
        <Button variant="outline" onClick={() => navigate(-1)}>
          <ArrowLeft size={16} aria-hidden="true" />
          Go back
        </Button>
        {/* Every role lands on the dashboard, so it's always a safe target. */}
        <Button asChild>
          <Link to="/dashboard">Go to dashboard</Link>
        </Button>
      </div>
    </div>
  );
};

export default NotFoundPage;
