interface Pin {
  pin: string;
  function: string;
  direction: string;
  notes?: string;
}

interface PinMappingProps {
  pins: Pin[];
}

export default function PinMapping({ pins }: PinMappingProps) {
  return (
    <div className="my-3 overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr style={{ borderBottom: "1px solid #333" }}>
            <th
              className="text-left py-2 px-3 font-medium uppercase tracking-widest text-xs"
              style={{ color: "#a0c4c4" }}
            >
              Pin
            </th>
            <th
              className="text-left py-2 px-3 font-medium uppercase tracking-widest text-xs"
              style={{ color: "#a0c4c4" }}
            >
              Function
            </th>
            <th
              className="text-left py-2 px-3 font-medium uppercase tracking-widest text-xs"
              style={{ color: "#a0c4c4" }}
            >
              Direction
            </th>
            <th
              className="text-left py-2 px-3 font-medium uppercase tracking-widest text-xs"
              style={{ color: "#a0c4c4" }}
            >
              Notes
            </th>
          </tr>
        </thead>
        <tbody>
          {pins.map((pin, idx) => (
            <tr
              key={idx}
              className="transition-colors"
              style={{
                borderBottom: "1px solid #1a1a1a",
                backgroundColor:
                  idx % 2 === 0 ? "rgba(255,255,255,0.01)" : "transparent",
              }}
            >
              <td
                className="py-2 px-3 font-mono text-xs"
                style={{ color: "#eee" }}
              >
                {pin.pin}
              </td>
              <td className="py-2 px-3 text-xs" style={{ color: "#999" }}>
                {pin.function}
              </td>
              <td className="py-2 px-3 text-xs" style={{ color: "#999" }}>
                {pin.direction}
              </td>
              <td className="py-2 px-3 text-xs" style={{ color: "#555" }}>
                {pin.notes || "-"}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
