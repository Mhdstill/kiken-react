import Address from "./Address";

type Operation = {
  '@id': string;
  id: string;
  name: string;
  useClockInGeolocation: boolean;
  isDarkMode: boolean;
  createdAt: string;
  updatedAt: string;
  address?: Address | undefined;
  distance?: number | undefined;
};

export default Operation;
