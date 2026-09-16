import { Component, type ErrorInfo, type ReactNode } from 'react';
import { ErrorStateCard } from '../ui/StateCard.js';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
    console.error('Unhandled React Error Boundary caught:', error, errorInfo);
  }

  private handleReset = (): void => {
    this.setState({ hasError: false, error: undefined });
  };

  public render(): ReactNode {
    if (this.state.hasError) {
      return (
        <div className="p-8 max-w-2xl mx-auto my-12">
          <ErrorStateCard
            title="An unexpected application error occurred"
            message={this.state.error?.message || 'Something went wrong while rendering this section.'}
            onRetry={this.handleReset}
          />
        </div>
      );
    }

    return this.props.children;
  }
}
