export default function TypingIndicator() {
  return (
    <div className="flex items-center gap-1 py-3">
      <div
        className="w-1.5 h-1.5 rounded-full typing-dot"
        style={{ backgroundColor: "#a0c4c4" }}
      />
      <div
        className="w-1.5 h-1.5 rounded-full typing-dot"
        style={{ backgroundColor: "#a0c4c4" }}
      />
      <div
        className="w-1.5 h-1.5 rounded-full typing-dot"
        style={{ backgroundColor: "#a0c4c4" }}
      />
    </div>
  );
}
