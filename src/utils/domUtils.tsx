import GithubIcon from "@/components/GithubIcon.tsx";
import {SiteConfig} from "@/config/siteConfig.ts";
import {createRoot, Root} from "react-dom/client";
import App from "@/App.tsx";

export function simulateFileSelection(fileInput: HTMLInputElement, fileName: string, content: string) {
  const file = new File([content], fileName, { type: 'text/plain' });
  const dataTransfer = new DataTransfer();
  dataTransfer.items.add(file);
  fileInput.files = dataTransfer.files;
  const event = new Event('change', { bubbles: true });
  fileInput.dispatchEvent(event);
}

export function observeElement(
  selectors: string[],
  callback: (element: Element, selector: string, isAdded: boolean) => void
): () => void {
  const observer = new MutationObserver((mutations) => {
    for (const mutation of mutations) {
      if (mutation.type === 'childList') {
        const handleNodes = (nodes: NodeList, isAdded: boolean) => {
          nodes.forEach(node => {
            if (node instanceof Element) {
              selectors.forEach(s => {
                if (node.matches(s)) {
                  callback(node, s, isAdded);
                }
                node.querySelectorAll(s).forEach(el => callback(el, s, isAdded));
              });
            }
          });
        };

        handleNodes(mutation.addedNodes, true);
        handleNodes(mutation.removedNodes, false);
      }
    }
  });

  observer.observe(document.body, {
    childList: true,
    subtree: true
  });

  selectors.forEach(s => document.querySelectorAll(s).forEach(el => callback(el, s, true)));
  return () => observer.disconnect();
}

export function makeExtensionButton(className: string, onClick: (e: MouseEvent) => void) {
  const button = document.createElement('button');
  button.innerHTML = `<span class="${className}">${GithubIcon()}</span>`
  button.setAttribute('aria-label', 'Attach Repo');
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