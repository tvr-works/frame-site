import { useEffect, useReducer, useRef, useState } from "react";
import { initialSession, sessionTransition, story } from "./playback";
export function useDemo() {
  const [session, dispatch] = useReducer(sessionTransition, undefined, initialSession);
  const region = useRef<HTMLElement>(null);
  const [reduced, setReduced] = useState(false);
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const media = window.matchMedia("(prefers-reduced-motion: reduce)");
    const change = () => {
      setReduced(media.matches);
      if (media.matches) dispatch({ type: "pause" });
    };
    change();
    media.addEventListener("change", change);
    const background = () => {
      if (document.hidden) dispatch({ type: "pause" });
    };
    document.addEventListener("visibilitychange", background);
    let firstObservation = true;
    const observer = new IntersectionObserver(
      ([entry]) => {
        const inView = entry.isIntersecting && entry.intersectionRatio >= 0.15;
        setVisible(inView);
        if (firstObservation) {
          firstObservation = false;
          if (inView && !media.matches && !document.hidden) dispatch({ type: "resume" });
        }
        if (!entry.isIntersecting || entry.intersectionRatio < 0.15) dispatch({ type: "pause" });
      },
      { threshold: 0.15 },
    );
    if (region.current) observer.observe(region.current);
    return () => {
      media.removeEventListener("change", change);
      document.removeEventListener("visibilitychange", background);
      observer.disconnect();
    };
  }, []);
  useEffect(() => {
    if (session.mode !== "playing" || !visible || document.hidden) return;
    const timer = window.setTimeout(
      () => dispatch({ type: "tick" }),
      story[session.step]?.delay ?? 0,
    );
    return () => window.clearTimeout(timer);
  }, [session.mode, session.step, visible]);
  return { session, dispatch, region, reduced };
}
