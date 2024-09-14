import { Typography } from "@mui/material";
import React from "react";
import { DayPicker } from "react-day-picker";
import "react-day-picker/style.css";

function Home() {
    const [selected, setSelected] = React.useState<Date[] | undefined>();
    // const som = Intl.supportedValuesOf("timeZone");

    return (
        <>
            <Typography variant="h1">Meet Up</Typography>
            <DayPicker mode="multiple" showOutsideDays selected={selected} onSelect={setSelected} />
            <Typography> {String(selected)} </Typography>
        </>
    );
}

export default Home;
