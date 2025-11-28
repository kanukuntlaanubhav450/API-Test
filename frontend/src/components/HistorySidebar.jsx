import React from "react";
import { X } from "lucide-react";

export default function HistorySidebar({ open, onClose, history, onSelect }) {
  return (
    <div
      className={`
        fixed top-0 left-0 h-full w-80 bg-[#0f0f0f] text-white shadow-xl
        transform transition-transform duration-300 z-50
        ${open ? "translate-x-0" : "-translate-x-full"}
      `}
    >
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-zinc-800">
        <h2 className="text-lg font-semibold">History</h2>
        <button onClick={onClose}>
          <X size={22} />
        </button>
      </div>

      {/* List */}
      <div className="overflow-y-auto h-[calc(100%-60px)] p-3 space-y-3">
        {history.length === 0 && (
          <p className="text-sm text-zinc-400 text-center mt-10">
            No history yet.
          </p>
        )}

        {history.map((item) => (
          <div
            key={item.id}
            onClick={() => onSelect(item)}
            className="p-3 border border-zinc-800 rounded-md cursor-pointer hover:bg-zinc-900 transition"
          >
            <div className="flex items-center justify-between">
              <span className="text-xs px-2 py-1 bg-zinc-800 rounded">
                {item.method}
              </span>
              <span className="text-xs text-zinc-400">
                {new Date(item.created_at).toLocaleString()}
              </span>
            </div>

            <p className="mt-2 text-sm break-all text-zinc-200">{item.url}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
