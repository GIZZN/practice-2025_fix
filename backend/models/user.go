package models

import (
	"time"
)

type User struct {
	ID               int64      `json:"id"`
	Name             string     `json:"name"`
	Email            string     `json:"email"`
	PasswordHash     string     `json:"-"`
	Avatar           string     `json:"avatar,omitempty"`
	Phone            *string    `json:"phone,omitempty"`
	BirthDate        *time.Time `json:"birth_date,omitempty"`
	Address          *string    `json:"address,omitempty"`
	City             *string    `json:"city,omitempty"`
	Country          *string    `json:"country,omitempty"`
	PostalCode       *string    `json:"postal_code,omitempty"`
	Telegram         *string    `json:"telegram,omitempty"`
	WhatsApp         *string    `json:"whatsapp,omitempty"`
	PreferredContact *string    `json:"preferred_contact,omitempty"`
	Language         *string    `json:"language,omitempty"`
	Notifications    bool       `json:"notifications"`
	CreatedAt        time.Time  `json:"created_at"`
	UpdatedAt        time.Time  `json:"updated_at"`
}

type LoginRequest struct {
	Email    string `json:"email"`
	Password string `json:"password"`
}

type RegisterRequest struct {
	Name            string `json:"name"`
	Email           string `json:"email"`
	Password        string `json:"password"`
	ConfirmPassword string `json:"confirm_password"`
}

type AuthResponse struct {
	Token string `json:"token"`
	User  *User  `json:"user"`
}

type UpdateUserRequest struct {
	Name             *string `json:"name,omitempty"`
	Phone            *string `json:"phone,omitempty"`
	BirthDate        *string `json:"birth_date,omitempty"`
	Address          *string `json:"address,omitempty"`
	City             *string `json:"city,omitempty"`
	Country          *string `json:"country,omitempty"`
	PostalCode       *string `json:"postal_code,omitempty"`
	Telegram         *string `json:"telegram,omitempty"`
	WhatsApp         *string `json:"whatsapp,omitempty"`
	PreferredContact *string `json:"preferred_contact,omitempty"`
	Language         *string `json:"language,omitempty"`
}

type UserUpdate struct {
	Name             *string    `json:"name,omitempty"`
	Phone            *string    `json:"phone,omitempty"`
	BirthDate        *time.Time `json:"birth_date,omitempty"`
	Address          *string    `json:"address,omitempty"`
	City             *string    `json:"city,omitempty"`
	Country          *string    `json:"country,omitempty"`
	PostalCode       *string    `json:"postal_code,omitempty"`
	Telegram         *string    `json:"telegram,omitempty"`
	WhatsApp         *string    `json:"whatsapp,omitempty"`
	PreferredContact *string    `json:"preferred_contact,omitempty"`
	Language         *string    `json:"language,omitempty"`
}
