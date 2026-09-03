import random
from datetime import datetime, timedelta, timezone
from typing import Optional

import httpx
from bson import ObjectId
from fastapi import APIRouter, Header, HTTPException, status
from pydantic import BaseModel, Field

from app.config import settings
from app.database import get_database
from app.routes.auth import get_authenticated_user_id, get_student_profile_data, get_recruiter_profile_data, is_recruiter_role

router = APIRouter(tags=["Applications"])


class ApplicationStatusUpdate(BaseModel):
    status: str = Field(..., pattern="^(reviewing|interview|rejected|accepted)$")


class MessageCreate(BaseModel):
    subject: str = Field(..., min_length=1, max_length=200)
    body: str = Field(..., min_length=1, max_length=5000)


def now_iso():
    return datetime.now(timezone.utc).isoformat()


def object_id(value: str):
    try:
        return ObjectId(value)
    except Exception:
        raise HTTPException(status_code=400, detail="Invalid id")


def profile_snapshot(user: dict, profile) -> dict:
    data = profile.model_dump()
    data["cv"] = user.get("cv") or {}
    return data


def local_analysis(opportunity: dict, profile: dict) -> dict:
    required = [str(item).strip() for item in opportunity.get("requiredSkills") or [] if str(item).strip()]
    candidate = {str(item).strip().lower() for item in profile.get("skills") or []}
    matched = [skill for skill in required if skill.lower() in candidate]
    missing = [skill for skill in required if skill.lower() not in candidate]
    score = round((len(matched) / len(required)) * 100) if required else 75
    return {"score": score, "matchedSkills": matched, "skillGaps": missing, "eligible": not missing, "summary": "Strong alignment with the listed skills." if not missing else f"You match {len(matched)} of {len(required)} listed skills.", "recommendations": [f"Build evidence for {skill}." for skill in missing[:5]], "provider": "local-fallback"}


async def analyze_with_gemini(opportunity: dict, profile: dict) -> dict:
    fallback = local_analysis(opportunity, profile)
    if not settings.GEMINI_API_KEY:
        return fallback
    prompt = ("Return JSON only with keys score (0-100 integer), matchedSkills (array), skillGaps (array), eligible (boolean), summary (string), recommendations (array). Assess this candidate against this role.\n"
        f"ROLE: {opportunity.get('title')}; skills={opportunity.get('requiredSkills')}; eligibility={opportunity.get('eligibility')}; description={opportunity.get('description')}\n"
        f"CANDIDATE: skills={profile.get('skills')}; education={profile.get('education')}; degreeField={profile.get('degreeField')}; experience={profile.get('experience')}; interests={profile.get('interests')}")
    url = f"https://generativelanguage.googleapis.com/v1beta/models/{settings.GEMINI_MODEL}:generateContent"
    try:
        async with httpx.AsyncClient(timeout=20) as client:
            response = await client.post(url, params={"key": settings.GEMINI_API_KEY}, json={"contents": [{"parts": [{"text": prompt}]}], "generationConfig": {"responseMimeType": "application/json"}})
            response.raise_for_status()
            text = response.json()["candidates"][0]["content"]["parts"][0]["text"]
            import json
            result = json.loads(text)
            result["score"] = max(0, min(100, int(result.get("score", fallback["score"]))))
            result["provider"] = settings.GEMINI_MODEL
            return result
    except Exception:
        return fallback


async def current_user(authorization: Optional[str], recruiter: bool = False):
    user_id = await get_authenticated_user_id(authorization)
    db = get_database()
    user = await db["users"].find_one({"_id": object_id(user_id)})
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    if recruiter != is_recruiter_role(user.get("role")):
        raise HTTPException(status_code=403, detail="Access denied")
    return user_id, user, db


def serialize(doc):
    result = dict(doc)
    result["_id"] = str(result["_id"])
    for key in ("opportunityId", "candidateId", "recruiterId"):
        if result.get(key) is not None:
            result[key] = str(result[key])
    return result


@router.get("/applications/preview/{opportunity_id}")
async def application_preview(opportunity_id: str, authorization: Optional[str] = Header(None)):
    user_id, user, db = await current_user(authorization)
    opportunity = await db["opportunities"].find_one({"_id": object_id(opportunity_id)})
    if not opportunity:
        raise HTTPException(status_code=404, detail="Opportunity not found")
    profile = await get_student_profile_data(user)
    existing = await db["applications"].find_one({"opportunityId": opportunity["_id"], "candidateId": user_id})
    cached = await db["application_analysis_cache"].find_one({"opportunityId": opportunity["_id"], "candidateId": user_id})
    analysis = existing.get("analysis") if existing else (cached.get("analysis") if cached else None)
    if analysis is None:
        analysis = await analyze_with_gemini(opportunity, profile.model_dump())
        await db["application_analysis_cache"].update_one({"opportunityId": opportunity["_id"], "candidateId": user_id}, {"$set": {"analysis": analysis, "updatedAt": now_iso()}}, upsert=True)
    return {"opportunity": serialize(opportunity), "profile": profile.model_dump(), "analysis": analysis, "alreadyApplied": bool(existing)}


@router.post("/applications/{opportunity_id}", status_code=status.HTTP_201_CREATED)
async def apply(opportunity_id: str, authorization: Optional[str] = Header(None)):
    user_id, user, db = await current_user(authorization)
    opportunity = await db["opportunities"].find_one({"_id": object_id(opportunity_id)})
    if not opportunity:
        raise HTTPException(status_code=404, detail="Opportunity not found")
    if await db["applications"].find_one({"opportunityId": opportunity["_id"], "candidateId": user_id}):
        raise HTTPException(status_code=409, detail="You already applied to this opportunity")
    profile = await get_student_profile_data(user)
    cached = await db["application_analysis_cache"].find_one({"opportunityId": opportunity["_id"], "candidateId": user_id})
    analysis = cached.get("analysis") if cached else None
    if analysis is None:
        analysis = await analyze_with_gemini(opportunity, profile.model_dump())
    await db["application_analysis_cache"].delete_one({"opportunityId": opportunity["_id"], "candidateId": user_id})
    recruiter = await db["users"].find_one({"_id": object_id(str(opportunity.get("createdBy")))}) if opportunity.get("createdBy") else None
    recruiter_profile = await get_recruiter_profile_data(recruiter) if recruiter else None
    application = {"opportunityId": opportunity["_id"], "candidateId": user_id, "recruiterId": opportunity.get("createdBy"), "status": "submitted", "appliedAt": now_iso(), "opportunitySnapshot": serialize(opportunity), "candidateSnapshot": profile_snapshot(user, profile), "recruiterSnapshot": recruiter_profile.model_dump() if recruiter_profile else {}, "analysis": analysis}
    result = await db["applications"].insert_one(application)
    await db["opportunities"].update_one({"_id": opportunity["_id"]}, {"$inc": {"applicants": 1}})
    await db["notifications"].insert_one({"userId": opportunity.get("createdBy"), "type": "application", "title": "New application received", "body": f"{profile.fullName or profile.email} applied for {opportunity.get('title')}", "read": False, "createdAt": now_iso(), "applicationId": str(result.inserted_id)})
    return serialize({**application, "_id": result.inserted_id})


@router.get("/applications/my")
async def my_applications(authorization: Optional[str] = Header(None)):
    user_id, _, db = await current_user(authorization)
    return [serialize(item) async for item in db["applications"].find({"candidateId": user_id}).sort("appliedAt", -1)]


@router.get("/applications/opportunity/{opportunity_id}")
async def opportunity_applications(opportunity_id: str, authorization: Optional[str] = Header(None)):
    user_id, _, db = await current_user(authorization, recruiter=True)
    if not await db["opportunities"].find_one({"_id": object_id(opportunity_id), "createdBy": user_id}):
        raise HTTPException(status_code=404, detail="Opportunity not found")
    return [serialize(item) async for item in db["applications"].find({"opportunityId": object_id(opportunity_id)}).sort("appliedAt", -1)]


@router.patch("/applications/{application_id}/status")
async def update_application_status(application_id: str, payload: ApplicationStatusUpdate, authorization: Optional[str] = Header(None)):
    user_id, _, db = await current_user(authorization, recruiter=True)
    application = await db["applications"].find_one({"_id": object_id(application_id), "recruiterId": user_id})
    if not application:
        raise HTTPException(status_code=404, detail="Application not found")
    await db["applications"].update_one({"_id": application["_id"]}, {"$set": {"status": payload.status, "updatedAt": now_iso()}})
    if payload.status == "rejected":
        organization = application.get("recruiterSnapshot", {}).get("companyName") or "the organization"
        role = application.get("opportunitySnapshot", {}).get("title") or "the opportunity"
        candidate = application.get("candidateSnapshot", {}).get("fullName") or "Candidate"
        contact = application.get("recruiterSnapshot", {}).get("contactName") or organization
        body = f"Dear {candidate},\n\nThank you for your interest in {organization} and for applying for the {role} position. After careful consideration, we will not be progressing your application to the next stage at this time.\n\nWe appreciate the time and effort you invested in your application and encourage you to continue developing your skills and pursuing opportunities that align with your goals. We wish you every success in your future endeavors.\n\nKind regards,\n{contact}\n{organization}"
        await db["applications"].update_one({"_id": application["_id"]}, {"$set": {"decisionMessage": {"subject": f"Application update: {role}", "body": body}}})
        await db["notifications"].insert_one({"userId": application["candidateId"], "type": "decision", "title": f"Application update: {role}", "body": body, "read": False, "createdAt": now_iso(), "applicationId": str(application["_id"])})
    return {"status": payload.status}


@router.post("/applications/{application_id}/message")
async def message_candidate(application_id: str, payload: MessageCreate, authorization: Optional[str] = Header(None)):
    user_id, _, db = await current_user(authorization, recruiter=True)
    application = await db["applications"].find_one({"_id": object_id(application_id), "recruiterId": user_id})
    if not application:
        raise HTTPException(status_code=404, detail="Application not found")
    sent_at = now_iso()
    await db["applications"].update_one({"_id": application["_id"]}, {"$set": {"status": "accepted", "decisionMessage": payload.model_dump(), "updatedAt": sent_at}})
    await db["notifications"].insert_one({"userId": application["candidateId"], "type": "decision", "title": payload.subject, "body": payload.body, "read": False, "createdAt": sent_at, "applicationId": application_id})
    return {"message": "Message sent"}


@router.get("/notifications")
async def notifications(authorization: Optional[str] = Header(None)):
    user_id, user, db = await current_user(authorization)
    applications = await db["applications"].find({"candidateId": user_id}, {"opportunityId": 1}).to_list(length=None)
    applied_ids = [item["opportunityId"] for item in applications if item.get("opportunityId")]
    deadline_filter = {"applicationDeadline": {"$exists": True, "$nin": [None, ""]}}
    if applied_ids:
        deadline_filter["_id"] = {"$nin": applied_ids}

    now = datetime.now(timezone.utc)
    reminder_messages = [
        "The deadline is approaching. Give this opportunity a look before it closes.",
        "This opportunity may be a strong fit for your profile and is nearing its deadline.",
        "A quick reminder: this opportunity will not stay open forever.",
    ]
    async for opportunity in db["opportunities"].find(deadline_filter):
        raw_deadline = opportunity.get("applicationDeadline")
        try:
            deadline = datetime.fromisoformat(str(raw_deadline).replace("Z", "+00:00"))
            if deadline.tzinfo is None:
                deadline = deadline.replace(tzinfo=timezone.utc)
        except ValueError:
            continue
        days_left = (deadline - now).total_seconds() / 86400
        if 0 <= days_left <= 7:
            opportunity_id = str(opportunity["_id"])
            reminder_key = f"deadline:{opportunity_id}:{deadline.date().isoformat()}"
            exists = await db["notifications"].find_one({"userId": user_id, "reminderKey": reminder_key})
            if not exists:
                await db["notifications"].insert_one({
                    "userId": user_id,
                    "type": "deadline",
                    "title": f"Deadline reminder: {opportunity.get('title') or 'Opportunity'}",
                    "body": random.choice(reminder_messages),
                    "opportunityId": opportunity_id,
                    "opportunityUrl": f"/feed?opportunity={opportunity_id}",
                    "read": False,
                    "createdAt": now_iso(),
                    "reminderKey": reminder_key,
                })

    return [serialize(item) async for item in db["notifications"].find({"userId": user_id}).sort("createdAt", -1).limit(50)]


@router.patch("/notifications/{notification_id}/read")
async def mark_notification_read(notification_id: str, authorization: Optional[str] = Header(None)):
    user_id, _, db = await current_user(authorization)
    result = await db["notifications"].update_one({"_id": object_id(notification_id), "userId": user_id}, {"$set": {"read": True}})
    if not result.matched_count:
        raise HTTPException(status_code=404, detail="Notification not found")
    return {"read": True}