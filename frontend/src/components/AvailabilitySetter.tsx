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

// take in event intervals and display each days's time as a stack of boxes to be clickable
// 1. setup time table selector with all the event intervals
// 2. api request to get the users availability times so highlight the appropriate boxes
// 3. setup being able to click and select the boxes to add to availability
export const AvailabilitySetter = ({ eventId, userId, eventIntervals, availability }: AvailabilitySetterProp) => {
    const days: number = eventIntervals.length;
    const times: number = eventIntervals[0].length;
    console.log(eventIntervals);
    console.log(times);

    const generateTimeRow = () => {
        const rows = [];
        for (let i = 0; i < times; i++) {
            const cells = [];
            for (let j = 0; j < days; j++) {
                cells.push(
                    <TableCell key={eventIntervals[j][i].toString()} data-value={eventIntervals[j][i].toISOString()}>
                        <Box bgcolor={"black"} />
                    </TableCell>
                );
            }
            rows.push(<TableRow>{cells}</TableRow>);
        }
        return rows;
    };

    return (
        <Box>
            <TableContainer component={Paper} sx={{ overflowX: "auto" }}>
                <Table>
                    <TableHead>
                        <TableRow>
                            {eventIntervals.map((dates) => {
                                return (
                                    <TableCell key={dates[0].toString()} align="center">
                                        {format(dates[0], "MMM d")}
                                    </TableCell>
                                );
                            })}
                        </TableRow>
                    </TableHead>
                    <TableBody>{generateTimeRow()}</TableBody>
                </Table>
            </TableContainer>
            {/* {console.log(availability)} */}
            <Typography>{`${eventId} ${userId}`}</Typography>
        </Box>
    );
};
