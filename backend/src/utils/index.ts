import { parse } from "date-fns";
import { fromZonedTime } from "date-fns-tz";

export const datetimeFormat: string = "yyyy-MM-dd HH:mm";

export function generateNRandomId(n: number) {
    const min = Math.pow(10, n - 1);
    const max = Math.pow(10, n) - 1;
    return Math.floor(min + Math.random() * (max - min + 1));
}

export function getDateTime(date: string): Date {
    return parse(date, datetimeFormat, new Date());
}

export function getUtcDateTime(date: string, timezone: string): Date {
    return fromZonedTime(getDateTime(date), timezone);
}
