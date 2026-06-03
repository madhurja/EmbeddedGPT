import { CircuitBoard, Menu, PanelRight, Settings } from "lucide-react";

interface TopBarProps {
  onOpenConversations: () => void;
  onOpenTools: () => void;
}

export default function TopBar({
  onOpenConversations,
  onOpenTools,
}: TopBarProps) {
  return (
    <header
      className="h-12 flex items-center gap-3 px-3 sm:px-4 border-b shrink-0"
      style={{
        backgroundColor: "#0a0a0a",
        borderColor: "#222",
      }}
    >
      {/* Left cluster */}
      <div className="flex min-w-0 items-center gap-2">
        <button
          type="button"
          onClick={onOpenConversations}
          aria-label="Open conversations"
          title="Open conversations"
          className="grid h-8 w-8 place-items-center rounded transition-colors hover:bg-white/5 md:hidden"
          style={{ color: "#999" }}
        >
          <Menu size={17} />
        </button>
        <CircuitBoard size={16} style={{ color: "#a0c4c4" }} />
        <span
          className="truncate text-sm font-medium tracking-wide"
          style={{ color: "#eee" }}
        >
          EmbeddedGPT
        </span>
      </div>

      {/* Center cluster */}
      <div className="hidden flex-1 justify-center sm:flex">
        <span
          className="text-xs uppercase tracking-widest"
          style={{ color: "#555" }}
        >
          ENGINEERING AI v2.4
        </span>
      </div>

      {/* Right cluster */}
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={onOpenTools}
          aria-label="Open tools panel"
          title="Open tools panel"
          className="grid h-8 w-8 place-items-center rounded transition-colors hover:bg-white/5 xl:hidden"
          style={{ color: "#999" }}
        >
          <PanelRight size={17} />
        </button>
        <div className="hidden items-center gap-2 sm:flex">
          <div
            className="w-2 h-2 rounded-full status-pulse"
            style={{ backgroundColor: "#4ade80" }}
          />
          <span
            className="text-xs uppercase tracking-widest"
            style={{ color: "#555" }}
          >
            ONLINE
          </span>
        </div>
        <button
          type="button"
          aria-label="Settings"
          title="Settings"
          className="p-1.5 rounded transition-colors hover:bg-white/5"
          style={{ color: "#999" }}
        >
          <Settings size={16} />
        </button>
      </div>
    </header>
  );
}
