// components/ErrorBoundary.tsx
"use client";

import React, { Component, type ReactNode, type ErrorInfo } from "react";
import { AlertTriangle, RefreshCw } from "lucide-react";

interface Props {
  children?: ReactNode;
  fallback?: ReactNode;
  onError?: (error: Error, errorInfo: ErrorInfo) => void;
}

interface State {
  hasError: boolean;
  error?: Error;
}

/**
 * Reusable error boundary component for catching React errors.
 * Wrap sections or components that might fail to prevent the whole page from crashing.
 *
 * @example
 * <ErrorBoundary>
 *   <SomeComponent />
 * </ErrorBoundary>
 *
 * @example
 * <ErrorBoundary fallback={<div>Custom error UI</div>}>
 *   <SomeComponent />
 * </ErrorBoundary>
 */
export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("ErrorBoundary caught an error:", error, errorInfo);
    this.props.onError?.(error, errorInfo);
  }

  handleReset = () => {
    this.setState({ hasError: false, error: undefined });
  };

  render() {
    if (this.state.hasError) {
      // Custom fallback if provided
      if (this.props.fallback) {
        return this.props.fallback;
      }

      // Default fallback UI
      return (
        <div className="flex flex-col items-center justify-center rounded-xl border border-red-500/20 bg-red-500/5 p-8 text-center">
          <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-red-500/10">
            <AlertTriangle className="h-6 w-6 text-red-500" />
          </div>
          <h3 className="mb-2 text-lg font-semibold text-foreground">
            Something went wrong
          </h3>
          <p className="mb-4 text-sm text-muted-foreground">
            This section failed to load. Try refreshing.
          </p>
          <button
            onClick={this.handleReset}
            className="inline-flex items-center gap-2 rounded-lg bg-red-500/10 px-4 py-2 text-sm font-medium text-red-400 transition-colors hover:bg-red-500/20"
          >
            <RefreshCw className="h-4 w-4" />
            Try again
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}

/**
 * Wrapper component for async data that might fail.
 * Shows a fallback UI while loading or if there's an error.
 */
export function AsyncBoundary({
  children,
  error,
  isLoading,
  loadingFallback,
  errorFallback,
}: {
  children?: ReactNode;
  error?: Error | null;
  isLoading?: boolean;
  loadingFallback?: ReactNode;
  errorFallback?: ReactNode;
}) {
  if (isLoading) {
    return (
      loadingFallback || (
        <div className="flex items-center justify-center p-8">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-accent border-t-transparent" />
        </div>
      )
    );
  }

  if (error) {
    return (
      errorFallback || (
        <div className="flex flex-col items-center justify-center rounded-xl border border-red-500/20 bg-red-500/5 p-8 text-center">
          <AlertTriangle className="mb-2 h-8 w-8 text-red-500" />
          <p className="text-sm text-muted-foreground">
            Failed to load content
          </p>
        </div>
      )
    );
  }

  return <>{children}</>;
}

export default ErrorBoundary;
