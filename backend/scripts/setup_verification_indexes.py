from db import db

async def setup_verification_indexes():
    """Define indexes for the VerificationAudit collection."""
    print("Creating indexes for VerificationAudit...")
    # Analytics/Search
    await db.verification_audits.create_index([("certificate_id", 1)])
    await db.verification_audits.create_index([("timestamp", -1)])
    await db.verification_audits.create_index([("verification_result", 1)])
    print("Indexes created.")

if __name__ == "__main__":
    import asyncio
    asyncio.run(setup_verification_indexes())
