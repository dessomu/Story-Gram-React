import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App.jsx";
import StoryContextProvider from "./contexts/StoryContextProvider.jsx";

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <StoryContextProvider>
      <App />
    </StoryContextProvider>
  </StrictMode>
);
