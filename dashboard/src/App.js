import { Fragment, useContext } from "react";
import { Routes, Route } from "react-router-dom";

import { HostContext } from "./context/HostContext";
import Login from "./components/login/login";
import Navigation from "./components/navigation/navigation";
import CVE from "./components/cve/cve";
import Toggler from "./components/modeToggler/modeToggler";

// New SIEM Components
import Home from "./components/home/home";
import Computers from "./components/computers/computers";
import Logs from "./components/logs/logs";
import Scripts from "./components/scripts/scripts";
import About from "./components/about/about";
import SearchPage from "./components/search/SearchPage";

import Admin from "./components/admin/admin";

const App = () => {
    const { isLoggedIn } = useContext(HostContext);

    if (!isLoggedIn) {
        return <Login />;
    }

    return (
        <Fragment>
            <Navigation />
            <Toggler />
            <Routes>
                <Route path='/' element={<Home />} />
                <Route path='/computers' element={<Computers />} />
                <Route path='/logs' element={<Logs />} />
                <Route path='/search' element={<SearchPage />} />
                <Route path='/CVE' element={<CVE />} />
                <Route path='/scripts' element={<Scripts />} />
                <Route path='/about' element={<About />} />
                <Route path='/admin' element={<Admin />} />
            </Routes>
        </Fragment>
    );
};

export default App;