import React, { FC, useEffect } from 'react';
import {
  createBrowserRouter,
  Navigate,
  RouterProvider,
  useNavigate,
} from 'react-router-dom';

import FilesPage from './components/Files';
import HomePage from './components/Home';
import DefaultLayout from './components/Layout';
import LoginPage from './components/Login';
import AdministrationPage from './components/Administration';
import { Role } from './services/auth/auth';

type ProtectedRouteProps = {
  rolesAllowed: Role[];
  children?: React.ReactNode;
};

export const LogoutPage = () => {
  const navigate = useNavigate();
  useEffect(() => {
    sessionStorage.clear();
    navigate('/');
  }, []);
  return null;
};

const ProtectedRoute = ({
  rolesAllowed,
  children,
}: ProtectedRouteProps): JSX.Element => {
  const role = sessionStorage.getItem('role');
  if (role) {
    if (rolesAllowed.find((allowedRole) => role === allowedRole)) {
      return <React.Fragment>{children}</React.Fragment>;
    }
  }
  return <Navigate to="/" replace={true} />;
};

const router = createBrowserRouter([
  {
    path: '/',
    element: <DefaultLayout />,
    children: [
      { index: true, element: <HomePage /> },
      {
        path: ':operationToken',
        element: <FilesPage />,
      },
      {
        path: ':operationToken/folder/:folderId',
        element: <FilesPage />,
      },
    ],
  },
  {
    path: 'admin',
    element: (
      <ProtectedRoute rolesAllowed={[Role.ADMIN, Role.CLIENT]}>
        <DefaultLayout />
      </ProtectedRoute>
    ),
    children: [
      { index: true, element: <AdministrationPage /> },
      {
        path: 'operations',
        element: (
          <ProtectedRoute rolesAllowed={[Role.ADMIN]}>
            <AdministrationPage />
          </ProtectedRoute>
        ),
      },
      {
        path: 'users',
        element: <AdministrationPage selectedKey="users" />,
      },
    ],
  },
  {
    path: 'login',
    element: <LoginPage />,
  },
  {
    path: 'logout',
    element: <LogoutPage />,
  },
]);

const App: FC = () => {
  return <RouterProvider router={router} />;
};

export default App;
