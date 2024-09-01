import browser from "webextension-polyfill";
import type { BackgroundMessage } from "~/entries/background/main";
import { getScheduleHandler, type GetScheduleResponse } from "./schedule";

export type ContentMessage =
  | GetScheduleResponse
  | {
      type: string;
    };

export function sendMessage(message: ContentMessage) {
  return chrome.runtime.sendMessage(message);
}

async function onBackgroundMessage(message: BackgroundMessage) {
  switch (message.type) {
    case "get_schedule":
      await getScheduleHandler();
  }
}

browser.runtime.onMessage.addListener(onBackgroundMessage);
