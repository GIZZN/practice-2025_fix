package services

import (
	"delivery-service/models"
	"delivery-service/repository"
	"errors"
	"fmt"
	"time"
)

var (
	ErrUserNotFound = errors.New("пользователь не найден")
	ErrInvalidInput = errors.New("некорректные входные данные")
)

type UserService struct {
	userRepo *repository.UserRepository
}

func NewUserService(userRepo *repository.UserRepository) *UserService {
	if userRepo == nil {
		panic("user repository is required")
	}
	return &UserService{userRepo: userRepo}
}

func (s *UserService) GetUserByID(id int64) (*models.User, error) {
	if id <= 0 {
		return nil, ErrInvalidInput
	}

	user, err := s.userRepo.GetUserByID(id)
	if err != nil {
		if errors.Is(err, repository.ErrUserNotFound) {
			return nil, ErrUserNotFound
		}
		return nil, fmt.Errorf("ошибка при получении пользователя: %w", err)
	}

	return user, nil
}

func (s *UserService) UpdateUser(id int64, update *models.UpdateUserRequest) (*models.User, error) {
	if id <= 0 || update == nil {
		return nil, ErrInvalidInput
	}

	if err := s.validateUpdateRequest(update); err != nil {
		return nil, err
	}

	user, err := s.userRepo.UpdateUser(id, update)
	if err != nil {
		if errors.Is(err, repository.ErrUserNotFound) {
			return nil, ErrUserNotFound
		}
		return nil, fmt.Errorf("ошибка при обновлении пользователя: %w", err)
	}

	return user, nil
}

func (s *UserService) validateUpdateRequest(req *models.UpdateUserRequest) error {
	if req == nil {
		return ErrInvalidInput
	}

	if req.BirthDate != nil {
		_, err := time.Parse("2006-01-02", *req.BirthDate)
		if err != nil {
			return fmt.Errorf("неверный формат даты рождения (требуется YYYY-MM-DD): %w", err)
		}
	}

	if req.Phone != nil && *req.Phone != "" {
		if len(*req.Phone) < 10 || len(*req.Phone) > 20 {
			return errors.New("неверный формат номера телефона")
		}
	}

	return nil
}
