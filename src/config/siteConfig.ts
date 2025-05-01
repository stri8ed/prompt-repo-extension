
export interface SiteConfig {
  name: string;
  urlPattern: RegExp;
  buttonTargetSelector: string[];
  inputSelector: string;
  fileInputSelector: string | null;
}

const siteConfigs: SiteConfig[] = [
  {
    name: 'ChatGPT',
    inputSelector: '#prompt-textarea',
    urlPattern: /chatgpt/,
    buttonTargetSelector: [
      '[aria-label*="Upload files"]'
    ],
    fileInputSelector: '[type="file"]'
  },
  {
    name: 'Claude',
    urlPattern: /claude/,
    buttonTargetSelector: ['[aria-controls="input-menu"]'],
    inputSelector: '[contenteditable="true"]',
    fileInputSelector: '[type="file"]'
  },
  {
    name: 'Google AI Studio',
    urlPattern: /aistudio\.google\.com/,
    buttonTargetSelector: ['[aria-label*="Insert assets"]'],
    inputSelector: '[aria-label*="Type something"]',
    fileInputSelector: null
  }
];

export default siteConfigs;