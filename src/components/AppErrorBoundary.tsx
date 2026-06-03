import { Component, type ErrorInfo, type ReactNode } from "react";
import { RefreshCw, ShieldAlert } from "lucide-react";

interface AppErrorBoundaryProps {
  children: ReactNode;
}

interface AppErrorBoundaryState {
  hasIssue: boolean;
}

export default class AppErrorBoundary extends Component<
  AppErrorBoundaryProps,
  AppErrorBoundaryState
> {
  state: AppErrorBoundaryState = { hasIssue: false };

  static getDerivedStateFromError() {
    return { hasIssue: true };
  }

  componentDidCatch(error: unknown, errorInfo: ErrorInfo) {
    console.warn("[ui] Workspace recovered from a render issue", {
      error,
      componentStack: errorInfo.componentStack,
    });
  }

  render() {
    if (!this.state.hasIssue) {
      return this.props.children;
    }

    return (
      <div
        className="grid min-h-screen place-items-center px-4"
        style={{ backgroundColor: "#0a0a0a" }}
      >
        <div
          className="w-full max-w-md rounded-lg border p-6 text-center"
          style={{ backgroundColor: "#111", borderColor: "#222" }}
        >
          <div
            className="mx-auto grid h-12 w-12 place-items-center rounded-full"
            style={{ backgroundColor: "rgba(160, 196, 196, 0.12)" }}
          >
            <ShieldAlert size={24} style={{ color: "#a0c4c4" }} />
          </div>
          <h1 className="mt-4 text-base font-medium" style={{ color: "#eee" }}>
            Workspace needs a refresh
          </h1>
          <p className="mt-2 text-sm leading-relaxed" style={{ color: "#777" }}>
            The app protected your session from a display problem. Refresh to
            reopen the workspace.
          </p>
          <button
            type="button"
            onClick={() => window.location.reload()}
            className="mt-5 inline-flex h-10 items-center justify-center gap-2 rounded px-4 text-sm font-medium transition-colors"
            style={{
              backgroundColor: "rgba(160, 196, 196, 0.15)",
              color: "#a0c4c4",
              border: "1px solid rgba(160, 196, 196, 0.3)",
            }}
          >
            <RefreshCw size={16} />
            Refresh workspace
          </button>
        </div>
      </div>
    );
  }
}
