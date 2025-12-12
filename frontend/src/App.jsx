import { useState } from "react";
import HeadersSection from "./components/HeadersSection";
import ParamsSection from "./components/ParamsSection";
import AceEditor from "react-ace";
import HistorySidebar from "./components/HistorySidebar";
import CollectionsSidebar from "./components/CollectionsSidebar";
import "ace-builds/src-noconflict/mode-json";
import "ace-builds/src-noconflict/theme-dracula";
import "ace-builds/src-noconflict/theme-chrome";
import { auth } from "./firebase";
import { onAuthStateChanged, signOut } from "firebase/auth";
import { useNavigate } from "react-router-dom";
import { useEffect } from "react";
import { db } from "./firebase";
import { saveHistoryItem, getUserHistory } from "./utils/history";
import { createUserCollection, saveCollectionItem, loadUserCollections, loadCollectionItems } from "./utils/collections";
import MobileTabs from "./components/MobileTabs";
import { logLogout, logLogin, logSignup } from "./utils/logUserEvent";


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
  const [searchQuery, setSearchQuery] = useState("");
  const [activeSidebarTab, setActiveSidebarTab] = useState("history");
  const [user, setUser] = useState(null);
  const navigate = useNavigate();
  const [mobileTab, setMobileTab] = useState("home");
  const [openSaveModal, setOpenSaveModal] = useState(false);
  const [description, setDescription] = useState("");
  const [collectionName, setCollectionName] = useState("");
  const [saveSuccess, setSaveSuccess] = useState("");
  const [saveError, setSaveError] = useState("");
  const [selectedCollection, setSelectedCollection] = useState("");
  const [newCollectionInput, setNewCollectionInput] = useState("");
  const [expandedCollections, setExpandedCollections] = useState({});





useEffect(() => {
  if (!openSaveModal) {
    setSaveSuccess("");
    setSaveError("");
  }
}, [openSaveModal]);

useEffect(() => {
  const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
    setUser(currentUser);
  });
  return () => unsubscribe();
}, []);

useEffect(() => {
  if (!user) {
    setHistoryList([]);
    setCollections([]);   // also clear collections for guest
    return;
  }



  const loadHistory = async () => {
    const { items = [] } = await getUserHistory(user.uid);
    const clean = items.map(doc => ({
      id: doc.id,
      method: doc.method || "",
      url: doc.url || "",
      headers: doc.headers || [],
      params: doc.params || [],
      body: doc.body || "",
      created_at: doc.created_at || ""
    }));

    const deleted = JSON.parse(localStorage.getItem("deletedHistory") || "[]");
    const filtered = clean.filter(item => !deleted.includes(item.id));

    setHistoryList(filtered);
  };

  loadHistory();

  // ⭐ Collections loader
 const loadCollections = async () => {
  try {
    // Load ALL collections + their items
    const cols = await loadUserCollections(user.uid);

    setCollections(cols);  // cols already contains items[]
  } catch (err) {
    console.error("Failed to load collections:", err);
    setCollections([]);
  }
};




  loadCollections();

}, [user]);

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
  setApiStatus(null);
  setApiStatusText("");
  setResponse("Loading...");

  // Build headers
  const enabledHeaders = {};
  headers.forEach((h) => {
    if (h.enabled && h.key.trim() !== "") enabledHeaders[h.key] = h.value;
  });

  // Build params
  const enabledParams = params.filter(
    (p) => p.enabled && p.key.trim() !== ""
  );

  let finalUrl = url;

  if (enabledParams.length > 0) {
    const qs = enabledParams
      .map(
        (p) =>
          `${encodeURIComponent(p.key)}=${encodeURIComponent(p.value)}`
      )
      .join("&");

    finalUrl += finalUrl.includes("?") ? "&" + qs : "?" + qs;
  }

  // Parse request body
  let parsedBody = null;
  try {
    parsedBody = body ? JSON.parse(body) : null;
  } catch {
    alert("Invalid JSON in body");
    setLoading(false);
    return;
  }

  const payload = {
    url: finalUrl,
    method: method.toUpperCase(),
    headers: enabledHeaders,
    body: parsedBody,
  };

  const start = performance.now();

  try {
    const res = await fetch(
      `${import.meta.env.VITE_API_URL || "http://localhost:5000"}/proxy`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      }
    );

    // Extract response headers
    const rawHeaders = {};
    res.headers.forEach((val, key) => (rawHeaders[key] = val));
    setResponseHeaders(rawHeaders);

    // Parse JSON
    let result;
    try {
      result = await res.json();
    } catch {
      result = {
        status: res.status,
        statusText: res.statusText,
        data: "Non-JSON response",
      };
    }

    setApiStatus(result.status);
    setApiStatusText(result.statusText);

    let bodyOut = result.data;
    if (typeof bodyOut === "object") {
      bodyOut = JSON.stringify(bodyOut, null, 2);
    }

    setResponse(String(bodyOut));

    // Save history
    if (user) {
      const docRef = await saveHistoryItem(user.uid, {
        method,
        url: finalUrl,
        headers: enabledHeaders,
        params: enabledParams,
        body: parsedBody,
      });

      setHistoryList((prev) => [
        {
          id: docRef.id,   // NOW docRef exists
          method,
          url: finalUrl,
          headers: enabledHeaders,
          params: enabledParams,
          body: parsedBody,
          created_at: new Date().toISOString(),
        },
        ...prev,
      ]);
    }
  } catch (err) {
    setResponse("Error: " + err.message);
  } finally {
    setResponseTime(Math.round(performance.now() - start));
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
       // NEW UPDATED handleHistorySelect — paste this entire block
const handleHistorySelect = (item) => {

  // normalize url & method
  setUrl(item.url || "");
  setMethod((item.method || "GET").toUpperCase());

  // normalize headers
  const normHeaders = Array.isArray(item.headers)
    ? item.headers.map(h => ({
        key: (h.key ?? "").toString(),
        value: (h.value ?? "").toString(),
        enabled: h.enabled !== false
      }))
    : [];

  if (normHeaders.length === 0) {
    setHeaders([{ key: "Content-Type", value: "application/json", enabled: true }]);
  } else {
    setHeaders(normHeaders);
  }

  // normalize params
  const normParams = Array.isArray(item.params)
    ? item.params.map(p => ({
        key: (p.key ?? "").toString(),
        value: (p.value ?? "").toString(),
        enabled: p.enabled !== false
      }))
    : [];
  setParams(normParams);

  // normalize body
  let bodyText = "";
  if (typeof item.body === "string") {
    bodyText = item.body;
  } else if (item.body && typeof item.body === "object") {
    bodyText = JSON.stringify(item.body, null, 2);
  }
  setBody(bodyText);

  // reset response panel
  setResponse(null);
  setApiStatus(null);
  setApiStatusText("");
  setResponseHeaders({});
  setResponseTime(null);

  // close sidebar
  setHistoryOpen(false);

  console.log("History item loaded:", item);
};

const handleCreateCollection = async (name) => {
  if (!user) {
    // Guest user — temporary UI only
    setCollections(prev => [
      { id: "local-" + Date.now(), name, items: [] },
      ...prev
    ]);
    return;
  }

  // Logged-in user — save to Firestore
  const newItem = {
    name,
    items: []
  };

  try {
    const docRef = await saveCollection(user.uid, newItem);

    // Update UI after successful save
    setCollections(prev => [
      { id: docRef.id, ...newItem },
      ...prev
    ]);
  } catch (error) {
    console.error("Failed to create collection:", error);
    alert("Failed to create collection. Please try again.");
  }
}; // <-- 🔥 THIS MUST BE HERE (closing the function)

const handleDeleteSavedRequest = (collectionName, itemId) => {
  setCollections((prev) =>
    prev.map((col) => {
      if (col.name === collectionName) {
        return {
          ...col,
          items: col.items.filter((item) => item.id !== itemId),
        };
      }
      return col;
    })
  );
};

const filteredHistory = historyList.filter((item) =>
  item.url.toLowerCase().includes(searchQuery.toLowerCase())
);

const filteredCollections = collections.filter((col) =>
  col.name.toLowerCase().includes(searchQuery.toLowerCase())
);
const handleDeleteHistory = (id) => {
  // Save deleted ID locally
  const deleted = JSON.parse(localStorage.getItem("deletedHistory") || "[]");

  if (!deleted.includes(id)) {
    deleted.push(id);
    localStorage.setItem("deletedHistory", JSON.stringify(deleted));
  }

  // Remove from UI
  setHistoryList(prev => prev.filter((h) => h.id !== id));
};


const handleDeleteCollection = (id) => {
  // store deleted IDs in localStorage
  const deleted = JSON.parse(localStorage.getItem("deletedCollections") || "[]");

  if (!deleted.includes(id)) {
    deleted.push(id);
    localStorage.setItem("deletedCollections", JSON.stringify(deleted));
  }

  // remove from UI only
  setCollections(prev => prev.filter(c => c.id !== id));
};
const handleSave = async () => {

if (!description.trim()) {
  setSaveError("Description is required.");
  setSaveSuccess("");
  return;
}

 // --- COLLECTION SELECTION LOGIC ---
  let finalCollectionName = "";

  if (selectedCollection === "+new") {
    if (!newCollectionInput.trim()) {
      setSaveError("Please enter a name for the new collection.");
      setSaveSuccess("");
      return;
    }
    finalCollectionName = newCollectionInput.trim();
  } else {
    if (!selectedCollection.trim()) {
      setSaveError("Please select a collection.");
      setSaveSuccess("");
      return;
    }
    finalCollectionName = selectedCollection.trim();
  }

  if (!response) {
    alert("No response to save!");
    return;
  }

  const payload = {
    description,
    collectionName: finalCollectionName,

    userId: user?.uid || null,
    request: {
      url,
      method,
      headers,
      params,
      body,
    },
    response: {
      status: apiStatus,
      statusText: apiStatusText,
      headers: responseHeaders,
      data: response,
      time: responseTime,
    },
    createdAt: new Date().toISOString(),
  };

try {
  let collectionId = collections.find(c => c.name === finalCollectionName)?.id;

  // ⭐ 1️⃣ If new collection → create it first
  if (!collectionId) {
    // Create Firestore collection
    const newCol = await createUserCollection(user.uid, finalCollectionName);

    // Add new collection to UI
    setCollections(prev => [
      { id: newCol.id, name: newCol.name, items: [] },
      ...prev
    ]);

    collectionId = newCol.id;  // Now we have the correct ID
  }

  // ⭐ 2️⃣ Save request item inside this collection
  const savedItemId = await saveCollectionItem(collectionId, payload, user.uid);

  // ⭐ 3️⃣ Update UI with newly saved item
  setCollections(prev =>
    prev.map(col =>
      col.id === collectionId
        ? {
            ...col,
            items: [
              {
                id: savedItemId,
                description,
                request: { url, method, headers, params, body },
                response: {
                  status: apiStatus,
                  statusText: apiStatusText,
                  headers: responseHeaders,
                  data: response,
                  time: responseTime,
                },
                createdAt: new Date().toISOString(),
              },
              ...(col.items || []),
            ],
          }
        : col
    )
  );

  // ⭐ 4️⃣ Success message + close modal
  setSaveSuccess("Saved successfully!");
  setSaveError("");

  setTimeout(() => {
    setOpenSaveModal(false);
    setSaveSuccess("");  
  }, 1200);

} catch (err) {
  setSaveError("Save failed: " + err.message);
  setSaveSuccess("");
}

};
useEffect(() => {
  if (!openSaveModal) {
    setDescription("");
    setCollectionName("");
  }
}, [openSaveModal]);


const handleLoadSavedCollectionItem = (item) => {
  const req = item.request;

  // URL + METHOD
  setUrl(req.url || "");
  setMethod(req.method || "GET");

  // HEADERS
  setHeaders(
    Array.isArray(req.headers)
      ? req.headers
      : [{ key: "Content-Type", value: "application/json", enabled: true }]
  );

  // PARAMS
  setParams(Array.isArray(req.params) ? req.params : []);

  // BODY
  let bodyText = "";
  if (typeof req.body === "string") {
    bodyText = req.body;
  } else if (req.body && typeof req.body === "object") {
    bodyText = JSON.stringify(req.body, null, 2);
  }
  setBody(bodyText);

  // RESPONSE
  const res = item.response;
  if (res) {
    setApiStatus(res.status || null);
    setApiStatusText(res.statusText || "");
    setResponseHeaders(res.headers || {});

    let resBody = res.data;
    if (typeof resBody === "object") {
      resBody = JSON.stringify(resBody, null, 2);
    }
    setResponse(resBody || "");

    setResponseTime(res.time || null);
  } else {
    // If no response saved
    setApiStatus(null);
    setApiStatusText("");
    setResponse("");
    setResponseHeaders({});
    setResponseTime(null);
  }

  // Close sidebar
  setCollectionsOpen(false);
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
 {/* DESKTOP UI — only visible on md and above */}
<div
  className="
    hidden 
    md:grid 
    grid-cols-[260px_1fr_0.8fr]
    w-full 
    h-[100vh]
  "
>



        {/* LEFT: History & Collections */}
       {/* LEFT: History & Collections */}
<aside className="
  border-r 
  p-4 
  bg-white dark:bg-gray-800 
  overflow-auto 
  h-full
">



  {/* Title */}
  <h3 className="font-bold text-lg mb-3">API Tester</h3>
        {/* Login / Signup buttons */}
{/* Show Welcome if logged in */}
{user ? (
  <div className="mb-3">
    <p className="text-sm font-semibold text-green-700">
      Welcome, {user.email}
    </p>

   <button
  onClick={async () => {
    try {
      if (user) {
        await logLogout(user);
      }
      await signOut(auth);
    } catch (error) {
      console.error("Logout failed:", error);
    }
  }}
  className="text-red-600 text-xs underline mt-1 cursor-pointer"
>
  Logout
</button>


  </div>
) : (
  /* Show Login + Signup if NOT logged in */
  <div className="flex gap-2 mb-3">
    <button
      className="px-3 py-1 bg-blue-600 text-black rounded"
      onClick={() => navigate("/login")}

    >
      Login
    </button>

    <button
      className="px-3 py-1 bg-green-600 text-black rounded"
      onClick={() => navigate("/signup")}

    >
      Sign Up
    </button>
  </div>
)}



  {/* Search Bar */}
  <div className="mb-4">
    <input
      value={searchQuery}
      onChange={(e) => setSearchQuery(e.target.value)}
      placeholder="Search..."
      className="w-full border rounded px-3 py-2 text-sm bg-white dark:bg-gray-700"
    />
  </div>

  {/* Tabs */}
  <div className="mb-2 border-b">
    <nav className="flex gap-4 text-sm">

      {/* History Button */}
      <button
        onClick={() => {
          setActiveSidebarTab("history");
          setHistoryOpen(true);
        }}
        className={`py-2 ${
          activeSidebarTab === "history"
            ? "border-b-2 border-blue-500"
            : "text-gray-600"
        }`}
      >
        History
      </button>

      {/* Collections Button */}
      <button
        onClick={() => {
          setActiveSidebarTab("collections");
          setCollectionsOpen(true);
        }}
        className={`py-2 ${
          activeSidebarTab === "collections"
            ? "border-b-2 border-blue-500"
            : "text-gray-600"
        }`}
      >
        Collections
      </button>
    </nav>
  </div>

  {/* SHOW RESULTS ONLY WHEN SEARCH HAS INPUT */}
 {/* ALWAYS SHOW HISTORY OR FILTERED HISTORY */}
<div className="mt-4 text-sm space-y-4">

  {/* HISTORY TAB */}
  {activeSidebarTab === "history" && (
    <div>
      {(searchQuery.trim() ? filteredHistory : historyList).length === 0 ? (
        <div className="text-xs text-gray-500">No history yet</div>
      ) : (
        (searchQuery.trim() ? filteredHistory : historyList).map((item) => (
          <div
            key={item.id || item.tempId}
            onClick={() => handleHistorySelect(item)}
            className="p-2 border border-gray-300 rounded cursor-pointer hover:bg-gray-100"
          >
            <div className="text-xs text-blue-600 font-semibold">
              {item.method}
            </div>
            <div className="text-xs break-all">{item.url}</div>
          </div>
        ))
      )}
    </div>
  )}

  {/* COLLECTIONS TAB — KEEP YOUR EXISTING CODE BELOW */}
 {activeSidebarTab === "collections" && (
  <div>
    {filteredCollections.length === 0 ? (
      <div className="text-xs text-gray-500">No matching collections</div>
    ) : (
      filteredCollections.map((col) => (
        <div
          key={col.id}
          className="border border-gray-300 rounded cursor-pointer mb-2"
        >
          {/* HEADER ROW */}
          <div
            className="p-2 hover:bg-gray-100 flex justify-between items-center"
            onClick={() =>
              setExpandedCollections((prev) => ({
                ...prev,
                [col.name]: !prev[col.name],
              }))
            }
          >
            <span className="font-medium">{col.name}</span>
            <span className="text-sm">
              {expandedCollections[col.name] ? "▾" : "▸"}
            </span>
          </div>

          {/* ITEMS LIST */}
          {expandedCollections[col.name] && (
            <div className="ml-4 mb-2 space-y-2">
              {col.items && col.items.length > 0 ? (
                col.items.map((item) => (
                  <div
                    key={item.id}
                    className="p-2 bg-gray-50 hover:bg-gray-200 rounded text-xs flex justify-between items-start"
                  >
                    <div
                      className="flex-1 cursor-pointer"
                      onClick={() => handleLoadSavedCollectionItem(item)}

                    >
                      <div className="font-semibold">{item.description}</div>
                      <div className="text-gray-500 break-all">
                        {item.request.url}
                      </div>
                    </div>

                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDeleteSavedRequest(col.name, item.id);
                      }}
                      className="text-red-600 hover:text-red-800 ml-2"
                    >
                      🗑
                    </button>
                  </div>
                ))
              ) : (
                <div className="text-xs text-gray-500 ml-2">
                  No saved requests
                </div>
              )}
            </div>
          )}
        </div>
      ))
    )}
  </div>
)}

</div>

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
  <aside className="
  border-l 
  p-4 
  bg-white dark:bg-gray-800 
  h-full 
  overflow-hidden 
  flex flex-col
">



          {/* HEADER: Response + Copy button */}
<div className="flex justify-between items-center mb-4">
  <h3 className="text-lg font-semibold">Response</h3>

  <button 
  onClick={() => setOpenSaveModal(true)}
  className="px-3 py-1 bg-green-600 text-black rounded"
>
  Save
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
      value={typeof response === "string" ? response : JSON.stringify(response, null, 2)}

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
 history={searchQuery.trim() ? filteredHistory : historyList}
  onSelect={handleHistorySelect}
  onDelete={handleDeleteHistory}
/>

{/* ✅ Step 7: Collections  goes HERE */}

<CollectionsSidebar
  key={collectionsOpen ? "open" : "closed"}
  open={collectionsOpen}
  onClose={() => setCollectionsOpen(false)}
  collections={searchQuery.trim() ? filteredCollections : collections}
  onCreateCollection={handleCreateCollection}
  onDelete={handleDeleteCollection}
  onSelectItem={handleLoadSavedCollectionItem}  // NEW ✔
  onDeleteItem={handleDeleteSavedRequest}
/>

{openSaveModal && (
 <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-[9999]">

    <div className="bg-white dark:bg-gray-800 p-6 rounded-lg w-96 shadow-lg">

      <h2 className="text-xl font-semibold mb-4">Save API Request</h2>

      {/* Description */}
      <label className="block mb-2 font-medium">Description</label>
      <input
        type="text"
        value={description}
        onChange={(e) => setDescription(e.target.value)}
        className="w-full px-3 py-2 border rounded mb-4 dark:bg-gray-700"
        placeholder="Enter description"
      />

      {/* Collection Name */}
     <label className="block mb-2 font-medium">Collection</label>

<select
  className="w-full px-3 py-2 border rounded mb-4 dark:bg-gray-700"
  value={selectedCollection}
  onChange={(e) => {
    setSelectedCollection(e.target.value);
    if (e.target.value !== "+new") {
      setNewCollectionInput("");
    }
  }}
>
  <option value="">-- Select Collection --</option>

  {/* Populate existing collections */}
  {collections.map((col) => (
    <option key={col.id} value={col.name}>
      {col.name}
    </option>
  ))}

  {/* Option to create new collection */}
  <option value="+new">+ Create New Collection</option>
</select>
{selectedCollection === "+new" && (
  <input
    className="w-full px-3 py-2 border rounded mb-4 dark:bg-gray-700"
    placeholder="Enter new collection name"
    value={newCollectionInput}
    onChange={(e) => setNewCollectionInput(e.target.value)}
  />
)}

      {saveSuccess && (
  <div className="text-green-600 text-sm mb-2">{saveSuccess}</div>
)}

{saveError && (
  <div className="text-red-600 text-sm mb-2">{saveError}</div>
)}


      {/* Buttons */}
      <div className="flex justify-end gap-3 mt-4">
        <button
          onClick={() => setOpenSaveModal(false)}
          className="px-4 py-2 bg-gray-400 text-black rounded"
        >
          Cancel
        </button>

        <button
          onClick={handleSave}

          className="px-4 py-2 bg-green-600 text-black rounded"
        >
          Save
        </button>
      </div>
    </div>
  </div>
)}



{/* MOBILE VIEW */}
<div className="md:hidden min-h-screen pb-16">
 {mobileTab === "home" && (
  <div className="p-4 space-y-6">

    {/* API Tester Title */}
    <h2 className="text-xl font-bold text-center">API Tester</h2>

    {/* Login + Signup (STACKED, OPTION B) */}
    {!user && (
      <div className="space-y-3">
        <button
          onClick={() => navigate("/login")}
          className="w-full py-2 bg-blue-600 text-black rounded"
        >
          Login
        </button>

        <button
          onClick={() => navigate("/signup")}
          className="w-full py-2 bg-green-600 text-black rounded"
        >
          Sign Up
        </button>
      </div>
    )}

    {/* --- BREAK / GAP --- */}
    <div className="border-b my-4"></div>

    {/* REQUEST BUILDER (middle section condensed for mobile) */}
    <div className="space-y-3">

      {/* Method + URL Input */}
      <div className="flex gap-2">
        <select
          value={method}
          onChange={(e) => setMethod(e.target.value)}
          className="border rounded px-3 py-2 bg-white text-sm w-28"
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
      </div>

      {/* Send Button */}
      <button
        onClick={sendRequest}
        disabled={loading}
        className="w-full py-2 bg-blue-500 text-black rounded"
      >
        {loading ? "Sending..." : "Send"}
      </button>

      {/* Tabs */}
      <div className="flex gap-4 border-b pb-2">
        <button
          onClick={() => setActiveTab("params")}
          className={`${activeTab === "params" ? "font-bold text-blue-600" : "text-gray-600"}`}
        >
          Params
        </button>
        <button
          onClick={() => setActiveTab("headers")}
          className={`${activeTab === "headers" ? "font-bold text-blue-600" : "text-gray-600"}`}
        >
          Headers
        </button>
        <button
          onClick={() => setActiveTab("body")}
          className={`${activeTab === "body" ? "font-bold text-blue-600" : "text-gray-600"}`}
        >
          Body
        </button>
      </div>

      {/* Tab Content */}
      <div className="min-h-[200px]">
        {activeTab === "params" && (
          <ParamsSection params={params} setParams={setParams} />
        )}

        {activeTab === "headers" && (
          <HeadersSection headers={headers} setHeaders={setHeaders} />
        )}

        {activeTab === "body" && (
          <AceEditor
            mode="json"
            theme="chrome"
            className="border rounded"
            width="100%"
            height="300px"
            value={body}
            onChange={(val) => setBody(val)}
            setOptions={{ useWorker: false }}
          />
        )}
      </div>

    </div>
  </div>
)}


  {mobileTab === "history" && (
    <div className="p-4">
      <HistorySidebar
        open={true}
        onClose={() => {}}
        history={historyList}
        onSelect={handleHistorySelect}
        onDelete={handleDeleteHistory}
      />
    </div>
  )}

  {mobileTab === "response" && (
  <div className="p-4 space-y-4">
    <div className="flex justify-between items-center">
      <h2 className="text-lg font-bold">Response</h2>
      <button
    onClick={() => setOpenSaveModal(true)}
    className="px-3 py-1 bg-green-600 text-black rounded shadow active:scale-95"
  >
    Save
  </button>
    </div>

    {/* Status Line */}
    <div className="flex justify-around text-sm py-2 border rounded bg-gray-50">
      <div>
        <span className="font-semibold">Status: </span>
        <span className={apiStatus >= 400 ? "text-red-600" : "text-green-600"}>
          {apiStatus !== null ? apiStatus : "--"}
        </span>
      </div>

      {responseTime !== null && (
        <div className="text-gray-600">
          ⏱ {responseTime}ms
        </div>
      )}
    </div>

    {/* Response Tabs (same as desktop) */}
    <div className="flex gap-4 border-b pb-2">
      <button
        onClick={() => setResponseTab("body")}
        className={`${responseTab === "body" ? "font-bold text-blue-600" : "text-gray-600"}`}
      >
        Body
      </button>

      <button
        onClick={() => setResponseTab("headers")}
        className={`${responseTab === "headers" ? "font-bold text-blue-600" : "text-gray-600"}`}
      >
        Headers
      </button>
    </div>

    {/* Response Body */}
    <div className="border rounded p-3 bg-gray-50 h-[60vh] overflow-auto">
      {responseTab === "body" && (
        response ? (
          <AceEditor
            mode="json"
            theme="chrome"
            width="100%"
            height="100%"
            readOnly={true}
            value={
              typeof response === "string"
                ? response
                : JSON.stringify(response, null, 2)
            }
            setOptions={{ useWorker: false }}
          />
        ) : (
          <div className="text-center text-gray-400 mt-10">
            No response yet
          </div>
        )
      )}

      {responseTab === "headers" && (
        <pre className="whitespace-pre-wrap text-sm">
          {Object.entries(responseHeaders).map(([k, v]) => `${k}: ${v}\n`)}
        </pre>
      )}
    </div>
  </div>
)}


  {mobileTab === "collections" && (
    <div className="p-4">
      <CollectionsSidebar
        open={true}
        onClose={() => {}}
        collections={collections}
        onCreateCollection={handleCreateCollection}
        onDelete={handleDeleteCollection}
      />
    </div>
  )}
</div>


<MobileTabs activeTab={mobileTab} setActiveTab={setMobileTab} />


    </div>
  );
}
