import { useParams } from "react-router-dom";

function Meeting() {
    const { id } = useParams();
    return <>Meeting {id}</>;
}

export default Meeting;
