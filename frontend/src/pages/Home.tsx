import { Typography } from "@mui/material";
import { LocalizationProvider, TimePicker } from "@mui/x-date-pickers";
import { AdapterDateFns } from "@mui/x-date-pickers/AdapterDateFnsV3";
import { set } from "date-fns";
import React from "react";
import { DayPicker } from "react-day-picker";
import "react-day-picker/style.css";

function Home() {
    const [selected, setSelected] = React.useState<Date[] | undefined>([]);
    // const som = Intl.supportedValuesOf("timeZone");
    const [earliest, setEarliest] = React.useState<Date | null>(set(new Date(), { hours: 9, minutes: 0 }));
    const [latest, setLatest] = React.useState<Date | null>(set(new Date(), { hours: 17, minutes: 0 }));

    return (
        <>
            <Typography variant="h1">Meet Up</Typography>
            <DayPicker mode="multiple" showOutsideDays selected={selected} onSelect={setSelected} />
            <LocalizationProvider dateAdapter={AdapterDateFns}>
                <TimePicker
                    minutesStep={15}
                    label="Earliest Start Time"
                    value={earliest}
                    onChange={setEarliest}
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
                    onChange={setLatest}
                    skipDisabled={true}
                    slotProps={{
                        field: {
                            readOnly: true,
                        },
                    }}
                />
            </LocalizationProvider>
            <Typography> {String(selected)} </Typography>
            <Typography> {String(earliest)} </Typography>
            <Typography> {String(latest)} </Typography>
        </>
    );
}

export default Home;
