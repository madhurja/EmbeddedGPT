import { useState } from "react";
import { Search, Plus, Clock, MessageSquare, Database } from "lucide-react";
import { cn } from "@/lib/utils";

interface Conversation {
  id: number;
  title: string;
  updatedAt: Date;
}

interface LeftSidebarProps {
  conversations: Conversation[];
  activeConversation: number | null;
  onSelectConversation: (id: number) => void;
  onNewConversation: () => void;
  searchQuery: string;
  onSearchChange: (query: string) => void;
  className?: string;
}

export default function LeftSidebar({
  conversations,
  activeConversation,
  onSelectConversation,
  onNewConversation,
  searchQuery,
  onSearchChange,
  className,
}: LeftSidebarProps) {
  const [searchFocused, setSearchFocused] = useState(false);
  const activeConversationTitle = conversations.find(
    conversation => conversation.id === activeConversation
  )?.title;

  function formatTime(date: Date): string {
    const now = new Date();
    const diff = now.getTime() - new Date(date).getTime();
    const minutes = Math.floor(diff / 60000);
    if (minutes < 60) return `${minutes}m`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours}h`;
    return `${Math.floor(hours / 24)}d`;
  }

  return (
    <aside
      className={cn(
        "w-[280px] shrink-0 flex flex-col border-r h-full overflow-hidden",
        className
      )}
      style={{
        backgroundColor: "#1a1a1a",
        borderColor: "#222",
      }}
    >
      <div className="p-4 sm:p-5 flex min-h-0 flex-1 flex-col gap-3">
        {/* Search Input */}
        <div
          className="relative flex items-center h-9 rounded transition-colors"
          style={{
            backgroundColor: "#0d0d0d",
            border: `1px solid ${searchFocused ? "#a0c4c4" : "#222"}`,
          }}
        >
          <Search
            size={14}
            className="absolute left-3"
            style={{ color: "#555" }}
          />
          <input
            type="text"
            placeholder="Search conversations..."
            value={searchQuery}
            onChange={e => onSearchChange(e.target.value)}
            onFocus={() => setSearchFocused(true)}
            onBlur={() => setSearchFocused(false)}
            className="w-full h-full bg-transparent pl-9 pr-3 text-sm outline-none"
            style={{ color: "#eee" }}
          />
        </div>

        {/* New Chat Button */}
        <button
          onClick={onNewConversation}
          className="w-full h-9 rounded flex items-center justify-center gap-2 text-xs uppercase tracking-widest font-medium transition-colors border"
          style={{
            backgroundColor: "transparent",
            borderColor: "#333",
            color: "#eee",
          }}
          onMouseEnter={e =>
            (e.currentTarget.style.backgroundColor = "rgba(255,255,255,0.03)")
          }
          onMouseLeave={e =>
            (e.currentTarget.style.backgroundColor = "transparent")
          }
        >
          <Plus size={14} />
          NEW CONVERSATION
        </button>

        {/* Divider */}
        <div className="w-full h-px" style={{ backgroundColor: "#222" }} />

        {/* History List */}
        <div className="flex flex-col gap-1 overflow-y-auto flex-1 min-h-0">
          {conversations.length === 0 && (
            <div className="py-8 text-center">
              <p className="text-xs" style={{ color: "#555" }}>
                No conversations yet
              </p>
              <p className="text-xs mt-1" style={{ color: "#333" }}>
                Start a new chat to begin
              </p>
            </div>
          )}
          {conversations.map(conv => (
            <button
              key={conv.id}
              onClick={() => onSelectConversation(conv.id)}
              className="w-full text-left rounded px-3 py-2.5 transition-colors flex items-start gap-2 group"
              style={{
                backgroundColor:
                  activeConversation === conv.id
                    ? "rgba(160, 196, 196, 0.15)"
                    : "transparent",
                borderLeft:
                  activeConversation === conv.id
                    ? "2px solid #a0c4c4"
                    : "2px solid transparent",
              }}
              onMouseEnter={e => {
                if (activeConversation !== conv.id) {
                  e.currentTarget.style.backgroundColor =
                    "rgba(255,255,255,0.03)";
                }
              }}
              onMouseLeave={e => {
                if (activeConversation !== conv.id) {
                  e.currentTarget.style.backgroundColor = "transparent";
                }
              }}
            >
              <div className="flex-1 min-w-0">
                <p
                  className="text-sm truncate"
                  style={{
                    color: activeConversation === conv.id ? "#eee" : "#999",
                  }}
                >
                  {conv.title}
                </p>
              </div>
              <div className="flex items-center gap-1 shrink-0 mt-0.5">
                <Clock size={10} style={{ color: "#555" }} />
                <span className="text-xs" style={{ color: "#555" }}>
                  {formatTime(conv.updatedAt)}
                </span>
              </div>
            </button>
          ))}
        </div>

        {/* Session Summary */}
        <div className="mt-auto pt-4 border-t" style={{ borderColor: "#222" }}>
          <div className="flex items-center gap-2">
            <MessageSquare size={12} style={{ color: "#a0c4c4" }} />
            <span
              className="text-xs uppercase tracking-widest"
              style={{ color: "#555" }}
            >
              SESSION
            </span>
          </div>
          <div
            className="mt-3 rounded border px-3 py-2 text-xs leading-relaxed"
            style={{
              backgroundColor: "#111",
              borderColor: "#222",
              color: "#666",
            }}
          >
            <div className="flex items-center justify-between gap-2">
              <span>Saved conversations</span>
              <span style={{ color: "#a0c4c4" }}>{conversations.length}</span>
            </div>
            <div className="mt-1 flex items-center justify-between gap-2">
              <span>Active thread</span>
              <span className="truncate" style={{ color: "#a0c4c4" }}>
                {activeConversationTitle ?? "None"}
              </span>
            </div>
            <div className="mt-1 flex items-center gap-2">
              <Database size={11} style={{ color: "#555" }} />
              <span>History stays in local browser storage.</span>
            </div>
          </div>
        </div>
      </div>
    </aside>
  );
}
