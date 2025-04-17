import { Box, Typography } from "@mui/material";

type UserListProps = {
    usernames: string[];
};

export const UserList = ({ usernames }: UserListProps) => {
    return (
        <Box
            sx={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
            }}
        >
            <Typography variant="h5" fontWeight={"bold"}>
                Users
            </Typography>
            {usernames.map((username) => (
                <Typography>{username}</Typography>
            ))}
        </Box>
    );
};
