import { FC, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const HomePage: FC = () => {
  const navigate = useNavigate();

  useEffect(() => {
    if (sessionStorage.getItem('token')) {
      const operationToken = sessionStorage.getItem('operation_token');
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
