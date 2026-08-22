from fastapi import FastAPI

app = FastAPI(
    title="HDM Field Service API",
    version="0.1.0",
)


@app.get("/health")
def health():
    return {
        "status": "ok",
        "application": "HDM Field Service API",
    }