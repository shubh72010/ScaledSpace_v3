import React from "react";
import { createRoot } from "react-dom/client";
import App from "./App.jsx";
import "./index.css"; // If you do not have index.css, remove this line!

const root = createRoot(document.getElementById("root"));
root.render(<App />);