from db import db

async def setup_certificate_record_indexes():
    """Define indexes for the CertificateRecord collection."""
    print("Creating indexes for CertificateRecord...")
    # Unique Identity
    await db.certificate_records.create_index([("certificate_id", 1)], unique=True)
    await db.certificate_records.create_index([("verification_code", 1)], unique=True)
    
    # Analytics/Search
    await db.certificate_records.create_index([("recipient_user_id", 1)])
    await db.certificate_records.create_index([("event_id", 1)])
    await db.certificate_records.create_index([("stage_id", 1)])
    await db.certificate_records.create_index([("batch_id", 1)])
    await db.certificate_records.create_index([("status", 1)])
    await db.certificate_records.create_index([("certificate_type", 1)])
    await db.certificate_records.create_index([("issued_at", -1)])
    print("Indexes created.")

if __name__ == "__main__":
    import asyncio
    asyncio.run(setup_certificate_record_indexes())
