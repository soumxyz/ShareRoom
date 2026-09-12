import Link from 'next/link';

export default function NotFound() {
  return (
    <div
      className="min-h-screen w-full relative overflow-hidden bg-cover bg-center bg-no-repeat"
      style={{ backgroundImage: "url('/bg-image.png')" }}
    >
      <div className="relative z-10 flex min-h-screen items-center justify-center">
        <div className="text-center">
          <h1 className="mb-4 text-4xl font-semibold text-white">404</h1>
          <p className="mb-4 text-xl text-white/70">Oops! Page not found</p>
          <Link href="/" className="text-white underline hover:text-white/80">
            Return to Home
          </Link>
        </div>
      </div>
    </div>
  );
}
