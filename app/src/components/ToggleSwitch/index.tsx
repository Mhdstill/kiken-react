import React, { useState } from 'react';
import { Switch } from 'antd';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSun, faMoon } from '@fortawesome/free-solid-svg-icons';

interface ToggleSwitchProps {
  initialValue: boolean; // Ajouter une prop initialValue pour récupérer l'état initial
  onClick: (checked: boolean) => void; // Fonction de rappel onClick
}

const ToggleSwitch: React.FC<ToggleSwitchProps> = ({ initialValue, onClick }) => {
  const [isDarkMode, setIsDarkMode] = useState(initialValue); // Utiliser l'état initial

  const toggleTheme = (checked: boolean) => {
    setIsDarkMode(checked);
    onClick(checked); // Appeler la fonction de rappel onClick
  };

  return (
    <div className="toggle-switch">
      <Switch
        checked={isDarkMode}
        onChange={toggleTheme}
        checkedChildren={<FontAwesomeIcon icon={faMoon} />}
        unCheckedChildren={<FontAwesomeIcon icon={faSun} />}
      />
    </div>
  );
};

export default ToggleSwitch;