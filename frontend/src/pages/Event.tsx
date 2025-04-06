import { Box, CircularProgress, Container, Typography } from "@mui/material";
import { useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import axios from "axios";

import { Availability, getEvent, getEventUsers } from "../ApiResponses";
import { UserSession } from "../components/UserSession";
import { AvailabilitySetter } from "../components/AvailabilitySetter";
import { API } from "../ApiEndpoints";

export const Event = () => {
    const { id } = useParams();
    // const test = import.meta.env.VITE_API_URL; // TODO: for setting up api url for deployment
    // if (!test) console.error("fail");
    const [eventData, setEventData] = useState<getEvent>({} as getEvent);
    const [userData, setUserData] = useState<getEventUsers>({} as getEventUsers);
    const [availabilityMap] = useState<Map<string, string[]>>(new Map<string, string[]>());
    const [loading, setLoading] = useState<boolean>(true);
    const [dataError, setDataError] = useState<string | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [userSession, setUserSession] = useState<string>("");
    const [username, setUsername] = useState<string>("");
    const [eventIntervals, setEventIntervals] = useState<Date[][]>([]);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const eventResponse = await axios.get(API.events.byId(id as string));
                setEventData(eventResponse.data);
                const userResponse = await axios.get(API.events.users(id as string));
                setUserData(userResponse.data);
                const availabilityResponse = await axios.get(API.events.availability(id as string));
                availabilityResponse.data.availabilities.forEach((value: Availability) => {
                    availabilityMap.set(value.userId, value.dates);
                });
                const [startHours, startMinutes] = eventResponse.data.startTime.split(":").map(Number);
                const [endHours, endMinutes] = eventResponse.data.endTime.split(":").map(Number);
                const allIntervals: Date[][] = [];
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
                    allIntervals.push(result);
                }
                setEventIntervals(allIntervals);
            } catch (error) {
                setDataError((error as Error).message);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, []);

    if (loading)
        return (
            <Box
                sx={{
                    height: "100vh",
                    display: "flex",
                    justifyContent: "center",
                    alignItems: "center",
                    flexDirection: "column",
                    gap: 2,
                }}
            >
                <CircularProgress />
            </Box>
        );
    if (dataError) return <Typography>{dataError}</Typography>;

    const userSessionSetup = async (username: string) => {
        for (const user of userData.users) {
            if (user.name.toLowerCase() == username.toLowerCase()) {
                setUserSession(user.userId);
                setUsername(user.name);
                return;
            }
        }
        try {
            const response = await axios.post(API.events.users(eventData.eventId.toString()), { name: username });
            setUserSession(response.data.userId);
            setUsername(username);
        } catch (error) {
            setError(error instanceof Error ? error.message : "An unknown error occured setting user session");
        }
    };

    return (
        <Container>
            <Typography variant="h2" align="center">
                {eventData.name}
            </Typography>
            <Typography>Invite people to this event by sending them this link!</Typography>
            <Box sx={{ display: "flex", gap: 5, justifyContent: "space-around" }}>
                {!userSession ? (
                    <UserSession setUsername={userSessionSetup} />
                ) : (
                    <>
                        <Box
                            sx={{
                                display: "flex",
                                flexDirection: "column",
                                justifyContent: "center",
                                alignItems: "center",
                            }}
                        >
                            <Typography variant="h5" fontWeight={"bold"}>{`${username}'s Availability`}</Typography>
                            <AvailabilitySetter
                                eventId={eventData.eventId}
                                userId={userSession}
                                eventIntervals={eventIntervals}
                                availability={[]}
                            />
                        </Box>
                    </>
                )}
            </Box>
            <Box>
                <Typography variant="h5" fontWeight={"bold"}>
                    Group Availability
                </Typography>
                <Typography>
                    Lorem ipsum dolor, sit amet consectetur adipisicing elit. Blanditiis esse sunt inventore tempore sed
                    libero voluptatum iure quibusdam veniam molestiae dignissimos, minus commodi consequatur similique
                    eum neque deleniti quis nihil?
                </Typography>
            </Box>
            {/* <Box>
                <br />
                <Typography>Event Dates: {eventData.dates}</Typography>
                <Typography>Event Start: {eventData.startTime}</Typography>
                <Typography>Event End: {eventData.endTime}</Typography>
                <br />
                <Typography variant="h3">Debug</Typography>
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
                <Typography>{username}</Typography>
                <Typography>{userSession}</Typography>
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
                <NotificationMessage
                    open={!!error}
                    message={error || ""}
                    severity={"error"}
                    onClose={() => setError(null)}
                />
            </Box> */}
        </Container>
    );
};

export default Event;
