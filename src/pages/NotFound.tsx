import { useLocation, Link } from "react-router-dom";
import { useEffect } from "react";
import { AppLayout } from "@/components/layout/AppLayout";
import { Button } from "@/components/ui/button";

const NotFound = () => {
  const location = useLocation();

  useEffect(() => {
    console.error("404 Error: User attempted to access non-existent route:", location.pathname);
  }, [location.pathname]);

  return (
    <AppLayout>
      <main className="pt-24 pb-16 relative z-10">
        <div className="container mx-auto px-4 flex items-center justify-center min-h-[60vh]">
          <div className="app-surface-strong p-10 text-center max-w-md">
            <h1 className="mb-4 text-4xl font-semibold">404</h1>
            <p className="mb-6 text-muted-foreground">Oops! Page not found</p>
            <Button asChild>
              <Link to="/">Return to Home</Link>
            </Button>
          </div>
        </div>
      </main>
    </AppLayout>
  );
};

export default NotFound;
