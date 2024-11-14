import { Container, Typography } from "@mui/material";
import { useParams } from "react-router-dom";
import React, { useEffect, useState } from "react";
import axios from "axios";
import { eventsEndpoint } from "../ApiEndpoints";
import { getEvent, getEventUsers } from "../ApiResponses";

function Meeting() {
    const { id } = useParams();
    const test = import.meta.env.VITE_API_URL;
    if (!test) console.error("fail");
    const [eventData, setEventData] = useState<getEvent>({} as getEvent);
    const [userData, setUserData] = useState<getEventUsers>({} as getEventUsers);
    // const [availabilityData, setAvailabilityData] = useState(null);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const eventResponse = await axios.get(eventsEndpoint + `/${id}`);
                setEventData(eventResponse.data);
                const userResponse = await axios.get(eventsEndpoint + `/${id}/users`);
                setUserData(userResponse.data);
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
            <Typography>Event Dates: {eventData.dates}</Typography>
            <Typography>Event Start: {eventData.startTime}</Typography>
            <Typography>Event End: {eventData.endTime}</Typography>
            <br />
            <Typography>Users:</Typography>
            {userData.users.map((data) => {
                return <Typography>{data.name}</Typography>;
            })}
            {/* <Typography>Users: {userData.users}</Typography> */}
        </Container>
    );
}

export default Meeting;
