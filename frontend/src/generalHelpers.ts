export function localTimeAsUTC(date: Date): Date {
    return new Date(
        Date.UTC(
            date.getFullYear(),
            date.getMonth(),
            date.getDate(),
            date.getHours(),
            date.getMinutes(),
            date.getSeconds(),
            date.getMilliseconds()
        )
    );
}

export function utcAsLocalTime(date: Date): Date {
    return new Date(
        date.getUTCFullYear(),
        date.getUTCMonth(),
        date.getUTCDate(),
        date.getUTCHours(),
        date.getUTCMinutes(),
        date.getUTCSeconds(),
        date.getUTCMilliseconds()
    );
}
type ISODateString = string;

export function generateTimeslots(
    dates: ISODateString[],
    startHour: number,
    startMinute: number,
    endHour: number,
    endMinute: number
): ISODateString[][] {
    const timeSlots: ISODateString[][] = [];
    for (const dateIso of dates) {
        const result: ISODateString[] = [];
        const curr: Date = utcAsLocalTime(new Date(dateIso));
        curr.setHours(startHour, startMinute);
        const dayEnd: Date = utcAsLocalTime(new Date(dateIso));
        dayEnd.setHours(endHour, endMinute);
        while (curr < dayEnd) {
            result.push(localTimeAsUTC(new Date(curr)).toISOString());
            curr.setMinutes(curr.getMinutes() + 30);
        }
        timeSlots.push(result);
    }
    return timeSlots;
}
