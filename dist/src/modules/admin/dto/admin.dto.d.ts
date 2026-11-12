import { AccountStatus } from '@prisma/client';
export declare class UpdateUserStatusDto {
    status: AccountStatus;
    reason?: string;
}
export declare class UpdateSystemSettingDto {
    key: string;
    value: Record<string, unknown>;
    description?: string;
}
