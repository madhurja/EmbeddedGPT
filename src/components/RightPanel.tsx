import { useMemo, useState } from "react";
import {
  Search,
  ExternalLink,
  Cpu,
  Terminal,
  Zap,
  ChevronRight,
  BrainCircuit,
} from "lucide-react";
import { trpc } from "@/providers/trpc-client";
import { cn } from "@/lib/utils";

interface Reference {
  title: string;
  url: string;
  source?: string;
}

interface RightPanelProps {
  references: Reference[];
  adaptiveStats?: {
    learnedItems: number;
    recentTasks: number;
    answerStyle: string;
  };
  className?: string;
}

export default function RightPanel({
  references,
  adaptiveStats,
  className,
}: RightPanelProps) {
  const [componentSearch, setComponentSearch] = useState("");

  const { data: components } = trpc.component.list.useQuery();

  const filteredComponents =
    components?.filter(
      c =>
        c.name.toLowerCase().includes(componentSearch.toLowerCase()) ||
        c.manufacturer.toLowerCase().includes(componentSearch.toLowerCase())
    ) ?? [];

  const sessionNotes = useMemo(
    () => [
      components
        ? `Component reference entries available: ${components.length}`
        : "Loading component reference entries...",
      references.length > 0
        ? `Current answer surfaced ${references.length} reference link${references.length === 1 ? "" : "s"}.`
        : "Ask an engineering question to populate source references.",
      adaptiveStats
        ? `Adaptive memory is storing ${adaptiveStats.learnedItems} learned items across ${adaptiveStats.recentTasks} recent tasks.`
        : "Adaptive memory statistics are not available yet.",
      "The panel shows current session data only; it does not estimate token usage or backend heartbeats.",
    ],
    [adaptiveStats, components, references.length]
  );

  return (
    <aside
      className={cn(
        "w-[260px] shrink-0 flex flex-col border-l h-full overflow-hidden",
        className
      )}
      style={{
        backgroundColor: "#1a1a1a",
        borderColor: "#222",
      }}
    >
      <div className="p-4 sm:p-5 flex flex-col gap-5 overflow-y-auto flex-1">
        {/* Component Reference */}
        <div className="flex flex-col gap-2">
          <div className="flex items-center gap-2">
            <Cpu size={12} style={{ color: "#a0c4c4" }} />
            <span
              className="text-xs uppercase tracking-widest"
              style={{ color: "#555" }}
            >
              COMPONENT DB
            </span>
          </div>
          <div
            className="relative flex items-center h-8 rounded"
            style={{
              backgroundColor: "#0d0d0d",
              border: "1px solid #222",
            }}
          >
            <Search
              size={12}
              className="absolute left-2.5"
              style={{ color: "#555" }}
            />
            <input
              type="text"
              placeholder="Search components..."
              value={componentSearch}
              onChange={e => setComponentSearch(e.target.value)}
              className="w-full h-full bg-transparent pl-8 pr-2 text-xs outline-none"
              style={{ color: "#eee" }}
            />
          </div>
          <div className="flex flex-col gap-1 max-h-[180px] overflow-y-auto">
            {filteredComponents.map(comp => (
              <div
                key={comp.id}
                className="rounded px-2.5 py-2 transition-colors cursor-pointer"
                style={{ backgroundColor: "transparent" }}
                onMouseEnter={e =>
                  (e.currentTarget.style.backgroundColor =
                    "rgba(255,255,255,0.03)")
                }
                onMouseLeave={e =>
                  (e.currentTarget.style.backgroundColor = "transparent")
                }
              >
                <p className="font-mono text-xs" style={{ color: "#eee" }}>
                  {comp.name}
                </p>
                <p className="text-xs mt-0.5" style={{ color: "#555" }}>
                  {comp.manufacturer}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Divider */}
        <div className="w-full h-px" style={{ backgroundColor: "#222" }} />

        {/* Datasheet Links / References */}
        <div className="flex flex-col gap-2">
          <div className="flex items-center gap-2">
            <ExternalLink size={12} style={{ color: "#a0c4c4" }} />
            <span
              className="text-xs uppercase tracking-widest"
              style={{ color: "#555" }}
            >
              REFERENCES
            </span>
          </div>
          <div className="flex flex-col gap-1.5">
            {references.length === 0 && (
              <p className="text-xs py-2" style={{ color: "#555" }}>
                Ask a question to see references
              </p>
            )}
            {references.map((ref, idx) => (
              <a
                key={idx}
                href={ref.url}
                target="_blank"
                rel="noopener noreferrer"
                className="rounded px-3 py-2 transition-colors block"
                style={{ backgroundColor: "#111" }}
                onMouseEnter={e =>
                  (e.currentTarget.style.backgroundColor = "#161616")
                }
                onMouseLeave={e =>
                  (e.currentTarget.style.backgroundColor = "#111")
                }
              >
                <div className="flex items-center gap-1.5">
                  <ChevronRight size={10} style={{ color: "#a0c4c4" }} />
                  <p
                    className="text-xs truncate flex-1"
                    style={{ color: "#eee" }}
                  >
                    {ref.title}
                  </p>
                </div>
                <p
                  className="font-mono text-xs mt-0.5 truncate"
                  style={{ color: "#555" }}
                >
                  {ref.source}
                </p>
              </a>
            ))}
          </div>
        </div>

        {/* Divider */}
        <div className="w-full h-px" style={{ backgroundColor: "#222" }} />

        {/* Adaptive Memory */}
        <div className="flex flex-col gap-2">
          <div className="flex items-center gap-2">
            <BrainCircuit size={12} style={{ color: "#a0c4c4" }} />
            <span
              className="text-xs uppercase tracking-widest"
              style={{ color: "#555" }}
            >
              ADAPTIVE MEMORY
            </span>
          </div>
          <div
            className="rounded px-3 py-2 text-xs leading-relaxed"
            style={{ backgroundColor: "#111", color: "#666" }}
          >
            <div className="flex items-center justify-between gap-2">
              <span>Learned items</span>
              <span style={{ color: "#a0c4c4" }}>
                {adaptiveStats?.learnedItems ?? 0}
              </span>
            </div>
            <div className="mt-1 flex items-center justify-between gap-2">
              <span>Recent tasks</span>
              <span style={{ color: "#a0c4c4" }}>
                {adaptiveStats?.recentTasks ?? 0}
              </span>
            </div>
            <div className="mt-1 flex items-center justify-between gap-2">
              <span>Style</span>
              <span className="truncate" style={{ color: "#a0c4c4" }}>
                {adaptiveStats?.answerStyle ?? "balanced"}
              </span>
            </div>
          </div>
        </div>

        {/* Divider */}
        <div className="w-full h-px" style={{ backgroundColor: "#222" }} />

        {/* Session Status */}
        <div className="flex flex-col gap-2 flex-1 min-h-0">
          <div className="flex items-center gap-2">
            <Terminal size={12} style={{ color: "#a0c4c4" }} />
            <span
              className="text-xs uppercase tracking-widest"
              style={{ color: "#555" }}
            >
              SESSION STATUS
            </span>
          </div>
          <div
            className="rounded p-2 overflow-y-auto font-mono text-xs leading-relaxed flex-1"
            style={{ backgroundColor: "#0d0d0d", color: "#555" }}
          >
            {sessionNotes.map((line, idx) => (
              <div key={idx} className="truncate">
                {line}
              </div>
            ))}
          </div>
        </div>

        {/* Divider */}
        <div className="w-full h-px" style={{ backgroundColor: "#222" }} />

        {/* Schematic Preview */}
        <div className="flex flex-col gap-2">
          <div className="flex items-center gap-2">
            <Zap size={12} style={{ color: "#a0c4c4" }} />
            <span
              className="text-xs uppercase tracking-widest"
              style={{ color: "#555" }}
            >
              SCHEMATIC PREVIEW
            </span>
          </div>
          <div
            className="w-full aspect-square rounded flex items-center justify-center"
            style={{ backgroundColor: "#111" }}
          >
            <svg
              width="80"
              height="80"
              viewBox="0 0 80 80"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              style={{ opacity: 0.2 }}
            >
              {/* Op-amp / ADC block diagram */}
              <polygon
                points="10,10 70,40 10,70"
                stroke="#a0c4c4"
                strokeWidth="1.5"
                fill="none"
              />
              {/* Input lines */}
              <line
                x1="0"
                y1="25"
                x2="10"
                y2="25"
                stroke="#a0c4c4"
                strokeWidth="1"
              />
              <line
                x1="0"
                y1="55"
                x2="10"
                y2="55"
                stroke="#a0c4c4"
                strokeWidth="1"
              />
              {/* Output line */}
              <line
                x1="70"
                y1="40"
                x2="80"
                y2="40"
                stroke="#a0c4c4"
                strokeWidth="1"
              />
              {/* Plus/Minus labels */}
              <text
                x="14"
                y="23"
                fill="#a0c4c4"
                fontSize="8"
                fontFamily="monospace"
              >
                +
              </text>
              <text
                x="14"
                y="60"
                fill="#a0c4c4"
                fontSize="8"
                fontFamily="monospace"
              >
                -
              </text>
              {/* ADC label */}
              <text
                x="25"
                y="43"
                fill="#a0c4c4"
                fontSize="7"
                fontFamily="monospace"
              >
                ADC
              </text>
            </svg>
          </div>
        </div>
      </div>
    </aside>
  );
}
