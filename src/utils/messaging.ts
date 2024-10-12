import {MessageMap, RequestType} from "@/types.ts";
import MessageSender = chrome.runtime.MessageSender;

interface ErrorResponse {
  error: string;
}

type ResponseOrError<T> = T | ErrorResponse;

export function sendMessage<T extends RequestType>(
  type: T,
  payload: MessageMap[T]['request']
): Promise<MessageMap[T]['response']> {
  return new Promise((resolve, reject) => {
    chrome.runtime.sendMessage({ type, payload }, (response: ResponseOrError<MessageMap[T]['response']>) => {
      if (chrome.runtime.lastError) {
        reject(new Error(chrome.runtime.lastError.message));
      } else if ('error' in response) {
        reject(new Error(response.error));
      } else {
        resolve(response);
      }
    });
  });
}

export function addMessageListener<T extends RequestType>(
  type: T,
  handler: (payload: MessageMap[T]['request'], sender: MessageSender) => Promise<MessageMap[T]['response']>
) {
  chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (message.type === type) {
      handler(message.payload, sender)
        .then(sendResponse)
        .catch((error: Error) => {
          sendResponse({ error: error.message });
        });
      return true; // Indicates that the response will be sent asynchronously
    }
  });
}

export function keepAlive(interval: number) {
  return setInterval(async () => {
    await sendMessage(RequestType.Ping, {});
  }, interval);
}