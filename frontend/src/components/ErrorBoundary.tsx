import React, { Component, ReactNode } from 'react';
import { AlertTriangle, RefreshCw } from 'lucide-react';
import Button from './ui/Button';

interface ErrorBoundaryProps {
  children: ReactNode;
  fallback?: (error: Error, resetError: () => void) => ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
    };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return {
      hasError: true,
      error,
    };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('ErrorBoundary caught an error:', error, errorInfo);
  }

  resetError = () => {
    this.setState({
      hasError: false,
      error: null,
    });
  };

  render() {
    if (this.state.hasError && this.state.error) {
      if (this.props.fallback) {
        return this.props.fallback(this.state.error, this.resetError);
      }

      return (
        <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-red-50 via-orange-50 to-yellow-50 px-4">
          <div className="mx-auto w-full max-w-2xl text-center relative">
            {/* Icon */}
            <div className="mb-8 flex justify-center">
              <div className="rounded-full bg-red-100 p-6">
                <AlertTriangle className="h-16 w-16 text-red-600" strokeWidth={1.5} />
              </div>
            </div>

            {/* Heading */}
            <h1 className="mb-4 text-4xl font-bold text-gray-900">
              Oops! Something went wrong
            </h1>

            {/* Description */}
            <p className="mb-2 text-lg text-gray-600">
              We encountered an unexpected error while processing your request.
            </p>

            <p className="mb-8 text-sm text-gray-500">
              {this.state.error.message || 'An unexpected error occurred. Please try again.'}
            </p>

            {/* Action Buttons */}
            <div className="flex flex-col items-center justify-center gap-3 sm:flex-row">
              <Button
                size="lg"
                variant="primary"
                onClick={this.resetError}
                className="flex items-center gap-2"
              >
                <RefreshCw size={20} />
                Try Again
              </Button>

              <Button
                size="lg"
                variant="outline"
                onClick={() => (window.location.href = '/')}
              >
                Go to Home
              </Button>
            </div>

            {/* Additional Help */}
            <div className="mt-12 rounded-lg bg-white/50 p-6 backdrop-blur-sm">
              <p className="text-sm text-gray-600">
                If this problem persists, please contact our support team.
              </p>
            </div>

            {/* Decorative Elements */}
            <div className="pointer-events-none absolute inset-0 overflow-hidden">
              <div className="absolute top-20 -left-4 h-72 w-72 rounded-full bg-red-200/30 blur-3xl" />
              <div className="absolute -right-4 bottom-20 h-72 w-72 rounded-full bg-orange-200/30 blur-3xl" />
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
