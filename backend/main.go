package main

import (
	"crypto/tls"
	"delivery-service/db"
	"delivery-service/handlers"
	"delivery-service/middleware"
	"delivery-service/repository"
	"delivery-service/services"
	"fmt"
	"log"
	"net/http"
	"os"
	"strings"

	"github.com/gorilla/mux"
	"github.com/joho/godotenv"
)

func main() {
	// Загрузка переменных окружения
	if err := godotenv.Load(); err != nil {
		log.Printf("Warning: .env file not found, using system environment variables")
	}

	// Инициализация базы данных
	if err := db.InitDB(); err != nil {
		log.Fatal("Error initializing database:", err)
	}
	defer db.DB.Close()

	// Инициализация репозиториев, сервисов и обработчиков
	userRepo := repository.NewUserRepository(db.DB)
	authService := services.NewAuthService(userRepo)
	authHandler := handlers.NewAuthHandler(authService)
	authMiddleware := middleware.NewAuthMiddleware(authService)

	// Create router
	router := mux.NewRouter()

	// Получаем разрешенные origins из переменной окружения
	allowedOriginsStr := os.Getenv("ALLOWED_ORIGINS")
	if allowedOriginsStr == "" {
		allowedOriginsStr = "http://localhost:3000,https://practice-2025.vercel.app"
	}
	allowedOrigins := strings.Split(allowedOriginsStr, ",")

	// CORS middleware
	router.Use(func(next http.Handler) http.Handler {
		return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
			origin := r.Header.Get("Origin")
			allowed := false

			// Всегда разрешаем vercel.app
			if strings.Contains(origin, "vercel.app") {
				w.Header().Set("Access-Control-Allow-Origin", origin)
				allowed = true
			} else {
				// Проверяем origin на соответствие разрешенным доменам
				for _, allowedOrigin := range allowedOrigins {
					// Проверка на wildcard домены
					if strings.Contains(allowedOrigin, "*") {
						pattern := strings.Replace(allowedOrigin, "*", ".*", -1)
						if strings.HasPrefix(origin, strings.Split(pattern, ".*")[0]) {
							allowed = true
							w.Header().Set("Access-Control-Allow-Origin", origin)
							break
						}
					} else if origin == allowedOrigin {
						allowed = true
						w.Header().Set("Access-Control-Allow-Origin", origin)
						break
					}
				}

				if !allowed {
					log.Printf("Blocked request from unauthorized origin: %s", origin)
				}
			}

			w.Header().Set("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS")
			w.Header().Set("Access-Control-Allow-Headers", "Content-Type, Authorization")
			w.Header().Set("Access-Control-Allow-Credentials", "true")
			w.Header().Set("Access-Control-Max-Age", "3600")

			if r.Method == "OPTIONS" {
				w.WriteHeader(http.StatusOK)
				return
			}

			next.ServeHTTP(w, r)
		})
	})

	// публичные роуты
	router.HandleFunc("/api/auth/register", authHandler.Register).Methods("POST", "OPTIONS")
	router.HandleFunc("/api/auth/login", authHandler.Login).Methods("POST", "OPTIONS")

	// защищенные роуты
	router.HandleFunc("/api/profile", authMiddleware.Authenticate(authHandler.GetProfile)).Methods("GET", "OPTIONS")
	router.HandleFunc("/api/profile", authMiddleware.Authenticate(authHandler.UpdateProfile)).Methods("PUT", "OPTIONS")

	port := os.Getenv("PORT")
	if port == "" {
		port = "8080"
	}

	// Определяем режим работы: HTTP или HTTPS
	useHTTPS := os.Getenv("USE_HTTPS")
	certFile := os.Getenv("CERT_FILE")
	keyFile := os.Getenv("KEY_FILE")

	if useHTTPS == "true" && certFile != "" && keyFile != "" {
		// Создаем TLS конфигурацию
		tlsConfig := &tls.Config{
			MinVersion: tls.VersionTLS12,
		}

		// Создаем HTTPS сервер
		server := &http.Server{
			Addr:      ":" + port,
			Handler:   router,
			TLSConfig: tlsConfig,
		}

		fmt.Printf("HTTPS Server is running on port %s...\n", port)
		log.Fatal(server.ListenAndServeTLS(certFile, keyFile))
	} else {
		// Запускаем HTTP сервер
		fmt.Printf("HTTP Server is running on port %s...\n", port)
		log.Fatal(http.ListenAndServe(":"+port, router))
	}
}
