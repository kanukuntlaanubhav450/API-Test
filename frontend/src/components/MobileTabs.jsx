import React from "react";

export default function MobileTabs({ activeTab, setActiveTab }) {
  return (
    <nav className="fixed bottom-0 left-0 w-full bg-white border-t flex justify-around py-2 md:hidden z-50" aria-label="Mobile navigation">
      {/* Home */}
      <button
        onClick={() => setActiveTab("home")}
        aria-label="Home tab"
        aria-current={activeTab === "home" ? "page" : undefined}
        className={`flex flex-col items-center text-xs ${
          activeTab === "home" ? "text-blue-600 font-bold" : "text-gray-500"
        }`}
      >
        <span aria-hidden="true">🏠</span>
        <span aria-hidden="true">Home</span>
        <span className="sr-only">Home tab</span>
      </button>

      {/* History */}
      <button
        onClick={() => setActiveTab("history")}
        aria-label="History tab"
        aria-current={activeTab === "history" ? "page" : undefined}
        className={`flex flex-col items-center text-xs ${
          activeTab === "history" ? "text-blue-600 font-bold" : "text-gray-500"
        }`}
      >
        <span aria-hidden="true">📜</span>
        <span aria-hidden="true">History</span>
        <span className="sr-only">History tab</span>
      </button>

      {/* Response */}
      <button
        onClick={() => setActiveTab("response")}
        aria-label="Response tab"
        aria-current={activeTab === "response" ? "page" : undefined}
        className={`flex flex-col items-center text-xs ${
          activeTab === "response" ? "text-blue-600 font-bold" : "text-gray-500"
        }`}
      >
        <span aria-hidden="true">📄</span>
        <span aria-hidden="true">Response</span>
        <span className="sr-only">Response tab</span>
      </button>

      {/* Collections */}
      <button
        onClick={() => setActiveTab("collections")}
        aria-label="Collections tab"
        aria-current={activeTab === "collections" ? "page" : undefined}
        className={`flex flex-col items-center text-xs ${
          activeTab === "collections" ? "text-blue-600 font-bold" : "text-gray-500"
        }`}
      >
        <span aria-hidden="true">📁</span>
        <span aria-hidden="true">Collections</span>
        <span className="sr-only">Collections tab</span>
      </button>

    </nav>
  );
}
