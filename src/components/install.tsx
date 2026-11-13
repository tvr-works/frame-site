import { ArrowUpRight } from "lucide-react";
import { buttonVariants } from "@/components/ui/button";

export const installCommand = "brew tap tvr-works/tap\nbrew install --cask tvr-works/tap/frame";
export const releaseUrl = "https://github.com/tvr-works/frame/releases/latest";

export function InstallCommand() {
  return (
    <pre className="code-block">
      <code>{installCommand}</code>
    </pre>
  );
}

export function InstallSection() {
  return (
    <section id="install" className="install-section" aria-labelledby="install-title" tabIndex={-1}>
      <h2 id="install-title" className="explanation-title">
        Install Frame
      </h2>
      <div className="install-columns">
        <div className="install-details">
          <h3>Install with Homebrew</h3>
          <InstallCommand />
          <p>
            Run these commands in Terminal with <a href="https://brew.sh/">Homebrew</a> installed.
          </p>
          <a className={buttonVariants()} href={releaseUrl}>
            Download release <ArrowUpRight aria-hidden="true" />
          </a>
        </div>
        <div className="install-details">
          <h3>Enable Accessibility access</h3>
          <ol className="install-steps">
            <li>Open Frame from Applications.</li>
            <li>In System Settings, go to Privacy &amp; Security → Accessibility.</li>
            <li>Enable Frame so it can arrange your windows.</li>
          </ol>
        </div>
      </div>
    </section>
  );
}
