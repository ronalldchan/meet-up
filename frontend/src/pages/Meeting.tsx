import { Box, Container, Typography } from "@mui/material";
import { useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import axios from "axios";
import { eventsEndpointAvailability, eventsEndpointEvent, eventsEndpointUsers } from "../ApiEndpoints";
import { Availability, getEvent, getEventUsers } from "../ApiResponses";
import { UserSession } from "../components/UserSession";

function Meeting() {
    const { id } = useParams();
    // const test = import.meta.env.VITE_API_URL; // TODO: for setting up api url for deployment
    // if (!test) console.error("fail");
    const [eventData, setEventData] = useState<getEvent>({} as getEvent);
    const [userData, setUserData] = useState<getEventUsers>({} as getEventUsers);
    const [availabilityMap] = useState<Map<number, string[]>>(new Map<number, string[]>());
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);
    const [userSession, setUserSession] = useState<string>("");
    const [eventIntervals, setEventIntervals] = useState<Date[][]>([]);

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
                const [startHours, startMinutes] = eventResponse.data.startTime.split(":").map(Number);
                const [endHours, endMinutes] = eventResponse.data.endTime.split(":").map(Number);
                for (const dateString of eventResponse.data.dates) {
                    const result: Date[] = [];
                    const startDateTime: Date = new Date(dateString);
                    startDateTime.setHours(startHours, startMinutes);
                    const endDateTime: Date = new Date(dateString);
                    endDateTime.setHours(endHours, endMinutes);
                    const curr: Date = new Date(startDateTime);
                    while (curr < endDateTime) {
                        result.push(new Date(curr));
                        curr.setMinutes(curr.getMinutes() + 30);
                    }
                    setEventIntervals((prev) => [...prev, result]);
                }
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
            <Typography variant="h2" align="center">
                {eventData.name}
            </Typography>
            <Typography>Invite people to this event by sending them this link!</Typography>
            <Box sx={{ display: "flex", gap: 5, justifyContent: "space-around" }}>
                <Box>
                    {!userSession ? (
                        <UserSession setUsername={setUserSession} />
                    ) : (
                        <Typography variant="h5" fontWeight={"bold"}>{`${userSession}'s Availability`}</Typography>
                    )}
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
            <Typography>{eventData.dates}</Typography>
            <>
                <Typography>My Range</Typography>
                {eventIntervals.map((val) => (
                    <>
                        <Box>{val[0].toDateString()}</Box>
                        {val.map((val2) => (
                            <Typography key={val2.toISOString()}>{val2.toISOString()}</Typography>
                        ))}
                    </>
                ))}
            </>
        </Container>
    );
}

export default Meeting;
