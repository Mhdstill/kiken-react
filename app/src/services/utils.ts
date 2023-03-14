import { notification } from 'antd';
import axios, { CreateAxiosDefaults } from 'axios';
import jwtDecode, { JwtPayload } from 'jwt-decode';
import { TFunction } from 'react-i18next';

import { LogoutPage } from '../App';

export const buildAxiosInstance = (config: CreateAxiosDefaults) => {
  const axiosClient = axios.create(config);

  axiosClient.interceptors.request.use((config) => {
    const token = sessionStorage.getItem('token');
    if (token) {
      config.headers = {
        ...config.headers,
        Authorization: `Bearer ${token}`,
      };
    }
    return config;
  }, Promise.reject);

  axiosClient.interceptors.response.use(
    (response) => response,
    (error) => {
      const token = sessionStorage.getItem('token');
      const refreshToken = sessionStorage.getItem('refresh_token');
      if (token && refreshToken) {
        const decoded = jwtDecode<JwtPayload>(token);
        const currTime = new Date().getTime() / 1000;
        if (decoded.exp && decoded.exp <= currTime) {
          return LogoutPage;
        }
      }
      return Promise.reject(error);
    }
  );

  return axiosClient;
};

export const getFormattedDate = (value: string) => {
  return new Intl.DateTimeFormat('fr', {
    dateStyle: 'short',
    timeStyle: 'medium',
  }).format(new Date(value));
};

export const showErrorNotification = (error: Error | any, t: TFunction) => {
  let description;
  if (error.message === 'Unauthorized' || error.message === 'Forbidden') {
    description = t('notification.error.unauthorized');
  } else {
    description = t('notification.error.unknown');
  }
  notification.error({
    message: t('notification.error.title'),
    description: description,
  });
};

export const showSuccesNotification = (
  message: string,
  t: TFunction,
  options?: any
) => {
  notification.success({
    message: t('notification.success.title'),
    description: t(`notification.success.${message}`, options),
  });
};

export const getUrlWithQueryParams = (baseUrl: string, queryParams = {}) => {
  const url = new URL(baseUrl);
  if (Object.keys(queryParams).length > 0) {
    Object.entries(queryParams).forEach(([key, val]) => {
      url.searchParams.append(key, val ? val.toString() : '');
    });
  }
  return url;
};
