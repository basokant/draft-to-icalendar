import { camelize, isAlpha } from "~/lib/utils";
import { sendContentMessage } from "./main";

export function getScheduleHandler() {
  const schedule = getSchedule();
  return sendContentMessage({
    type: "get_schedule",
    schedule,
  });
}

export type DraftSchedule = {
  classes: Class[];
  year: number;
};

export const classSession = ["Fall", "Winter", "Summer", "Full Year"] as const;
export type ClassSession = (typeof classSession)[number];

export const classComponent = ["Lecture", "Lab", "Tutorial"] as const;
export type ClassComponent = (typeof classComponent)[number];

export const classDelivery = ["In Person", "Distance Studies/Online"] as const;
export type ClassDelivery = (typeof classDelivery)[number];

export const dayOfWeek = [
  "monday",
  "tuesday",
  "wednesday",
  "thursday",
  "friday",
] as const;
export type DayOfWeek = (typeof dayOfWeek)[number];

type ShortDayOfWeek = "M" | "Tu" | "W" | "Th" | "F";

export type ClassTime = {
  /** days in which this class time occurs in the week (from monday to friday) */
  days: DayOfWeek[];

  /** start of class time in the format "00:00 AM/PM" (in EST) */
  startTime: string;

  /** end of class time in the format "00:00 AM/PM" (in EST) */
  endTime: string;

  location: string | null;
};

type Class = {
  subject: string;
  courseNumber: string;
  session: ClassSession;
  component: ClassComponent;
  section: string;
  description: string;
  classNbr: number;
  creditUnits: number;
  instructor: string | null;
  daysTimesLocation: ClassTime[];
  deliveryType: ClassDelivery;
};

export type GetScheduleResponse = {
  type: "get_schedule";
  schedule: DraftSchedule;
};

function getHeadings() {
  const headingRow = document.querySelector(
    "table.table-hover > tbody > tr.active",
  );
  const headingCells = Array.from(headingRow?.querySelectorAll("th") ?? []);

  const headings = headingCells.map((hc) => hc.innerText);
  return headings;
}

function getClassPropertyFromHeading(heading: string): keyof Class {
  return camelize(heading.replaceAll("/", " ")) as keyof Class;
}

function getClassPropertyToColMap(headings: string[]) {
  const classPropertyToColMap = new Map<keyof Class, number>();
  headings?.forEach((heading, index) => {
    if (!heading) return;
    const property = getClassPropertyFromHeading(heading);
    classPropertyToColMap.set(property, index);
  });

  return classPropertyToColMap;
}

function getClasses(): Class[] {
  const headings = getHeadings();
  const classPropToColMap = getClassPropertyToColMap(headings);

  const classTableRows = Array.from(
    document.querySelectorAll<HTMLTableRowElement>(
      "table.table-hover > tbody > tr:not(.active)",
    ),
  );

  const classes = classTableRows.map((classTableRow) =>
    getClass(classTableRow, classPropToColMap),
  );
  return classes;
}

function getClass(
  classTableRow: HTMLTableRowElement,
  classPropToCol: Map<keyof Class, number>,
): Class {
  const classCells = Array.from(
    classTableRow.querySelectorAll<HTMLTableCellElement>(":scope > td"),
  );

  const subjectCol = classPropToCol.get("subject");
  const subject = subjectCol ? (classCells[subjectCol]?.innerText ?? "") : "";

  const courseNumberCol = classPropToCol.get("courseNumber");
  const courseNumber = courseNumberCol
    ? (classCells[courseNumberCol]?.innerText ?? "")
    : "";

  const componentCol = classPropToCol.get("component");
  const component: ClassComponent = componentCol
    ? getComponent(classCells[componentCol])
    : "Lecture";

  const sectionCol = classPropToCol.get("section");
  const section = sectionCol ? (classCells[sectionCol]?.innerText ?? "") : "";

  const descriptionCol = classPropToCol.get("description");
  const description = descriptionCol
    ? (classCells[descriptionCol]?.innerText ?? "")
    : "";

  const classNbrCol = classPropToCol.get("classNbr");
  const classNbr = classNbrCol ? Number(classCells[classNbrCol]?.innerText) : 0;

  const instructorCol = classPropToCol.get("instructor");
  const instructor = instructorCol
    ? getInstructor(classCells[instructorCol])
    : null;

  const daysTimesLocationCol = classPropToCol.get("daysTimesLocation");
  const daysTimesLocation: ClassTime[] = daysTimesLocationCol
    ? getClassTimes(classCells[daysTimesLocationCol])
    : [];

  const creditUnitsCol = classPropToCol.get("creditUnits");
  const creditUnits = creditUnitsCol
    ? Number(classCells[creditUnitsCol]?.innerText ?? 0.0)
    : 0.0;

  const deliveryCol = classPropToCol.get("deliveryType");
  const deliveryType: ClassDelivery = deliveryCol
    ? getDeliveryType(classCells[deliveryCol])
    : "Distance Studies/Online";

  const session: ClassSession = getClassSession(courseNumber);

  return {
    subject,
    courseNumber,
    session,
    component,
    section,
    description,
    classNbr,
    instructor,
    daysTimesLocation,
    creditUnits,
    deliveryType,
  };
}

function getComponent(cell: HTMLTableCellElement | undefined): ClassComponent {
  const component = cell?.innerText.toLowerCase();
  switch (component) {
    case "lab":
      return "Lab";
    case "tut":
      return "Tutorial";
    default:
      return "Lecture";
  }
}

function getInstructor(cell: HTMLTableCellElement | undefined): string | null {
  return cell?.innerText ?? null;
}

function getClassTimes(cell: HTMLTableCellElement | undefined): ClassTime[] {
  if (cell === undefined) {
    return [];
  }

  const classTimeRows = Array.from(
    cell.querySelectorAll<HTMLTableRowElement>("table > tbody > tr"),
  );

  const hasEmptyFirstCell = !classTimeRows
    .at(0)
    ?.querySelector("td")
    ?.innerText.trim();

  if (classTimeRows.length <= 1 && hasEmptyFirstCell) {
    return [];
  }

  const classTimes: ClassTime[] = classTimeRows.map(getClassTime);
  return classTimes;
}

function getClassTime(row: HTMLTableRowElement): ClassTime {
  const shortDayToDay: Record<ShortDayOfWeek, DayOfWeek> = {
    M: "monday",
    Tu: "tuesday",
    W: "wednesday",
    Th: "thursday",
    F: "friday",
  };

  const classTimeCells = Array.from(row.querySelectorAll("td"));

  const shortDays = classTimeCells[0]?.innerText
    .replace(/\s/g, "")
    ?.split("") as ShortDayOfWeek[] | undefined;
  const days: DayOfWeek[] =
    shortDays?.map((day: ShortDayOfWeek) => shortDayToDay[day]) ?? [];

  const times = classTimeCells[1]?.innerText.trim().split(" - ") ?? [];
  const startTime = times[0] ?? "";
  const endTime = times[1] ?? "";
  const location = classTimeCells[2]?.innerText ?? null;

  return {
    days,
    location,
    startTime,
    endTime,
  };
}

function getDeliveryType(
  cell: HTMLTableCellElement | undefined,
): ClassDelivery {
  const deliveryType = cell?.innerText.toLowerCase();
  if (deliveryType === "In Person") {
    return deliveryType;
  }
  return "Distance Studies/Online";
}

function getClassSession(courseNumber: string): ClassSession {
  const suffix = courseNumber.at(-1);
  if (!suffix || !isAlpha(suffix)) {
    return "Full Year";
  }

  switch (suffix) {
    case "A":
    case "F":
      return "Fall";
    case "B":
    case "G":
      return "Winter";
    default:
      return "Full Year";
  }
}

function getYear() {
  const termSelectElement = document.querySelector<HTMLSelectElement>(
    "select#CurrentTimeTableDisplay",
  );

  const term =
    Array.from(termSelectElement?.selectedOptions ?? []).at(
      termSelectElement?.selectedIndex ?? 0,
    )?.innerText ?? "";
  const year = Number(term?.trim().split(" ").at(-1));

  return year;
}

function getSchedule(): DraftSchedule {
  const classes = getClasses();
  const year = getYear();
  console.log({ classes, year });

  return {
    classes: classes,
    year: year,
  };
}
