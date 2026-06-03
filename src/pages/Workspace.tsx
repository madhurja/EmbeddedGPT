import { useState, useCallback, useEffect } from "react";
import { useNavigate } from "react-router";
import { useAuth } from "@/hooks/useAuth";
import { trpc } from "@/providers/trpc-client";
import TopBar from "@/components/TopBar";
import LeftSidebar from "@/components/LeftSidebar";
import ChatCanvas from "@/components/ChatCanvas";
import RightPanel from "@/components/RightPanel";
import {
  generateLocalEmbeddedResponse,
  type EmbeddedResponse,
} from "@contracts/embedded-answer";
import {
  adaptiveMemoryStats,
  createEmptyAdaptiveMemory,
  learnFromInteraction,
  normalizeAdaptiveMemory,
  summarizeAdaptiveMemory,
  type AdaptiveLearningMemory,
} from "@contracts/adaptive-learning";

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
  precision?: EmbeddedResponse["precision"];
  adaptiveLearning?: EmbeddedResponse["adaptiveLearning"];
  qualityGate?: EmbeddedResponse["qualityGate"];
  answerAudit?: EmbeddedResponse["answerAudit"];
}

interface Conversation {
  id: number;
  title: string;
  updatedAt: Date;
}

const ADAPTIVE_MEMORY_KEY = "embeddedgpt-adaptive-memory";

export default function Workspace() {
  const navigate = useNavigate();
  const { user, isLoading: authLoading } = useAuth();
  const [mobilePanel, setMobilePanel] = useState<
    "conversations" | "tools" | null
  >(null);

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!authLoading && !user) {
      navigate("/login");
    }
  }, [user, authLoading, navigate]);

  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [activeConversation, setActiveConversation] = useState<number | null>(
    null
  );
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [references, setReferences] = useState<ReferenceData[]>([]);
  const [adaptiveMemory, setAdaptiveMemory] = useState<AdaptiveLearningMemory>(
    () => createEmptyAdaptiveMemory()
  );

  // tRPC mutations
  const chatAsk = trpc.chat.ask.useMutation();

  // Load conversations from localStorage for demo
  useEffect(() => {
    const saved = localStorage.getItem("embeddedgpt-conversations");
    if (saved) {
      try {
        const parsed = JSON.parse(saved) as Conversation[];
        setConversations(parsed);
      } catch {
        // ignore
      }
    }
  }, []);

  useEffect(() => {
    const saved = localStorage.getItem(ADAPTIVE_MEMORY_KEY);
    if (!saved) return;

    try {
      setAdaptiveMemory(normalizeAdaptiveMemory(JSON.parse(saved)));
    } catch {
      setAdaptiveMemory(createEmptyAdaptiveMemory());
    }
  }, []);

  useEffect(() => {
    localStorage.setItem(ADAPTIVE_MEMORY_KEY, JSON.stringify(adaptiveMemory));
  }, [adaptiveMemory]);

  // Save conversations
  useEffect(() => {
    if (conversations.length > 0) {
      localStorage.setItem(
        "embeddedgpt-conversations",
        JSON.stringify(conversations)
      );
    }
  }, [conversations]);

  const handleNewConversation = useCallback(() => {
    const newId = Date.now();
    const newConv: Conversation = {
      id: newId,
      title: "New Conversation",
      updatedAt: new Date(),
    };
    setConversations(prev => [newConv, ...prev]);
    setActiveConversation(newId);
    setMessages([]);
    setReferences([]);
  }, []);

  const handleSelectConversation = useCallback((id: number) => {
    setActiveConversation(id);
    // Load messages for this conversation from localStorage
    const saved = localStorage.getItem(`embeddedgpt-messages-${id}`);
    if (saved) {
      try {
        setMessages(JSON.parse(saved));
      } catch {
        setMessages([]);
      }
    } else {
      setMessages([]);
    }
    const savedRefs = localStorage.getItem(`embeddedgpt-refs-${id}`);
    if (savedRefs) {
      try {
        setReferences(JSON.parse(savedRefs));
      } catch {
        setReferences([]);
      }
    } else {
      setReferences([]);
    }
  }, []);

  const handleSelectConversationAndClose = useCallback(
    (id: number) => {
      handleSelectConversation(id);
      setMobilePanel(null);
    },
    [handleSelectConversation]
  );

  const handleNewConversationAndClose = useCallback(() => {
    handleNewConversation();
    setMobilePanel(null);
  }, [handleNewConversation]);

  const typewriterEffect = useCallback(
    (fullText: string, messageId: string, onComplete?: () => void) => {
      const totalChars = fullText.length;

      if (totalChars === 0) {
        onComplete?.();
        return () => undefined;
      }

      let chunkEnd = 0;
      const intervalId = window.setInterval(() => {
        chunkEnd = Math.min(chunkEnd + 18, totalChars);
        const displayText = fullText.substring(0, chunkEnd);
        setMessages(prev =>
          prev.map(msg =>
            msg.id === messageId ? { ...msg, text: displayText } : msg
          )
        );

        if (chunkEnd === totalChars) {
          window.clearInterval(intervalId);
          onComplete?.();
        }
      }, 8);

      return () => {
        window.clearInterval(intervalId);
      };
    },
    []
  );

  const handleSendMessage = useCallback(
    async (text: string) => {
      const conversationId = activeConversation ?? Date.now();
      const adaptiveContext = summarizeAdaptiveMemory(adaptiveMemory);
      const appendAssistantResponse = (
        resp: EmbeddedResponse,
        shouldAnimate = false
      ) => {
        const aiMsgId = `ai-${Date.now()}`;
        const aiMsg: ChatMessage = {
          id: aiMsgId,
          role: "assistant",
          text: shouldAnimate ? "" : resp.prose,
          codeBlocks: resp.codeBlocks || [],
          pinMapping: resp.pinMapping || [],
          references: resp.references || [],
          debugChecklist: resp.debugChecklist || [],
          circuitNotes: resp.circuitNotes,
          precision: resp.precision,
          adaptiveLearning: resp.adaptiveLearning,
          qualityGate: resp.qualityGate,
          answerAudit: resp.answerAudit,
          isTyping: shouldAnimate,
        };

        setMessages(prev => [...prev, aiMsg]);
        setReferences(resp.references || []);

        if (shouldAnimate) {
          typewriterEffect(resp.prose, aiMsgId, () => {
            setMessages(prev =>
              prev.map(msg =>
                msg.id === aiMsgId ? { ...msg, isTyping: false } : msg
              )
            );
          });
        }
      };

      // Create conversation title from first message
      if (!activeConversation) {
        const newConv: Conversation = {
          id: conversationId,
          title: text.slice(0, 50) || "New Conversation",
          updatedAt: new Date(),
        };
        setConversations(prev => [newConv, ...prev]);
        setActiveConversation(conversationId);
        setReferences([]);
      } else if (messages.length === 0) {
        setConversations(prev =>
          prev.map(c =>
            c.id === conversationId ? { ...c, title: text.slice(0, 50) } : c
          )
        );
      }

      // Add user message
      const userMsgId = `user-${Date.now()}`;
      const userMsg: ChatMessage = {
        id: userMsgId,
        role: "user",
        text,
      };
      setMessages(prev =>
        activeConversation ? [...prev, userMsg] : [userMsg]
      );
      setIsLoading(true);

      try {
        // Call the chat API
        const result = await chatAsk.mutateAsync({
          question: text,
          context: adaptiveContext || undefined,
        });

        // Type guard for result
        if (
          result &&
          typeof result === "object" &&
          "response" in result &&
          result.response &&
          typeof result.response === "object"
        ) {
          const resp = result.response as {
            prose?: string;
            codeBlocks?: CodeBlockData[];
            pinMapping?: PinData[];
            references?: ReferenceData[];
            debugChecklist?: string[];
            circuitNotes?: string;
            precision?: EmbeddedResponse["precision"];
            adaptiveLearning?: EmbeddedResponse["adaptiveLearning"];
            qualityGate?: EmbeddedResponse["qualityGate"];
            answerAudit?: EmbeddedResponse["answerAudit"];
          };

          const responseForMemory: EmbeddedResponse = {
            prose: resp.prose || "",
            codeBlocks: resp.codeBlocks || [],
            pinMapping: resp.pinMapping || [],
            references: resp.references || [],
            debugChecklist: resp.debugChecklist || [],
            circuitNotes: resp.circuitNotes,
            precision: resp.precision,
            adaptiveLearning: resp.adaptiveLearning,
            qualityGate: resp.qualityGate,
            answerAudit: resp.answerAudit,
          };

          appendAssistantResponse(responseForMemory, true);
          setAdaptiveMemory(current =>
            learnFromInteraction(current, {
              question: text,
              response: responseForMemory,
            })
          );
        } else {
          const localResponse = generateLocalEmbeddedResponse(
            text,
            adaptiveContext
          ).response;
          appendAssistantResponse(localResponse);
          setAdaptiveMemory(current =>
            learnFromInteraction(current, {
              question: text,
              response: localResponse,
            })
          );
        }
      } catch {
        const localResponse = generateLocalEmbeddedResponse(
          text,
          adaptiveContext
        ).response;
        appendAssistantResponse(localResponse);
        setAdaptiveMemory(current =>
          learnFromInteraction(current, {
            question: text,
            response: localResponse,
          })
        );
      } finally {
        setIsLoading(false);
      }
    },
    [
      activeConversation,
      adaptiveMemory,
      messages.length,
      chatAsk,
      typewriterEffect,
    ]
  );

  // Save messages to localStorage
  useEffect(() => {
    if (activeConversation && messages.length > 0) {
      localStorage.setItem(
        `embeddedgpt-messages-${activeConversation}`,
        JSON.stringify(messages)
      );
    }
  }, [messages, activeConversation]);

  // Save references
  useEffect(() => {
    if (activeConversation && references.length > 0) {
      localStorage.setItem(
        `embeddedgpt-refs-${activeConversation}`,
        JSON.stringify(references)
      );
    }
  }, [references, activeConversation]);

  if (authLoading) {
    return (
      <div
        className="h-screen w-full flex items-center justify-center"
        style={{ backgroundColor: "#0a0a0a" }}
      >
        <div className="flex flex-col items-center gap-4">
          <div
            className="w-8 h-8 rounded-full animate-spin border-2 border-t-transparent"
            style={{ borderColor: "#a0c4c4", borderTopColor: "transparent" }}
          />
          <span className="text-sm" style={{ color: "#555" }}>
            Loading...
          </span>
        </div>
      </div>
    );
  }

  if (!user) {
    return null; // Will redirect
  }

  const filteredConversations = searchQuery
    ? conversations.filter(c =>
        c.title.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : conversations;
  const adaptiveStats = adaptiveMemoryStats(adaptiveMemory);

  return (
    <div
      className="h-screen w-full flex flex-col"
      style={{ backgroundColor: "#0a0a0a" }}
    >
      {/* Circuit texture background */}
      <div
        className="fixed inset-0 pointer-events-none opacity-[0.02]"
        style={{
          backgroundImage: "url(/circuit-texture.jpg)",
          backgroundSize: "256px 256px",
        }}
      />

      <TopBar
        onOpenConversations={() => setMobilePanel("conversations")}
        onOpenTools={() => setMobilePanel("tools")}
      />

      <div className="flex flex-1 overflow-hidden relative">
        {/* Left Sidebar */}
        <div className="hidden md:flex shrink-0">
          <LeftSidebar
            conversations={filteredConversations}
            activeConversation={activeConversation}
            onSelectConversation={handleSelectConversation}
            onNewConversation={handleNewConversation}
            searchQuery={searchQuery}
            onSearchChange={setSearchQuery}
          />
        </div>

        {/* Central Chat Canvas */}
        <ChatCanvas
          messages={messages}
          onSendMessage={handleSendMessage}
          isLoading={isLoading}
        />

        {/* Right Properties Panel */}
        <div className="hidden xl:flex shrink-0">
          <RightPanel references={references} adaptiveStats={adaptiveStats} />
        </div>

        {mobilePanel && (
          <button
            type="button"
            aria-label="Close side panel"
            className={`fixed inset-x-0 bottom-0 top-12 z-20 bg-black/60 ${
              mobilePanel === "conversations" ? "md:hidden" : "xl:hidden"
            }`}
            onClick={() => setMobilePanel(null)}
          />
        )}

        <div
          className={`fixed bottom-0 left-0 top-12 z-30 w-[min(280px,88vw)] transition-transform duration-200 md:hidden ${
            mobilePanel === "conversations"
              ? "translate-x-0"
              : "-translate-x-full"
          }`}
        >
          <LeftSidebar
            conversations={filteredConversations}
            activeConversation={activeConversation}
            onSelectConversation={handleSelectConversationAndClose}
            onNewConversation={handleNewConversationAndClose}
            searchQuery={searchQuery}
            onSearchChange={setSearchQuery}
            className="w-full"
          />
        </div>

        <div
          className={`fixed bottom-0 right-0 top-12 z-30 w-[min(300px,88vw)] transition-transform duration-200 xl:hidden ${
            mobilePanel === "tools" ? "translate-x-0" : "translate-x-full"
          }`}
        >
          <RightPanel
            references={references}
            adaptiveStats={adaptiveStats}
            className="w-full"
          />
        </div>
      </div>
    </div>
  );
}
