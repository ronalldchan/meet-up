import { Box, Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow } from "@mui/material";

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
    availabilities: Map<string, string>; // userId, ISO string
}

export const AvailabilityViewer = () => {
    return (
        <Box display={"flex"} justifyContent={"center"} alignItems={"center"} flexDirection={"column"} gap={2}>
            <TableContainer component={Paper}>
                <Table>
                    <TableHead>
                        <TableRow>
                            <TableCell>test</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        <TableRow>
                            <TableCell>test1</TableCell>
                        </TableRow>
                    </TableBody>
                </Table>
            </TableContainer>
        </Box>
    );
};
