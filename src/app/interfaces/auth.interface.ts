export interface AuthRequest {
    emailOrUsername: string;
    password: string;
}

export interface AuthResponse {
    token: string;
    refreshToken: string;
    id: number;
    username: string;
    email: string;
}

export interface SignupRequest {
    username: string;
    email: string;
    password: string;
}

export interface RefreshTokenRequest {
    refreshToken: string;
}

export enum Role {
    ROLE_USER = 'ROLE_USER',
    ROLE_ADMIN = 'ROLE_ADMIN',
    ROLE_MODERATOR = 'ROLE_MODERATOR',
}

export enum Permit {
    READ = 'READ',
    WRITE = 'WRITE',
    DELETE = 'DELETE',
    UPDATE = 'UPDATE',
    CREATE = 'CREATE',
    ADMIN = 'ADMIN',

}

export interface PermitEntity {
    id: number;
    permit: Permit;
}

export interface RoleEntity {
    id: number;
    role: Role;
    permits: PermitEntity[];
}