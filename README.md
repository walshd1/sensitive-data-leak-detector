# Sensitive Data Leak Detector

Detects accidental commits of sensitive data (API keys, passwords, etc.) using AI-powered pattern recognition.

## Free
```yaml
- uses: walshd1/sensitive-data-leak-detector@v1
  with:
    gemini_api_key: ${{ secrets.GEMINI_API_KEY }}
```

## Paid (cost + 4.75%)
```yaml
- uses: walshd1/sensitive-data-leak-detector@v1
  with:
    service_token: ${{ secrets.ACTION_FACTORY_TOKEN }}
```
