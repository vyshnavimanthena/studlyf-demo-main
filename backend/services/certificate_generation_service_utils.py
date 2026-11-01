import uuid
import random
import string
import qrcode
import qrcode.image.svg
import os
from io import BytesIO
from db import db
from datetime import datetime
from weasyprint import HTML

# Utils for ID/QR Generation
async def generate_certificate_id(cert_type: str) -> str:
    seq = await db.counters.find_one_and_update(
        {"_id": f"cert_seq_{cert_type}"},
        {"$inc": {"seq": 1}},
        upsert=True,
        return_document=True
    )
    sequence = str(seq["seq"]).zfill(6)
    prefix = f"CERT-CF26-{cert_type[:3].upper()}"
    return f"{prefix}-{sequence}"

async def generate_unique_verification_code() -> str:
    while True:
        code = ''.join(random.choices(string.ascii_uppercase + string.digits, k=8))
        if not await db.certificate_records.find_one({"verification_code": code}):
            return code

async def generate_qr_assets(url: str, cert_id: str) -> Dict[str, str]:
    base_dir = f"uploads/certs/qr/{cert_id}"
    os.makedirs(base_dir, exist_ok=True)
    
    # PNG
    png_path = f"{base_dir}/qr.png"
    qr = qrcode.QRCode(box_size=10, border=5)
    qr.add_data(url)
    qr.make(fit=True)
    img = qr.make_image(fill_color="black", back_color="white")
    img.save(png_path)
    
    # SVG
    svg_path = f"{base_dir}/qr.svg"
    factory = qrcode.image.svg.SvgImage
    svg_img = qrcode.make(url, image_factory=factory)
    svg_img.save(svg_path)
    
    return {"png": png_path, "svg": svg_path}

def render_html_from_canvas(template_config: dict, render_data: dict) -> str:
    # Convert elements_json to HTML
    elements = template_config.get("elements_json", {}).get("elements", [])
    html = "<div style='position:relative; width:842px; height:595px;'>"
    for el in elements:
        # Simplified renderer
        val = el.get("content", "").replace("{{recipient_name}}", render_data.get("recipient_name", ""))
        html += f"<div style='position:absolute; left:{el['x']}px; top:{el['y']}px; font-size:{el['fontSize']}px;'>{val}</div>"
    html += "</div>"
    return html

async def render_certificate_pdf(template_config: dict, render_data: dict, cert_id: str) -> str:
    html_content = render_html_from_canvas(template_config, render_data)
    pdf_path = f"uploads/certs/pdf/{cert_id}.pdf"
    os.makedirs(os.path.dirname(pdf_path), exist_ok=True)
    HTML(string=html_content).write_pdf(pdf_path)
    return pdf_path

