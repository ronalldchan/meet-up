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
import React, { useEffect, useRef, useState } from "react";
import NotificationMessage from "./NotificationMessage";
import axios from "axios";
import { API } from "../ApiEndpoints";
import { utcAsLocalTime } from "../generalHelpers";

interface AvailabilitySetterProp {
    eventId: string;
    userId: string;
    dayTimeSlots: string[][];
    availability: string[];
}

const tableFontSize = 12;
// const tableCellStyle = { width: "1px" };
const unavailableColour = "rgb(255, 200, 200)";
const availableColour = "rgb(200, 255, 200)";

// when updating the availability, should take some function to also update the viewing table to see the relevant changes?
export const AvailabilitySetter = ({ eventId, userId, dayTimeSlots, availability }: AvailabilitySetterProp) => {
    const days: number = dayTimeSlots.length;
    const slotsInADay: number = dayTimeSlots[0].length;

    const [selectedTimes, setSelectedTimes] = React.useState<Set<string>>(new Set(availability)); // Track selected times
    const [success, setSuccess] = React.useState<string | null>(null);
    const [error, setError] = React.useState<string | null>(null);
    const [, setDraggedCells] = useState<Set<string>>(new Set());
    const didStartDragInComponent = useRef(false);
    const isDragging = useRef<boolean>(false);
    const dragMode = useRef<"add" | "remove" | null>(null);

    const handlePointerDown = (datetime: string) => {
        didStartDragInComponent.current = true;
        isDragging.current = true;
        setDraggedCells(new Set([datetime]));
        dragMode.current = selectedTimes.has(datetime) ? "remove" : "add";
        toggleSelection(datetime);
    };

    const handlePointerEnter = (datetime: string) => {
        if (!isDragging.current) return;

        setDraggedCells((prev) => {
            if (prev.has(datetime)) return prev;
            const newSet = new Set(prev);
            newSet.add(datetime);
            toggleSelection(datetime);
            return newSet;
        });
    };

    const toggleSelection = (datetime: string) => {
        setSelectedTimes((prev) => {
            const newSet = new Set(prev);
            if (dragMode.current == "remove") newSet.delete(datetime);
            else newSet.add(datetime);
            return newSet;
        });
    };

    useEffect(() => {
        const handlePointerUp = () => {
            if (didStartDragInComponent.current) {
                isDragging.current = false;
                setDraggedCells(new Set());
                didStartDragInComponent.current = false;
                dragMode.current = null;
            }
        };
        window.addEventListener("pointerup", handlePointerUp);
        return () => {
            window.removeEventListener("pointerup", handlePointerUp);
        };
    }, []);

    const generateTimeRows = () => {
        const rows = [];
        for (let timeIndex = 0; timeIndex < slotsInADay; timeIndex++) {
            const cells = [];
            const timeSlot: Date = utcAsLocalTime(new Date(dayTimeSlots[0][timeIndex]));

            if (timeSlot.getMinutes() == 0) {
                cells.push(
                    <TableCell rowSpan={2} key={`time-${timeIndex}`} align="center">
                        <Typography fontSize={tableFontSize} sx={{ whiteSpace: "nowrap" }}>
                            {format(timeSlot, "h a")}
                        </Typography>
                    </TableCell>
                );
            }

            for (let dayIndex = 0; dayIndex < days; dayIndex++) {
                const isoValue: string = dayTimeSlots[dayIndex][timeIndex];
                cells.push(
                    <TableCell
                        onPointerDown={() => handlePointerDown(isoValue)}
                        onPointerOver={() => handlePointerEnter(isoValue)}
                        // padding="none"
                        key={isoValue}
                        // data-value={isoValue} // for debugging
                        sx={{
                            border: 1,
                            borderColor: "rgb(0, 0, 0)",
                            backgroundColor: selectedTimes.has(isoValue) ? availableColour : unavailableColour,
                        }}
                    />
                );
            }
            rows.push(<TableRow key={`${timeIndex}`}>{cells}</TableRow>);
        }
        return rows;
    };

    const handleSubmit = async (e: React.FormEvent) => {
        // do api request to update availability
        e.preventDefault();
        try {
            await axios.patch(API.events.userAvailability(eventId, userId), {
                availability: Array.from(selectedTimes),
            });
            setSuccess("updated availablity");
        } catch (error) {
            setError((error as Error).message || "Failed to update availability");
        }
    };

    return (
        <form onSubmit={handleSubmit}>
            <Box display={"flex"} justifyContent={"center"} alignItems={"center"} flexDirection={"column"} gap={2}>
                <TableContainer component={Paper} sx={{ maxWidth: "66vw", overflow: "auto", width: "max-content" }}>
                    <Table size="small">
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
                    <Button onClick={() => setSelectedTimes(new Set())}>select none</Button>
                    <Button onClick={() => setSelectedTimes(new Set(dayTimeSlots.flat()))}>select all</Button>
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
