import { createRoot } from "react-dom/client";
import "./i18n/index";
import "./App.css";
import "./index.css";
import App from "./App";

createRoot(document.getElementById("root")!).render(<App />);
