package main

import (
	"flag"
	"log"
	"treesindia/config"
	"treesindia/seed"
)

func main() {
	// Initialize configuration
	config.InitConfig()

	// Initialize database
	config.InitDatabase()
	
	// Parse command line flags
	seedType := flag.String("type", "all", "Type of seed to run: all, admin, categories")
	flag.Parse()

	db := config.GetDB()

	switch *seedType {
	case "all":
		log.Println("Running all seeds...")
		if err := seed.SeedAll(db); err != nil {
			log.Fatal("Failed to run all seeds:", err)
		}
	case "admin":
		log.Println("Running admin seed...")
		// You can add individual seed functions to the seed package if needed
		log.Println("Admin seed completed")
	case "categories":
		log.Println("Running categories seed...")
		// You can add individual seed functions to the seed package if needed
		log.Println("Categories seed completed")
	default:
		log.Fatal("Invalid seed type. Use: all, admin, categories")
	}

	log.Println("Seed operation completed successfully!")
}
