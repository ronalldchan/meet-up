import { Box, Button, Container, Grid2, Stack, TextField, Typography } from "@mui/material";
import { LocalizationProvider, TimePicker } from "@mui/x-date-pickers";
import { AdapterDateFns } from "@mui/x-date-pickers/AdapterDateFnsV3";
import React, { useMemo } from "react";
import "react-day-picker/style.css";
import "../DayPicker.css";
import { formatDate, isBefore, set } from "date-fns";
import { CustomDayPicker } from "../components/CustomDayPicker";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import NotificationMessage from "../components/NotificationMessage";
import { API } from "../ApiEndpoints";

function Home() {
    const navigate = useNavigate();
    const minuteStep = 30;
    const [today] = React.useState<Date>(new Date());

    const [eventName, setEventName] = React.useState<string>("");
    const [dates, setDates] = React.useState<Date[]>([]);
    const [earliestTime, setEarliestTime] = React.useState<Date>(set(today, { hours: 9, minutes: 0 }));
    const [latestTime, setLatestTime] = React.useState<Date>(set(today, { hours: 17, minutes: 0 }));

    const [error, setError] = React.useState<string | null>(null);
    const [success, setSuccess] = React.useState<string | null>(null);

    const enableSubmitButton: boolean = useMemo(
        () => dates.length > 0 && isBefore(earliestTime, latestTime) && eventName.trim().length >= 3,
        [dates, earliestTime, latestTime, eventName]
    );
    const [loading, setLoading] = React.useState<boolean>(false);

    async function createEvent(event: React.FormEvent<HTMLFormElement>) {
        event.preventDefault();
        if (!enableSubmitButton) {
            return;
        }
        if (loading) return;
        setLoading(true);
        const jsonData = {
            name: eventName,
            dates: dates.map((value) => formatDate(value, "yyyy-MM-dd")),
            startTime: formatDate(earliestTime, "HH:mm"),
            endTime: formatDate(latestTime, "HH:mm"),
            // timezone: timezone, // TODO: Implement proper timezone handling later
            // timezone: "UTC",
        };
        try {
            const response = await axios.post(API.events.base, jsonData);
            setSuccess("Successfully created event. Redirecting you now.");
            await new Promise((resolve) => setTimeout(resolve, 1000));
            navigate(`/event/${response.data.eventId}`);
        } catch (error) {
            setError("Failed to create event. Please try again.");
            console.error("Error sending request:", error);
        } finally {
            setLoading(false);
        }
    }

    return (
        <Container>
            <Typography variant="h1" align="center">
                Meet Up
            </Typography>
            <Grid2 container spacing={5} justifyContent={"center"}>
                <Grid2>
                    <CustomDayPicker dates={dates} setSelected={setDates} />
                </Grid2>
                <Grid2 display={"flex"} justifyContent={"center"} alignItems={"center"}>
                    <form onSubmit={createEvent}>
                        <Stack spacing={2}>
                            <LocalizationProvider dateAdapter={AdapterDateFns}>
                                <TimePicker
                                    minutesStep={minuteStep}
                                    label="Earliest Start Time"
                                    value={earliestTime}
                                    onChange={(date) => date && setEarliestTime(date)}
                                    skipDisabled={true}
                                    slotProps={{
                                        field: {
                                            readOnly: true,
                                        },
                                    }}
                                />
                                <TimePicker
                                    minutesStep={minuteStep}
                                    label="Latest End Time"
                                    value={latestTime}
                                    onChange={(date) => (date !== null ? setLatestTime(date) : null)}
                                    skipDisabled={true}
                                    slotProps={{
                                        field: {
                                            readOnly: true,
                                        },
                                    }}
                                    // shouldDisableTime={(value) =>
                                    //     isBefore(value, earliestTime) || isSameMinute(value, earliestTime)
                                    // }
                                />
                            </LocalizationProvider>
                            {/* {
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
                                } */}
                            <TextField
                                label="Event Name"
                                fullWidth
                                value={eventName}
                                onChange={(event) => setEventName(event.target.value)}
                                error={eventName.length < 3}
                                placeholder="My New Event"
                            />

                            <Button
                                variant="contained"
                                type="submit"
                                disabled={!enableSubmitButton || loading}
                                fullWidth
                            >
                                Create Event
                            </Button>
                        </Stack>
                    </form>
                </Grid2>
            </Grid2>
            <NotificationMessage open={!!error} message={error || ""} onClose={() => setError(null)} severity="error" />
            <NotificationMessage
                open={!!success}
                message={success || ""}
                onClose={() => setError(null)}
                severity="success"
            />
            {/* <Box>
                <Typography variant="h5" fontWeight={"bold"}>
                    Debugging
                </Typography>
                <Typography> Selected Dates: {String(dates)} </Typography>
                <Typography> Today: {String(today)}</Typography>
                <Typography> Earliest Time: {String(earliestTime)} </Typography>
                <Typography> Latest Time: {String(latestTime)} </Typography>
            </Box> */}
        </Container>
    );
}

export default Home;
