import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import NavIcon from './NavIcon';

interface NavDropdownProps {
    isExpanded: boolean;
    items: Array<{ title: string, path: string, icon: any }>; // Remplacer 'any' par le type approprié pour l'icône FontAwesome
}

const NavDropdown: React.FC<NavDropdownProps> = ({ isExpanded, items }) => {
    const navigate = useNavigate();
    const location = useLocation();

    return isExpanded ? (
        <ul className='navbar-nav'>
            {items.map((item, index) => (
                <li key={index} className={`nav-item ps-3 ${location.pathname === item.path ? "active" : ""}`}>
                    <a className="nav-link text-white ps-3 pl-3" onClick={() => navigate(item.path)}>
                        <NavIcon icon={item.icon} />
                        <span className="nav-link-text ms-1">{item.title}</span>
                    </a>
                </li>
            ))}
        </ul>
    ) : null;
};

export default NavDropdown;