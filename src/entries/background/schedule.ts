import browser from "webextension-polyfill";
import { sendMessage, type BackgroundMessage } from "./main";

export async function requestSchedule() {
  const activeTabId = await browser.tabs
    .query({
      currentWindow: true,
      active: true,
    })
    .then((tabs) => tabs[0]?.id);

  if (!activeTabId) {
    throw Error(
      "could not request schedule because there is no active content script tab",
    );
  }

  console.info(`requesting schedule from tab ${activeTabId}`);
  await sendMessage(activeTabId, {
    type: "get_schedule",
  });
}
