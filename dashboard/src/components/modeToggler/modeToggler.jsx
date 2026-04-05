import { useContext, useEffect } from "react";
import { HostContext } from "../../context/HostContext";
import { 
    MDBDropdownItem, 
    MDBSwitch ,
    MDBDropdownMenu,
    MDBDropdownToggle,
    MDBDropdown
} from 'mdb-react-ui-kit';

const Toggler = () => {
    const { theme, setTheme } = useContext(HostContext);

    const toggleTheme = (theme) => {
        switch(theme) {
            case 'light-mode':
                setTheme('light-mode');
                break;
            case 'dark-mode':      
                setTheme('dark-mode');
                break;
            default:
                setTheme('dark-mode')
        }
    };

    useEffect(() => {
        document.body.className = theme;
    }, [theme])

    const getToggleColor = () => {
        return theme === 'dark-mode' ? 'light' : 'dark';
    }

    return(
        <div className="mx-3" style={{ paddingTop: '50px' }}>
            <MDBDropdown>
                <MDBDropdownToggle color={getToggleColor()} className="shadow-5-strong border" >Mode</MDBDropdownToggle>
                <MDBDropdownMenu dark className="mt-2 text-center shadow-5-strong">
                    <MDBDropdownItem onClick={()=> toggleTheme('light-mode')} link >Light</MDBDropdownItem>
                    <MDBDropdownItem onClick={()=> toggleTheme('dark-mode')} link >Dark</MDBDropdownItem>
                </MDBDropdownMenu>
            </MDBDropdown>
        </div>
    );
};

export default Toggler;
