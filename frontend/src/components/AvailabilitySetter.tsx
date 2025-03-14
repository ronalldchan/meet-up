import {
    Box,
    Button,
    Paper,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Typography,
} from "@mui/material";
import { format } from "date-fns";
import React, { useEffect } from "react";
import NotificationMessage from "./NotificationMessage";

interface AvailabilitySetterProp {
    eventId: number;
    userId: number;
    eventIntervals: Date[][];
    availability: Date[];
}

const tableFontSize = 12;
const unavailableColour = "rgb(255, 200, 200)";
const availableColour = "rgb(200, 255, 200)";

// take in event intervals and display each days's time as a stack of boxes to be clickable
// 1. setup time table selector with all the event intervals
// 2. api request to get the users availability times so highlight the appropriate boxes
// 3. setup being able to click and select the boxes to add to availability
export const AvailabilitySetter = ({ eventId, userId, eventIntervals, availability }: AvailabilitySetterProp) => {
    const days: number = eventIntervals.length;
    const times: number = eventIntervals[0].length;

    const [selectedTimes, setSelectedTimes] = React.useState<Date[]>([]); // Track selected times
    const [isDragging, setIsDragging] = React.useState(false); // Track drag state
    const [success, setSuccess] = React.useState<string | null>(null);
    const [error, setError] = React.useState<string | null>(null);

    useEffect(() => {
        const handlePointerUp = () => setIsDragging(false);

        window.addEventListener("pointerup", handlePointerUp);

        return () => {
            window.removeEventListener("pointerup", handlePointerUp);
        };
    }, []);

    const toggleSelection = (datetime: Date) => {
        setSelectedTimes((prev) =>
            prev.includes(datetime) ? prev.filter((t) => t !== datetime) : [...prev, datetime]
        );
    };

    const handlePointerDown = (datetime: Date) => {
        setIsDragging(true);
        toggleSelection(datetime);
    };

    const handlePointerEnter = (datetime: Date) => {
        if (isDragging) {
            toggleSelection(datetime);
        }
    };

    const generateTimeRows = () => {
        const rows = [];
        for (let i = 0; i < times; i++) {
            const cells = [];
            const time = eventIntervals[0][i];
            if (time.getMinutes() == 0) {
                cells.push(
                    <TableCell rowSpan={2} key={`time-${i}`}>
                        <Typography fontSize={tableFontSize} sx={{ whiteSpace: "nowrap" }}>
                            {format(time, "h a")}
                        </Typography>
                    </TableCell>
                );
            }

            for (let j = 0; j < days; j++) {
                const datetimeValue = eventIntervals[j][i];
                cells.push(
                    <TableCell
                        onPointerDown={() => handlePointerDown(datetimeValue)}
                        onPointerEnter={() => handlePointerEnter(datetimeValue)}
                        padding="none"
                        height={1}
                        key={datetimeValue.toISOString()}
                        data-value={datetimeValue.toISOString()}
                        sx={{
                            border: 1,
                            borderColor: "rgb(0, 0, 0)",
                            backgroundColor: selectedTimes.includes(datetimeValue)
                                ? availableColour
                                : unavailableColour,
                        }}
                    />
                );
            }
            rows.push(<TableRow key={`row-${i}`}>{cells}</TableRow>);
        }
        return rows;
    };

    const handleSubmit = (e: React.FormEvent) => {
        // do api request to update availability
        e.preventDefault();
        try {
            setSuccess("updated availablity");
        } catch (error) {
            setError((error as Error).message || "Failed to update availability");
        }
    };

    console.log(selectedTimes);
    return (
        <form onSubmit={handleSubmit}>
            <Box display={"flex"} justifyContent={"center"} alignItems={"center"} flexDirection={"column"} gap={2}>
                <TableContainer component={Paper} sx={{ overflowX: "auto", maxWidth: "40vw", margin: "auto" }}>
                    <Table>
                        <TableHead>
                            <TableRow>
                                <TableCell />
                                {eventIntervals.map((dates) => {
                                    return (
                                        <TableCell key={dates[0].toString()} align="center">
                                            <Typography fontSize={tableFontSize}>
                                                {format(dates[0], "MMM d")}
                                            </Typography>
                                        </TableCell>
                                    );
                                })}
                            </TableRow>
                        </TableHead>
                        <TableBody sx={{ userSelect: "none" }}>{generateTimeRows()}</TableBody>
                    </Table>
                </TableContainer>
                <Button variant="contained" type="submit">
                    Update Availability
                </Button>
            </Box>
            <NotificationMessage
                open={!!success}
                message={success || ""}
                severity={"success"}
                onClose={() => setSuccess(null)}
            />
            <NotificationMessage
                open={!!error}
                message={error || ""}
                severity={"error"}
                onClose={() => setError(null)}
            />
        </form>
    );
};
