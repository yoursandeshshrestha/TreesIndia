package models

import "gorm.io/gorm"

// AdminRoleCode represents a specific admin capability group
type AdminRoleCode string

const (
	AdminRoleSuperAdmin        AdminRoleCode = "super_admin"
	AdminRoleBookingManager    AdminRoleCode = "booking_manager"
	AdminRoleVendorManager     AdminRoleCode = "vendor_manager"
	AdminRoleFinanceManager    AdminRoleCode = "finance_manager"
	AdminRoleSupportAgent      AdminRoleCode = "support_agent"
	AdminRoleContentManager    AdminRoleCode = "content_manager"
	AdminRolePropertiesManager AdminRoleCode = "properties_manager"
)

// AdminRole represents a role that can be assigned to admin users
type AdminRole struct {
	gorm.Model
	Code        AdminRoleCode `json:"code" gorm:"type:varchar(64);uniqueIndex;not null"`
	Label       string        `json:"label" gorm:"type:varchar(128);not null"`
	Description string        `json:"description" gorm:"type:text"`

	Users []User `json:"-" gorm:"many2many:user_admin_roles;"`
}


