import { useLocation } from "react-router-dom";
import { useEffect } from "react";
import { SplineBackground } from "@/components/shareroom/SplineBackground";

const NotFound = () => {
  const location = useLocation();

  useEffect(() => {
    console.error("404 Error: User attempted to access non-existent route:", location.pathname);
  }, [location.pathname]);

  return (
    <div className="min-h-screen w-full bg-gradient-to-b from-neutral-900 to-neutral-700 relative overflow-hidden">
      <SplineBackground />
      <div className="relative z-10 flex min-h-screen items-center justify-center">
        <div className="text-center">
          <h1 className="mb-4 text-4xl font-bold text-white">404</h1>
          <p className="mb-4 text-xl text-white/70">Oops! Page not found</p>
          <a href="/" className="text-white underline hover:text-white/80">
            Return to Home
          </a>
        </div>
      </div>
    </div>
  );
};

export default NotFound;
