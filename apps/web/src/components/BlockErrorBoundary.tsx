import { Component, ErrorInfo, ReactNode } from 'react';
import { FarskhetsPrick } from './FarskhetsPrick';

interface Props {
  children: ReactNode;
  fallbackTitle?: string;
  onRetry?: () => void;
}

interface State {
  hasError: boolean;
}

export class BlockErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
  };

  public static getDerivedStateFromError(): State {
    return { hasError: true };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
    if (process.env.NODE_ENV !== 'production') {
      console.error('BlockErrorBoundary fångade ett fel:', error, errorInfo);
    }
  }

  private handleReset = (): void => {
    this.setState({ hasError: false });
    if (this.props.onRetry) {
      this.props.onRetry();
    }
  };

  public render(): ReactNode {
    if (this.state.hasError) {
      return (
        <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-bold text-slate-900">
              {this.props.fallbackTitle || 'Den här uppgiften saknas just nu'}
            </h3>
            <FarskhetsPrick
              status="failed"
              explanation="Den här uppgiften går inte att visa just nu. Resten av sidan fungerar som vanligt."
              onRetry={this.handleReset}
            />
          </div>
          <p className="text-slate-600 text-sm leading-relaxed">
            Den här uppgiften saknas just nu.
          </p>
          <div>
            <button
              type="button"
              onClick={this.handleReset}
              className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 text-sm font-semibold rounded-lg transition-colors cursor-pointer"
            >
              Försök igen
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
