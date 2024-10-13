
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
    buttonTargetSelector: ['[aria-label="Attach files"]', '[data-testid="send-button"]'],
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