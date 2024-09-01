import browser from "webextension-polyfill";
import { requestSchedule } from "./schedule";

export type BackgroundMessage = {
  type: "get_schedule";
};

export function sendMessage(tabId: number, message: BackgroundMessage) {
  return browser.tabs.sendMessage(tabId, message);
}

browser.runtime.onInstalled.addListener(() => {
  console.log("Draft to Calendar installed");
});

browser.contextMenus.create({
  id: "draft-to-calendar",
  title: "Draft My Schedule to iCalendar",
  documentUrlPatterns: [
    "https://draftmyschedule.uwo.ca/secure/current_timetable.cfm",
  ],
});

browser.contextMenus.onClicked.addListener(async (info, _) => {
  if (info.menuItemId === "draft-to-calendar") {
    await requestSchedule();
  }
});
