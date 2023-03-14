import type { Role } from '../services/auth/auth';

type User = {
  '@id': string;
  id: string;
  email: string;
  operation: string;
  roles: Role[];
  createdAt: string;
  updatedAt: string;
};

export default User;
