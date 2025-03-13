import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faHome, 
  faQrcode, 
  faSignOutAlt
} from '@fortawesome/free-solid-svg-icons';

const BottomNavBar: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  
  const isActive = (path: string) => {
    return location.pathname === path || location.pathname.startsWith(path);
  };

  // Ne pas afficher la barre si ce n'est pas une PWA ou si on est sur la page de login
  if (document.body.classList.contains('pwa-mode') === false || location.pathname === '/login') {
    return null;
  }

  const handleLogout = () => {
    navigate('/logout');
  };

  return (
    <div className="bottom-nav">
      <div 
        className={`bottom-nav-item ${isActive('/') && !location.pathname.startsWith('/admin') ? 'active' : ''}`}
        onClick={() => navigate('/')}
      >
        <FontAwesomeIcon icon={faHome} />
        <span>Accueil</span>
      </div>
      
      <div 
        className="bottom-nav-item bottom-nav-scan"
        onClick={() => navigate('/scan')}
      >
        <div className="scan-button-wrapper">
          <div className="scan-button">
            <FontAwesomeIcon icon={faQrcode} />
          </div>
          <span>Scanner</span>
        </div>
      </div>
      
      <div 
        className="bottom-nav-item"
        onClick={handleLogout}
      >
        <FontAwesomeIcon icon={faSignOutAlt} />
        <span>Déconnexion</span>
      </div>
    </div>
  );
};

export default BottomNavBar; 