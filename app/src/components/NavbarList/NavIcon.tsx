import React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';

interface NavIconProps {
    icon: any; // Remplacer 'any' par le type approprié pour l'icône FontAwesome
}

const NavIcon: React.FC<NavIconProps> = ({ icon }) => {
    return (
        <div className="text-white text-center me-2 d-flex align-items-center justify-content-center">
            <FontAwesomeIcon icon={icon} style={{ fontSize: '1.2rem' }} className="fas fa-user-circle ps-2 pe-2 text-center" />
        </div>
    );
};

export default NavIcon;