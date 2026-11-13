import { ArrowUpRight } from "lucide-react";
import { buttonVariants } from "@/components/ui/button";

export function SiteHeader({ guide = false }: { guide?: boolean }) {
  return (
    <header className="site-header">
      <a className="wordmark" href="/" aria-label="Frame home">
        <img src="/icon.png" width="42" height="42" alt="" />
        <span>Frame</span>
      </a>
      <nav aria-label="Main navigation">
        <a href="/guide.html" aria-current={guide ? "page" : undefined}>
          Guide
        </a>
        <a href="https://github.com/tvr-works/frame">
          GitHub <ArrowUpRight />
        </a>
        <a className={buttonVariants({ size: "header" })} href={guide ? "/#install" : "#install"}>
          Install
        </a>
      </nav>
    </header>
  );
}

export function SiteFooter() {
  return (
    <footer className="site-footer">
      <nav aria-label="Footer navigation">
        <a href="/guide.html">Guide</a>
        <a href="https://github.com/tvr-works/frame">
          GitHub <ArrowUpRight />
        </a>
      </nav>
    </footer>
  );
}
