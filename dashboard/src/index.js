import React from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import { HostProvider } from "./context/HostContext";

import 'mdb-react-ui-kit/dist/css/mdb.min.css';
import "@fortawesome/fontawesome-free/css/all.min.css";
import App from "./App";

createRoot(
    document.getElementById("app"))
    .render(
        <React.StrictMode>
            <BrowserRouter>
                <HostProvider>
                    <App />
                </HostProvider>
            </BrowserRouter>
        </React.StrictMode>);