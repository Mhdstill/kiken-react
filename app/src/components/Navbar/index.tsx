import React, { useState, useEffect, useRef } from 'react';
import { Drawer, Layout, Menu, MenuProps, MenuTheme } from 'antd';
import { MenuMode } from 'rc-menu/lib/interface';
import { useLocation, useNavigate } from 'react-router-dom';
import type { WithTranslation } from 'react-i18next';
import { faHouse, faBars, faPaintBrush } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { useTheme } from '../../contexts/ThemeContext';
import withTranslation from '../../hoc/withTranslation';
import { useIsMobile } from '../../hooks/useIsMobile';
import './style.less';
import { useMenuContext } from '../../contexts/MenuContext';
import ToggleSwitch from '../ToggleSwitch';

const { Header } = Layout;

const Navbar: React.FC = ({ t }: WithTranslation) => {
  const navigate = useNavigate();
  const isMobile = useIsMobile();
  const navRef = useRef<HTMLDivElement>(null);
  const { isDarkMode, toggleTheme } = useTheme();
  const { isMenuOpen, setIsMenuOpen } = useMenuContext();
  const [initialThemeSet, setInitialThemeSet] = useState<boolean>(false);

  useEffect(() => {
    const storedTheme = localStorage.getItem('theme');
    if (storedTheme !== null) {
      setInitialThemeSet(true);
    }
  }, []);

  const handleIconClick = (e: React.MouseEvent<SVGSVGElement, MouseEvent>) => {
    e.stopPropagation();
    setIsMenuOpen(!isMenuOpen);
  };

  return (
    <>
      <Header>
        <nav
          ref={navRef}
          className="fs-3 navbar navbar-main d-flex align-items-center justify-content-center"
          id="navbarBlur" navbar-scroll="true"
        >
          <FontAwesomeIcon icon={faBars} className='menu-icon' style={{ position: 'absolute', left: 0, color: 'white', cursor: 'pointer' }} onClick={handleIconClick} />
          <img style={{ height: '48px', cursor: 'pointer' }} onClick={() => navigate("/admin")} src="/images/logo-disney.svg" alt="Logo de Disney" />

          {initialThemeSet && <ToggleSwitch initialValue={isDarkMode} onClick={toggleTheme} />}
        </nav>
      </Header>
    </>
  );
};

export default withTranslation(Navbar);