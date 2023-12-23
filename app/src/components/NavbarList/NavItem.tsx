import React, { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import NavIcon from './NavIcon';
import NavDropdown from './NavDropdown';
import NavDropdownIcon from './NavDropdownIcon';
import { CSSTransition } from 'react-transition-group';
import { useMenuContext } from '../../contexts/MenuContext';

interface NavItemProps {
    title: string;
    icon: any; // Remplacer 'any' par le type approprié pour l'icône FontAwesome
    dropdownItems?: Array<{ title: string, path: string, icon: any }>;
    path: string;
}

const NavItem: React.FC<NavItemProps> = ({ title, icon, dropdownItems, path }) => {
    const location = useLocation();
    const navigate = useNavigate();
    const [isHovered, setIsHovered] = useState(location.pathname.includes(path));
    const { isMenuOpen, setIsMenuOpen } = useMenuContext();

    const handleMouseOver = () => {
        setIsHovered(true);
    };

    const handleMouseLeave = () => {
        setIsHovered(false);
    };

    const handleClick = (event: React.MouseEvent) => {
        if (!dropdownItems || dropdownItems.length <= 0) {
       //     event.stopPropagation();
            navigate(path);
        }
    };

    return (
        <li
            onMouseOver={handleMouseOver}
            onMouseLeave={handleMouseLeave}
            onClick={handleClick}
            className={`${!dropdownItems || dropdownItems.length === 0 ? "nav-item" : ""} ${location.pathname === path ? "active" : ""}`}
            style={{ cursor: "pointer" }}
        >
            <div className="nav-link text-white" style={{ fontFamily: "Saira-Medium" }}>
                <NavIcon icon={icon} />
                <span className="nav-link-text ms-1">{title}</span>
                {dropdownItems && dropdownItems.length > 0 && (
                    <NavDropdownIcon
                        isExpanded={isHovered}
                    />
                )}
            </div>
            {dropdownItems && dropdownItems.length > 0 && (
                <CSSTransition in={isHovered} timeout={600} classNames="dropdown-animation" unmountOnExit>
                    <NavDropdown
                        isExpanded={isHovered}
                        items={dropdownItems}
                    />
                </CSSTransition>
            )}
        </li>
    );
};

export default NavItem;