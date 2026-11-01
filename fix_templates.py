import asyncio
import sys
import os
from bson import ObjectId

# Ensure backend directory is in path
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), 'backend')))

from db import db

async def run():
    # Retrieve all templates
    cursor = db.cert_templates.find({})
    async for template in cursor:
        html = template.get("html_content", "")
        if not html: continue
        
        # Simple heuristic: if it has '{ box-sizing' it's broken
        if '{ box-sizing' in html:
            print(f"Fixing template {template['template_id']}")
            # Escape CSS braces: '{' -> '{{', '}' -> '}}'
            # Be careful not to escape the actual placeholders (student_name, etc.)
            # This is a brute-force approach, might need refinement
            new_html = html.replace('{ box-sizing', '{{ box-sizing').replace('border-box; }', 'border-box; }}')
            
            await db.cert_templates.update_one(
                {'_id': template['_id']},
                {'$set': {'html_content': new_html}}
            )

if __name__ == '__main__':
    asyncio.run(run())
