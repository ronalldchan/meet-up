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
import React, { useEffect, useState } from "react";
import NotificationMessage from "./NotificationMessage";
import axios from "axios";
import { API } from "../ApiEndpoints";
import { localTimeAsUTC } from "../generalHelpers";

interface AvailabilitySetterProp {
    eventId: string;
    userId: string;
    dayTimeSlots: Date[][];
    availability: Date[];
}

const tableFontSize = 12;
const unavailableColour = "rgb(255, 200, 200)";
const availableColour = "rgb(200, 255, 200)";

// take in event intervals and display each days's time as a stack of boxes to be clickable
// 1. setup time table selector with all the event intervals
// 2. api request to get the users availability times so highlight the appropriate boxes
// 3. setup being able to click and select the boxes to add to availability
export const AvailabilitySetter = ({ eventId, userId, dayTimeSlots, availability }: AvailabilitySetterProp) => {
    const days: number = dayTimeSlots.length;
    const slotsInADay: number = dayTimeSlots[0].length;

    const [selectedTimes, setSelectedTimes] = React.useState<Date[]>(availability); // Track selected times
    const [isDragging, setIsDragging] = React.useState(false); // Track drag state
    const [success, setSuccess] = React.useState<string | null>(null);
    const [error, setError] = React.useState<string | null>(null);
    const [draggedCells, setDraggedCells] = useState<Set<number>>(new Set());

    useEffect(() => {
        const handlePointerUp = () => {
            setIsDragging(false);
            setDraggedCells(new Set());
        };
        window.addEventListener("pointerup", handlePointerUp);
        return () => {
            window.removeEventListener("pointerup", handlePointerUp);
        };
    }, []);

    const toggleSelection = (datetime: Date) => {
        setSelectedTimes((prev) =>
            prev.some((value: Date) => value.getTime() == datetime.getTime())
                ? prev.filter((t) => t.getTime() !== datetime.getTime())
                : [...prev, datetime]
        );
    };

    const handlePointerDown = (datetime: Date) => {
        setIsDragging(true);
        const timestamp = datetime.getTime();
        setDraggedCells(new Set([timestamp]));
        toggleSelection(datetime);
    };

    const handlePointerEnter = (datetime: Date) => {
        if (isDragging) {
            // toggleSelection(datetime);
            const timestamp = datetime.getTime();
            setDraggedCells((prev) => {
                if (prev.has(timestamp)) return prev;
                const newSet = new Set(prev);
                newSet.add(timestamp);
                toggleSelection(datetime);
                return newSet;
            });
        }
    };

    const generateTimeRows = () => {
        const rows = [];
        for (let i = 0; i < slotsInADay; i++) {
            const cells = [];
            const slot = dayTimeSlots[0][i];
            if (slot.getMinutes() == 0) {
                cells.push(
                    <TableCell rowSpan={2} key={`time-${i}`}>
                        <Typography fontSize={tableFontSize} sx={{ whiteSpace: "nowrap" }}>
                            {format(slot, "h a")}
                        </Typography>
                    </TableCell>
                );
            }

            for (let j = 0; j < days; j++) {
                const datetimeValue: Date = dayTimeSlots[j][i];
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
                            backgroundColor: selectedTimes.some(
                                (value: Date) => value.getTime() == datetimeValue.getTime()
                            )
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

    const handleSubmit = async (e: React.FormEvent) => {
        // do api request to update availability
        e.preventDefault();
        try {
            await axios.patch(API.events.userAvailability(eventId, userId), {
                availability: selectedTimes.map((value) => localTimeAsUTC(value)),
            });
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
                                {dayTimeSlots.map((dates) => {
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
                <Box display={"flex"} gap={2}>
                    <Button onClick={() => setSelectedTimes([])}>select none</Button>
                    <Button onClick={() => setSelectedTimes(dayTimeSlots.flat())}>select all</Button>
                    <Button variant="contained" type="submit">
                        Update Availability
                    </Button>
                </Box>
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
