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
import { utcAsLocalTime } from "../generalHelpers";
import { useEffect, useMemo } from "react";

/**
 * names
 * user ids?
 * all availabilities
 * a cell would have stronger highlight based on number of people
 * have the number scale off the avaialible / total people, make it effect opacity of cell
 * need some way for the user updating their availability to appear in this viewer as well
 * when you hover over a cell, have it show who's available and who isnt, where should this appear? as a hover item? or when you click?
 * @returns
 */

interface AvailabilityViewerProp {
    users: Map<string, string>; // userId, username
    availabilities: Map<string, string[]>; // userId, ISO string
    timeslots: string[][];
}

const tableFontSize = 12;

// flip availabilities map, map dates to users that are availabile. have a list of users that are available on that day, and the rest are not availabile
export const AvailabilityViewer = ({ users, availabilities, timeslots }: AvailabilityViewerProp) => {
    const timeslotToUsers: Map<string, string[]> = useMemo(() => {
        const map: Map<string, string[]> = new Map();
        for (const [userId, timeslots] of availabilities.entries()) {
            for (const timeslot of timeslots) {
                if (!map.get(timeslot)) map.set(timeslot, [userId]);
                else map.get(timeslot)?.push(userId);
            }
        }
        return map;
    }, [availabilities]);

    const maxTimeslotCount: number = useMemo(() => {
        return Math.max(...Array.from(timeslotToUsers.values()).map((arr) => arr.length));
    }, [timeslotToUsers]);

    const generateTimeRows = () => {
        const rows = [];
        for (let timeIndex = 0; timeIndex < timeslots[0].length; timeIndex++) {
            const cells = [];
            const timeSlot: Date = utcAsLocalTime(new Date(timeslots[0][timeIndex]));

            if (timeSlot.getMinutes() == 0) {
                cells.push(
                    <TableCell rowSpan={2} key={`time-${timeIndex}`} align="center">
                        <Typography fontSize={tableFontSize} sx={{ whiteSpace: "nowrap" }}>
                            {format(timeSlot, "h a")}
                        </Typography>
                    </TableCell>
                );
            }
            console.log(users);
            for (let dayIndex = 0; dayIndex < timeslots.length; dayIndex++) {
                const isoValue: string = timeslots[dayIndex][timeIndex];
                cells.push(
                    <TableCell
                        key={isoValue}
                        sx={{
                            border: 1,
                            borderColor: "rgb(0, 0, 0)",
                            backgroundColor: `rgb(0, 150, 0, ${
                                (timeslotToUsers.get(isoValue)?.length ?? 0) / maxTimeslotCount
                            })`,
                        }}
                    />
                );
            }
            rows.push(<TableRow key={`${timeIndex}`}>{cells}</TableRow>);
        }
        return rows;
    };

    return (
        <Box display={"flex"} justifyContent={"center"} alignItems={"center"} flexDirection={"column"} gap={2}>
            <TableContainer component={Paper} sx={{ maxWidth: "66vw", overflow: "auto", width: "max-content" }}>
                <Table size="small">
                    <TableHead>
                        <TableRow>
                            <TableCell />
                            {timeslots.map((dates) => (
                                <TableCell>
                                    <Typography fontSize={tableFontSize}>{format(dates[0], "MMM d")}</Typography>
                                </TableCell>
                            ))}
                        </TableRow>
                    </TableHead>
                    <TableBody>{generateTimeRows()}</TableBody>
                </Table>
            </TableContainer>
        </Box>
    );
};
