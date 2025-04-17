import { Box, CircularProgress, Container, Typography } from "@mui/material";
import { useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import axios from "axios";
import { Availability, getEvent, getEventUsers } from "../ApiResponses";
import { UserSession } from "../components/UserSession";
import { AvailabilitySetter } from "../components/AvailabilitySetter";
import { API } from "../ApiEndpoints";
import { generateTimeslots } from "../generalHelpers";
import { AvailabilityViewer } from "../components/AvailabilityViewer";
import { UserList } from "../components/UserList";

export const Event = () => {
    const { id } = useParams();
    const [eventData, setEventData] = useState<getEvent>({} as getEvent);
    const [userData, setUserData] = useState<getEventUsers>({} as getEventUsers);
    const [availabilityMap, setAvailabilityMap] = useState<Map<string, string[]>>(new Map<string, string[]>());
    const [loading, setLoading] = useState<boolean>(true);
    const [dataError, setDataError] = useState<string | null>(null);
    const [, setError] = useState<string | null>(null);
    const [userId, setUserId] = useState<string>("");
    const [username, setUsername] = useState<string>("");
    const [allTimeslots, setAllTimeslots] = useState<string[][]>([]);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const eventResponse = await axios.get(API.events.byId(id as string));
                setEventData(eventResponse.data);
                const userResponse = await axios.get(API.events.users(id as string));
                setUserData(userResponse.data);
                const availabilityResponse = await axios.get(API.events.availability(id as string));
                availabilityResponse.data.availabilities.forEach((value: Availability) => {
                    setAvailabilityMap((prev) => {
                        const update = new Map(prev);
                        update.set(value.userId, value.dates);
                        return update;
                    });
                });

                const [startHours, startMinutes] = eventResponse.data.startTime.split(":").map(Number);
                const [endHours, endMinutes] = eventResponse.data.endTime.split(":").map(Number);
                const timeslots = generateTimeslots(
                    eventResponse.data.dates,
                    startHours,
                    startMinutes,
                    endHours,
                    endMinutes
                );
                setAllTimeslots(timeslots);
            } catch (error) {
                setDataError((error as Error).message);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, [id]);

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

    const updater = (availability: string[]) => {
        setAvailabilityMap((prev) => {
            const update = new Map(prev);
            update.set(userId, availability);
            return update;
        });
    };

    return (
        <Container>
            <Typography variant="h2" align="center">
                {eventData.name}
            </Typography>
            <Typography>Invite people to this event by sending them this link!</Typography>
            <Box sx={{ display: "flex", gap: 5, justifyContent: "center", alignItems: "flex-start" }}>
                {!userId ? (
                    <>
                        <Box maxHeight={"20vw"} overflow={"auto"}>
                            <UserList usernames={userData.users.map((user) => user.name)} />
                        </Box>
                        <UserSession setUsername={userSessionSetup} />
                    </>
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
                                dayTimeSlots={allTimeslots}
                                availability={availabilityMap.get(userId) ?? []}
                                updater={updater}
                            />
                        </Box>
                    </>
                )}
            </Box>
            <Box>
                <Typography variant="h5" fontWeight={"bold"}>
                    Group Availability
                </Typography>
                <AvailabilityViewer
                    users={new Map(userData.users.map((user) => [user.userId, user.name]))}
                    availabilities={availabilityMap}
                    timeslots={allTimeslots}
                />
                <Typography>Group Information Here</Typography>
            </Box>
        </Container>
    );
};

export default Event;
