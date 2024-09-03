import browser from "webextension-polyfill";
import { sendBackgroundMessage } from "./main";
import type {
  Class,
  ClassTime,
  DraftSchedule,
  GetScheduleResponse,
} from "../content-script/primary/draft-my-schedule";
import {
  getFallSemDates,
  getWinterSemDates,
  type DateRange,
} from "~/lib/western-dates";
import ical, { ICalEventRepeatingFreq } from "ical-generator";
import {
  ICalWeekday,
  type ICalCalendar,
  type ICalEventData,
} from "ical-generator";
import { getDay, parse, setDay, type Day } from "date-fns";

const DAY_FORMAT = "EEEE";
const TWELVE_HOUR_TIME_FORMAT = "h:m a";

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
  const calendar = createCoursesCalendar(schedule);

  const dataUri = "data:text/calendar;base64," + btoa(calendar.toString());
  const filename = `courses-fall-winter-${response.schedule.year}.ics`;
  browser.downloads.download({
    url: dataUri,
    filename,
  });
}

function getWeekday(day: number): ICalWeekday {
  switch (day) {
    case 0:
      return ICalWeekday.SU;
    case 1:
      return ICalWeekday.MO;
    case 2:
      return ICalWeekday.TU;
    case 3:
      return ICalWeekday.WE;
    case 4:
      return ICalWeekday.TH;
    case 5:
      return ICalWeekday.FR;
    default:
      return ICalWeekday.SA;
  }
}

function createClassTimeEvent(
  ct: ClassTime,
  cl: Class,
  dateRange: DateRange,
): ICalEventData {
  const { startDate, endDate } = dateRange;
  const summary = `${cl.subject} ${cl.courseNumber} ${cl.component}`;
  const description = `${cl.description} ${cl.component} for the ${cl.session}`;
  const days = ct.days.map((day) => {
    return getDay(parse(day, DAY_FORMAT, new Date()));
  });
  const weekdays = days.map(getWeekday);

  const firstDay = days[0] ?? 0;
  const firstOccurrenceDate = setDay(startDate, firstDay, {
    weekStartsOn: getDay(startDate) as Day,
  });

  const startDateTime = parse(
    ct.startTime,
    TWELVE_HOUR_TIME_FORMAT,
    firstOccurrenceDate,
  );

  const endDateTime = parse(
    ct.endTime,
    TWELVE_HOUR_TIME_FORMAT,
    firstOccurrenceDate,
  );

  return {
    summary,
    description,
    location: ct.location,
    start: startDateTime,
    end: endDateTime,
    repeating: {
      byDay: weekdays,
      freq: ICalEventRepeatingFreq.WEEKLY,
      until: endDate,
    },
  };
}

function createClassTimeEvents(
  classes: Class[],
  dateRanges: DateRange[],
): ICalEventData[] {
  return dateRanges.flatMap((dateRange) =>
    classes.flatMap((cl) =>
      cl.daysTimesLocation.map((ct) => createClassTimeEvent(ct, cl, dateRange)),
    ),
  );
}

function createCoursesCalendar(schedule: DraftSchedule): ICalCalendar {
  const schoolYear = schedule.year;
  const fallClasses = schedule.classes.filter(
    (cl) => cl.session === "Fall" || cl.session === "Full Year",
  );
  const fallSemDates = getFallSemDates(schoolYear);
  const fallEvents = createClassTimeEvents(fallClasses, fallSemDates);

  const winterClasses = schedule.classes.filter(
    (cl) => cl.session === "Winter" || cl.session === "Full Year",
  );
  const winterSemDates = getWinterSemDates(schoolYear);
  const winterEvents = createClassTimeEvents(winterClasses, winterSemDates);

  const calendar = ical({ name: `Courses Fall/Winter ${schoolYear}` });
  for (const fallEvent of fallEvents) {
    calendar.createEvent(fallEvent);
  }

  for (const winterEvent of winterEvents) {
    calendar.createEvent(winterEvent);
  }

  return calendar;
}
