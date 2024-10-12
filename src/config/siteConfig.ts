
export interface SiteConfig {
  name: string;
  urlPattern: RegExp;
  buttonTargetSelector: string[];
  inputSelector: string;
  canDragAndDrop: () => boolean;
}

const siteConfigs: SiteConfig[] = [
  {
    name: 'ChatGPT',
    inputSelector: '#prompt-textarea',
    urlPattern: /chatgpt/,
    buttonTargetSelector: ['[aria-label="Attach files"]', '[data-testid="send-button"]'],
    canDragAndDrop: () => document.querySelector('[aria-label*="o1-preview"]') === null
  },
  {
    name: 'Claude',
    urlPattern: /claude/,
    buttonTargetSelector: ['[aria-label="Capture screenshot"]'],
    inputSelector: '[contenteditable="true"]',
    canDragAndDrop: () => false
  }
];

export default siteConfigs;