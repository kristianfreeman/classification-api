# classification-api

![WIP](https://pub-b4e6ed9616414ace9314e84c0a5cd3e8.r2.dev/workinprogress.jpg)

Simple classification API built using Cloudflare Workers, D1, and Vectorize.

This API uses the `bge-base-en` model from Hugging Face to classify text. You can store a series of "buckets" and then classify any given text against those buckets. All data is stored in a D1 database and a corresponding Vectorize index that is automatically synced.

## Usage

### Create classifications

```bash
curl -X POST -H "Content-Type: application/json" -d '{"text": "This is a test"}' https://api.example.com/classifications
```

### Classify

```bash
curl -X POST -H "Content-Type: application/json" -d '{"query": "This is a test"}' https://api.example.com/classify
```

### Delete classifications

```bash
curl -X DELETE -H "Content-Type: application/json" -d '{"id": 1}' https://api.example.com/classifications/1
```

## Deploy

```bash
wrangler publish
```
