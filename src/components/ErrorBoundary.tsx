import { Component, ReactNode } from "react";

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
  name?: string;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

// Inline logger to avoid circular deps
const logError = (name: string, error: Error, info?: object) => {
  if (import.meta.env.DEV) {
    console.error(`[ErrorBoundary:${name}]`, error, info);
  }
};

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: object) {
    logError(this.props.name || "unknown", error, errorInfo);
  }

  handleRetry = () => {
    this.setState({ hasError: false, error: null });
  };

  render() {
    if (this.state.hasError) {
      return (
        this.props.fallback || (
          <div className="flex items-center justify-center p-8" role="alert">
            <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-6 text-center">
              <div className="text-red-500 text-5xl mb-3" aria-hidden="true">⚠️</div>
              <h2 className="text-lg font-semibold text-gray-800 mb-2">
                {this.props.name ? `${this.props.name} Error` : "Something went wrong"}
              </h2>
              <p className="text-sm text-gray-600 mb-4">
                {import.meta.env.DEV
                  ? this.state.error?.message || "An unexpected error occurred"
                  : "Terjadi kesalahan. Silakan muat ulang halaman."}
              </p>
              <div className="flex gap-2 justify-center">
                <button
                  onClick={this.handleRetry}
                  className="px-4 py-2 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  Retry
                </button>
                <button
                  onClick={() => window.location.reload()}
                  className="px-4 py-2 bg-gray-200 text-gray-700 text-sm rounded-lg hover:bg-gray-300 transition-colors focus:outline-none focus:ring-2 focus:ring-gray-400"
                >
                  Reload Page
                </button>
              </div>
            </div>
          </div>
        )
      );
    }
    return this.props.children;
  }
}

/** Wraps a component with ErrorBoundary for isolated error handling */
export function withErrorBoundary<T extends object>(
  Component_: React.ComponentType<T>,
  name?: string,
  fallback?: ReactNode,
) {
  const Wrapped = (props: T) => (
    <ErrorBoundary name={name || Component_.displayName || Component_.name} fallback={fallback}>
      <Component_ {...props} />
    </ErrorBoundary>
  );
  Wrapped.displayName = `withErrorBoundary(${Component_.displayName || Component_.name || "Component"})`;
  return Wrapped;
}
