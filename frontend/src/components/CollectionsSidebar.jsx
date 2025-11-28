import React, { useState } from "react";
import { X, FolderPlus, Folder } from "lucide-react";

export default function CollectionsSidebar({
  open,
  onClose,
  collections,
  onCreateCollection
}) {
  const [showInput, setShowInput] = useState(false);
  const [newName, setNewName] = useState("");
   
  

  const createNewCollection = () => {
    if (!newName.trim()) return;
    onCreateCollection(newName.trim());
    setNewName("");
    setShowInput(false);
  };

  return (
    <div
      className={`
        fixed top-0 left-0 h-full w-80 bg-[#111] text-white shadow-xl
        transform transition-transform duration-300 z-50
        ${open ? "translate-x-0" : "-translate-x-full"}
      `}
    >
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-zinc-700">
        <h2 className="text-lg font-semibold">Collections</h2>
        <button onClick={onClose}>
          <X size={22} />
        </button>
      </div>

      {/* Create Collection */}
      <div className="p-4 border-b border-zinc-700">
        <button
          onClick={() => setShowInput(true)}
          className="w-full bg-blue-600 text-white py-2 rounded flex items-center justify-center gap-2"
        >
          <FolderPlus size={18} /> New Collection
        </button>

        {showInput && (
          <div className="mt-3 flex gap-2">
            <input
              autoFocus
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              placeholder="Collection name"
              className="flex-1 px-2 py-1 bg-zinc-900 border border-zinc-700 rounded"
            />
            <button
              onClick={createNewCollection}
              className="bg-green-600 px-3 rounded"
            >
              Add
            </button>
          </div>
        )}
      </div>

      {/* Collection List */}
      <div className="overflow-y-auto h-[calc(100%-160px)] p-3 space-y-3">
        {collections.length === 0 && (
          <p className="text-sm text-zinc-400 text-center mt-10">
            No collections created yet.
          </p>
        )}

        {collections.map((col) => (
          <div
            key={col.id}
            className="p-3 border border-zinc-700 rounded-md cursor-pointer hover:bg-zinc-900 transition flex items-center gap-2"
          >
            <Folder size={18} className="text-blue-400" />
            <span>{col.name}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
