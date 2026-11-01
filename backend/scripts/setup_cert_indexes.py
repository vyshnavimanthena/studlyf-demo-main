from db import db

async def setup_certificate_indexes():
    """Define indexes for the CertificateTemplate collection."""
    print("Creating indexes for CertificateTemplate...")
    # Unique compound index for slug isolation
    await db.certificate_templates.create_index([("institution_id", 1), ("template_slug", 1)], unique=True)
    
    # Versioning index
    await db.certificate_templates.create_index([("template_id", 1), ("template_version", -1)], unique=True)
    
    # Performance indexes
    await db.certificate_templates.create_index([("status", 1)])
    await db.certificate_templates.create_index([("is_deleted", 1)])
    await db.certificate_templates.create_index([("template_category", 1)])
    await db.certificate_templates.create_index([("template_type", 1)])
    await db.certificate_templates.create_index([("created_at", -1)])
    print("Indexes created.")

if __name__ == "__main__":
    import asyncio
    asyncio.run(setup_certificate_indexes())
