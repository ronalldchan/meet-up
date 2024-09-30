import {
    Alert,
    Box,
    Button,
    Container,
    FormControl,
    Grid2,
    InputLabel,
    MenuItem,
    Select,
    SelectChangeEvent,
    Snackbar,
    SnackbarCloseReason,
    Stack,
    TextField,
    Typography,
} from "@mui/material";
import { LocalizationProvider, TimePicker } from "@mui/x-date-pickers";
import { AdapterDateFns } from "@mui/x-date-pickers/AdapterDateFnsV3";
import React from "react";
import "react-day-picker/style.css";
import "../DayPicker.css";
import { formatDate, isAfter, isBefore, isSameDay, isSameMinute, set } from "date-fns";
import { rawTimeZones } from "@vvo/tzdb";
import { fromZonedTime, toZonedTime } from "date-fns-tz";
import { CustomDayPicker } from "../components/CustomDayPicker";
import axios from "axios";

function Home() {
    const [today, setToday] = React.useState<Date>(new Date());
    const [nextYear, setNextYear] = React.useState<Date>(set(today, { year: today.getFullYear() + 1 }));

    const timezones = rawTimeZones.map((value) => value.name).sort();
    const [dates, setDates] = React.useState<Date[]>([]);

    const [earliestTime, setEarliestTime] = React.useState<Date>(set(today, { hours: 9, minutes: 0 }));
    const [latestTime, setLatestTime] = React.useState<Date>(set(today, { hours: 17, minutes: 0 }));
    const [timezone, setTimezone] = React.useState<string>(Intl.DateTimeFormat().resolvedOptions().timeZone);
    const [eventName, setEventName] = React.useState<string>("");

    const [showAlert, setShowAlert] = React.useState<boolean>(false);
    const enableSubmitButton: boolean = dates.length > 0 && isBefore(earliestTime, latestTime) && eventName.length >= 3;

    function handleTimezoneChange(event: SelectChangeEvent) {
        const value: string = event.target.value as string;
        const utcTime: Date = fromZonedTime(today, timezone);
        const zonedTime = toZonedTime(utcTime, value);
        setToday(zonedTime);
        setNextYear(set(zonedTime, { year: today.getFullYear() + 1 }));
        setDates(dates.filter((value) => isSameDay(value, zonedTime) || isAfter(value, zonedTime)));
        setTimezone(value);
    }

    async function createEvent() {
        if (!enableSubmitButton) {
            setShowAlert(true);
            return;
        }

        const jsonData = {
            name: eventName,
            dates: dates.map((value) => formatDate(value, "yyyy-MM-dd")),
            startTime: formatDate(earliestTime, "HH:mm"),
            endTime: formatDate(latestTime, "HH:mm"),
            timezone: timezone,
        };

        try {
            console.log("sending request");
            const response = await axios.post("http://localhost:8080/api/events", jsonData);
            console.log("Response:", response.data);
        } catch (error) {
            console.error("Error sending request:", error);
        }
    }

    function handleAlertClose(event: React.SyntheticEvent | Event, reason?: SnackbarCloseReason) {
        if (reason === "clickaway") return;
        setShowAlert(false);
    }

    return (
        <Container>
            <Typography variant="h1" align="center">
                Meet Up
            </Typography>
            <Grid2 container spacing={5} justifyContent={"center"}>
                <Grid2>
                    <CustomDayPicker dates={dates} setSelected={setDates} today={today} nextYear={nextYear} />
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
                                    onChange={handleTimezoneChange}
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
                            <Button variant="contained" disabled={!enableSubmitButton} onClick={createEvent}>
                                Create Event
                            </Button>
                        </Stack>
                    </Box>
                </Grid2>
            </Grid2>
            <Snackbar
                open={showAlert}
                autoHideDuration={6000}
                anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
                onClose={handleAlertClose}
            >
                <Alert severity="error" variant="filled" onClose={handleAlertClose}>
                    Failed to create event. Please try again.
                </Alert>
            </Snackbar>
            <Typography variant="h5" fontWeight={"bold"}>
                Debugging
            </Typography>
            <Typography> Selected Dates: {String(dates)} </Typography>
            <Typography> Today: {String(today)}</Typography>
            <Typography> Next Year: {String(nextYear)}</Typography>
            <Typography> Earliest Time: {String(earliestTime)} </Typography>
            <Typography> Latest Time: {String(latestTime)} </Typography>
        </Container>
    );
}

export default Home;
