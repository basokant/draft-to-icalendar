/**
 * Western Undergraduate sessional dates for the current school year
 * @link https://www.westerncalendar.uwo.ca/SessionalDates.cfm?CategoriesFilter=5&TypesFilter=1&searchWithBoxes=&SelectedCalendar=Live&ArchiveID=
 */

import {
  addWeeks,
  endOfDay,
  isFriday,
  isMonday,
  nextFriday,
  nextMonday,
  nextThursday,
  previousFriday,
  previousSaturday,
  startOfDay,
} from "date-fns";

export type DateRange = {
  startDate: Date;
  endDate: Date;
};

export function getFallSemDates(schoolYear: number): DateRange[] {
  const startOfFallSem = getStartOfFallSem(schoolYear);
  const startOfFallReadingWeek = getStartOfFallReadingWeek(schoolYear);
  const beforeReadingWeekRange: DateRange = {
    startDate: startOfDay(startOfFallSem),
    endDate: endOfDay(previousFriday(startOfFallReadingWeek)),
  };

  const fallSemClassesResume = nextMonday(addWeeks(startOfFallReadingWeek, 1));
  const endOfFallSem = getEndOfFallSem(schoolYear);
  const afterReadingWeekRange: DateRange = {
    startDate: startOfDay(fallSemClassesResume),
    endDate: endOfDay(endOfFallSem),
  };

  return [beforeReadingWeekRange, afterReadingWeekRange];
}

export function getWinterSemDates(schoolYear: number): DateRange[] {
  const startOfWinterSem = getStartOfWinterSem(schoolYear);
  const startOfSpringReadingWeek = getStartOfSpringReadingWeek(schoolYear);
  const beforeReadingWeekRange: DateRange = {
    startDate: startOfDay(startOfWinterSem),
    endDate: endOfDay(previousFriday(startOfSpringReadingWeek)),
  };

  const winterSemClassesResume = nextMonday(
    addWeeks(startOfSpringReadingWeek, 1),
  );
  const endOfWinterSem = getEndOfWinterSem(schoolYear);
  const afterReadingWeekRange: DateRange = {
    startDate: startOfDay(winterSemClassesResume),
    endDate: endOfDay(endOfWinterSem),
  };

  return [beforeReadingWeekRange, afterReadingWeekRange];
}

function getLabourDay(year: number): Date {
  const septemberFirst = new Date(year, 8, 1);
  const labourDay = isMonday(septemberFirst)
    ? septemberFirst
    : nextMonday(septemberFirst);

  return labourDay;
}

/**
 * The start of the Fall semester of the school year.
 *
 * Assumption: Thursday after Labour Day, where Labour Day is the first Monday of September
 * */
function getStartOfFallSem(schoolYear: number): Date {
  const labourDay = getLabourDay(schoolYear);
  return nextThursday(labourDay);
}

function getThanksgiving(year: number): Date {
  const octoberFirst = new Date(year, 9, 1);
  const firstMondayOctober = isMonday(octoberFirst)
    ? octoberFirst
    : nextMonday(octoberFirst);

  const thanksgiving = addWeeks(firstMondayOctober, 1);
  return thanksgiving;
}

/**
 * The start of the Fall reading week of the school year.
 *
 * Assumption: week of Thanksgiving, where Thanksgiving is the second Monday of October
 * */
function getStartOfFallReadingWeek(schoolYear: number): Date {
  const thanksgiving = getThanksgiving(schoolYear);
  return previousSaturday(thanksgiving);
}

/**
 * The end of the Fall semester of the school year.
 *
 * Assumption: Friday 13 weeks after start of Fall semester
 * */
function getEndOfFallSem(schoolYear: number): Date {
  const startOfSem = getStartOfFallSem(schoolYear);
  const thirteenWeeksAfterStart = addWeeks(startOfSem, 13);
  const endOfFallSem = isFriday(thirteenWeeksAfterStart)
    ? thirteenWeeksAfterStart
    : nextFriday(thirteenWeeksAfterStart);

  return endOfFallSem;
}

/**
 * The start of the Winter semester of the school year.
 *
 * Assumption: first monday two weeks after December 23rd (start of Winter break)
 * */
function getStartOfWinterSem(schoolYear: number): Date {
  const startOfWinterBreak = new Date(schoolYear, 11, 23);
  const twoWeeksAfterStart = addWeeks(startOfWinterBreak, 2);
  const startOfWinterSem = isMonday(twoWeeksAfterStart)
    ? twoWeeksAfterStart
    : nextMonday(twoWeeksAfterStart);

  return startOfWinterSem;
}

function getFamilyDay(year: number): Date {
  const februaryFirst = new Date(year, 1, 1);
  const firstMonday = isMonday(februaryFirst)
    ? februaryFirst
    : nextMonday(februaryFirst);
  const familyDay = addWeeks(firstMonday, 2);

  return familyDay;
}

/**
 * The start of the Spring reading week of the school year.
 *
 * Assumption: week of Family Day, which is the third Monday of February
 * */
function getStartOfSpringReadingWeek(schoolYear: number): Date {
  const year = schoolYear + 1;
  const familyDay = getFamilyDay(year);
  return previousSaturday(familyDay);
}

/**
 * The end of the winter semester of the school year.
 *
 * Assumption: Friday 12 weeks after start of Winter semester.
 * */
function getEndOfWinterSem(schoolYear: number): Date {
  const startOfWinterSem = getStartOfWinterSem(schoolYear);
  const thirteenWeeksAfterStart = addWeeks(startOfWinterSem, 12);
  const endOfWinterSem = isFriday(thirteenWeeksAfterStart)
    ? thirteenWeeksAfterStart
    : nextFriday(thirteenWeeksAfterStart);

  return endOfWinterSem;
}
