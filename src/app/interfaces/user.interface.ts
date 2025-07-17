import { RoleEntity } from './auth.interface';
import { Song, Album } from './music.interface';

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
  roles: RoleEntity[];
  refreshToken?: string;
}

export enum AuthProvider {
  LOCAL = 'LOCAL',
  GOOGLE = 'GOOGLE',
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
  username: string;
  email: string;
  profilePictureUrl?: string;
  active: boolean;
  roles: string[];
}

export interface Reaction {
  reactionId: number;
  userId: number;
  username: string;
  reactionType: ReactionType;
  reactedType: ReactedType;
  reactedId: number;
  createdAt?: string;
}

export interface Comment {
  commentId: number;
  reviewId: number;
  userId: number;
  username: string;
  text: string;
  createdAt: string;
  commentType: CommentType;
  active: boolean;
}

export interface Review {
  reviewId: number;
  rating: number;
  description?: string;
  date: string;
  active: boolean;
  userId: number;
  username?: string;
}

export interface SongReview extends Review {
  songId: number;
  song?: Song;
}

export interface AlbumReview extends Review {
  albumId: number;
  album?: Album;
}

export type MusicReview = SongReview | AlbumReview;

export enum ReactionType {
  LIKE = 'LIKE',
  LOVE = 'LOVE',
  WOW = 'WOW',
  DISLIKE = 'DISLIKE',
}

export enum ReactedType {
  COMMENT = 'COMMENT',
  REVIEW = 'REVIEW'
}

export enum CommentType {
  SONG = 'SONG',
  ALBUM = 'ALBUM'
}

export interface UpdateUserProfileRequest {
  username?: string;
  profilePictureUrl?: string;
  biography?: string;
}

export interface UserStats {
  totalReviews: number;
  songReviews: number;
  albumReviews: number;
  totalComments: number;
  totalReactions: number;
  avgRating: number;
  joinDate: string;
}
