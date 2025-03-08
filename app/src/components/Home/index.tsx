import { FC, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const HomePage: FC = () => {
  const navigate = useNavigate();

  useEffect(() => {
    if (localStorage.getItem('token')) {
      const operationToken = localStorage.getItem('operation_token');
      if (operationToken) {
        navigate(`/${operationToken}`);
      }
    } else {
      navigate('/login');
    }
  }, []);

  return null;
};

export default HomePage;
