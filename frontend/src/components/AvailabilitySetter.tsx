import {
    Box,
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

    useEffect(() => {
        const handleMouseUp = () => setIsDragging(false);

        window.addEventListener("mouseup", handleMouseUp);

        return () => {
            window.removeEventListener("mouseup", handleMouseUp);
        };
    }, []);

    const toggleSelection = (datetime: Date) => {
        setSelectedTimes((prev) =>
            prev.includes(datetime) ? prev.filter((t) => t !== datetime) : [...prev, datetime]
        );
    };

    const handleMouseDown = (datetime: Date) => {
        setIsDragging(true);
        toggleSelection(datetime);
    };

    const handleMouseEnter = (datetime: Date) => {
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
                        onMouseDown={() => handleMouseDown(datetimeValue)}
                        onMouseEnter={() => handleMouseEnter(datetimeValue)}
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

    console.log(selectedTimes);
    return (
        <Box>
            <TableContainer
                component={Paper}
                sx={{ overflowX: "auto", maxWidth: "40vw", margin: "auto", userSelect: "none" }}
            >
                <Table>
                    <TableHead>
                        <TableRow>
                            <TableCell />
                            {eventIntervals.map((dates) => {
                                return (
                                    <TableCell key={dates[0].toString()} align="center">
                                        <Typography fontSize={tableFontSize}>{format(dates[0], "MMM d")}</Typography>
                                    </TableCell>
                                );
                            })}
                        </TableRow>
                    </TableHead>
                    <TableBody>{generateTimeRows()}</TableBody>
                </Table>
            </TableContainer>
        </Box>
    );
};
