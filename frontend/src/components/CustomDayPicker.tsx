import { Box, Button, Paper, Typography } from "@mui/material";
import React from "react";
import { DayPicker } from "react-day-picker";

interface CustomDayPickerProps {
    dates: Date[];
    setSelected: (dates: Date[]) => void;
    today: Date;
    nextYear: Date;
}

export function CustomDayPicker({ dates, setSelected, today, nextYear }: CustomDayPickerProps) {
    return (
        <Paper sx={{ padding: 3 }}>
            <DayPicker
                mode="multiple"
                // startMonth={today}
                // endMonth={nextYear}
                today={today}
                selected={dates}
                onSelect={setSelected}
                // disabled={{ before: today }}
                showOutsideDays
                required
                footer={
                    <Box
                        sx={{
                            display: "flex",
                            justifyContent: "space-between",
                            alignItems: "center",
                        }}
                    >
                        {dates.length > 0 ? (
                            <Typography>You selected {dates?.length} days.</Typography>
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
    );
}
