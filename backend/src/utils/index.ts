import { isAfter, isBefore, isValid, parse, set } from "date-fns";
import { fromZonedTime } from "date-fns-tz";

export const dateFormat: string = "yyyy-MM-dd";
export const timeFormat: string = "HH:mm";
export const datetimeFormat: string = dateFormat + " " + timeFormat;
const eventIdRegex: RegExp = /^[1-9][0-9]*$/;

export function isValidIdString(input: string): boolean {
    return eventIdRegex.test(input);
}

export function generateNRandomId(n: number) {
    const min = Math.pow(10, n - 1);
    const max = Math.pow(10, n) - 1;
    return Math.floor(min + Math.random() * (max - min + 1)).toString();
}

export function parseTime(time: string): Date {
    return parse(time, timeFormat, new Date().setSeconds(0, 0));
}

export function parseDateTime(datetime: string): Date {
    return parse(datetime, datetimeFormat, new Date().setSeconds(0, 0));
}

export function parseUtcDateTime(date: string, time: string, timezone: string): Date {
    return fromZonedTime(parseDateTime(date + " " + time), timezone);
}

export function isValidInput(input: string): boolean {
    return input.length >= 3;
}

export function isValidTimezone(timezone: string): boolean {
    return isValid(fromZonedTime(new Date(), timezone));
}

export function isSameUtcDay(d1: Date, d2: Date): boolean {
    return (
        d1.getUTCFullYear() == d2.getUTCFullYear() &&
        d1.getUTCMonth() == d2.getUTCMonth() &&
        d1.getUTCDate() == d2.getUTCDate()
    );
}
