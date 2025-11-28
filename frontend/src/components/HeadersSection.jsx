
import React, { useRef, useEffect } from "react";


export default function HeadersSection({ headers, setHeaders }) {
  const addHeader = () =>
    setHeaders([...headers, { key: "", value: "", enabled: true }]);
  const scrollRef = useRef(null);

  const update = (idx, field, val) => {
    setHeaders(headers.map((h, i) => (i === idx ? { ...h, [field]: val } : h)));
  };

  const remove = (idx) =>
    setHeaders(headers.filter((_, i) => i !== idx));

  useEffect(() => {
  if (scrollRef.current) {
    scrollRef.current.scrollTo({
      top: scrollRef.current.scrollHeight,
      behavior: "smooth",
    });
  }
}, [headers]);


  return (
    <div className="flex flex-col h-full">
      {/* Header row labels */}
      <h2 className="text-sm font-medium text-gray-600 mb-2">Request Headers</h2>
      <div className="flex items-center justify-between mb-3">
        <div className="text-sm text-gray-600">Key</div>
        <div className="text-sm text-gray-600">Value</div>
      </div>

      {/* FIX: Scrollable list area */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto pr-2 space-y-2">

        {headers.map((h, i) => (
         <div
  key={i}
  className="grid grid-cols-[28px_1fr_1fr_32px] gap-2 items-center border rounded px-2 py-1 animate-fadeIn"
>

            <input
              type="checkbox"
              checked={h.enabled}
              onChange={(e) => update(i, "enabled", e.target.checked)}
              className="w-5 h-5"
            />
            <input
              value={h.key}
              placeholder="Header name"
              onChange={(e) => update(i, "key", e.target.value)}
              className="px-2 py-1 text-sm border rounded"
            />
            <input
              value={h.value}
              placeholder="Value"
              onChange={(e) => update(i, "value", e.target.value)}
              className="px-2 py-1 text-sm border rounded"
            />
           <button
  onClick={() => remove(i)}
  className="text-red-500 hover:text-red-700 text-xs leading-none"
  style={{
    padding: "0px",
    margin: "0px",
    width: "16px",
    height: "16px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  }}
>
  ✕
</button>


          </div>
        ))}
      </div>

      {/* Add button */}
      <div className="sticky bottom-0 bg-white dark:bg-gray-900 py-2">
  <button onClick={addHeader} className="px-3 py-2 border rounded text-sm w-full">
    + Add Header
  </button>
</div>

    </div>
  );
}
