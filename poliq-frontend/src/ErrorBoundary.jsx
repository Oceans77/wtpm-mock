// src/ErrorBoundary.jsx
import React from 'react';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error) {
    // Update state so the next render will show the fallback UI
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    // You can also log the error to an error reporting service
    console.error("React Error Boundary caught an error:", error, errorInfo);
    this.setState({ errorInfo });
  }

  render() {
    if (this.state.hasError) {
      // You can render any custom fallback UI
      return (
        <div className="p-8 bg-red-50 text-red-800 rounded-lg max-w-4xl mx-auto my-8">
          <h2 className="text-2xl font-bold mb-4">Something went wrong</h2>
          <div className="mb-4">
            <p className="font-semibold">Error:</p>
            <pre className="bg-white p-4 rounded overflow-auto text-sm">
              {this.state.error && this.state.error.toString()}
            </pre>
          </div>
          {this.state.errorInfo && (
            <div className="mb-4">
              <p className="font-semibold">Component Stack:</p>
              <pre className="bg-white p-4 rounded overflow-auto text-sm max-h-96">
                {this.state.errorInfo.componentStack}
              </pre>
            </div>
          )}
          <button 
            className="mt-4 px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
            onClick={() => window.location.reload()}
          >
            Reload Page
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
