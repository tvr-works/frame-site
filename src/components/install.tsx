import { ArrowUpRight } from "lucide-react";
import { buttonVariants } from "@/components/ui/button";

export const installCommand = "brew tap tvr-works/tap\nbrew install --cask tvr-works/tap/frame";
export const releaseUrl = "https://github.com/tvr-works/frame/releases/latest";

export function InstallCommand() {
  return (
    <pre className="install-command">
      <code>{installCommand}</code>
    </pre>
  );
}

export function InstallSection() {
  return (
    <section id="install" className="install-section" aria-labelledby="install-title" tabIndex={-1}>
      <div>
        <h2 id="install-title" className="explanation-title">
          Install Frame
        </h2>
        <p className="explanation-lead">The menu bar app and command-line client, together.</p>
        <p className="install-requirement">Requires macOS 13 Ventura or later.</p>
        <a className={buttonVariants()} href={releaseUrl}>
          Download release <ArrowUpRight aria-hidden="true" />
        </a>
      </div>
      <div className="install-details">
        <h3>Install with Homebrew</h3>
        <InstallCommand />
        <p>
          Run these commands in Terminal with <a href="https://brew.sh/">Homebrew</a> installed.
        </p>
        <h3>Open Frame and allow Accessibility access</h3>
        <p>
          Open Frame from Applications. In System Settings, go to Privacy &amp; Security →
          Accessibility and enable Frame so it can arrange your windows.
        </p>
        <a className="install-guide-link" href="/guide.html#first-launch">
          Read the setup guide <ArrowUpRight aria-hidden="true" />
        </a>
      </div>
    </section>
  );
}
