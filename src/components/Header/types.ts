export interface User {
  id: number;
  name: string;
  email: string;
  avatar?: string;
  phone: string | null;
  birthDate: string | null;
  address: string | null;
  city: string | null;
  country: string | null;
  postalCode: string | null;
  telegram: string | null;
  whatsapp: string | null;
  preferredContact: string | null;
  language: string | null;
  notifications: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface NavLink {
  href: string;
  label: string;
}

export interface HeaderProps {
  className?: string;
}

export interface NotificationBadgeProps {
  count: number;
}

export interface AuthResponse {
  token: string;
  user: User;
}

export interface ApiError {
  message: string;
  code?: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest extends LoginRequest {
  name: string;
  confirmPassword: string;
}

export interface UpdateUserRequest {
  name?: string;
  phone?: string | null;
  birthDate?: string | null;
  address?: string | null;
  city?: string | null;
  country?: string | null;
  postalCode?: string | null;
  telegram?: string | null;
  whatsapp?: string | null;
  preferredContact?: string | null;
  language?: string | null;
}