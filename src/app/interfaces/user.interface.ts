import { RoleEntity, PermitEntity, Role, Permit } from './auth.interface';

export interface User {
    userId: number;
    username: string;
    active: boolean;
    credential?: Credential;
    reactions?: Reaction[];
    reviews?: Review[];
}

export interface Credential {
    id: number;
    email: string;
    provider: AuthProvider;
    providerId?: string;
    profilePictureUrl?: string;
    biography?: string;
    roles: Role[];
}

export enum AuthProvider {
    LOCAL = 'LOCAL',
    GOOGLE = 'GOOGLE',
    FACEBOOK = 'FACEBOOK',
    GITHUB = 'GITHUB'
}

export interface UserProfile {
    userId: number;
    username: string;
    active: boolean;
    email: string;
    provider: AuthProvider;
    profilePictureUrl?: string;
    biography?: string;
    roles: string[];
    permissions: string[];
}

export interface UserSummary {
    userId: number;
    username: string,
    email: string,
    profilePictureUrl?: string;
    active: boolean;
    roles: string[];
}

export interface UpdateUserProfileRequest {
    username?: string;
    profilePictureUrl?: string;
    biography?: string;
}

export interface Reaction {

}

export interface Review {
    
}


