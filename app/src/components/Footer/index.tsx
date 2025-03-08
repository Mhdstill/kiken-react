import React from 'react';
import { Layout } from 'antd';
const { Footer: BaseFooter } = Layout;

const Footer = () => {
  return (
    <div style={{ 
        textAlign: 'center', 
        padding: '10px',
        fontSize: '14px',
        color: '#666'
    }}>
        © Développé par <a 
            href="https://dev4you.fr" 
            target="_blank" 
            rel="noopener noreferrer"
        >DEV4YOU</a>
    </div>
  );
};

export default Footer;
