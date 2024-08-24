import { isValid, parse } from "date-fns";
import { fromZonedTime, toZonedTime } from "date-fns-tz";

export const dateFormat: string = "yyyy-MM-dd";
export const timeFormat: string = "HH:mm";
const datetimeFormat: string = dateFormat + " " + timeFormat;

export function generateNRandomId(n: number) {
    const min = Math.pow(10, n - 1);
    const max = Math.pow(10, n) - 1;
    return Math.floor(min + Math.random() * (max - min + 1));
}

function getDateTime(date: string): Date {
    return parse(date, datetimeFormat, new Date());
}

export function getUtcDateTime(date: string, time: string, timezone: string): Date {
    return fromZonedTime(getDateTime(date + " " + time), timezone);
}

export function isValidTime(timeString: string) {
    return isValid(parse(timeString, timeFormat, new Date()));
}

export function isValidDate(dateString: string): boolean {
    return isValid(parse(dateString, dateFormat, new Date()));
}
