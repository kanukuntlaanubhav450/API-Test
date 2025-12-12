import React, { useState, useEffect } from "react";
import { X, FolderPlus, Folder } from "lucide-react";

export default function CollectionsSidebar({
  open,
  onClose,
  collections = [],
  onCreateCollection,
  onDelete,           // delete collection
  onSelectItem,       // load saved request
  onDeleteItem        // delete saved request
}) {
  const [showInput, setShowInput] = useState(false);
  const [newName, setNewName] = useState("");
  const [expanded, setExpanded] = useState({});

  useEffect(() => {
    console.log("Collections updated in sidebar:", collections);
  }, [collections]);

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
      {/* HEADER */}
      <div className="flex items-center justify-between p-4 border-b border-zinc-700">
        <h2 className="font-semibold">Collections</h2>
        <button onClick={onClose}>
          <X size={22} color="black" />
        </button>
      </div>

      {/* CREATE COLLECTION */}
      <div className="p-4 border-b border-zinc-700">
        <button
          onClick={() => setShowInput(true)}
          className="w-full bg-blue-600 text-black py-2 rounded flex items-center justify-center gap-2"
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
              className="bg-green-600 text-black px-3 rounded"
            >
              Add
            </button>
          </div>
        )}
      </div>

      {/* COLLECTION LIST */}
      <div className="overflow-y-auto h-[calc(100%-160px)] p-3 space-y-3">
        {(!collections || collections.length === 0) && (
          <p className="text-sm text-zinc-400 text-center mt-10">
            No collections created yet.
          </p>
        )}

        {(collections || []).map((col) => (
          <div
            key={col.id}
            className="border border-zinc-700 rounded-md hover:bg-zinc-900 transition"
          >
            {/* COLLECTION HEADER */}
            <div
              className="p-3 flex justify-between items-center cursor-pointer"
              onClick={() =>
                setExpanded((prev) => ({
                  ...prev,
                  [col.name]: !prev[col.name],
                }))
              }
            >
              <div className="flex items-center gap-2">
                <Folder size={18} className="text-gray-300" />
                <span>{col.name}</span>
              </div>

              <span className="text-sm">
                {expanded[col.name] ? "▾" : "▸"}
              </span>
            </div>

            {/* SAVED REQUESTS */}
            {expanded[col.name] && (
              <div className="pl-6 pb-3 space-y-2">
                {col.items && col.items.length > 0 ? (
                  col.items.map((item) => (
                    <div
                      key={item.id}
                      className="p-2 bg-zinc-800 rounded flex justify-between items-start hover:bg-zinc-700 cursor-pointer"
                    >
                      {/* LOAD ITEM */}
                      <div
                        className="flex-1"
                        onClick={() => onSelectItem(item)}


                      >
                        <div className="font-semibold text-sm">{item.description}</div>
                        <div className="text-xs text-gray-400 break-all">
                          {item.request?.url}
                        </div>
                      </div>

                      {/* DELETE ITEM */}
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onDeleteItem(col.name, item.id);
                        }}
                        className="text-red-500 hover:text-red-700 ml-2 text-sm"
                      >
                        ✕
                      </button>
                    </div>
                  ))
                ) : (
                  <div className="text-xs text-gray-500">No saved requests</div>
                )}
              </div>
            )}

            {/* DELETE COLLECTION BUTTON */}
            <div className="border-t border-zinc-700 p-2 text-right">
              <button
                onClick={() => onDelete(col.id)}
                className="text-red-400 hover:text-red-600 text-sm"
              >
                Delete Collection
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
