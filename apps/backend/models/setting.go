package models

type AppSetting struct {
	ID    uint   `gorm:"primaryKey"`
	Key   string `gorm:"unique;not null;type:varchar(100)"`
	Value string `gorm:"type:text"`
}
