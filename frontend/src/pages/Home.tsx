import {
    Box,
    Button,
    Container,
    FormControl,
    Grid2,
    InputLabel,
    MenuItem,
    Select,
    Stack,
    TextField,
    Typography,
} from "@mui/material";
import { LocalizationProvider, TimePicker } from "@mui/x-date-pickers";
import { AdapterDateFns } from "@mui/x-date-pickers/AdapterDateFnsV3";
import React from "react";
import "react-day-picker/style.css";
import "../DayPicker.css";
import { isBefore, isSameMinute, set } from "date-fns";
import { rawTimeZones } from "@vvo/tzdb";
import { fromZonedTime, toZonedTime } from "date-fns-tz";
import { CustomDayPicker } from "../components/CustomDayPicker";

function Home() {
    const [today, setToday] = React.useState<Date>(new Date());
    const [nextYear, setNextYear] = React.useState<Date>(set(today, { year: today.getFullYear() + 1 }));

    const timezones = rawTimeZones.map((value) => value.name).sort();
    const [dates, setSelected] = React.useState<Date[]>([]);

    const [earliestTime, setEarliestTime] = React.useState<Date>(set(today, { hours: 9, minutes: 0 }));
    const [latestTime, setLatestTime] = React.useState<Date>(set(today, { hours: 17, minutes: 0 }));
    const [timezone, setTimezone] = React.useState<string>(Intl.DateTimeFormat().resolvedOptions().timeZone);
    const [eventName, setEventName] = React.useState<string>("");
    return (
        <Container>
            <Typography variant="h1" align="center">
                Meet Up
            </Typography>
            <Grid2 container spacing={5} justifyContent={"center"}>
                <Grid2>
                    <CustomDayPicker dates={dates} setSelected={setSelected} today={today} nextYear={nextYear} />
                </Grid2>
                <Grid2 display={"flex"} justifyContent={"center"} alignItems={"center"}>
                    <Box>
                        <Stack spacing={2}>
                            <LocalizationProvider dateAdapter={AdapterDateFns}>
                                <TimePicker
                                    minutesStep={15}
                                    label="Earliest Start Time"
                                    value={earliestTime}
                                    onChange={(date) => (date !== null ? setEarliestTime(date) : null)}
                                    skipDisabled={true}
                                    slotProps={{
                                        field: {
                                            readOnly: true,
                                        },
                                    }}
                                />
                                <TimePicker
                                    minutesStep={15}
                                    label="Latest End Time"
                                    value={latestTime}
                                    onChange={(date) => (date !== null ? setLatestTime(date) : null)}
                                    skipDisabled={true}
                                    slotProps={{
                                        field: {
                                            readOnly: true,
                                        },
                                    }}
                                    shouldDisableTime={(value) =>
                                        isBefore(value, earliestTime) || isSameMinute(value, earliestTime)
                                    }
                                />
                            </LocalizationProvider>
                            <FormControl fullWidth>
                                <InputLabel id="timezone">Timezone</InputLabel>
                                <Select
                                    labelId="timezone"
                                    label="Timezone"
                                    value={timezone}
                                    onChange={(event) => {
                                        const value: string = event.target.value as string;
                                        const utcTime: Date = fromZonedTime(today, timezone);
                                        const zonedTime = toZonedTime(utcTime, value);
                                        setToday(zonedTime);
                                        setNextYear(set(zonedTime, { year: today.getFullYear() + 1 }));
                                        setTimezone(value);
                                    }}
                                >
                                    {timezones.map((value) => (
                                        <MenuItem key={value} value={value}>
                                            {value}
                                        </MenuItem>
                                    ))}
                                </Select>
                            </FormControl>
                            <TextField
                                label="Event Name"
                                fullWidth
                                value={eventName}
                                onChange={(event) => setEventName(event.target.value)}
                                error={eventName.length < 3}
                                placeholder="My New Event"
                                color={eventName.length != 0 ? "success" : "primary"}
                            />
                            <Button
                                variant="contained"
                                disabled={
                                    !(dates.length > 0 && isBefore(earliestTime, latestTime) && eventName.length >= 3)
                                }
                            >
                                Create Event
                            </Button>
                        </Stack>
                    </Box>
                </Grid2>
            </Grid2>
            <Typography> {String(dates)} </Typography>
            <Typography> {String(earliestTime)} </Typography>
            <Typography> {String(latestTime)} </Typography>
        </Container>
    );
}

export default Home;
