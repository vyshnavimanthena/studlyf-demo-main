import asyncio
import json
import os
from db import db
from datetime import datetime

async def run_migration():
    print("Running migration: Seeding prebuilt templates...")
    template_dir = os.path.join(os.path.dirname(__file__), "..", "artifacts", "templates")
    for filename in os.listdir(template_dir):
        if filename.endswith(".json"):
            with open(os.path.join(template_dir, filename), "r") as f:
                data = json.load(f)
                # Ensure correct format for mongo
                data["created_at"] = datetime.strptime(data["created_at"], "%Y-%m-%dT%H:%M:%SZ")
                data["updated_at"] = datetime.strptime(data["updated_at"], "%Y-%m-%dT%H:%M:%SZ")
                
                await db.certificate_templates.replace_one(
                    {"template_id": data["template_id"], "template_version": data["template_version"]},
                    data,
                    upsert=True
                )
                print(f"Seeded: {data['template_name']}")

if __name__ == "__main__":
    asyncio.run(run_migration())
