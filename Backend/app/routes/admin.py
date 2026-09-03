import json
import secrets
from pathlib import Path
from bson import ObjectId
from fastapi import APIRouter, HTTPException, Query, status

from app.config import settings
from app.database import get_database

router = APIRouter(prefix="/admin", tags=["Admin"])
MOCK_DATA_PATH = Path(__file__).resolve().parent.parent / "mock_opportunities_1000.json"


def normalize_category(value: str) -> str:
    return {
        "Job": "JOB",
        "Internship": "INTERNSHIP",
        "Fellowship": "FELLOWSHIP",
        "Hackathon": "HACKATHON",
        "Workshop": "WORKSHOP",
    }.get(str(value).strip(), str(value).strip().upper())


def normalize_skills(value) -> list[str]:
    if isinstance(value, list):
        return [str(item).strip() for item in value if str(item).strip()]
    return [item.strip() for item in str(value or "").split(",") if item.strip()]


def normalize_opportunity(item: dict) -> dict:
    stipend = item.get("stipend") or {}
    stipend_amount = stipend.get("amount") if isinstance(stipend, dict) else None
    stipend_currency = stipend.get("currency", "PKR") if isinstance(stipend, dict) else "PKR"
    stipend_period = stipend.get("cycle", "MONTHLY") if isinstance(stipend, dict) else "MONTHLY"
    return {
        "title": item.get("opportunity_title") or "Untitled opportunity",
        "organization": item.get("organization") or "Organization",
        "category": normalize_category(item.get("opportunity_category", "INTERNSHIP")),
        "type": str(item.get("type") or "UNPAID").upper(),
        "location": item.get("location") or "Remote",
        "remoteType": item.get("mode") or "Remote",
        "applicationDeadline": item.get("application_deadline"),
        "startDate": item.get("start_date"),
        "startTime": item.get("start_time"),
        "durationDays": item.get("duration_days"),
        "workDays": item.get("working_days"),
        "timezone": item.get("timezone") or "UTC",
        "applicationUrl": item.get("application_url"),
        "description": item.get("description") or "No description provided.",
        "requiredSkills": normalize_skills(item.get("required_skills")),
        "eligibility": item.get("eligibility"),
        "stipendAmount": stipend_amount,
        "stipendCurrency": stipend_currency,
        "stipendPeriod": stipend_period,
        "stipend": f"{stipend_currency} {stipend_amount} / {stipend_period}" if stipend_amount is not None else None,
        "status": "published",
        "createdBy": "mock-seed",
        "seedSource": "mock_opportunities_1000",
        "mockId": item.get("id"),
        "publishedAt": item.get("application_deadline") or "2026-01-01T00:00:00",
    }


@router.get("/seed-opportunities")
async def seed_mock_opportunities(
    password: str = Query(..., min_length=1),
):
    if not secrets.compare_digest(password, settings.ADMIN_SEED_PASSWORD):
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid seed password")
    if not MOCK_DATA_PATH.exists():
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail="Mock opportunity file not found")

    try:
        source_items = json.loads(MOCK_DATA_PATH.read_text(encoding="utf-8"))
    except (OSError, json.JSONDecodeError) as exc:
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=f"Unable to read mock data: {exc}")

    db = get_database()
    inserted = 0
    updated = 0
    for item in source_items:
        document = normalize_opportunity(item)
        result = await db["opportunities"].update_one(
            {"seedSource": document["seedSource"], "mockId": document["mockId"]},
            {"$set": document},
            upsert=True,
        )
        if result.upserted_id:
            inserted += 1
        elif result.modified_count:
            updated += 1

    return {"message": "Mock opportunities seeded successfully", "total": len(source_items), "inserted": inserted, "updated": updated}


@router.delete("/mock-opportunities/{mock_id}")
async def delete_mock_opportunity(
    mock_id: str,
    password: str = Query(..., min_length=1),
):
    if not secrets.compare_digest(password, settings.ADMIN_SEED_PASSWORD):
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid seed password")

    db = get_database()
    mock_id_values = [mock_id]
    if mock_id.isdigit():
        mock_id_values.append(int(mock_id))

    opportunity = await db["opportunities"].find_one(
        {"seedSource": "mock_opportunities_1000", "mockId": {"$in": mock_id_values}},
        {"_id": 1},
    )
    if not opportunity:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Mock opportunity not found")

    await db["opportunities"].delete_one({"_id": opportunity["_id"]})
    opportunity_id = opportunity["_id"]
    await db["users"].update_many(
        {"savedOpportunities": {"$in": [str(opportunity_id), opportunity_id]}},
        {"$pull": {"savedOpportunities": {"$in": [str(opportunity_id), opportunity_id]}}},
    )

    return {"message": "Mock opportunity deleted successfully", "mockId": mock_id}


@router.delete("/mock-opportunities")
async def delete_mock_opportunities(
    count: str = Query("all", pattern=r"^(100|200|300|all)$"),
    password: str = Query(..., min_length=1),
):
    if not secrets.compare_digest(password, settings.ADMIN_SEED_PASSWORD):
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid seed password")

    db = get_database()
    mock_filter = {"seedSource": "mock_opportunities_1000"}
    cursor = db["opportunities"].find(mock_filter, {"_id": 1}).sort("mockId", 1)
    if count != "all":
        cursor = cursor.limit(int(count))

    opportunity_ids = [item["_id"] async for item in cursor]
    if not opportunity_ids:
        return {"message": "No mock opportunities found", "deleted": 0, "requested": count}

    result = await db["opportunities"].delete_many({"_id": {"$in": opportunity_ids}})
    saved_id_values = [value for opportunity_id in opportunity_ids for value in (str(opportunity_id), opportunity_id)]
    await db["users"].update_many(
        {"savedOpportunities": {"$in": saved_id_values}},
        {"$pull": {"savedOpportunities": {"$in": saved_id_values}}},
    )

    return {"message": "Mock opportunities deleted successfully", "deleted": result.deleted_count, "requested": count}
