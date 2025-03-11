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

interface AvailabilitySetterProp {
    eventId: number;
    userId: number;
    eventIntervals: Date[][];
    availability: Date[];
}

const tableFontSize = 10;

// take in event intervals and display each days's time as a stack of boxes to be clickable
// 1. setup time table selector with all the event intervals
// 2. api request to get the users availability times so highlight the appropriate boxes
// 3. setup being able to click and select the boxes to add to availability
export const AvailabilitySetter = ({ eventId, userId, eventIntervals, availability }: AvailabilitySetterProp) => {
    const days: number = eventIntervals.length;
    const times: number = eventIntervals[0].length;

    const generateTimeRows = () => {
        const rows = [];
        for (let i = 0; i < times; i++) {
            const cells = [];
            const time = eventIntervals[0][i];
            cells.push(
                <TableCell sx={{ p: 1 }}>
                    <Typography fontSize={tableFontSize}>
                        {time.getMinutes() == 0 ? format(time, "h a") : null}
                    </Typography>
                </TableCell>
            );
            for (let j = 0; j < days; j++) {
                cells.push(
                    <TableCell
                        padding="none"
                        height={1}
                        key={eventIntervals[j][i].toString()}
                        data-value={eventIntervals[j][i].toISOString()}
                    >
                        <Box sx={{ width: "99%", height: "100%", bgcolor: "green" }} />
                    </TableCell>
                );
            }
            rows.push(<TableRow sx={{ height: 32 }}>{cells}</TableRow>);
        }
        return rows;
    };

    return (
        <Box>
            <TableContainer component={Paper} sx={{ overflowX: "auto" }}>
                <Table>
                    <TableHead>
                        <TableRow>
                            <TableCell />
                            {eventIntervals.map((dates) => {
                                return (
                                    <TableCell key={dates[0].toString()} align="center">
                                        <Typography>{format(dates[0], "MMM d")}</Typography>
                                    </TableCell>
                                );
                            })}
                        </TableRow>
                    </TableHead>
                    <TableBody>{generateTimeRows()}</TableBody>
                </Table>
            </TableContainer>
            <Typography>{`${eventId} ${userId}`}</Typography>
        </Box>
    );
};
