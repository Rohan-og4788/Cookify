"use client";

import { Component, type ReactNode } from "react";
import { Button } from "@/components/ui/button";

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(): State {
    return { hasError: true };
  }

  render() {
    if (this.state.hasError) {
      return (
        this.props.fallback ?? (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <h2 className="mb-2 text-xl font-semibold">Something went wrong</h2>
            <p className="mb-4 text-muted">An unexpected error occurred.</p>
            <Button onClick={() => this.setState({ hasError: false })}>
              Try again
            </Button>
          </div>
        )
      );
    }

    return this.props.children;
  }
}
