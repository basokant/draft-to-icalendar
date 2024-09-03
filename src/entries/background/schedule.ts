import browser from "webextension-polyfill";
import { sendBackgroundMessage } from "./main";
import type { GetScheduleResponse } from "../content-script/primary/draft-my-schedule";
import { getFallSemDates, getWinterSemDates } from "~/lib/western-dates";

export async function sendGetScheduleRequest() {
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
  await sendBackgroundMessage(activeTabId, {
    type: "get_schedule",
  });
}

export function getScheduleResponseHandler(response: GetScheduleResponse) {
  const schedule = response.schedule;
  console.log({ schedule });

  const schoolYear = schedule.year;
  const fallSemDates = getFallSemDates(schoolYear);
  const winterSemDates = getWinterSemDates(schoolYear);
}
