import GithubIcon from "@/components/GithubIcon.tsx";
import {SiteConfig} from "@/config/siteConfig.ts";
import {createRoot, Root} from "react-dom/client";
import App from "@/components/App.tsx";

export function simulateFileDrop(targetElement: Element, fileName: string, content: string) {
  const dragOverEvent = new Event('dragover', {
    bubbles: true,
    cancelable: true,
  });
  targetElement.dispatchEvent(dragOverEvent);

  const syntheticFile = new File([content], fileName, {
    type: "text/plain"
  });

  let dataTransfer = new DataTransfer()
  dataTransfer.items.add(syntheticFile)

  const dropEvent = new DragEvent('drop', {
    dataTransfer,
    bubbles: true,
    cancelable: true,
  });

  targetElement.dispatchEvent(dropEvent);
}

export function observeElement(selectors: string[], callback: (element: Element, selector: string) => void): () => void {
  const observer = new MutationObserver((mutations) => {
    for (const mutation of mutations) {
      if (mutation.type === 'childList') {
        for (const node of mutation.addedNodes) {
          if (node instanceof Element) {
            selectors.forEach(s => {
              if (node.matches(s)) {
                callback(node, s);
              }
              node.querySelectorAll(s).forEach(el => callback(el, s));
            })
          }
        }
      }
    }
  });

  observer.observe(document.body, {
    childList: true,
    subtree: true
  });
  selectors.forEach(s => document.querySelectorAll(s).forEach(el => callback(el, s)));
  return () => observer.disconnect();
}

export function makeExtensionButton(className: string, onClick: (e: MouseEvent) => void) {
  const button = document.createElement('button');
  button.innerHTML = `<span class="${className}">${GithubIcon()}</span>`
  button.addEventListener('click', onClick);
  return button;
}

export function createOrUpdateApp(config: SiteConfig, show: boolean): (show: boolean) => void {
  let root: Root | null = null;
  let container: HTMLDivElement | null = null;

  return function renderApp(newShow: boolean = show) {
    if (!container) {
      container = document.createElement('div');
      container.id = 'attach-repo-extension-app';
      document.body.appendChild(container);
    }

    if (!root) {
      root = createRoot(container);
    }

    root.render(
      <App
        config={config}
        show={newShow}
        onClose={() => renderApp(false)}
    />
  );
  };
}