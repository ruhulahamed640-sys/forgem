import { SetMetadata } from '@nestjs/common';
import { ROLES_KEY, IS_PUBLIC_KEY } from '../constants';

export const Roles = (...roles: string[]) => SetMetadata(ROLES_KEY, roles);
export const Public = () => SetMetadata(IS_PUBLIC_KEY, true);
