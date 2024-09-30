import { Route, Routes } from "react-router-dom";
import "./App.css";
import Home from "./pages/Home";
import Meeting from "./pages/Meeting";
import { Typography } from "@mui/material";

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
                <Route path="/" element={<Home />} />
                <Route path="/event/:id" element={<Meeting />} />
                <Route path="/" element={<Home />} />
                <Route path="/" element={<Home />} />
                <Route path="*" element={<Typography>not found</Typography>} />
            </Routes>
        </>
    );
}

export default App;
