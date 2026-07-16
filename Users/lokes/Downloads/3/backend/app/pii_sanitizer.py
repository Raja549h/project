"""PII Sanitization Middleware using Microsoft Presidio."""

import logging
from presidio_analyzer import AnalyzerEngine
from presidio_analyzer.nlp_engine import NlpEngineProvider
from presidio_anonymizer import AnonymizerEngine
from presidio_anonymizer.entities import OperatorConfig

log = logging.getLogger(__name__)

# Configure Presidio to use the small spacy model downloaded via pip
configuration = {
    "nlp_engine_name": "spacy",
    "models": [{"lang_code": "en", "model_name": "en_core_web_sm"}],
}

try:
    provider = NlpEngineProvider(nlp_configuration=configuration)
    nlp_engine = provider.create_engine()
    analyzer = AnalyzerEngine(nlp_engine=nlp_engine, supported_languages=["en"])
    anonymizer = AnonymizerEngine()
    log.info("Presidio PII engines initialized successfully.")
except Exception as e:
    log.error("Failed to initialize Presidio: %s", e)
    analyzer = None
    anonymizer = None


def sanitize_text(text: str) -> tuple[str, dict[str, str]]:
    """
    Detects and masks PII in the text.
    Returns the sanitized text and a mapping of {placeholder: original_value} for restoration.
    """
    if not analyzer or not anonymizer or not text:
        return text, {}

    try:
        results = analyzer.analyze(text=text, entities=["PERSON", "PHONE_NUMBER", "EMAIL_ADDRESS"], language="en")
        
        # We need to map placeholders back to original text.
        # Presidio's AnonymizerEngine doesn't automatically return the mapping easily if we want 
        # unique placeholders like <PERSON_1>. We will manually map them.
        
        mapping = {}
        sanitized_text = text
        
        # Sort results descending by start to avoid shifting indices when replacing
        results.sort(key=lambda x: x.start, reverse=True)
        
        counters = {"PERSON": 1, "PHONE_NUMBER": 1, "EMAIL_ADDRESS": 1}
        
        for res in results:
            entity_type = res.entity_type
            original_value = text[res.start:res.end]
            
            placeholder = f"<{entity_type}_{counters[entity_type]}>"
            counters[entity_type] += 1
            
            mapping[placeholder] = original_value
            sanitized_text = sanitized_text[:res.start] + placeholder + sanitized_text[res.end:]
            
        return sanitized_text, mapping
    except Exception as e:
        log.warning("PII sanitization failed, returning original text. Error: %s", e)
        return text, {}


def restore_pii(text: str, mapping: dict[str, str]) -> str:
    """Restores PII from the mapping into the sanitized text."""
    if not mapping or not text:
        return text
        
    restored_text = text
    for placeholder, original in mapping.items():
        restored_text = restored_text.replace(placeholder, original)
        
    return restored_text
