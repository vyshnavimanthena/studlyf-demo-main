from db import db

async def setup_eligibility_indexes():
    """Define indexes for the EligibilityRule collection."""
    print("Creating indexes for EligibilityRule...")
    await db.eligibility_rules.create_index([("rule_id", 1)], unique=True)
    await db.eligibility_rules.create_index([("event_id", 1)])
    await db.eligibility_rules.create_index([("stage_id", 1)])
    await db.eligibility_rules.create_index([("status", 1)])
    await db.eligibility_rules.create_index([("certificate_type", 1)])
    await db.eligibility_rules.create_index([("rule_category", 1)])
    await db.eligibility_rules.create_index([("is_deleted", 1)])
    print("Indexes created.")

if __name__ == "__main__":
    import asyncio
    asyncio.run(setup_eligibility_indexes())
