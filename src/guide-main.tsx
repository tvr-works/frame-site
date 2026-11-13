import { StrictMode } from "react";
import { createRoot, hydrateRoot } from "react-dom/client";
import GuidePage from "./guide-page";
import "./styles.css";
const root = document.getElementById("root")!;
const app = (
  <StrictMode>
    <GuidePage />
  </StrictMode>
);
if (root.hasChildNodes()) hydrateRoot(root, app);
else createRoot(root).render(app);
