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
    return (
        <Box>
            <TableContainer component={Paper} sx={{ overflowX: "auto" }}>
                <Table>
                    <TableHead>
                        <TableRow>
                            <TableCell>Day</TableCell>
                            {eventIntervals.map((dates, index) => {
                                return (
                                    <TableCell key={dates[0].toString()} align="center">
                                        {format(dates[0], "MMM d")}
                                    </TableCell>
                                );
                            })}
                            {/* {dates.map((time) => (
                                    <TableCell key={time.toString()} align="center">
                                        {time.toISOString()}
                                    </TableCell>
                                ))} */}
                        </TableRow>
                    </TableHead>
                    <TableBody></TableBody>
                </Table>
            </TableContainer>
            {/* {console.log(availability)} */}
            <Typography>{`${eventId} ${userId}`}</Typography>
        </Box>
    );
};
