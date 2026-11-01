import React, { Component, ErrorInfo, ReactNode } from 'react';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
}

class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false
  };

  public static getDerivedStateFromError(_: Error): State {
    return { hasError: true };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    const errorName = typeof error?.name === 'string' ? error.name : 'Error';
    const errorMessage = typeof error?.message === 'string' ? error.message : 'Unknown render error';
    const componentStack = typeof errorInfo.componentStack === 'string' ? errorInfo.componentStack : '';

    console.error(`[ErrorBoundary] ${errorName}: ${errorMessage}\n${componentStack}`);
  }

  public render() {
    if (this.state.hasError) {
      return (
        <div className="h-screen flex flex-col items-center justify-center p-4">
          <h1 className="text-2xl font-bold mb-4">Something went wrong.</h1>
          <button 
            className="px-4 py-2 bg-blue-500 text-white rounded"
            onClick={() => { this.setState({ hasError: false }); window.location.reload(); }}
          >
            Refresh Page
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;

