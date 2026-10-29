import { createRoot } from "react-dom/client";
import "@fontsource/quicksand/400.css";
import "@fontsource/quicksand/500.css";
import "@fontsource/quicksand/600.css";
import "@fontsource/quicksand/700.css";
import App from "./App.tsx";
import "./index.css";

const root = document.getElementById("root");
if (root) createRoot(root).render(<App />);
