import os
import qrcode
from PIL import Image, ImageDraw, ImageFont
from backend.core.config import settings

def generate_table_qr(table_number: str) -> str:
    """
    Generates a beautifully styled QR code card for a specific table
    and saves it to uploads/qrcodes/table_{table_number}.png
    Returns the public path URL: /uploads/qrcodes/table_{table_number}.png
    """
    filename = f"table_{table_number}.png"
    filepath = os.path.join(settings.QR_DIR, filename)

    # Destination URL for table scanning
    target_url = f"{settings.FRONTEND_BASE_URL}/?table={table_number}"

    # 1. Create QR code
    qr = qrcode.QRCode(
        version=1,
        error_correction=qrcode.constants.ERROR_CORRECT_H,
        box_size=10,
        border=2,
    )
    qr.add_data(target_url)
    qr.make(fit=True)
    qr_img = qr.make_image(fill_color="#173D2D", back_color="#FCFAF5").convert("RGB")

    # 2. Build decorative table card (Width: 600, Height: 750)
    card_w, card_h = 600, 750
    card = Image.new("RGB", (card_w, card_h), "#FCFAF5")
    draw = ImageDraw.Draw(card)

    # Outer elegant gold/green border
    draw.rectangle([15, 15, card_w - 15, card_h - 15], outline="#C6A15B", width=3)
    draw.rectangle([22, 22, card_w - 22, card_h - 22], outline="#173D2D", width=1)

    # Header text
    brand_text = "SAFFRON & SAGE"
    subtitle_text = "ARTISANAL DINING & BAR"
    table_text = f"TABLE {table_number}"
    instructions_text = "Scan to Browse Menu, Order & Pay Online"

    # Fallback to default font or draw nicely
    try:
        font_brand = ImageFont.truetype("arial.ttf", 36)
        font_sub = ImageFont.truetype("arial.ttf", 16)
        font_table = ImageFont.truetype("arialbd.ttf", 44)
        font_inst = ImageFont.truetype("arial.ttf", 18)
    except Exception:
        font_brand = ImageFont.load_default()
        font_sub = font_brand
        font_table = font_brand
        font_inst = font_brand

    # Center Brand Header
    draw.text((card_w // 2, 60), brand_text, fill="#173D2D", font=font_brand, anchor="mm")
    draw.text((card_w // 2, 100), subtitle_text, fill="#C6A15B", font=font_sub, anchor="mm")

    # Table badge
    draw.rounded_rectangle([150, 130, card_w - 150, 195], radius=12, fill="#173D2D")
    draw.text((card_w // 2, 162), table_text, fill="#F7F3E8", font=font_table, anchor="mm")

    # Paste QR Code in center
    qr_w, qr_h = qr_img.size
    offset_x = (card_w - qr_w) // 2
    offset_y = 230
    card.paste(qr_img, (offset_x, offset_y))

    # Instructions at bottom
    draw.text((card_w // 2, offset_y + qr_h + 35), instructions_text, fill="#242820", font=font_inst, anchor="mm")
    draw.text((card_w // 2, offset_y + qr_h + 70), "Powered by Cashfree Payments", fill="#77786F", font=font_sub, anchor="mm")

    # Save
    card.save(filepath, format="PNG")
    return f"/uploads/qrcodes/{filename}"

def generate_general_qr() -> str:
    """
    Generates a general restaurant QR code leading to the homepage
    """
    filename = "general_menu_qr.png"
    filepath = os.path.join(settings.QR_DIR, filename)
    target_url = f"{settings.FRONTEND_BASE_URL}/"

    qr = qrcode.QRCode(
        version=1,
        error_correction=qrcode.constants.ERROR_CORRECT_H,
        box_size=10,
        border=2,
    )
    qr.add_data(target_url)
    qr.make(fit=True)
    qr_img = qr.make_image(fill_color="#173D2D", back_color="#FCFAF5").convert("RGB")

    card_w, card_h = 550, 680
    card = Image.new("RGB", (card_w, card_h), "#FCFAF5")
    draw = ImageDraw.Draw(card)

    draw.rectangle([15, 15, card_w - 15, card_h - 15], outline="#C6A15B", width=3)
    
    try:
        font_brand = ImageFont.truetype("arial.ttf", 34)
        font_sub = ImageFont.truetype("arial.ttf", 16)
        font_inst = ImageFont.truetype("arial.ttf", 18)
    except Exception:
        font_brand = ImageFont.load_default()
        font_sub = font_brand
        font_inst = font_brand

    draw.text((card_w // 2, 55), "SAFFRON & SAGE", fill="#173D2D", font=font_brand, anchor="mm")
    draw.text((card_w // 2, 95), "FINE DINING & HOSPITALITY", fill="#C6A15B", font=font_sub, anchor="mm")

    qr_w, qr_h = qr_img.size
    offset_x = (card_w - qr_w) // 2
    offset_y = 135
    card.paste(qr_img, (offset_x, offset_y))

    draw.text((card_w // 2, offset_y + qr_h + 35), "Scan to Explore Restaurant & Reserve", fill="#242820", font=font_inst, anchor="mm")
    card.save(filepath, format="PNG")
    return f"/uploads/qrcodes/{filename}"
