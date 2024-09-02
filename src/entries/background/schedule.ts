import browser from "webextension-polyfill";
import { sendBackgroundMessage } from "./main";
import type { GetScheduleResponse } from "../content-script/primary/draft-my-schedule";
import * as WesternDates from "../../constants/western-dates";
import { parse } from "date-fns/parse";

const DATE_FORMAT = "MMMM dd, yyyy";

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

  const startOfFallSem = parse(
    WesternDates.START_OF_FALL_SEM,
    DATE_FORMAT,
    new Date(),
  );

  const startOfFallReadingWeek = parse(
    WesternDates.START_OF_FALL_READING_WEEK,
    DATE_FORMAT,
    new Date(),
  );

  const endOfFallSem = parse(
    WesternDates.END_OF_FALL_SEM,
    DATE_FORMAT,
    new Date(),
  );
}
