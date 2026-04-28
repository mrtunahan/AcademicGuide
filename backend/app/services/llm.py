from langchain_core.language_models.chat_models import BaseChatModel

from app.config import Settings


def build_llm(settings: Settings) -> BaseChatModel:
    """Construct a chat model based on LLM_PROVIDER.

    Imports are lazy so each backend's heavy deps aren't loaded for the
    other provider.
    """
    provider = settings.llm_provider.lower()
    if provider == "ollama":
        from langchain_ollama import ChatOllama

        return ChatOllama(
            base_url=settings.ollama_base_url,
            model=settings.ollama_model,
            temperature=settings.llm_temperature,
        )
    if provider == "openai":
        from langchain_openai import ChatOpenAI

        return ChatOpenAI(
            model=settings.openai_model,
            api_key=settings.openai_api_key,
            temperature=settings.llm_temperature,
        )
    raise ValueError(
        f"Bilinmeyen LLM_PROVIDER: {settings.llm_provider!r}. "
        "Geçerli değerler: 'ollama', 'openai'."
    )
