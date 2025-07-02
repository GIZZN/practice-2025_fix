package handlers

import (
	"delivery-service/models"
	"delivery-service/services"
	"encoding/json"
	"errors"
	"net/http"
)

type ProfileHandler struct {
	userService *services.UserService
}

func NewProfileHandler(userService *services.UserService) *ProfileHandler {
	if userService == nil {
		panic("user service is required")
	}
	return &ProfileHandler{userService: userService}
}

func (h *ProfileHandler) GetProfile(w http.ResponseWriter, r *http.Request) {
	userID, ok := r.Context().Value("userID").(int64)
	if !ok {
		http.Error(w, "Unauthorized", http.StatusUnauthorized)
		return
	}

	user, err := h.userService.GetUserByID(userID)
	if err != nil {
		switch {
		case errors.Is(err, services.ErrUserNotFound):
			http.Error(w, "Пользователь не найден", http.StatusNotFound)
		case errors.Is(err, services.ErrInvalidInput):
			http.Error(w, "Некорректный ID пользователя", http.StatusBadRequest)
		default:
			http.Error(w, "Ошибка при получении данных пользователя", http.StatusInternalServerError)
		}
		return
	}

	w.Header().Set("Content-Type", "application/json")
	if err := json.NewEncoder(w).Encode(user); err != nil {
		http.Error(w, "Ошибка при сериализации данных", http.StatusInternalServerError)
		return
	}
}

func (h *ProfileHandler) UpdateProfile(w http.ResponseWriter, r *http.Request) {
	userID, ok := r.Context().Value("userID").(int64)
	if !ok {
		http.Error(w, "Unauthorized", http.StatusUnauthorized)
		return
	}

	var update models.UpdateUserRequest
	if err := json.NewDecoder(r.Body).Decode(&update); err != nil {
		http.Error(w, "Неверный формат данных", http.StatusBadRequest)
		return
	}

	updatedUser, err := h.userService.UpdateUser(userID, &update)
	if err != nil {
		switch {
		case errors.Is(err, services.ErrUserNotFound):
			http.Error(w, "Пользователь не найден", http.StatusNotFound)
		case errors.Is(err, services.ErrInvalidInput):
			http.Error(w, "Некорректные данные для обновления", http.StatusBadRequest)
		default:
			http.Error(w, "Ошибка при обновлении профиля", http.StatusInternalServerError)
		}
		return
	}

	w.Header().Set("Content-Type", "application/json")
	if err := json.NewEncoder(w).Encode(updatedUser); err != nil {
		http.Error(w, "Ошибка при сериализации данных", http.StatusInternalServerError)
		return
	}
}
