from functools import lru_cache
from typing import Any

import chromadb
from langchain_chroma import Chroma
from langchain_core.documents import Document
from langchain_core.embeddings import Embeddings
from langchain_openai import ChatOpenAI
from langchain_text_splitters import RecursiveCharacterTextSplitter

from app.config import Settings, get_settings
from app.schemas.rag import DocumentInput

SYSTEM_PROMPT = """Sen TÜBİTAK 2209 başvurularını analiz eden bir akademik mentörsün.
Sana verilen bağlamı kullanarak öğrencinin sorusunu Türkçe yanıtla.
Bağlam yetersizse bunu açıkça belirt; uydurma."""


def _build_embeddings(settings: Settings) -> Embeddings:
    provider = settings.embedding_provider.lower()
    if provider == "openai":
        from langchain_openai import OpenAIEmbeddings

        return OpenAIEmbeddings(
            model=settings.embedding_model,
            api_key=settings.openai_api_key,
        )
    if provider == "huggingface":
        # Imported lazily so OpenAI-only deployments don't pay the torch import cost.
        from langchain_huggingface import HuggingFaceEmbeddings

        return HuggingFaceEmbeddings(
            model_name=settings.embedding_model,
            cache_folder=settings.hf_cache_dir,
            model_kwargs={"device": settings.embedding_device},
            encode_kwargs={"normalize_embeddings": settings.embedding_normalize},
        )
    raise ValueError(
        f"Bilinmeyen EMBEDDING_PROVIDER: {settings.embedding_provider!r}. "
        "Geçerli değerler: 'huggingface', 'openai'."
    )


class RAGService:
    def __init__(self, settings: Settings) -> None:
        self.settings = settings
        self.collection_name = settings.chroma_collection
        self._embeddings = _build_embeddings(settings)
        self._client = chromadb.HttpClient(
            host=settings.chroma_host,
            port=settings.chroma_port,
        )
        self._vectorstore = Chroma(
            client=self._client,
            collection_name=self.collection_name,
            embedding_function=self._embeddings,
        )
        self._splitter = RecursiveCharacterTextSplitter(
            chunk_size=800,
            chunk_overlap=120,
        )
        self._llm = ChatOpenAI(
            model=settings.llm_model,
            api_key=settings.openai_api_key,
            temperature=0.2,
        )

    def ingest(self, documents: list[DocumentInput]) -> int:
        lc_docs: list[Document] = []
        for doc in documents:
            metadata = {"source": doc.source, **doc.metadata}
            for chunk in self._splitter.split_text(doc.content):
                lc_docs.append(Document(page_content=chunk, metadata=metadata))
        if not lc_docs:
            return 0
        self._vectorstore.add_documents(lc_docs)
        return len(lc_docs)

    def query(self, question: str, top_k: int = 4) -> dict[str, Any]:
        results = self._vectorstore.similarity_search_with_score(question, k=top_k)
        chunks = [
            {
                "content": doc.page_content,
                "source": doc.metadata.get("source", "unknown"),
                "score": float(score),
            }
            for doc, score in results
        ]

        context = "\n\n---\n\n".join(
            f"[Kaynak: {c['source']}]\n{c['content']}" for c in chunks
        )
        prompt = (
            f"{SYSTEM_PROMPT}\n\n"
            f"# Bağlam\n{context}\n\n"
            f"# Soru\n{question}\n\n"
            "# Yanıt"
        )
        response = self._llm.invoke(prompt)
        answer = response.content if hasattr(response, "content") else str(response)
        return {"answer": answer, "chunks": chunks}


@lru_cache
def get_rag_service() -> RAGService:
    return RAGService(get_settings())
