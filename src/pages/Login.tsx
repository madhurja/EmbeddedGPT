import { CircuitBoard, ArrowRight } from "lucide-react";
import { isDemoModeEnabled, startDemoSession } from "@/hooks/useAuth";

function getMissingOAuthConfig() {
  const missing: string[] = [];
  if (!import.meta.env.VITE_KIMI_AUTH_URL) {
    missing.push("VITE_KIMI_AUTH_URL");
  }
  if (!import.meta.env.VITE_APP_ID) {
    missing.push("VITE_APP_ID");
  }
  return missing;
}

function getOAuthUrl() {
  const kimiAuthUrl = import.meta.env.VITE_KIMI_AUTH_URL;
  const appID = import.meta.env.VITE_APP_ID;
  if (!kimiAuthUrl || !appID) {
    return null;
  }

  const redirectUri = `${window.location.origin}/api/oauth/callback`;
  const state = btoa(redirectUri);

  const url = new URL(`${kimiAuthUrl}/api/oauth/authorize`);
  url.searchParams.set("client_id", appID);
  url.searchParams.set("redirect_uri", redirectUri);
  url.searchParams.set("response_type", "code");
  url.searchParams.set("scope", "profile");
  url.searchParams.set("state", state);

  return url.toString();
}

export default function Login() {
  const oauthUrl = getOAuthUrl();
  const demoModeEnabled = isDemoModeEnabled();
  const missingOAuthConfig = getMissingOAuthConfig();
  const setupMessage =
    missingOAuthConfig.length > 0
      ? `Set ${missingOAuthConfig.join(" and ")} in .env to enable Kimi sign-in.`
      : "Kimi sign-in is ready when OAuth configuration is present.";

  return (
    <div
      className="min-h-screen flex items-center justify-center relative overflow-x-hidden px-4 py-8"
      style={{ backgroundColor: "#0a0a0a" }}
    >
      {/* Circuit texture background */}
      <div
        className="fixed inset-0 pointer-events-none opacity-[0.03]"
        style={{
          backgroundImage: "url(/circuit-texture.jpg)",
          backgroundSize: "256px 256px",
        }}
      />

      <div className="relative z-10 w-full max-w-[calc(100vw-2rem)] sm:max-w-md">
        {/* Logo */}
        <div className="flex flex-col items-center gap-4 mb-10">
          <div
            className="w-14 h-14 rounded-full flex items-center justify-center"
            style={{
              backgroundColor: "rgba(160, 196, 196, 0.15)",
              boxShadow: "0 0 24px rgba(160, 196, 196, 0.2)",
            }}
          >
            <CircuitBoard size={28} style={{ color: "#a0c4c4" }} />
          </div>
          <div className="text-center">
            <h1
              className="text-xl font-medium tracking-wide"
              style={{ color: "#eee" }}
            >
              EmbeddedGPT
            </h1>
            <p className="text-sm mt-1.5" style={{ color: "#555" }}>
              Engineering-grade AI for hardware design
            </p>
          </div>
        </div>

        {/* Login Card */}
        <div
          className="rounded-lg p-6 sm:p-8 border w-full box-border overflow-hidden"
          style={{
            backgroundColor: "#111",
            borderColor: "#222",
          }}
        >
          <div className="flex flex-col gap-6">
            <div className="flex flex-col gap-1">
              <h2
                className="text-sm font-medium uppercase tracking-widest"
                style={{ color: "#eee" }}
              >
                Sign in required
              </h2>
              <p className="text-xs leading-relaxed" style={{ color: "#777" }}>
                Please sign in before opening the engineering workspace. Your
                chats and component references stay with your account.
              </p>
            </div>

            <button
              onClick={() => {
                if (oauthUrl) {
                  window.location.href = oauthUrl;
                }
              }}
              disabled={!oauthUrl}
              className="w-full h-11 rounded flex items-center justify-center gap-2 text-sm font-medium transition-all"
              style={{
                backgroundColor: "rgba(160, 196, 196, 0.15)",
                color: "#a0c4c4",
                border: "1px solid rgba(160, 196, 196, 0.3)",
                opacity: oauthUrl ? 1 : 0.55,
                cursor: oauthUrl ? "pointer" : "not-allowed",
              }}
              onMouseEnter={e => {
                if (!oauthUrl) return;
                e.currentTarget.style.backgroundColor =
                  "rgba(160, 196, 196, 0.25)";
              }}
              onMouseLeave={e => {
                e.currentTarget.style.backgroundColor =
                  "rgba(160, 196, 196, 0.15)";
              }}
            >
              {oauthUrl ? "Sign in with Kimi" : "Sign-in setup missing"}
              <ArrowRight size={16} />
            </button>

            {demoModeEnabled ? (
              <button
                onClick={() => {
                  if (startDemoSession()) {
                    window.location.href = "/";
                  }
                }}
                className="w-full h-11 rounded flex items-center justify-center gap-2 text-sm font-medium transition-all border"
                style={{
                  backgroundColor: "transparent",
                  color: "#ddd",
                  borderColor: "#333",
                }}
                onMouseEnter={e => {
                  e.currentTarget.style.backgroundColor =
                    "rgba(255, 255, 255, 0.04)";
                  e.currentTarget.style.borderColor = "#444";
                }}
                onMouseLeave={e => {
                  e.currentTarget.style.backgroundColor = "transparent";
                  e.currentTarget.style.borderColor = "#333";
                }}
              >
                Try local demo
              </button>
            ) : null}

            {!oauthUrl ? (
              <div
                className="rounded border px-3 py-2 text-xs leading-relaxed"
                style={{
                  backgroundColor: "rgba(244, 198, 116, 0.04)",
                  borderColor: "rgba(244, 198, 116, 0.2)",
                  color: "#b8a06b",
                }}
              >
                {setupMessage}
                {!demoModeEnabled
                  ? " For local manual testing, you can also set VITE_ENABLE_DEMO_LOGIN=true."
                  : ""}
              </div>
            ) : null}

            <div className="w-full h-px" style={{ backgroundColor: "#222" }} />

            <div className="flex flex-col gap-2">
              <div className="flex items-center gap-2">
                <div
                  className="w-1.5 h-1.5 rounded-full"
                  style={{ backgroundColor: "#4ade80" }}
                />
                <span className="text-xs" style={{ color: "#777" }}>
                  Secure OAuth 2.0 authentication
                </span>
              </div>
              <div className="flex items-center gap-2">
                <div
                  className="w-1.5 h-1.5 rounded-full"
                  style={{ backgroundColor: "#4ade80" }}
                />
                <span className="text-xs" style={{ color: "#777" }}>
                  Conversation history synced across sessions
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <p className="text-center text-xs mt-6" style={{ color: "#333" }}>
          EmbeddedGPT v2.4 - Hardware Knowledge Engine
        </p>
      </div>
    </div>
  );
}
