import { Box, Button, Container, TextField, Typography } from "@mui/material";
import { Form, useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import axios from "axios";
import { eventsEndpointAvailability, eventsEndpointEvent, eventsEndpointUsers } from "../ApiEndpoints";
import { Availability, getEvent, getEventUsers } from "../ApiResponses";

function Meeting() {
    const { id } = useParams();
    const test = import.meta.env.VITE_API_URL;
    if (!test) console.error("fail");
    const [eventData, setEventData] = useState<getEvent>({} as getEvent);
    const [userData, setUserData] = useState<getEventUsers>({} as getEventUsers);
    const [availabilityMap] = useState<Map<number, string[]>>(new Map<number, string[]>());
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const eventResponse = await axios.get(eventsEndpointEvent(id as string));
                setEventData(eventResponse.data);
                const userResponse = await axios.get(eventsEndpointUsers(id as string));
                setUserData(userResponse.data);
                const availabilityResponse = await axios.get(eventsEndpointAvailability(id as string));
                availabilityResponse.data.availabilities.forEach((value: Availability) => {
                    availabilityMap.set(value.userId, value.dates);
                });
            } catch (error) {
                setError((error as Error).message);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, []);

    if (loading) return <>Loading</>;
    if (error) return <>{error}</>;

    return (
        <Container>
            {/* <Typography variant="h2">Meeting {id}</Typography> */}
            <Typography variant="h2" align="center">
                {eventData.name}
            </Typography>
            <Typography>Invite people to this event by sending them this link!</Typography>
            <Box sx={{ display: "flex", gap: 5, justifyContent: "space-around" }}>
                <Box sx={{ display: "flex", flexDirection: "column", justifyContent: "center", alignItems: "center" }}>
                    <Typography variant="h5" fontWeight={"bold"}>
                        Sign In
                    </Typography>
                    <TextField label="Your Name" margin="normal" />
                    <Button variant="contained">Sign In</Button>
                </Box>
                <Box>
                    <Typography variant="h5" fontWeight={"bold"}>
                        Group Availability
                    </Typography>
                </Box>
            </Box>
            <Typography>Event Dates: {eventData.dates}</Typography>
            <Typography>Event Start: {eventData.startTime}</Typography>
            <Typography>Event End: {eventData.endTime}</Typography>
            <br />
            <Typography>Users:</Typography>
            <>
                {userData.users.map((data) => {
                    return (
                        <Typography key={data.name}>{`${data.name} + ${
                            availabilityMap.get(data.userId) || []
                        }`}</Typography>
                    );
                })}
            </>
        </Container>
    );
}

export default Meeting;
