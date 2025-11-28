
import React, { useRef, useEffect } from "react";


export default function ParamsSection({ params, setParams }) {
  const addParam = () => setParams([...params, { key: "", value: "", enabled: true }]);
  const scrollRef = useRef(null);

  const update = (idx, field, val) => {
    setParams(params.map((p, i) => (i === idx ? { ...p, [field]: val } : p)));
  };

  const remove = (idx) => setParams(params.filter((_, i) => i !== idx));

  useEffect(() => {
  if (scrollRef.current) {
    scrollRef.current.scrollTo({
      top: scrollRef.current.scrollHeight,
      behavior: "smooth",
    });
  }
}, [params]);


  return (
    <div className="flex flex-col h-full">
      <h2 className="text-sm font-medium text-gray-600 mb-2">Query Parameters</h2>
      <div className="flex items-center justify-between mb-3">
        <div className="text-sm text-gray-600">Key</div>
        <div className="text-sm text-gray-600">Value</div>
      </div>

      {/* FIX: make this flex-1 + overflow-auto */}
     <div ref={scrollRef} className="h-full overflow-y-auto pr-2 space-y-2">



        {params.map((p, i) => (
          <div
  key={i}
  className="grid grid-cols-[28px_1fr_1fr_32px] gap-2 items-center border rounded px-2 py-1 animate-fadeIn"
>

            <input
              type="checkbox"
              checked={p.enabled}
              onChange={(e) => update(i, "enabled", e.target.checked)}
              className="w-5 h-5"
            />
            <input
              value={p.key}
              placeholder="Query parameter name"
              onChange={(e) => update(i, "key", e.target.value)}
              className="px-2 py-1 text-sm border rounded"
            />
            <input
              value={p.value}
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

     <div className="sticky bottom-0 bg-white dark:bg-gray-900 py-2">
  <button onClick={addParam} className="px-3 py-2 border rounded text-sm w-full">
    + Add Row
  </button>
</div>

    </div>
  );
}
