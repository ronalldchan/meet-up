import { Alert, Snackbar } from "@mui/material";

interface NotificationMessageProps {
    open: boolean;
    message: string;
    severity: "error" | "warning" | "info" | "success";
    onClose: () => void;
}

const NotificationMessage: React.FC<NotificationMessageProps> = ({ open, message, severity, onClose }) => {
    return (
        <Snackbar
            open={open}
            autoHideDuration={5000}
            onClose={onClose}
            anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
        >
            <Alert variant="filled" onClose={onClose} severity={severity} sx={{ width: "100%" }}>
                {message}
            </Alert>
        </Snackbar>
    );
};

export default NotificationMessage;
