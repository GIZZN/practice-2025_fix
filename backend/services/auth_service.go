package services

import (
	"delivery-service/models"
	"delivery-service/repository"
	"errors"
	"fmt"
	"log"
	"os"
	"regexp"
	"strings"
	"time"

	"github.com/golang-jwt/jwt/v5"
	"golang.org/x/crypto/bcrypt"
)

var (
	ErrInvalidCredentials = errors.New("неверный email или пароль")
	ErrPasswordMismatch   = errors.New("пароли не совпадают")
	ErrUserExists         = errors.New("пользователь с таким email уже существует")
	ErrInvalidToken       = errors.New("недействительный токен")
	ErrMissingJWTSecret   = errors.New("отсутствует JWT_SECRET в переменных окружения")
	ErrInvalidEmail       = errors.New("некорректный email")
	ErrInvalidPassword    = errors.New("пароль должен содержать минимум 8 символов")
	ErrInvalidName        = errors.New("имя должно содержать минимум 2 символа")
)

const (
	bcryptCost     = 12
	tokenExpiresIn = time.Hour * 24 * 7
)

var emailRegex = regexp.MustCompile(`^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$`)

type AuthService struct {
	userRepo *repository.UserRepository
}

func NewAuthService(userRepo *repository.UserRepository) *AuthService {
	if userRepo == nil {
		panic("user repository is required")
	}
	return &AuthService{userRepo: userRepo}
}

func (s *AuthService) Register(req *models.RegisterRequest) (*models.AuthResponse, error) {
	log.Printf("Начало регистрации пользователя: %s", req.Email)

	if err := s.validateRegistration(req); err != nil {
		log.Printf("Ошибка валидации при регистрации: %v", err)
		return nil, err
	}

	// Нормализация данных
	req.Email = strings.TrimSpace(strings.ToLower(req.Email))
	req.Name = strings.TrimSpace(req.Name)

	existingUser, err := s.userRepo.GetUserByEmail(req.Email)
	if err != nil && !errors.Is(err, repository.ErrUserNotFound) {
		log.Printf("Ошибка при проверке существующего пользователя: %v", err)
		return nil, fmt.Errorf("ошибка при проверке существующего пользователя: %w", err)
	}
	if existingUser != nil {
		log.Printf("Попытка регистрации с существующим email: %s", req.Email)
		return nil, ErrUserExists
	}

	hashedPassword, err := bcrypt.GenerateFromPassword([]byte(req.Password), bcryptCost)
	if err != nil {
		log.Printf("Ошибка при хешировании пароля: %v", err)
		return nil, fmt.Errorf("ошибка при хешировании пароля: %w", err)
	}

	now := time.Now()
	user := &models.User{
		Name:          req.Name,
		Email:         req.Email,
		PasswordHash:  string(hashedPassword),
		Notifications: true,
		CreatedAt:     now,
		UpdatedAt:     now,
	}

	if err := s.userRepo.CreateUser(user); err != nil {
		log.Printf("Ошибка при создании пользователя: %v", err)
		return nil, fmt.Errorf("ошибка при создании пользователя: %w", err)
	}

	token, err := s.generateToken(user)
	if err != nil {
		log.Printf("Ошибка при генерации токена: %v", err)
		return nil, fmt.Errorf("ошибка при генерации токена: %w", err)
	}

	log.Printf("Пользователь успешно зарегистрирован: %s", req.Email)

	return &models.AuthResponse{
		Token: token,
		User:  user,
	}, nil
}

func (s *AuthService) Login(req *models.LoginRequest) (*models.AuthResponse, error) {
	if err := s.validateLogin(req); err != nil {
		return nil, err
	}

	user, err := s.userRepo.GetUserByEmail(req.Email)
	if err != nil {
		if errors.Is(err, repository.ErrUserNotFound) {
			return nil, ErrInvalidCredentials
		}
		return nil, fmt.Errorf("ошибка при поиске пользователя: %w", err)
	}

	if err := bcrypt.CompareHashAndPassword([]byte(user.PasswordHash), []byte(req.Password)); err != nil {
		return nil, ErrInvalidCredentials
	}

	token, err := s.generateToken(user)
	if err != nil {
		return nil, fmt.Errorf("ошибка при генерации токена: %w", err)
	}

	return &models.AuthResponse{
		Token: token,
		User:  user,
	}, nil
}

func (s *AuthService) ValidateToken(tokenString string) (*models.User, error) {
	if tokenString == "" {
		return nil, ErrInvalidToken
	}

	token, err := jwt.Parse(tokenString, func(token *jwt.Token) (interface{}, error) {
		if _, ok := token.Method.(*jwt.SigningMethodHMAC); !ok {
			return nil, fmt.Errorf("неожиданный метод подписи: %v", token.Header["alg"])
		}
		secret := os.Getenv("JWT_SECRET")
		if secret == "" {
			return nil, ErrMissingJWTSecret
		}
		return []byte(secret), nil
	})

	if err != nil {
		return nil, fmt.Errorf("ошибка при проверке токена: %w", err)
	}

	if claims, ok := token.Claims.(jwt.MapClaims); ok && token.Valid {
		if !s.validateTokenClaims(claims) {
			return nil, ErrInvalidToken
		}

		userID := int64(claims["user_id"].(float64))
		user, err := s.userRepo.GetUserByID(userID)
		if err != nil {
			return nil, fmt.Errorf("ошибка при получении пользователя: %w", err)
		}

		return user, nil
	}

	return nil, ErrInvalidToken
}

func (s *AuthService) UpdateUser(userID int64, req *models.UpdateUserRequest) error {
	if err := s.validateUpdateRequest(req); err != nil {
		return err
	}

	user, err := s.userRepo.UpdateUser(userID, req)
	if err != nil {
		return fmt.Errorf("ошибка при обновлении пользователя: %w", err)
	}

	if user == nil {
		return repository.ErrUserNotFound
	}

	return nil
}

func (s *AuthService) GetUserByID(userID int64) (*models.User, error) {
	if userID <= 0 {
		return nil, repository.ErrInvalidInput
	}

	user, err := s.userRepo.GetUserByID(userID)
	if err != nil {
		return nil, fmt.Errorf("ошибка при получении пользователя: %w", err)
	}

	return user, nil
}

func (s *AuthService) validateRegistration(req *models.RegisterRequest) error {
	if req == nil {
		return repository.ErrInvalidInput
	}

	// Проверка имени
	if len(strings.TrimSpace(req.Name)) < 2 {
		return ErrInvalidName
	}

	// Проверка email
	if !emailRegex.MatchString(req.Email) {
		return ErrInvalidEmail
	}

	// Проверка пароля
	if len(req.Password) < 8 {
		return ErrInvalidPassword
	}

	if req.Password != req.ConfirmPassword {
		return ErrPasswordMismatch
	}

	return nil
}

func (s *AuthService) validateLogin(req *models.LoginRequest) error {
	if req == nil || req.Email == "" || req.Password == "" {
		return repository.ErrInvalidInput
	}
	return nil
}

func (s *AuthService) validateUpdateRequest(req *models.UpdateUserRequest) error {
	if req == nil {
		return repository.ErrInvalidInput
	}
	// добавить проверки здесь
	return nil
}

func (s *AuthService) validateTokenClaims(claims jwt.MapClaims) bool {
	exp, ok := claims["exp"].(float64)
	if !ok {
		return false
	}
	return time.Now().Unix() < int64(exp)
}

func (s *AuthService) generateToken(user *models.User) (string, error) {
	secret := os.Getenv("JWT_SECRET")
	if secret == "" {
		return "", ErrMissingJWTSecret
	}

	token := jwt.NewWithClaims(jwt.SigningMethodHS256, jwt.MapClaims{
		"user_id": user.ID,
		"email":   user.Email,
		"exp":     time.Now().Add(tokenExpiresIn).Unix(),
	})

	return token.SignedString([]byte(secret))
}
