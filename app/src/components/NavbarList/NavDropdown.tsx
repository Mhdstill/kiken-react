import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import NavIcon from './NavIcon';
import { Link } from 'react-router-dom'; // Importez Link

interface NavDropdownProps {
    isExpanded: boolean;
    items: Array<{ title: string, path: string, icon: any }>;
}

const NavDropdown: React.FC<NavDropdownProps> = ({ isExpanded, items }) => {
    const navigate = useNavigate();
    const location = useLocation();

    const handleClick = (path: string, event: React.MouseEvent) => {
        //event.stopPropagation(); 
        navigate(path);
    };

    return isExpanded ? (
        <ul className='navbar-nav'>
            {items.map((item, index) => (
                <li key={index} className={`nav-item ps-3 ${location.pathname === item.path ? "active" : ""}`}>
                    <Link to={item.path} className="nav-link text-white ps-3 pl-3" onClick={(e) => handleClick(item.path, e)}>
                        <NavIcon icon={item.icon} />
                        <span className="nav-link-text ms-1">{item.title}</span>
                    </Link>
                </li>
            ))}
        </ul>
    ) : null;
};

export default NavDropdown;