# News sentiment analysis
from textblob import TextBlob

# FinBERT imports (install transformers & torch if not already)
try:
    from transformers import AutoTokenizer, AutoModelForSequenceClassification
    import torch
except ImportError:
    AutoTokenizer = None
    AutoModelForSequenceClassification = None
    torch = None


# ------------------------------------------------------------------
# TextBlob-based sentiment (existing)
# ------------------------------------------------------------------

def analyze_sentiment(text):
    """Analyze sentiment of text using TextBlob"""
    try:
        blob = TextBlob(text)
        polarity = blob.sentiment.polarity  # -1 to 1
        subjectivity = blob.sentiment.subjectivity  # 0 to 1
        
        if polarity > 0.1:
            sentiment = "Positive"
        elif polarity < -0.1:
            sentiment = "Negative"
        else:
            sentiment = "Neutral"
        
        return {
            "sentiment": sentiment,
            "polarity": round(polarity, 3),
            "subjectivity": round(subjectivity, 3)
        }
    except Exception as e:
        return {
            "sentiment": "Unknown",
            "polarity": 0.0,
            "subjectivity": 0.5,
            "error": str(e)
        }

# ------------------------------------------------------------------
# FinBERT-based sentiment
# ------------------------------------------------------------------

_MODEL_NAME = "yiyanghkust/finbert-tone"
_tokenizer = None
_model = None


def _load_finbert():
    """Lazy-load tokenizer and model from HuggingFace"""
    global _tokenizer, _model
    if _tokenizer is None or _model is None:
        try:
            _tokenizer = AutoTokenizer.from_pretrained(_MODEL_NAME)
            _model = AutoModelForSequenceClassification.from_pretrained(_MODEL_NAME)
        except Exception:
            # If loading fails, leave as None and fall back to TextBlob
            _tokenizer = None
            _model = None
    return _tokenizer, _model


def finbert_sentiment(text: str):
    """Classify text using FinBERT and return sentiment score.

    Returns a dict containing:
        * sentiment: "Positive"/"Neutral"/"Negative"/"Unknown"
        * score: float in [-1, 1] (positive minus negative probability)
        * probabilities: {"positive":float,"neutral":float,"negative":float}
    """
    tokenizer, model = _load_finbert()
    if tokenizer is None or model is None:
        # fallback gracefully
        base = analyze_sentiment(text)
        return {
            "sentiment": base["sentiment"],
            "score": base.get("polarity", 0.0),
            "probabilities": {
                "positive": max(base.get("polarity", 0.0), 0),
                "neutral": 0,
                "negative": -min(base.get("polarity", 0.0), 0)
            }
        }

    try:
        inputs = tokenizer(text, return_tensors="pt", truncation=True)
        outputs = model(**inputs)
        probs = torch.softmax(outputs.logits, dim=-1).detach().numpy()[0]
        # According to finbert-tone: labels order [neutral, positive, negative]
        neutral_p, positive_p, negative_p = probs.tolist()
        score = positive_p - negative_p  # -1..1
        if score > 0.05:
            sentiment = "Positive"
        elif score < -0.05:
            sentiment = "Negative"
        else:
            sentiment = "Neutral"
        return {
            "sentiment": sentiment,
            "score": round(float(score), 3),
            "probabilities": {
                "positive": round(float(positive_p), 3),
                "neutral": round(float(neutral_p), 3),
                "negative": round(float(negative_p), 3),
            }
        }
    except Exception as e:
        # fallback on error
        return {
            "sentiment": "Unknown",
            "score": 0.0,
            "probabilities": {"positive": 0, "neutral": 0, "negative": 0},
            "error": str(e)
        }


def analyze_news_sentiment(articles):
    """Analyze sentiment of multiple articles"""
    sentiments = []
    for article in articles:
        text = article.get("title", "") + " " + article.get("description", "")
        sentiment = analyze_sentiment(text)
        sentiments.append({
            "article": article,
            "analysis": sentiment
        })
    
    return sentiments
