package repository

import (
	"database/sql"
	"delivery-service/models"
	"errors"
	"time"
)

var (
	ErrUserNotFound = errors.New("user not found")
	ErrInvalidInput = errors.New("invalid input parameters")
)

const (
	queryCreateUser = `
		INSERT INTO users (name, email, password_hash)
		VALUES ($1, $2, $3)
		RETURNING id, created_at, updated_at`

	queryGetUserByEmail = `
		SELECT id, name, email, password_hash, COALESCE(avatar, ''), phone, birth_date,
			   address, city, country, postal_code, telegram, whatsapp,
			   preferred_contact, language, notifications, created_at, updated_at
		FROM users
		WHERE email = $1`

	queryGetUserByID = `
		SELECT id, name, email, password_hash, COALESCE(avatar, ''), phone, birth_date,
			   address, city, country, postal_code, telegram, whatsapp,
			   preferred_contact, language, notifications, created_at, updated_at
		FROM users
		WHERE id = $1`

	queryUpdateUser = `
		UPDATE users SET
			name = COALESCE($1, name),
			phone = $2,
			birth_date = $3::date,
			address = $4,
			city = $5,
			country = $6,
			postal_code = $7,
			telegram = $8,
			whatsapp = $9,
			preferred_contact = $10,
			language = $11,
			updated_at = NOW()
		WHERE id = $12
		RETURNING id, name, email, phone, birth_date, address, city, country,
				  postal_code, telegram, whatsapp, preferred_contact, language,
				  created_at, updated_at`
)

type UserRepository struct {
	db *sql.DB
}

func NewUserRepository(db *sql.DB) *UserRepository {
	if db == nil {
		panic("database connection is required")
	}
	return &UserRepository{db: db}
}

func (r *UserRepository) CreateUser(user *models.User) error {
	if user == nil {
		return ErrInvalidInput
	}

	return r.db.QueryRow(
		queryCreateUser,
		user.Name,
		user.Email,
		user.PasswordHash,
	).Scan(&user.ID, &user.CreatedAt, &user.UpdatedAt)
}

func (r *UserRepository) GetUserByEmail(email string) (*models.User, error) {
	if email == "" {
		return nil, ErrInvalidInput
	}

	user := &models.User{}
	var (
		phone            sql.NullString
		birthDate        sql.NullTime
		address          sql.NullString
		city             sql.NullString
		country          sql.NullString
		postalCode       sql.NullString
		telegram         sql.NullString
		whatsapp         sql.NullString
		preferredContact sql.NullString
		language         sql.NullString
	)

	err := r.db.QueryRow(queryGetUserByEmail, email).Scan(
		&user.ID,
		&user.Name,
		&user.Email,
		&user.PasswordHash,
		&user.Avatar,
		&phone,
		&birthDate,
		&address,
		&city,
		&country,
		&postalCode,
		&telegram,
		&whatsapp,
		&preferredContact,
		&language,
		&user.Notifications,
		&user.CreatedAt,
		&user.UpdatedAt,
	)

	if err == sql.ErrNoRows {
		return nil, ErrUserNotFound
	}
	if err != nil {
		return nil, err
	}

	return r.mapNullableFields(user, phone, birthDate, address, city, country, postalCode, telegram, whatsapp, preferredContact, language), nil
}

func (r *UserRepository) GetUserByID(id int64) (*models.User, error) {
	if id <= 0 {
		return nil, ErrInvalidInput
	}

	user := &models.User{}
	var (
		phone            sql.NullString
		birthDate        sql.NullTime
		address          sql.NullString
		city             sql.NullString
		country          sql.NullString
		postalCode       sql.NullString
		telegram         sql.NullString
		whatsapp         sql.NullString
		preferredContact sql.NullString
		language         sql.NullString
	)

	err := r.db.QueryRow(queryGetUserByID, id).Scan(
		&user.ID,
		&user.Name,
		&user.Email,
		&user.PasswordHash,
		&user.Avatar,
		&phone,
		&birthDate,
		&address,
		&city,
		&country,
		&postalCode,
		&telegram,
		&whatsapp,
		&preferredContact,
		&language,
		&user.Notifications,
		&user.CreatedAt,
		&user.UpdatedAt,
	)

	if err == sql.ErrNoRows {
		return nil, ErrUserNotFound
	}
	if err != nil {
		return nil, err
	}

	return r.mapNullableFields(user, phone, birthDate, address, city, country, postalCode, telegram, whatsapp, preferredContact, language), nil
}

func (r *UserRepository) UpdateUser(userID int64, updates *models.UpdateUserRequest) (*models.User, error) {
	if userID <= 0 || updates == nil {
		return nil, ErrInvalidInput
	}

	tx, err := r.db.Begin()
	if err != nil {
		return nil, err
	}
	defer tx.Rollback()

	var birthDate *time.Time
	if updates.BirthDate != nil {
		t, err := time.Parse("2006-01-02", *updates.BirthDate)
		if err != nil {
			return nil, err
		}
		birthDate = &t
	}

	user := &models.User{}
	var (
		phone            sql.NullString
		birthDateNull    sql.NullTime
		address          sql.NullString
		city             sql.NullString
		country          sql.NullString
		postalCode       sql.NullString
		telegram         sql.NullString
		whatsapp         sql.NullString
		preferredContact sql.NullString
		language         sql.NullString
	)

	err = tx.QueryRow(
		queryUpdateUser,
		updates.Name,
		updates.Phone,
		birthDate,
		updates.Address,
		updates.City,
		updates.Country,
		updates.PostalCode,
		updates.Telegram,
		updates.WhatsApp,
		updates.PreferredContact,
		updates.Language,
		userID,
	).Scan(
		&user.ID,
		&user.Name,
		&user.Email,
		&phone,
		&birthDateNull,
		&address,
		&city,
		&country,
		&postalCode,
		&telegram,
		&whatsapp,
		&preferredContact,
		&language,
		&user.CreatedAt,
		&user.UpdatedAt,
	)

	if err != nil {
		return nil, err
	}

	if err = tx.Commit(); err != nil {
		return nil, err
	}

	return r.mapNullableFields(user, phone, birthDateNull, address, city, country, postalCode, telegram, whatsapp, preferredContact, language), nil
}

func (r *UserRepository) mapNullableFields(
	user *models.User,
	phone sql.NullString,
	birthDate sql.NullTime,
	address sql.NullString,
	city sql.NullString,
	country sql.NullString,
	postalCode sql.NullString,
	telegram sql.NullString,
	whatsapp sql.NullString,
	preferredContact sql.NullString,
	language sql.NullString,
) *models.User {
	if phone.Valid {
		user.Phone = &phone.String
	}
	if birthDate.Valid {
		user.BirthDate = &birthDate.Time
	}
	if address.Valid {
		user.Address = &address.String
	}
	if city.Valid {
		user.City = &city.String
	}
	if country.Valid {
		user.Country = &country.String
	}
	if postalCode.Valid {
		user.PostalCode = &postalCode.String
	}
	if telegram.Valid {
		user.Telegram = &telegram.String
	}
	if whatsapp.Valid {
		user.WhatsApp = &whatsapp.String
	}
	if preferredContact.Valid {
		user.PreferredContact = &preferredContact.String
	}
	if language.Valid {
		user.Language = &language.String
	}

	return user
}
