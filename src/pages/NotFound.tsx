import { ArrowLeft, CircuitBoard } from "lucide-react";
import { Link } from "react-router";

export default function NotFound() {
  return (
    <div
      className="min-h-screen flex items-center justify-center"
      style={{ backgroundColor: "#0a0a0a" }}
    >
      <div className="flex flex-col items-center gap-6 text-center px-6">
        <CircuitBoard size={32} style={{ color: "#a0c4c4", opacity: 0.5 }} />
        <div>
          <h1
            className="text-4xl font-mono font-medium"
            style={{ color: "#eee" }}
          >
            404
          </h1>
          <p className="text-sm mt-2" style={{ color: "#555" }}>
            Page not found in address space
          </p>
        </div>
        <Link
          to="/"
          className="flex items-center gap-2 px-4 py-2 rounded text-sm transition-colors border"
          style={{
            color: "#a0c4c4",
            borderColor: "#333",
            backgroundColor: "transparent",
          }}
          onMouseEnter={e => {
            e.currentTarget.style.backgroundColor = "rgba(255,255,255,0.03)";
          }}
          onMouseLeave={e => {
            e.currentTarget.style.backgroundColor = "transparent";
          }}
        >
          <ArrowLeft size={14} />
          Back to Workspace
        </Link>
      </div>
    </div>
  );
}
