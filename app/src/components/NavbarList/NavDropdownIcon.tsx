import React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faChevronDown, faChevronRight } from '@fortawesome/free-solid-svg-icons';

interface NavDropdownIconProps {
    isExpanded: boolean;
}

const NavDropdownIcon: React.FC<NavDropdownIconProps> = ({ isExpanded }) => {
    const icon = isExpanded ? faChevronDown : faChevronRight;

    return (
        <div className='w-100 text-right'>
            <FontAwesomeIcon
                icon={icon}
                style={{ fontSize: '1.2rem', float: 'right' }}
                className="fas fa-user-circle ps-2 pe-2 text-center"
            />
        </div>
    );
};

export default NavDropdownIcon;