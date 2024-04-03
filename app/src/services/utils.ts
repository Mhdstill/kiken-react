import { notification } from 'antd';
import axios, { CreateAxiosDefaults } from 'axios';
import jwtDecode, { JwtPayload } from 'jwt-decode';
import { TFunction } from 'react-i18next';

import { LogoutPage } from '../App';
import Address from '../types/Address';
import { faClipboardList, faFile, faFolder, faSign, faTrash, faTriangleExclamation, faUser } from '@fortawesome/free-solid-svg-icons';

export const buildAxiosInstance = (config: CreateAxiosDefaults) => {
  const axiosClient = axios.create(config);

  /*
  axiosClient.interceptors.request.use((config) => {
    const token = sessionStorage.getItem('token');

    if (token) {

      const refreshToken = sessionStorage.getItem('refresh_token');
      if (!checkTokenValidity && refreshToken) {
        refreshAuthToken(refreshToken);
      }

      config.headers = {
        ...config.headers,
        Authorization: `Bearer ${token}`,
      };
    }
    return config;
  }, Promise.reject);
  */

  axiosClient.interceptors.request.use(async (config: any) => {
    try {
      const token = sessionStorage.getItem('token');
      const refreshToken = sessionStorage.getItem('refresh_token');

      if (token) {
        const isValid = await checkTokenValidity(token);
        if (!isValid && refreshToken) {
          const newToken = await refreshAuthToken(refreshToken);
          if (newToken) {
            config.headers.Authorization = `Bearer ${newToken}`;
          }
        } else {
          config.headers.Authorization = `Bearer ${token}`;
        }
      }

      return config;
    } catch (error) {
      // Gérez l'erreur si nécessaire
      return Promise.reject(error);
    }
  });


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
    timeStyle: 'short',
  }).format(new Date(value));
};

export const showSpecificErrorNotification = (description: any, t: TFunction) => {
  notification.error({
    message: t('notification.error.title'),
    description: description.replace("Error:", ""),
    placement: 'topLeft'
  });
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
    placement: 'topLeft'
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
    placement: 'topLeft'
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

export const checkTokenValidity = async (token: string) => {
  try {
    const response = await fetch(`${API_URL}/token/check`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`
      }
    });
    if (!response.ok) {
      throw new Error("Token is expired or invalid");
    }
    return true;
  } catch (error) {
    console.error("Token is expired or invalid");
    return false;
  }
};

export const refreshAuthToken = async (refreshToken: string) => {
  try {
    const response = await fetch(`${API_URL}/api/token/refresh`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        refresh_token: refreshToken,
      }),
    });

    if (!response.ok) {
      throw new Error("Response not OK");
    }

    const data = await response.json();
    localStorage.setItem("token", data.token);
    localStorage.setItem("refresh_token", data.refresh_token);
    sessionStorage.setItem("token", data.token);
    sessionStorage.setItem("refresh_token", data.refresh_token);
    return data.token;
  } catch (error) {
    console.error(error);
    return false;
  }
};


//Geolocation functions
interface GeolocationCoordinates {
  latitude: number;
  longitude: number;
}

export async function getCoordinatesFromAddress(address: Address) {
  const addressEncoded = encodeURIComponent(`${address.street}, ${address.zip} ${address.city}`);
  const url = `https://nominatim.openstreetmap.org/search?format=json&q=${addressEncoded}`;

  try {
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`Erreur HTTP ! Statut : ${response.status}`);
    }
    const data = await response.json();

    if (data.length === 0) {
      throw new Error('Adresse non trouvée.');
    }

    const coordinates = {
      latitude: parseFloat(data[0].lat),
      longitude: parseFloat(data[0].lon)
    };
    return coordinates;
  } catch (error) {
    throw new Error(error);
  }
}

export const getUserLocation = (): Promise<GeolocationCoordinates> => {
  return new Promise((resolve, reject) => {
    if (!navigator.geolocation) {
      throw new Error('La géolocalisation n\'est pas prise en charge par votre navigateur.');
    } else {
      navigator.geolocation.getCurrentPosition(
        position => {
          resolve(position.coords);
        },
        error => {
          reject('Vous devez accepter de donner votre position pour pouvoir valider ce formulaire.');
        }
      );
    }
  });
};
export const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number) => {
  const R = 6371e3; // Rayon de la Terre en mètres
  const φ1 = lat1 * Math.PI / 180;
  const φ2 = lat2 * Math.PI / 180;
  const Δφ = (lat2 - lat1) * Math.PI / 180;
  const Δλ = (lon2 - lon1) * Math.PI / 180;

  const a = Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
    Math.cos(φ1) * Math.cos(φ2) *
    Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return R * c; // Distance en mètres
};

export const checkUserProximity = async (operationLocation: GeolocationCoordinates, distance: number = 0) => {
  try {
    const userLocation = await getUserLocation();
    const differenceMeters = calculateDistance(
      userLocation.latitude,
      userLocation.longitude,
      operationLocation.latitude,
      operationLocation.longitude
    );

    return differenceMeters <= distance;
  } catch (error) {
    console.error("Erreur lors de la vérification de la proximité : ", error);
    throw error;
  }
};

export type IconKey = 'fa-folder' | 'fa-file' | 'fa-user';
export const getIcon = (iconName: IconKey) => {
  const icons = {
    'fa-folder': faFolder,
    'fa-file': faFile,
    'fa-user': faUser,
    'fa-form': faClipboardList,
    'fa-warning': faTriangleExclamation,
    'fa-trash': faTrash,
    'fa-sign': faSign
  };
  return icons[iconName] || faFolder;
};

export const getExtension = (path: string) => {
  const split = path.split('.');
  return split[split.length - 1];
};

export const API_URL = 'https://api.qr4you.fr';
export const QR4YOU_ID = '7e5cdd75-d1cc-4aea-94be-a7bb9e2a1896';

export const triggerDownload = (filename: string, data: string): void => {
  console.log("download")
  const a = document.createElement('a');
  a.href = data;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  setTimeout(() => {
    window.URL.revokeObjectURL(data); // Delay revoking the ObjectURL for Firefox
  }, 100);
};