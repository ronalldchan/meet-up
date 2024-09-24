import { Box, Button, Container, Grid2, Paper, TextField, Typography } from "@mui/material";
import { LocalizationProvider, TimePicker } from "@mui/x-date-pickers";
import { AdapterDateFns } from "@mui/x-date-pickers/AdapterDateFnsV3";
import React from "react";
import { DayPicker } from "react-day-picker";
import "react-day-picker/style.css";
import "../DayPicker.css";
import { isBefore, isSameMinute, set } from "date-fns";

function Home() {
    const [selected, setSelected] = React.useState<Date[]>([]);
    // const som = Intl.supportedValuesOf("timeZone");
    const today: Date = new Date();
    const [earliest, setEarliest] = React.useState<Date>(set(today, { hours: 9, minutes: 0 }));
    const [latest, setLatest] = React.useState<Date>(set(today, { hours: 17, minutes: 0 }));
    return (
        <Container>
            <Typography variant="h1" align="center">
                Meet Up
            </Typography>

            <Grid2 container spacing={5} justifyContent={"center"}>
                <Grid2>
                    <Paper sx={{ padding: 3 }}>
                        <DayPicker
                            mode="multiple"
                            // captionLayout="dropdown"
                            startMonth={today}
                            endMonth={new Date(today.getFullYear() + 1, today.getMonth())}
                            selected={selected}
                            onSelect={setSelected}
                            disabled={{ before: today }}
                            // showOutsideDays
                            required
                            footer={
                                <Box
                                    sx={{
                                        display: "flex",
                                        justifyContent: "space-between",
                                        alignItems: "center",
                                    }}
                                >
                                    {selected.length > 0 ? (
                                        <Typography>You selected {selected?.length} days.</Typography>
                                    ) : (
                                        <Typography>Please select at least one day.</Typography>
                                    )}

                                    <Button sx={{ marginLeft: "auto" }} onClick={() => setSelected([])}>
                                        Reset
                                    </Button>
                                </Box>
                            }
                        />
                    </Paper>
                </Grid2>
                <Grid2 display={"flex"} justifyContent={"center"} alignItems={"center"}>
                    <Box>
                        <Box padding={3}>
                            <TextField label="Event Name" required />
                        </Box>
                        {/* <Typography>test</Typography> */}
                        <LocalizationProvider dateAdapter={AdapterDateFns}>
                            <TimePicker
                                minutesStep={15}
                                label="Earliest Start Time"
                                value={earliest}
                                onChange={(date) => (date !== null ? setEarliest(date) : null)}
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
                                value={latest}
                                onChange={(date) => (date !== null ? setLatest(date) : null)}
                                skipDisabled={true}
                                slotProps={{
                                    field: {
                                        readOnly: true,
                                    },
                                }}
                                shouldDisableTime={(value) =>
                                    isBefore(value, earliest) || isSameMinute(value, earliest)
                                }
                            />
                        </LocalizationProvider>
                    </Box>
                </Grid2>
            </Grid2>

            <Typography> {String(selected)} </Typography>
            <Typography> {String(earliest)} </Typography>
            <Typography> {String(latest)} </Typography>
        </Container>
    );
}

export default Home;
