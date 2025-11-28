import { useState } from "react";
import HeadersSection from "./components/HeadersSection";
import ParamsSection from "./components/ParamsSection";
import AceEditor from "react-ace";
import HistorySidebar from "./components/HistorySidebar";
import CollectionsSidebar from "./components/CollectionsSidebar";

import "ace-builds/src-noconflict/mode-json";
import "ace-builds/src-noconflict/theme-dracula";
import "ace-builds/src-noconflict/theme-chrome";

function safeJsonParse(str) {
  try {
    return JSON.parse(str);
  } catch {
    return { message: str };
  }
}

export default function App() {
  const [url, setUrl] = useState("");
  const [method, setMethod] = useState("GET");
  const [response, setResponse] = useState(null);
  const [loading, setLoading] = useState(false);
  const [body, setBody] = useState("");
  const [apiStatus, setApiStatus] = useState(null);
  const [apiStatusText, setApiStatusText] = useState("");
  const [darkMode, setDarkMode] = useState(false);
  const [responseTime, setResponseTime] = useState(null);
  const [copied, setCopied] = useState(false);
  const [responseTab, setResponseTab] = useState("body");
  const [responseHeaders, setResponseHeaders] = useState({});
  const [historyOpen, setHistoryOpen] = useState(false);
  const [historyList, setHistoryList] = useState([]);
  const [collectionsOpen, setCollectionsOpen] = useState(false);
  const [collections, setCollections] = useState([]);

  // app state
  const [headers, setHeaders] = useState([
    { key: "Content-Type", value: "application/json", enabled: true },
  ]);
  const [params, setParams] = useState([]);
  const [activeTab, setActiveTab] = useState("params"); // default tab

  const sendRequest = async () => {
    if (!url) {
      alert("Please enter a URL");
      return;
    }
    setLoading(true);
    setResponse("Loading...");
    const enabledHeaders = {};
    headers.forEach((h) => {
      if (h.enabled && h.key.trim() !== "") enabledHeaders[h.key] = h.value;
    });

    const enabledParams = params.filter((p) => p.enabled && p.key.trim() !== "");
    let finalUrl = url;
    if (enabledParams.length > 0) {
      const qs = enabledParams
        .map((p) => `${encodeURIComponent(p.key)}=${encodeURIComponent(p.value)}`)
        .join("&");
      finalUrl += finalUrl.includes("?") ? "&" + qs : "?" + qs;
    }

    let parsedBody = null;
    try {
      parsedBody = body ? JSON.parse(body) : null;
    } catch {
      alert("Invalid JSON in body");
      setLoading(false);
      return;
    }

    const payload = { url: finalUrl, method, headers: enabledHeaders, body: parsedBody };
    const startTime = performance.now();

    try {
      const startTime = performance.now();
      const res = await fetch("http://localhost:5000/proxy", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
    const rawHeaders = {};
res.headers.forEach((val, key) => rawHeaders[key] = val);

const result = await res.json();
setResponseHeaders(rawHeaders);


const endTime = performance.now();  
setResponseTime(Math.round(endTime - startTime));

setApiStatus(result.status);
setApiStatusText(result.statusText);
setResponse(JSON.stringify(result.data));
// Save real request to history
setHistoryList((prev) => [
  {
    id: Date.now(),
    method,
    url: finalUrl,
    headers: enabledHeaders,
    params: enabledParams,
    body: parsedBody,
    created_at: new Date().toISOString()
  },
  ...prev
]);


    } catch (err) {
      setResponse("Error: " + err.message);
    } finally {
      setLoading(false);
    }
  };


const copyResponse = () => {
  if (!response) return;

  navigator.clipboard.writeText(
    JSON.stringify(safeJsonParse(response), null, 2)
  )
    .then(() => {
      alert("Response copied!");
    })
    .catch(() => {
      alert("Failed to copy!");
    });
};
        const handleHistorySelect = (item) => {
         setUrl(item.url);
          setMethod(item.method);
          setHeaders(item.headers || []);
          setParams(item.params || []);
          setBody(item.body ? JSON.stringify(item.body, null, 2) : "");

          setHistoryOpen(false);
        };
const handleCreateCollection = (name) => {
  setCollections((prev) => [
    ...prev,
    {
      id: Date.now(),
      name,
      items: []
    }
  ]);

  alert("Collection created!");
};


 return (
    <div
  className={`${darkMode ? "bg-gray-900 text-white" : "bg-gray-100 text-black"} 
              w-screen h-screen overflow-hidden flex flex-col`}
>


      {/* Top bar — spans full width */}

      {/* Three-column layout:
          - left: fixed min/max (history/collections)
          - middle: takes most space (1fr)
          - right: fixed min/max (response)
        Using Tailwind arbitrary grid columns for exact control.
      */}
      <div
        className="grid w-full"
        style={{
         gridTemplateColumns: "260px 1fr 0.8fr",
          height: "calc(100vh - 0px)",

        }}
      >
        {/* LEFT: History & Collections */}
        <aside className="border-r p-4 bg-white dark:bg-gray-800 overflow-auto h-full">
          <h3 className="font-bold text-lg mb-3">API Tester</h3>
          <div className="mb-4">
            <input placeholder="Search..." className="w-full border rounded px-3 py-2 text-sm bg-white dark:bg-gray-700" />
          </div>

          <div className="mb-2 border-b">
            <nav className="flex gap-4 text-sm">
             <button
  onClick={() => setHistoryOpen(true)}
  className="py-2 border-b-2 border-blue-500"
>
  History
</button>

              <button
  onClick={() => setCollectionsOpen(true)}
  className="py-2 text-gray-600"
>
  Collections
</button>

            </nav>
          </div>

          <div className="mt-4 text-sm space-y-4"></div>
            <div className="text-xs text-gray-500">No requests yet</div>

          


          
        </aside>

        {/* MIDDLE: URL, tabs, params/headers/body */}
      <main className="px-6 pb-2 pt-4 bg-white dark:bg-gray-900 min-h-0 flex flex-col overflow-hidden">

{/* URL BAR (now inside middle section) */}
<div className="sticky top-0 z-10 flex items-center gap-3 px-1 py-3 border-b bg-white dark:bg-gray-800">
  <select
    value={method}
    onChange={(e) => setMethod(e.target.value)}
    className="border rounded px-3 py-2 bg-white text-sm"
  >
    <option>GET</option>
    <option>POST</option>
    <option>PUT</option>
    <option>DELETE</option>
    <option>PATCH</option>
  </select>

  <input
    value={url}
    onChange={(e) => setUrl(e.target.value)}
    placeholder="Enter request URL..."
    className="flex-1 border rounded px-3 py-2 text-sm"
  />

  <button
    onClick={sendRequest}
    disabled={loading}
    className="bg-blue-600 text-black px-4 py-2 rounded"
  >
    {loading ? "Sending..." : "Send"}
  </button>
</div>


          {/* Tabs */}
          <div className="mb-4">
            <nav className="flex gap-6 items-end">
              <button
                onClick={() => setActiveTab("params")}
                className={`py-2 ${activeTab === "params" ? "border-b-2 border-blue-600 text-blue-600" : "text-gray-600"}`}
              >
                Params
              </button>
              <button
                onClick={() => setActiveTab("headers")}
                className={`py-2 ${activeTab === "headers" ? "border-b-2 border-blue-600 text-blue-600" : "text-gray-600"}`}
              >
                Headers
              </button>
              <button
                onClick={() => setActiveTab("body")}
                className={`py-2 ${activeTab === "body" ? "border-b-2 border-blue-600 text-blue-600" : "text-gray-600"}`}
              >
                Body
              </button>
            </nav>
          </div>

          {/* Tab content area — middle gets the most horizontal & vertical space */}
          <div className="min-h-0 flex flex-col">

           <div className="flex-1 min-h-0 overflow-y-auto overflow-x-hidden pr-3 pb-3">




              {activeTab === "params" && <ParamsSection params={params} setParams={setParams} />}
              {activeTab === "headers" && <HeadersSection headers={headers} setHeaders={setHeaders} />}
              {activeTab === "body" && (
                <div>
                  <h2 className="text-sm font-medium text-gray-600 mb-2">Request Body</h2>
                  <div className="mb-3 text-sm text-gray-500">Enter JSON body...</div>
                  <AceEditor
                    mode="json"
                    theme={darkMode ? "dracula" : "chrome"}
                    name="body-editor"
                    fontSize={14}
                    width="100%"
                    height="400px"
                    value={body}
                    onChange={(val) => setBody(val)}
                    setOptions={{ useWorker: false, showLineNumbers: true, tabSize: 2 }}
                    className="border rounded"
                  />
                </div>
              )}
            </div>

          
          </div>
        </main>

        {/* RIGHT: Response */}
       <aside className="border-l p-4 bg-white dark:bg-gray-800 h-full overflow-hidden flex flex-col">

          {/* HEADER: Response + Copy button */}
<div className="flex justify-between items-center mb-4">
  <h3 className="text-lg font-semibold">Response</h3>

  <button
    onClick={copyResponse}
    className={`border rounded px-3 py-1 text-sm transition flex items-center gap-2 ${
      copied ? "bg-green-500 text-white" : ""
    }`}
  >
    {copied ? "✓ Copied" : "📋 Copy"}
  </button>
</div>


{/* Status Line */}
<div className="sticky top-0 z-10 bg-white dark:bg-gray-800 text-sm flex items-center gap-4 py-2">


  <span className="font-medium">Status:</span>

  <span className={apiStatus >= 400 ? "text-red-500 font-semibold" : "text-green-600 font-semibold"}>
    {apiStatus !== null ? apiStatus : "--"}
  </span>

  <span className="text-gray-500">{apiStatusText}</span>

  {responseTime !== null && (
    <span className="text-gray-500 flex items-center gap-1">
      ⏱ {responseTime}ms
    </span>
  )}

</div>


{/*  Response Tabs */}
<div className="sticky top-10 z-10 bg-white dark:bg-gray-800 border-b flex gap-4 py-2">

  <button
    onClick={() => setResponseTab("body")}
    className={`py-2 text-sm ${responseTab === "body" ? "border-b-2 border-blue-600 text-blue-600" : "text-gray-500"}`}
  >
    Body
  </button>

  <button
    onClick={() => setResponseTab("headers")}
    className={`py-2 text-sm ${responseTab === "headers" ? "border-b-2 border-blue-600 text-blue-600" : "text-gray-500"}`}
  >
    Headers
  </button>
</div>



{/* JSON BOX */}
<div className="border rounded p-3 h-full overflow-auto bg-gray-50 dark:bg-gray-700">

 {responseTab === "body" && (
  response ? (
    <AceEditor
      mode="json"
      theme={darkMode ? "dracula" : "chrome"}
      name="response-editor"
      fontSize={14}
      width="100%"
      height="100%"
      readOnly={true}
      value={JSON.stringify(safeJsonParse(response), null, 2)}
      setOptions={{ useWorker: false }}
    />
  ) : (
    <div className="text-center text-gray-400 mt-10">No response yet</div>
  )
)}

{responseTab === "headers" && (
  <pre className="whitespace-pre-wrap text-sm">
    {Object.entries(responseHeaders).map(([key, value]) => (
      `${key}: ${value}\n`
    ))}
  </pre>
)}


</div>

        </aside>
      </div>

    {/* ✅ Step 6: History Drawer goes HERE */}
      <HistorySidebar
        open={historyOpen}
        onClose={() => setHistoryOpen(false)}
        history={historyList}
        onSelect={handleHistorySelect}
      />

{/* ✅ Step 7: Collections  goes HERE */}

<CollectionsSidebar
  open={collectionsOpen}
  onClose={() => setCollectionsOpen(false)}
  collections={collections}
  onCreateCollection={handleCreateCollection}
/>




    </div>
  );
}
