import { Route, Routes } from "react-router-dom";
import "./App.css";
import Home from "./pages/Home";
import Event from "./pages/Event";
import { Typography } from "@mui/material";
import { EVENT, HOME, WILDCARD } from "./RoutePaths";

function App() {
    return (
        <>
            {/* <nav>
                <ul>
                    <li>
                        <Link to="/">Home</Link>
                    </li>
                    <li>
                        <Link to="/:id">Meet</Link>
                    </li>
                </ul>
            </nav> */}
            <Routes>
                <Route path={HOME} element={<Home />} />
                <Route path={EVENT} element={<Event />} />
                <Route path="/" element={<Home />} />
                <Route path="/" element={<Home />} />
                <Route path={WILDCARD} element={<Typography>not found</Typography>} />
            </Routes>
        </>
    );
}

export default App;
