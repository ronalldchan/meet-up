import { Box, Button, TextField, Typography } from "@mui/material";
import React from "react";

type UserSessionProps = {
    setUsername: React.Dispatch<React.SetStateAction<string>>;
};

export const UserSession = ({ setUsername }: UserSessionProps) => {
    const [input, setInput] = React.useState<string>("");

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setUsername(input);
    };

    return (
        <Box
            component={"form"}
            onSubmit={handleSubmit}
            sx={{ display: "flex", flexDirection: "column", justifyContent: "center", alignItems: "center" }}
        >
            <Typography variant="h5" fontWeight={"bold"}>
                Sign In
            </Typography>
            <TextField
                label="Your Name"
                margin="normal"
                value={input}
                onChange={(event) => setInput(event.target.value)}
            />
            <Button variant="contained" type="submit">
                Sign In
            </Button>
        </Box>
    );
};
