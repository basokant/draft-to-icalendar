import browser from "webextension-polyfill";
import type { BackgroundMessage } from "~/entries/background/main";
import {
  getScheduleHandler,
  type GetScheduleResponse,
} from "./draft-my-schedule";

export type ContentMessage = GetScheduleResponse;

export function sendContentMessage(message: ContentMessage) {
  return chrome.runtime.sendMessage(message);
}

function onBackgroundMessage(message: BackgroundMessage) {
  switch (message.type) {
    case "get_schedule":
      return getScheduleHandler();
  }
}

browser.runtime.onMessage.addListener(onBackgroundMessage);
