import { Typography } from "@mui/material";
import { useParams } from "react-router-dom";
import React, { useEffect, useState } from "react";
import axios from "axios";
import { eventsEndpoint } from "../ApiEndpoints";
import { getEvent } from "../ApiResponses";

function Meeting() {
    const { id } = useParams();
    const test = import.meta.env.VITE_API_URL;
    if (!test) console.error("fail");
    const [data, setData] = useState<getEvent>(null);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const response = await axios.get(eventsEndpoint + `/${id}`);
                console.log(response);
                console.log(response.data);
                setData(response.data);
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
        <>
            <Typography>Meeting {id + test}</Typography>
            <Typography>Event Name: {data.name}</Typography>
            <Typography>Event Dates: {data.dates}</Typography>
            <Typography>Event Start: {data.startTime}</Typography>
            <Typography>Event End: {data.endTime}</Typography>
            {/* <ul>
                {data.map((item) => (
                    <li key={item}>{item}</li>
                ))}
            </ul> */}
        </>
    );
}

export default Meeting;
