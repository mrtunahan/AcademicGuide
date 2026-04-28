import json
from functools import lru_cache
from typing import Any

from langchain_openai import ChatOpenAI

from app.config import Settings, get_settings
from app.schemas.analysis import SectionType
from app.services.rag import RAGService, get_rag_service

SECTION_RUBRICS: dict[SectionType, str] = {
    SectionType.ozgun_deger: (
        "Özgünlük, literatürle farklılaşma, problemin akademik katkısı."
    ),
    SectionType.yontem: (
        "Yöntem seçimi, ölçüm ve doğrulama planı, kaynak yeterliliği."
    ),
    SectionType.is_paketleri: (
        "İş paketlerinin ayrıştırılmışlığı, takvim tutarlılığı, sorumlu atamaları."
    ),
    SectionType.yaygin_etki: (
        "Yaygın etki: yayın, patent, sosyo-ekonomik fayda, sürdürülebilirlik."
    ),
    SectionType.risk_yonetimi: (
        "Risk tanımları, olasılık-etki matrisi, B planları."
    ),
}

ANALYSIS_PROMPT = """Sen TÜBİTAK 2209 başvuru rehberlerine hâkim bir akademik değerlendiricisin.
Aşağıdaki bölüm metnini, verilen kriter ve TÜBİTAK bağlamına göre değerlendir.
Yanıtını SADECE şu JSON şemasında döndür:
{{
  "score": <0-100 arası tam sayı>,
  "summary": "<2-3 cümlelik özet>",
  "findings": [
    {{"severity": "high|medium|low", "message": "...", "suggestion": "..."}}
  ]
}}

# Bölüm
{section}

# Değerlendirme Kriterleri
{rubric}

# TÜBİTAK Bağlamı
{context}

# Öğrenci Metni
{text}
"""


class AnalysisService:
    def __init__(self, settings: Settings, rag: RAGService) -> None:
        self.settings = settings
        self.rag = rag
        self._llm = ChatOpenAI(
            model=settings.llm_model,
            api_key=settings.openai_api_key,
            temperature=0.1,
        )

    def review(self, section: SectionType, text: str) -> dict[str, Any]:
        rubric = SECTION_RUBRICS[section]
        retrieval_query = f"{section.value} için TÜBİTAK 2209 değerlendirme kriterleri"
        retrieval = self.rag.query(question=retrieval_query, top_k=4)
        context = "\n\n".join(c["content"] for c in retrieval["chunks"]) or "(yok)"
        citations = [c["source"] for c in retrieval["chunks"]]

        prompt = ANALYSIS_PROMPT.format(
            section=section.value,
            rubric=rubric,
            context=context,
            text=text,
        )
        response = self._llm.invoke(prompt)
        raw = response.content if hasattr(response, "content") else str(response)
        parsed = _safe_json(raw)

        return {
            "section": section,
            "score": int(parsed.get("score", 0)),
            "summary": parsed.get("summary", ""),
            "findings": parsed.get("findings", []),
            "citations": citations,
        }


def _safe_json(raw: str) -> dict[str, Any]:
    try:
        return json.loads(raw)
    except json.JSONDecodeError:
        start = raw.find("{")
        end = raw.rfind("}")
        if start != -1 and end != -1 and end > start:
            try:
                return json.loads(raw[start : end + 1])
            except json.JSONDecodeError:
                pass
    return {"score": 0, "summary": raw[:300], "findings": []}


@lru_cache
def get_analysis_service() -> AnalysisService:
    return AnalysisService(get_settings(), get_rag_service())
