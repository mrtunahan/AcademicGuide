from functools import lru_cache

from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_file=".env", extra="ignore")

    app_env: str = "development"
    app_host: str = "0.0.0.0"
    app_port: int = 8000

    database_url: str = "postgresql+psycopg://academicguide:change_me@postgres:5432/academicguide"

    chroma_host: str = "chroma"
    chroma_port: int = 8000
    chroma_collection: str = "tubitak_2209"

    openai_api_key: str | None = None
    llm_model: str = "gpt-4o-mini"

    # Embedding provider: "huggingface" (default, uses local BGE-M3) or "openai".
    embedding_provider: str = "huggingface"
    embedding_model: str = "BAAI/bge-m3"
    embedding_device: str = "cpu"  # "cpu" or "cuda" / "cuda:0"
    embedding_normalize: bool = True
    hf_cache_dir: str = "/app/data/hf"

    cors_origins: str = "http://localhost:5173"

    jwt_secret: str = "dev-only-change-me"
    jwt_algorithm: str = "HS256"
    jwt_expire_minutes: int = 60 * 24

    upload_max_mb: int = 25

    @property
    def cors_origins_list(self) -> list[str]:
        return [o.strip() for o in self.cors_origins.split(",") if o.strip()]


@lru_cache
def get_settings() -> Settings:
    return Settings()
