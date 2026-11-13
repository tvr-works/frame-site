import { renderToStaticMarkup, renderToString } from "react-dom/server";
import App from "./App";
import GuidePage from "./guide/page";
export function render() {
  return renderToString(<App />);
}
export function renderGuide() {
  return renderToStaticMarkup(<GuidePage />);
}
