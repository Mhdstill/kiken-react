import React, { createContext, useState, useEffect, ReactNode, useContext } from 'react';

// Créer une interface pour le contexte
interface MenuContextType {
  isMenuOpen: boolean;
  setIsMenuOpen: (open: boolean) => void;
}

// Créer le contexte avec des valeurs par défaut
const MenuContext = createContext<MenuContextType>({
  isMenuOpen: false,
  setIsMenuOpen: () => {}
});

// Créer un hook pour utiliser le contexte
export const useMenuContext = () => useContext(MenuContext);

// Créer un type pour les props du provider
interface MenuProviderProps {
  children: ReactNode;
}

// Créer le provider du contexte
export const MenuProvider: React.FC<MenuProviderProps> = ({ children }) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false); // Par défaut ouvert

  return (
    <MenuContext.Provider value={{ isMenuOpen, setIsMenuOpen }}>
      <SidebarManager>{children}</SidebarManager>
    </MenuContext.Provider>
  );
};

// Créer un composant pour gérer la sidebar
const SidebarManager: React.FC<MenuProviderProps> = ({ children }) => {
  const { isMenuOpen, setIsMenuOpen } = useMenuContext();

  useEffect(() => {
    if (isMenuOpen) {
      document.body.classList.add('g-sidenav-pinned');
    } else {
      document.body.classList.remove('g-sidenav-pinned');
    }
  }, [isMenuOpen]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const sidenavElement = document.querySelector('.sidenav');
      if (sidenavElement && !sidenavElement.contains(event.target as Node)) {
        setIsMenuOpen(false);
      }
    };

    if (isMenuOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isMenuOpen, setIsMenuOpen]);

  return <>{children}</>;
};