import { Home, Search } from 'lucide-react';
import { Link } from 'react-router-dom';
import Button from '../../components/ui/Button';

export default function NotFound() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 px-4">
      <div className="mx-auto w-full max-w-2xl text-center relative">
        {/* 404 Illustration */}
        <div className="mb-8">
          <div className="relative mx-auto w-fit">
            <p className="text-[150px] leading-none font-bold text-gray-200 sm:text-[200px]">404</p>
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
              <div className="rounded-full bg-blue-100 p-8">
                <Search className="h-20 w-20 text-blue-600" strokeWidth={1.5} />
              </div>
            </div>
          </div>
        </div>

        {/* Heading */}
        <h1 className="mb-4 text-4xl font-bold text-gray-900">Page Not Found</h1>

        {/* Description */}
        <p className="mb-3 text-lg text-gray-600">
          The page you are looking for doesn't exist or has been moved.
        </p>

        <p className="mb-8 text-sm text-gray-500">
          Please check the URL or return to the homepage to find what you're looking for.
        </p>

        {/* Action Buttons */}
        <div className="flex flex-col items-center justify-center gap-3 sm:flex-row">
          <Link to="/">
            <Button size="lg" variant="primary" className="flex items-center gap-2">
              <Home size={20} />
              Go to Home
            </Button>
          </Link>

          <Button size="lg" variant="outline" onClick={() => window.history.back()}>
            Go Back
          </Button>
        </div>

        {/* Additional Help */}
        <div className="mt-12 rounded-lg bg-white/50 p-6 backdrop-blur-sm">
          <p className="mb-3 text-sm font-semibold text-gray-700">Need help?</p>
          <p className="text-sm text-gray-600">
            Contact our support team or browse our help documentation.
          </p>
        </div>

        {/* Decorative Elements */}
        <div className="pointer-events-none absolute inset-0 overflow-hidden">
          <div className="absolute top-20 -left-4 h-72 w-72 rounded-full bg-purple-200/30 blur-3xl" />
          <div className="absolute -right-4 bottom-20 h-72 w-72 rounded-full bg-blue-200/30 blur-3xl" />
        </div>
      </div>
    </div>
  );
}
