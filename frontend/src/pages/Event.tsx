import { Box, CircularProgress, Container, Typography } from "@mui/material";
import { useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import axios from "axios";
import { Availability, getEvent, getEventUsers } from "../ApiResponses";
import { UserSession } from "../components/UserSession";
import { AvailabilitySetter } from "../components/AvailabilitySetter";
import { API } from "../ApiEndpoints";
import NotificationMessage from "../components/NotificationMessage";
import { utcAsLocalTime } from "../generalHelpers";

export const Event = () => {
    const { id } = useParams();
    // const test = import.meta.env.VITE_API_URL; // TODO: for setting up api url for deployment
    // if (!test) console.error("fail");
    const [eventData, setEventData] = useState<getEvent>({} as getEvent);
    const [userData, setUserData] = useState<getEventUsers>({} as getEventUsers);
    const [availabilityMap] = useState<Map<string, Date[]>>(new Map<string, Date[]>());
    const [loading, setLoading] = useState<boolean>(true);
    const [dataError, setDataError] = useState<string | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [userId, setUserId] = useState<string>("");
    const [username, setUsername] = useState<string>("");
    const [allTimeSlots, setAllTimeSlots] = useState<Date[][]>([]);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const eventResponse = await axios.get(API.events.byId(id as string));
                setEventData(eventResponse.data);
                const userResponse = await axios.get(API.events.users(id as string));
                setUserData(userResponse.data);
                const availabilityResponse = await axios.get(API.events.availability(id as string));
                availabilityResponse.data.availabilities.forEach((value: Availability) => {
                    availabilityMap.set(
                        value.userId,
                        value.dates.map((value) => utcAsLocalTime(new Date(value)))
                    );
                });

                const [startHours, startMinutes] = eventResponse.data.startTime.split(":").map(Number);
                const [endHours, endMinutes] = eventResponse.data.endTime.split(":").map(Number);
                const timeSlots: Date[][] = [];
                for (const dateIso of eventResponse.data.dates) {
                    const result: Date[] = [];
                    const dayStart: Date = utcAsLocalTime(new Date(dateIso));
                    dayStart.setHours(startHours, startMinutes);
                    const dayEnd: Date = utcAsLocalTime(new Date(dateIso));
                    dayEnd.setHours(endHours, endMinutes);
                    const curr: Date = new Date(dayStart);
                    while (curr < dayEnd) {
                        result.push(new Date(curr));
                        curr.setMinutes(curr.getMinutes() + 30);
                    }
                    timeSlots.push(result);
                }
                setAllTimeSlots(timeSlots);
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
                setUserId(user.userId);
                setUsername(user.name);
                return;
            }
        }
        try {
            const response = await axios.post(API.events.users(eventData.eventId.toString()), { name: username });
            setUserId(response.data.userId);
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
                {!userId ? (
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
                                userId={userId}
                                dayTimeSlots={allTimeSlots}
                                availability={availabilityMap.get(userId) ?? []}
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
            <Box>
                <Typography>Debug</Typography>
                <Typography>List of Users</Typography>
                {userData.users.map((data) => {
                    return <Typography>{data.name}</Typography>;
                })}
                {/* <>
                    {userData.users.map((data) => {
                        return (
                            <>
                                <Typography key={data.name}>{`${data.name}: ${
                                    availabilityMap.get(data.userId) || []
                                }`}</Typography>
                                <br />
                            </>
                        );
                    })}
                </> */}
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
