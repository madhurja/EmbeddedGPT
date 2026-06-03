import { useState, useRef, useEffect } from "react";
import {
  Send,
  Mic,
  Cpu,
  CheckCircle,
  ShieldCheck,
  AlertTriangle,
  BrainCircuit,
  Gauge,
  ScanSearch,
} from "lucide-react";
import CodeBlock from "./CodeBlock";
import PinMapping from "./PinMapping";
import TypingIndicator from "./TypingIndicator";

interface CodeBlockData {
  language: string;
  code: string;
  description?: string;
}

interface PinData {
  pin: string;
  function: string;
  direction: string;
  notes?: string;
}

interface ReferenceData {
  title: string;
  url: string;
  source?: string;
}

interface PrecisionReview {
  level: string;
  confidence: "High" | "Medium" | "Needs bench verification";
  assumptions: string[];
  safetyWarnings: string[];
  verificationSteps: string[];
  missingDetails: string[];
  calculationNotes: string[];
  validationGates?: string[];
  riskControls?: string[];
  releaseCriteria?: string[];
  errorBudgetNotes?: string[];
}

interface AdaptiveLearningData {
  memoryUsed: boolean;
  appliedHints: string[];
  confidenceTarget: string;
}

interface AccuracyQualityGate {
  targetAccuracy: string;
  sourceGrounding: string;
  sharpnessMode: string;
  knownLimits: string[];
  requiredUserDetails: string[];
  nextVerification: string[];
}

interface AnswerAudit {
  detectedDomains: string[];
  detectedBoards: string[];
  detectedProtocols: string[];
  riskLevel: "Low" | "Medium" | "High" | "Critical";
  difficulty: string;
  coverageScore: number;
  openQuestions: string[];
  improvementActions: string[];
}

interface ChatMessage {
  id: string;
  role: "user" | "assistant";
  text: string;
  isTyping?: boolean;
  codeBlocks?: CodeBlockData[];
  pinMapping?: PinData[];
  references?: ReferenceData[];
  debugChecklist?: string[];
  circuitNotes?: string;
  precision?: PrecisionReview;
  adaptiveLearning?: AdaptiveLearningData;
  qualityGate?: AccuracyQualityGate;
  answerAudit?: AnswerAudit;
}

interface ChatCanvasProps {
  messages: ChatMessage[];
  onSendMessage: (text: string) => void;
  isLoading: boolean;
}

export default function ChatCanvas({
  messages,
  onSendMessage,
  isLoading,
}: ChatCanvasProps) {
  const [inputText, setInputText] = useState("");
  const [inputFocused, setInputFocused] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  function handleSend() {
    if (!inputText.trim() || isLoading) return;
    onSendMessage(inputText.trim());
    setInputText("");
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
    }
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  }

  function handleTextareaChange(e: React.ChangeEvent<HTMLTextAreaElement>) {
    setInputText(e.target.value);
    e.target.style.height = "auto";
    e.target.style.height = `${Math.min(e.target.scrollHeight, 120)}px`;
  }

  return (
    <div
      className="min-w-0 flex-1 flex flex-col h-full overflow-hidden"
      style={{ backgroundColor: "#0a0a0a" }}
    >
      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto px-4 py-5 sm:px-6 sm:py-6">
        {/* AI Greeting - only show when no messages */}
        {messages.length === 0 && (
          <div className="flex flex-col gap-3 max-w-3xl">
            <div className="flex items-center gap-3">
              <div
                className="w-7 h-7 rounded-full flex items-center justify-center"
                style={{
                  backgroundColor: "#a0c4c4",
                  boxShadow: "0 0 12px rgba(160, 196, 196, 0.3)",
                }}
              >
                <Cpu size={14} color="#0a0a0a" />
              </div>
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium" style={{ color: "#eee" }}>
                  EmbeddedGPT
                </span>
                <span className="text-xs" style={{ color: "#4ade80" }}>
                  Ready
                </span>
              </div>
            </div>
            <div className="ml-10">
              <p className="text-sm leading-relaxed" style={{ color: "#999" }}>
                I'm ready to help with hardware design, embedded systems, and
                firmware debugging. Ask about component selection, schematic
                review, or code optimization.
              </p>
              {/* Example chips */}
              <div className="flex flex-wrap gap-2 mt-4">
                {[
                  "How do I interface ADS1115 with ESP32?",
                  "STM32 GPIO configuration for SPI",
                  "BME280 I2C wiring and code",
                  "ESP32 deep sleep modes",
                ].map(example => (
                  <button
                    key={example}
                    onClick={() => {
                      setInputText(example);
                    }}
                    className="px-3 py-1.5 rounded text-xs transition-colors border"
                    style={{
                      backgroundColor: "transparent",
                      borderColor: "#333",
                      color: "#999",
                    }}
                    onMouseEnter={e => {
                      e.currentTarget.style.backgroundColor =
                        "rgba(255,255,255,0.03)";
                      e.currentTarget.style.borderColor = "#444";
                    }}
                    onMouseLeave={e => {
                      e.currentTarget.style.backgroundColor = "transparent";
                      e.currentTarget.style.borderColor = "#333";
                    }}
                  >
                    {example}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Chat Messages */}
        {messages.map(msg => (
          <div
            key={msg.id}
            className={`flex flex-col gap-1 mb-5 ${
              msg.role === "user" ? "items-end" : "items-start"
            }`}
          >
            {msg.role === "assistant" && (
              <div className="flex items-center gap-2 mb-1">
                <div
                  className="w-6 h-6 rounded-full flex items-center justify-center"
                  style={{
                    backgroundColor: "#a0c4c4",
                    boxShadow: "0 0 8px rgba(160, 196, 196, 0.25)",
                  }}
                >
                  <Cpu size={12} color="#0a0a0a" />
                </div>
                <span className="text-xs font-medium" style={{ color: "#eee" }}>
                  EmbeddedGPT
                </span>
              </div>
            )}

            <div
              className={
                msg.role === "user"
                  ? "max-w-[90%] sm:max-w-[80%]"
                  : "w-full max-w-3xl"
              }
            >
              {msg.role === "user" ? (
                <div
                  className="rounded-lg px-4 py-3"
                  style={{ backgroundColor: "#1a1a1a" }}
                >
                  <p className="text-sm" style={{ color: "#eee" }}>
                    {msg.text}
                  </p>
                </div>
              ) : (
                <div className="flex flex-col">
                  <div className="ml-0 sm:ml-8">
                    {/* Prose text */}
                    <div
                      className="text-sm leading-relaxed whitespace-pre-wrap"
                      style={{ color: "#999" }}
                    >
                      {msg.text}
                    </div>

                    {/* Circuit Notes */}
                    {msg.circuitNotes && (
                      <div
                        className="mt-3 p-3 rounded text-xs leading-relaxed border-l-2"
                        style={{
                          backgroundColor: "rgba(160, 196, 196, 0.05)",
                          borderColor: "#a0c4c4",
                          color: "#999",
                        }}
                      >
                        <span
                          className="uppercase tracking-widest text-xs font-medium"
                          style={{ color: "#a0c4c4" }}
                        >
                          CIRCUIT NOTES
                        </span>
                        <p className="mt-1">{msg.circuitNotes}</p>
                      </div>
                    )}

                    {/* Adaptive Learning */}
                    {msg.adaptiveLearning?.memoryUsed && (
                      <div
                        className="mt-3 rounded border p-3"
                        style={{
                          backgroundColor: "rgba(139, 224, 196, 0.04)",
                          borderColor: "rgba(139, 224, 196, 0.2)",
                        }}
                      >
                        <div className="flex items-center gap-2">
                          <BrainCircuit
                            size={14}
                            style={{ color: "#8be0c4" }}
                          />
                          <span
                            className="text-xs font-medium uppercase tracking-widest"
                            style={{ color: "#8be0c4" }}
                          >
                            ADAPTIVE MEMORY
                          </span>
                        </div>
                        <p
                          className="mt-2 text-xs leading-relaxed"
                          style={{ color: "#777" }}
                        >
                          {msg.adaptiveLearning.confidenceTarget}
                        </p>
                        {msg.adaptiveLearning.appliedHints.length > 0 && (
                          <div className="mt-2 flex flex-col gap-1">
                            {msg.adaptiveLearning.appliedHints.map(
                              (hint, idx) => (
                                <span
                                  key={idx}
                                  className="text-xs leading-relaxed"
                                  style={{ color: "#888" }}
                                >
                                  {hint}
                                </span>
                              )
                            )}
                          </div>
                        )}
                      </div>
                    )}

                    {/* Accuracy Gate */}
                    {msg.qualityGate && (
                      <div
                        className="mt-3 rounded border p-3"
                        style={{
                          backgroundColor: "rgba(244, 198, 116, 0.04)",
                          borderColor: "rgba(244, 198, 116, 0.2)",
                        }}
                      >
                        <div className="flex flex-wrap items-center gap-2">
                          <Gauge size={14} style={{ color: "#f4c674" }} />
                          <span
                            className="text-xs font-medium uppercase tracking-widest"
                            style={{ color: "#f4c674" }}
                          >
                            ACCURACY GATE
                          </span>
                          <span
                            className="rounded px-2 py-0.5 text-xs"
                            style={{
                              backgroundColor: "rgba(244, 198, 116, 0.08)",
                              color: "#d9b46f",
                            }}
                          >
                            {msg.qualityGate.sharpnessMode}
                          </span>
                        </div>
                        <div className="mt-2 grid gap-3 md:grid-cols-2">
                          <div>
                            <p
                              className="text-xs uppercase tracking-widest"
                              style={{ color: "#666" }}
                            >
                              Target
                            </p>
                            <p
                              className="mt-1 text-xs leading-relaxed"
                              style={{ color: "#888" }}
                            >
                              {msg.qualityGate.targetAccuracy}
                            </p>
                          </div>
                          <div>
                            <p
                              className="text-xs uppercase tracking-widest"
                              style={{ color: "#666" }}
                            >
                              Source grounding
                            </p>
                            <p
                              className="mt-1 text-xs leading-relaxed"
                              style={{ color: "#888" }}
                            >
                              {msg.qualityGate.sourceGrounding}
                            </p>
                          </div>
                        </div>
                        <div className="mt-3 grid gap-3 md:grid-cols-2">
                          {[
                            [
                              "Needed details",
                              msg.qualityGate.requiredUserDetails,
                            ],
                            ["Known limits", msg.qualityGate.knownLimits],
                            [
                              "Next verification",
                              msg.qualityGate.nextVerification,
                            ],
                          ].map(([title, items]) => {
                            const list = items as string[];
                            if (list.length === 0) return null;
                            return (
                              <div key={title as string}>
                                <p
                                  className="text-xs uppercase tracking-widest"
                                  style={{ color: "#666" }}
                                >
                                  {title as string}
                                </p>
                                <ul className="mt-1 flex flex-col gap-1">
                                  {list.slice(0, 4).map((item, idx) => (
                                    <li
                                      key={idx}
                                      className="text-xs leading-relaxed"
                                      style={{ color: "#888" }}
                                    >
                                      {item}
                                    </li>
                                  ))}
                                </ul>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    )}

                    {/* Answer Audit */}
                    {msg.answerAudit && (
                      <div
                        className="mt-3 rounded border p-3"
                        style={{
                          backgroundColor: "rgba(160, 196, 196, 0.035)",
                          borderColor: "rgba(160, 196, 196, 0.18)",
                        }}
                      >
                        <div className="flex flex-wrap items-center gap-2">
                          <ScanSearch size={14} style={{ color: "#a0c4c4" }} />
                          <span
                            className="text-xs font-medium uppercase tracking-widest"
                            style={{ color: "#a0c4c4" }}
                          >
                            ANSWER AUDIT
                          </span>
                          <span
                            className="rounded px-2 py-0.5 text-xs"
                            style={{
                              backgroundColor: "rgba(160, 196, 196, 0.08)",
                              color:
                                msg.answerAudit.riskLevel === "Critical" ||
                                msg.answerAudit.riskLevel === "High"
                                  ? "#f4c674"
                                  : "#8be0c4",
                            }}
                          >
                            {msg.answerAudit.difficulty} -{" "}
                            {msg.answerAudit.riskLevel} risk
                          </span>
                          <span
                            className="rounded px-2 py-0.5 text-xs"
                            style={{
                              backgroundColor: "rgba(160, 196, 196, 0.08)",
                              color: "#a0c4c4",
                            }}
                          >
                            {msg.answerAudit.coverageScore}% coverage
                          </span>
                        </div>
                        <div className="mt-3 grid gap-3 md:grid-cols-2">
                          {[
                            ["Domains", msg.answerAudit.detectedDomains],
                            ["Boards", msg.answerAudit.detectedBoards],
                            ["Protocols", msg.answerAudit.detectedProtocols],
                            ["Open questions", msg.answerAudit.openQuestions],
                            [
                              "Improve precision",
                              msg.answerAudit.improvementActions,
                            ],
                          ].map(([title, items]) => {
                            const list = items as string[];
                            if (list.length === 0) return null;
                            return (
                              <div key={title as string}>
                                <p
                                  className="text-xs uppercase tracking-widest"
                                  style={{ color: "#666" }}
                                >
                                  {title as string}
                                </p>
                                <ul className="mt-1 flex flex-col gap-1">
                                  {list.slice(0, 4).map((item, idx) => (
                                    <li
                                      key={idx}
                                      className="text-xs leading-relaxed"
                                      style={{ color: "#888" }}
                                    >
                                      {item}
                                    </li>
                                  ))}
                                </ul>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    )}

                    {/* Precision Review */}
                    {msg.precision && (
                      <div
                        className="mt-3 rounded border p-3"
                        style={{
                          backgroundColor: "rgba(160, 196, 196, 0.04)",
                          borderColor: "rgba(160, 196, 196, 0.22)",
                        }}
                      >
                        <div className="flex flex-wrap items-center gap-2">
                          <ShieldCheck size={14} style={{ color: "#a0c4c4" }} />
                          <span
                            className="text-xs font-medium uppercase tracking-widest"
                            style={{ color: "#a0c4c4" }}
                          >
                            PRECISION REVIEW
                          </span>
                          <span
                            className="rounded px-2 py-0.5 text-xs"
                            style={{
                              backgroundColor: "rgba(160, 196, 196, 0.1)",
                              color:
                                msg.precision.confidence === "High"
                                  ? "#8be0c4"
                                  : "#f4c674",
                            }}
                          >
                            {msg.precision.level} - {msg.precision.confidence}
                          </span>
                        </div>

                        {msg.precision.safetyWarnings.length > 0 && (
                          <div className="mt-3 flex flex-col gap-1.5">
                            {msg.precision.safetyWarnings.map(
                              (warning, idx) => (
                                <div
                                  key={idx}
                                  className="flex items-start gap-2 text-xs leading-relaxed"
                                  style={{ color: "#d9b46f" }}
                                >
                                  <AlertTriangle
                                    size={13}
                                    className="mt-0.5 shrink-0"
                                  />
                                  <span>{warning}</span>
                                </div>
                              )
                            )}
                          </div>
                        )}

                        <div className="mt-3 grid gap-3 md:grid-cols-2">
                          {[
                            ["Assumptions", msg.precision.assumptions],
                            ["Missing details", msg.precision.missingDetails],
                            [
                              "Verification",
                              msg.precision.verificationSteps.slice(0, 4),
                            ],
                            ["Calculations", msg.precision.calculationNotes],
                            ["Risk controls", msg.precision.riskControls ?? []],
                            [
                              "Validation gates",
                              msg.precision.validationGates ?? [],
                            ],
                            [
                              "Release criteria",
                              msg.precision.releaseCriteria ?? [],
                            ],
                            [
                              "Error budget",
                              msg.precision.errorBudgetNotes ?? [],
                            ],
                          ].map(([title, items]) => {
                            const list = items as string[];
                            if (list.length === 0) return null;
                            return (
                              <div key={title as string}>
                                <p
                                  className="text-xs uppercase tracking-widest"
                                  style={{ color: "#666" }}
                                >
                                  {title as string}
                                </p>
                                <ul className="mt-1 flex flex-col gap-1">
                                  {list.map((item, idx) => (
                                    <li
                                      key={idx}
                                      className="text-xs leading-relaxed"
                                      style={{ color: "#888" }}
                                    >
                                      {item}
                                    </li>
                                  ))}
                                </ul>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    )}

                    {/* Code Blocks */}
                    {msg.codeBlocks?.map((block, idx) => (
                      <CodeBlock
                        key={idx}
                        language={block.language}
                        code={block.code}
                        description={block.description}
                      />
                    ))}

                    {/* Pin Mapping */}
                    {msg.pinMapping && msg.pinMapping.length > 0 && (
                      <div className="mt-3">
                        <div
                          className="text-xs uppercase tracking-widest font-medium mb-2"
                          style={{ color: "#a0c4c4" }}
                        >
                          PIN MAPPING
                        </div>
                        <PinMapping pins={msg.pinMapping} />
                      </div>
                    )}

                    {/* Debug Checklist */}
                    {msg.debugChecklist && msg.debugChecklist.length > 0 && (
                      <div className="mt-3">
                        <div
                          className="text-xs uppercase tracking-widest font-medium mb-2"
                          style={{ color: "#a0c4c4" }}
                        >
                          DEBUG CHECKLIST
                        </div>
                        <div className="flex flex-col gap-1.5">
                          {msg.debugChecklist.map((item, idx) => (
                            <div
                              key={idx}
                              className="flex items-start gap-2 py-1"
                            >
                              <CheckCircle
                                size={14}
                                className="shrink-0 mt-0.5"
                                style={{ color: "#333" }}
                              />
                              <span
                                className="text-xs leading-relaxed"
                                style={{ color: "#777" }}
                              >
                                {item}
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        ))}

        {/* Typing indicator */}
        {isLoading && (
          <div className="flex items-center gap-2 sm:ml-8">
            <TypingIndicator />
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input Bar */}
      <div
        className="shrink-0 px-4 pb-4 pt-2 sm:px-6"
        style={{ backgroundColor: "#0a0a0a" }}
      >
        <div
          className="flex items-end gap-2 rounded-lg px-4 py-3 transition-all"
          style={{
            backgroundColor: "#1a1a1a",
            border: `1px solid ${inputFocused ? "#a0c4c4" : "#222"}`,
            boxShadow: inputFocused
              ? "0 0 0 1px rgba(160, 196, 196, 0.15)"
              : "none",
          }}
        >
          <textarea
            ref={textareaRef}
            value={inputText}
            onChange={handleTextareaChange}
            onKeyDown={handleKeyDown}
            onFocus={() => setInputFocused(true)}
            onBlur={() => setInputFocused(false)}
            placeholder="Ask about hardware, code, or schematics..."
            rows={1}
            className="flex-1 bg-transparent text-sm outline-none resize-none max-h-[120px] min-h-[20px]"
            style={{ color: "#eee" }}
          />
          <div className="flex items-center gap-2 shrink-0">
            <button
              className="p-1.5 rounded transition-colors"
              style={{ color: "#555" }}
              onMouseEnter={e => (e.currentTarget.style.color = "#a0c4c4")}
              onMouseLeave={e => (e.currentTarget.style.color = "#555")}
            >
              <Mic size={18} />
            </button>
            <button
              onClick={handleSend}
              disabled={!inputText.trim() || isLoading}
              className="p-1.5 rounded transition-all"
              style={{
                color: inputText.trim() && !isLoading ? "#a0c4c4" : "#333",
                opacity: inputText.trim() && !isLoading ? 1 : 0.5,
              }}
            >
              <Send size={18} />
            </button>
          </div>
        </div>
        <p className="text-center text-xs mt-2" style={{ color: "#333" }}>
          Precision mode: verify production values with datasheets and bench
          tests.
        </p>
      </div>
    </div>
  );
}
