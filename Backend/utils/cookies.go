package utils

import (
	"net/http"
)

// Cookie names with environment prefix to avoid conflicts
const (
	AccessTokenCookie  = "treesindia_access_token"
	RefreshTokenCookie = "treesindia_refresh_token"
	CSRFTokenCookie    = "treesindia_csrf_token"
)

// CookieOptions holds configuration for cookies
type CookieOptions struct {
	Domain   string
	Secure   bool
	SameSite http.SameSite
	Path     string
}

// DefaultCookieOptions returns default cookie options based on environment
func DefaultCookieOptions() CookieOptions {
	return CookieOptions{
		Domain:   "", // Empty for current domain
		Secure:   true, // Always secure in production
		SameSite: http.SameSiteDefaultMode,
		Path:     "/",
	}
}

// SetHTTPOnlyCookie sets an HTTP-only cookie with proper security settings
func SetHTTPOnlyCookie(w http.ResponseWriter, name, value string, maxAge int, options CookieOptions) {
	cookie := &http.Cookie{
		Name:     name,
		Value:    value,
		Path:     options.Path,
		Domain:   options.Domain,
		MaxAge:   maxAge,
		HttpOnly: true,
		Secure:   options.Secure,
		SameSite: options.SameSite,
	}
	http.SetCookie(w, cookie)
}

// SetAccessTokenCookie sets the access token as an HTTP-only cookie
func SetAccessTokenCookie(w http.ResponseWriter, token string, maxAge int) {
	options := DefaultCookieOptions()
	SetHTTPOnlyCookie(w, AccessTokenCookie, token, maxAge, options)
}

// SetRefreshTokenCookie sets the refresh token as an HTTP-only cookie
func SetRefreshTokenCookie(w http.ResponseWriter, token string, maxAge int) {
	options := DefaultCookieOptions()
	SetHTTPOnlyCookie(w, RefreshTokenCookie, token, maxAge, options)
}

// GetCookie retrieves a cookie value by name
func GetCookie(r *http.Request, name string) (string, error) {
	cookie, err := r.Cookie(name)
	if err != nil {
		return "", err
	}
	return cookie.Value, nil
}

// GetAccessTokenFromCookie retrieves the access token from cookies
func GetAccessTokenFromCookie(r *http.Request) (string, error) {
	return GetCookie(r, AccessTokenCookie)
}

// GetRefreshTokenFromCookie retrieves the refresh token from cookies
func GetRefreshTokenFromCookie(r *http.Request) (string, error) {
	return GetCookie(r, RefreshTokenCookie)
}

// ClearCookie removes a cookie by setting it with an expired date
func ClearCookie(w http.ResponseWriter, name string, options CookieOptions) {
	cookie := &http.Cookie{
		Name:     name,
		Value:    "",
		Path:     options.Path,
		Domain:   options.Domain,
		MaxAge:   -1, // Expire immediately
		HttpOnly: true,
		Secure:   options.Secure,
		SameSite: options.SameSite,
	}
	http.SetCookie(w, cookie)
}

// ClearAuthCookies clears all authentication cookies
func ClearAuthCookies(w http.ResponseWriter) {
	options := DefaultCookieOptions()
	ClearCookie(w, AccessTokenCookie, options)
	ClearCookie(w, RefreshTokenCookie, options)
	ClearCookie(w, CSRFTokenCookie, options)
}

// SetAuthCookies sets both access and refresh token cookies
func SetAuthCookies(w http.ResponseWriter, accessToken, refreshToken string, accessTokenExpiry, refreshTokenExpiry int) {
	SetAccessTokenCookie(w, accessToken, accessTokenExpiry)
	SetRefreshTokenCookie(w, refreshToken, refreshTokenExpiry)
}
