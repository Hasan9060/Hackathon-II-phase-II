"""
Configuration management for Backend Task Service.

Loads environment variables and provides configuration access.
"""
import os
from dotenv import load_dotenv

# Load environment variables from .env file
load_dotenv()


class Settings:
    """Application settings loaded from environment variables."""

    # Database Configuration
    DATABASE_URL: str = os.getenv("DATABASE_URL", "")

    # JWT Authentication Configuration
    BETTER_AUTH_SECRET: str = os.getenv("BETTER_AUTH_SECRET", "")

    @classmethod
    def validate(cls) -> None:
        """Validate that required settings are present."""
        if not cls.DATABASE_URL:
            raise ValueError(
                "DATABASE_URL environment variable is required. "
                "Please set it in your .env file or environment."
            )
        if not cls.BETTER_AUTH_SECRET:
            raise ValueError(
                "BETTER_AUTH_SECRET environment variable is required. "
                "Please set it in your .env file or environment."
            )


# Global settings instance
settings = Settings()
