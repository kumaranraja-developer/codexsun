// cxsun/src/index.tsx
import React from "react";
import { createRoot } from "react-dom/client";

function App() {
    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-100">
            <h1 className="text-3xl font-bold text-blue-600">Hello from CXSUN React!</h1>
        </div>
    );
}

const container = document.getElementById("root");
if (container) {
    const root = createRoot(container);
    root.render(<App />);
}
