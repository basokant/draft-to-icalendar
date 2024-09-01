import { sendMessage } from "./main";

type Schedule = unknown;

export type GetScheduleResponse = {
  type: "get_schedule";
  schedule: Schedule;
};

export async function getScheduleHandler() {
  const schedule = getSchedule();
  return sendMessage({
    type: "get_schedule",
    schedule,
  });
}

function getSchedule(): Schedule {
  return null;
}
