package db

import (
	"database/sql"
	"fmt"
	"log"
	"os"

	_ "github.com/lib/pq"
)

var DB *sql.DB

func InitDB() error {
	log.Println("Инициализация базы данных...")

	dbURL := os.Getenv("DATABASE_URL")
	var connStr string

	if dbURL != "" {
		if dbURL[len(dbURL)-1] != '?' {
			dbURL += "?"
		}
		dbURL += "sslmode=disable"
		connStr = dbURL
	} else {
		connStr = fmt.Sprintf(
			"host=%s port=%s user=%s password=%s dbname=%s sslmode=disable",
			os.Getenv("DB_HOST"),
			os.Getenv("DB_PORT"),
			os.Getenv("DB_USER"),
			os.Getenv("DB_PASSWORD"),
			os.Getenv("DB_NAME"),
		)
	}

	log.Printf("Подключение к базе данных: %s:%s/%s", os.Getenv("DB_HOST"), os.Getenv("DB_PORT"), os.Getenv("DB_NAME"))

	var err error
	DB, err = sql.Open("postgres", connStr)
	if err != nil {
		return fmt.Errorf("error opening database: %v", err)
	}

	if err := DB.Ping(); err != nil {
		return fmt.Errorf("error connecting to the database: %v", err)
	}

	log.Println("Успешное подключение к базе данных")

	// Создаем таблицы
	schema, err := os.ReadFile("db/schema.sql")
	if err != nil {
		log.Printf("Ошибка чтения схемы базы данных: %v", err)
		// Попробуем прочитать из текущей директории
		schema, err = os.ReadFile("schema.sql")
		if err != nil {
			return fmt.Errorf("error reading schema file: %v", err)
		}
	}

	log.Println("Создание таблиц...")

	_, err = DB.Exec(string(schema))
	if err != nil {
		return fmt.Errorf("error creating tables: %v", err)
	}

	log.Println("Таблицы успешно созданы")

	return nil
}
