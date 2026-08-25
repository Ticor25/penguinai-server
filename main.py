import os
from typing import Any

import httpx
from fastapi import FastAPI, HTTPException, Request
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI(title="PenguinAI Proxy")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=False,
    allow_methods=["*"],
    allow_headers=["*"],
)

HF_TOKEN = os.getenv("HF_TOKEN", "").strip()
MODEL = os.getenv(
    "MODEL",
    "openai/gpt-oss-120b:fastest"
).strip()

HF_BASE_URL = "https://router.huggingface.co/v1"


def require_token():
    if not HF_TOKEN:
        raise HTTPException(
            status_code=500,
            detail="HF_TOKEN no está configurado en Render."
        )


@app.get("/")
async def root():
    return {
        "name": "PenguinAI Proxy",
        "status": "online",
        "api": "/v1"
    }


@app.get("/v1/models")
async def models():
    require_token()

    headers = {
        "Authorization": f"Bearer {HF_TOKEN}"
    }

    async with httpx.AsyncClient(timeout=60) as client:
        response = await client.get(
            f"{HF_BASE_URL}/models",
            headers=headers
        )

    if response.status_code >= 400:
        raise HTTPException(
            status_code=response.status_code,
            detail=response.text
        )

    data = response.json()

    if isinstance(data, dict) and "data" in data:
        return data

    return {
        "object": "list",
        "data": [
            {
                "id": MODEL,
                "object": "model",
                "owned_by": "huggingface"
            }
        ]
    }


@app.post("/v1/chat/completions")
async def chat_completions(request: Request):
    require_token()

    body: dict[str, Any] = await request.json()

    if not body.get("model"):
        body["model"] = MODEL

    headers = {
        "Authorization": f"Bearer {HF_TOKEN}",
        "Content-Type": "application/json"
    }

    async with httpx.AsyncClient(timeout=180) as client:
        response = await client.post(
            f"{HF_BASE_URL}/chat/completions",
            headers=headers,
            json=body
        )

    if response.status_code >= 400:
        raise HTTPException(
            status_code=response.status_code,
            detail=response.text
        )

    return response.json()


@app.get("/v1/check")
async def check():
    return {
        "ok": True,
        "model": MODEL
    }


@app.get("/health")
async def health():
    return {
        "status": "healthy"
    }


if __name__ == "__main__":
    import uvicorn

    port = int(os.getenv("PORT", "7860"))

    uvicorn.run(
        app,
        host="0.0.0.0",
        port=port
    )
