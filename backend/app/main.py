from fastapi import FastAPI, HTTPException, Query

from app.bc_client import search_customers
from fastapi.middleware.cors import CORSMiddleware


app = FastAPI(
    title="HDM Field Service API",
    version="0.1.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/health")
def health():
    return {
        "status": "ok",
        "application": "HDM Field Service API",
    }


@app.get("/api/customers")
def customers(
    q: str | None = Query(
        default=None,
        description="Search customer name",
    )
):
    try:
        results = search_customers(q)

        return {
            "count": len(results),
            "customers": results,
        }

    except Exception as exc:
        raise HTTPException(
            status_code=500,
            detail=str(exc),
        )