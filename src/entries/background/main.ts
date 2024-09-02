import browser from "webextension-polyfill";
import { sendGetScheduleRequest, getScheduleResponseHandler } from "./schedule";
import type { ContentMessage } from "../content-script/primary/main";

export type BackgroundMessage = {
  type: "get_schedule";
};

export function sendBackgroundMessage(
  tabId: number,
  message: BackgroundMessage,
) {
  return browser.tabs.sendMessage(tabId, message);
}

browser.runtime.onInstalled.addListener(() => {
  console.log("Draft to Calendar installed");
});

function onContentMessage(message: ContentMessage) {
  switch (message.type) {
    case "get_schedule":
      getScheduleResponseHandler(message);
  }
}

browser.runtime.onMessage.addListener(onContentMessage);

browser.contextMenus.create({
  id: "draft-to-calendar",
  title: "Draft My Schedule to iCalendar",
  documentUrlPatterns: [
    "https://draftmyschedule.uwo.ca/secure/current_timetable.cfm",
  ],
});

browser.contextMenus.onClicked.addListener(async (info, _) => {
  if (info.menuItemId === "draft-to-calendar") {
    await sendGetScheduleRequest();
  }
});
