def fix_id(doc):
    """Convert MongoDB _id to string and add as submissionId for API responses."""
    if doc and "_id" in doc:
        doc["_id"] = str(doc["_id"])
        doc["submissionId"] = doc["_id"]
    return doc
