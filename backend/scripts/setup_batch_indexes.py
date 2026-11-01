from db import db

async def setup_batch_indexes():
    """Define indexes for the CertificateBatch collection."""
    print("Creating indexes for CertificateBatch...")
    # Unique Identity
    await db.certificate_batches.create_index([("batch_id", 1)], unique=True)
    
    # Analytics/Search
    await db.certificate_batches.create_index([("event_id", 1)])
    await db.certificate_batches.create_index([("stage_id", 1)])
    await db.certificate_batches.create_index([("status", 1)])
    await db.certificate_batches.create_index([("created_by", 1)])
    await db.certificate_batches.create_index([("created_at", -1)])
    await db.certificate_batches.create_index([("institution_id", 1)])
    print("Indexes created.")

if __name__ == "__main__":
    import asyncio
    asyncio.run(setup_batch_indexes())
