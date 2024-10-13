
export interface SiteConfig {
  name: string;
  urlPattern: RegExp;
  buttonTargetSelector: string[];
  inputSelector: string;
  fileInputSelector: string;
}

const siteConfigs: SiteConfig[] = [
  {
    name: 'ChatGPT',
    inputSelector: '#prompt-textarea',
    urlPattern: /chatgpt/,
    buttonTargetSelector: [
      '[aria-label="Attach files"]', // not available in O-1 models
      '[data-testid="send-button"], [aria-label="Send prompt"]'
    ],
    fileInputSelector: '[type="file"]'
  },
  {
    name: 'Claude',
    urlPattern: /claude/,
    buttonTargetSelector: ['[aria-label="Capture screenshot"]'],
    inputSelector: '[contenteditable="true"]',
    fileInputSelector: '[type="file"]'
  }
];

export default siteConfigs;