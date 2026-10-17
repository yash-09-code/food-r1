from sqlalchemy.orm import Session
from backend.database import SessionLocal, engine, Base
from backend.models.models import (
    User, RestaurantSetting, WebsiteContent, Category, MenuItem,
    MenuItemVariant, MenuItemAddon, RestaurantTable, Promotion, Testimonial, GalleryImage
)
from backend.core.security import get_password_hash
from backend.services.qr_service import generate_table_qr, generate_general_qr

def seed_database():
    Base.metadata.create_all(bind=engine)
    db = SessionLocal()

    try:
        # 1. Seed Users
        if not db.query(User).filter(User.email == "admin@saffronsage.in").first():
            admin_user = User(
                email="admin@saffronsage.in",
                hashed_password=get_password_hash("Admin@123456"),
                full_name="Chef Vikramaditya Roy",
                phone="+91 98765 43210",
                role="admin",
                is_active=True
            )
            staff_user = User(
                email="staff@saffronsage.in",
                hashed_password=get_password_hash("Staff@123456"),
                full_name="Priya Sharma (Floor Captain)",
                phone="+91 98765 12345",
                role="staff",
                is_active=True
            )
            customer_user = User(
                email="guest@saffronsage.in",
                hashed_password=get_password_hash("Customer@123456"),
                full_name="Arjun Mehta",
                phone="+91 98111 22233",
                role="customer",
                is_active=True
            )
            db.add_all([admin_user, staff_user, customer_user])
            db.commit()

        # 2. Seed Settings
        default_settings = [
            ("restaurant_name", "Saffron & Sage Fine Dining", "Official Restaurant Name"),
            ("tagline", "Artisanal Gastronomy & Handcrafted Elixirs", "Brand Tagline"),
            ("address", "Plot 42, Heritage Boulevard, Indiranagar, Bengaluru, Karnataka 560038", "Physical Address"),
            ("phone", "+91 80 4965 2100", "Reservation and Order Helpline"),
            ("email", "reservations@saffronsage.in", "Official Email"),
            ("opening_hours", "Mon - Sun: 12:00 PM – 11:30 PM", "Operating Hours"),
            ("weekly_holidays", "None (Open 7 Days)", "Weekly Holidays"),
            ("temporary_closure_notice", "", "Temporary notice if closed"),
            ("currency", "INR", "Billing Currency"),
            ("tax_rate_percent", "5.0", "Goods & Services Tax (GST %)"),
            ("packaging_fee", "25.0", "Packaging Fee for Pickup & Delivery"),
            ("delivery_fee", "40.0", "Delivery Fee (Flat)"),
            ("service_fee", "0.0", "Optional Service Charge for Dine-in"),
            ("latitude", "12.9716", "Map Latitude"),
            ("longitude", "77.6412", "Map Longitude"),
            ("map_embed_url", "https://maps.google.com/maps?q=12.9716,77.6412&hl=en&z=15&output=embed", "Google Maps Embed URL")
        ]

        for key, val, desc in default_settings:
            if not db.query(RestaurantSetting).filter(RestaurantSetting.key == key).first():
                db.add(RestaurantSetting(key=key, value=val, description=desc))
        db.commit()

        # 3. Seed Website Content
        sections = [
            WebsiteContent(
                section_key="hero",
                title="Artisanal Dining & Botanical Elixirs",
                subtitle="Where centuries-old culinary heritage harmonizes with progressive modern gastronomy in Bengaluru.",
                content="Immerse yourself in sensory balance, wood-fired nuances, and fragrant botanicals curated by Master Chef Vikramaditya Roy.",
                image_url="https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&w=1600&q=80",
                button_text="Explore Our Menu",
                button_url="/menu",
                display_order=1
            ),
            WebsiteContent(
                section_key="story",
                title="Our Culinary Heritage & Vision",
                subtitle="A Celebration of Native Botanicals and Timeless Technique",
                content="Saffron & Sage was born out of a deep reverence for regional Indian spices, slow clay-pot cooking, and artisanal fermentation. Every grain is single-estate, every oil cold-pressed in small batches, and every spice blend ground fresh each morning.",
                image_url="https://images.unsplash.com/photo-1555396273-367ea4eb4db5?auto=format&fit=crop&w=1200&q=80",
                button_text="Read Full Story",
                button_url="/about",
                display_order=2
            ),
            WebsiteContent(
                section_key="announcement",
                title="Autumn Truffle & Saffron Festival",
                subtitle="Experience our chef-exclusive 7-course tasting menu paired with artisanal mocktails.",
                content="Available every Friday & Saturday evening through this season. Reservations recommended.",
                image_url=None,
                button_text="Reserve Tasting Table",
                button_url="/reservations",
                display_order=3
            ),
            WebsiteContent(
                section_key="footer",
                title="Saffron & Sage",
                subtitle="Fine Dining & Botanical Bar",
                content="Honoring Indian biodiversity and elevated hospitality. Experience seamless dining at your table with QR ordering.",
                display_order=4
            )
        ]

        for s in sections:
            if not db.query(WebsiteContent).filter(WebsiteContent.section_key == s.section_key).first():
                db.add(s)
        db.commit()

        # 4. Seed Categories
        cats_data = [
            ("Small Plates & Starters", "starters", "Refined appetisers celebrating crisp textures and delicate spices", "https://images.unsplash.com/photo-1541544741938-0af808871cc0?auto=format&fit=crop&w=800&q=80", 1),
            ("Clay Oven & Tandoor", "tandoor", "Infused with hickory smoke and roasted over white-hot embers", "https://images.unsplash.com/photo-1599488615731-7e5c2823ff28?auto=format&fit=crop&w=800&q=80", 2),
            ("Artisanal Mains & Curries", "mains", "Slow-simmered regional gravies infused with hand-pounded aromatics", "https://images.unsplash.com/photo-1585937421612-70a008356fbe?auto=format&fit=crop&w=800&q=80", 3),
            ("Heritage Breads & Biryanis", "breads-rice", "Aged basmati dum biryanis and clay-oven leavened breads", "https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?auto=format&fit=crop&w=800&q=80", 4),
            ("Signature Desserts", "desserts", "Delicate confections honoring saffron, pistachios, and wild berries", "https://images.unsplash.com/photo-1551024709-8f23befc6f87?auto=format&fit=crop&w=800&q=80", 5),
            ("Botanical Beverages", "beverages", "House-crafted cordials, fermented spritzers, and single-origin teas", "https://images.unsplash.com/photo-1513558161293-cdaf765ed2fd?auto=format&fit=crop&w=800&q=80", 6),
        ]

        category_map = {}
        for name, slug, desc, img, order in cats_data:
            cat = db.query(Category).filter(Category.slug == slug).first()
            if not cat:
                cat = Category(name=name, slug=slug, description=desc, image_url=img, display_order=order)
                db.add(cat)
                db.commit()
                db.refresh(cat)
            category_map[slug] = cat.id

        # 5. Seed Dishes
        dishes_data = [
            {
                "category_id": category_map["starters"],
                "name": "Smoked Truffle Galouti",
                "slug": "smoked-truffle-galouti",
                "description": "Melt-in-mouth wild portobello and chestnut medallions infused with Kashmiri saffron and cold-pressed white truffle oil, served on mini saffron warqi parathas.",
                "base_price": 480.0,
                "image_url": "https://images.unsplash.com/photo-1541544741938-0af808871cc0?auto=format&fit=crop&w=800&q=80",
                "is_veg": True,
                "spice_level": 1,
                "is_featured": True,
                "is_bestseller": True,
                "variants": [("Standard Portion (4 pcs)", 0.0), ("Grand Tasting (8 pcs)", 390.0)],
                "addons": [("Extra Truffle Butter Emulsion", 75.0), ("Crispy Saffron Crisp", 45.0)]
            },
            {
                "category_id": category_map["tandoor"],
                "name": "Kashmiri Morels & Malai Paneer Tikka",
                "slug": "kashmiri-morels-malai-paneer-tikka",
                "description": "Artisanal buffalo paneer stuffed with wild Himalayan morels, marinated in hung curd, green cardamom, and toasted pistachios, char-grilled over embers.",
                "base_price": 440.0,
                "image_url": "https://images.unsplash.com/photo-1567188040759-fb8a883dc6d8?auto=format&fit=crop&w=800&q=80",
                "is_veg": True,
                "spice_level": 1,
                "is_featured": True,
                "variants": [("Single Skewer", 0.0), ("Double Platter", 360.0)],
                "addons": [("Smoked Mint Chutney", 30.0), ("Extra Charred Morel", 90.0)]
            },
            {
                "category_id": category_map["tandoor"],
                "name": "Ghee Roast Mangalorean Prawns",
                "slug": "ghee-roast-mangalorean-prawns",
                "description": "Wild ocean tiger prawns flash-tossed in artisanal Kundapur chili paste, curry leaf crisp, and cultured A2 cow ghee.",
                "base_price": 640.0,
                "image_url": "https://images.unsplash.com/photo-1559742811-822873691df8?auto=format&fit=crop&w=800&q=80",
                "is_veg": False,
                "spice_level": 2,
                "is_featured": True,
                "is_bestseller": True,
                "variants": [("Regular (6 Prawns)", 0.0), ("Jumbo Feast (10 Prawns)", 420.0)],
                "addons": [("Appam Pair", 60.0), ("Curry Leaf Butter", 40.0)]
            },
            {
                "category_id": category_map["mains"],
                "name": "Dal Saffron & Sage (24-Hour Slow Cooked)",
                "slug": "dal-saffron-and-sage",
                "description": "Organic black urad lentils gently simmered over slow charcoal for twenty-four hours with San Marzano tomatoes, fenugreek, and smoked churned butter.",
                "base_price": 380.0,
                "image_url": "https://images.unsplash.com/photo-1546833999-b9f581a1996d?auto=format&fit=crop&w=800&q=80",
                "is_veg": True,
                "spice_level": 0,
                "is_featured": True,
                "is_bestseller": True,
                "variants": [("Regular Bowl", 0.0), ("Large Family Pot", 280.0)],
                "addons": [("Dollop of Smoked White Butter", 35.0), ("Garlic Naan Combo", 70.0)]
            },
            {
                "category_id": category_map["mains"],
                "name": "Braised Kashmiri Lamb Shank Rogan Josh",
                "slug": "braised-kashmiri-lamb-shank",
                "description": "Tender pasture-raised lamb shank slow-braised on the bone with whole ratan jot root, mace, fennel seed, and sweet red chili gravy.",
                "base_price": 760.0,
                "image_url": "https://images.unsplash.com/photo-1545247181-516773ca838b?auto=format&fit=crop&w=800&q=80",
                "is_veg": False,
                "spice_level": 2,
                "is_featured": True,
                "is_bestseller": True,
                "variants": [("Single Shank", 0.0), ("Double Shank Platter", 650.0)],
                "addons": [("Saffron Pulao Rice", 90.0), ("Extra Rogan Gravy", 80.0)]
            },
            {
                "category_id": category_map["breads-rice"],
                "name": "Dum Awadhi Chicken Biryani",
                "slug": "dum-awadhi-chicken-biryani",
                "description": "Long-grain aged basmati rice layered with free-range chicken steeped in saffron yakhni stock, sealed with dough and slow dum cooked.",
                "base_price": 540.0,
                "image_url": "https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?auto=format&fit=crop&w=800&q=80",
                "is_veg": False,
                "spice_level": 1,
                "is_featured": True,
                "is_bestseller": True,
                "variants": [("Standard Portion", 0.0), ("Handi Platter (2-3 Pax)", 480.0)],
                "addons": [("Burani Garlic Raita", 45.0), ("Mirchi Ka Salan", 50.0)]
            },
            {
                "category_id": category_map["breads-rice"],
                "name": "Wild Garlic & Truffle Butter Naan",
                "slug": "wild-garlic-truffle-butter-naan",
                "description": "Hand-stretched organic leavened flour blistered in clay oven, brushed with cultured butter, roast garlic slivers, and truffle glaze.",
                "base_price": 140.0,
                "image_url": "https://images.unsplash.com/photo-1533777857889-4be7c70b33f7?auto=format&fit=crop&w=800&q=80",
                "is_veg": True,
                "spice_level": 0,
                "variants": [("1 Piece", 0.0), ("Basket of 3", 220.0)],
                "addons": [("Extra Melted Cheese Layer", 60.0)]
            },
            {
                "category_id": category_map["desserts"],
                "name": "Persian Saffron & Pistachio Kulfi Gelato",
                "slug": "persian-saffron-pistachio-kulfi",
                "description": "Slowly condensed A2 milk churned into silken gelato with saffron threads, roasted Iranian pistachios, and delicate candied rose petals.",
                "base_price": 320.0,
                "image_url": "https://images.unsplash.com/photo-1505394033641-40c6ad1178d7?auto=format&fit=crop&w=800&q=80",
                "is_veg": True,
                "is_featured": True,
                "variants": [("Two Scoops", 0.0), ("Tasting Trio with Falooda", 160.0)],
                "addons": [("Gold Leaf Flake", 80.0), ("Cardamom Rabri Drizzle", 40.0)]
            },
            {
                "category_id": category_map["beverages"],
                "name": "Kokum & Basil Botanical Spritz",
                "slug": "kokum-basil-botanical-spritz",
                "description": "Sundried Malabar kokum infusion, fresh Thai holy basil, smoked sea salt, artisanal tonic, and wild mountain honey.",
                "base_price": 260.0,
                "image_url": "https://images.unsplash.com/photo-1513558161293-cdaf765ed2fd?auto=format&fit=crop&w=800&q=80",
                "is_veg": True,
                "is_featured": True,
                "variants": [("Chilled Glass", 0.0), ("Pitcher (Serves 4)", 650.0)],
                "addons": [("Chia Seed Infusion", 25.0)]
            }
        ]

        for d in dishes_data:
            existing_dish = db.query(MenuItem).filter(MenuItem.slug == d["slug"]).first()
            if not existing_dish:
                dish = MenuItem(
                    category_id=d["category_id"],
                    name=d["name"],
                    slug=d["slug"],
                    description=d["description"],
                    base_price=d["base_price"],
                    image_url=d["image_url"],
                    is_veg=d.get("is_veg", True),
                    spice_level=d.get("spice_level", 0),
                    is_featured=d.get("is_featured", False),
                    is_bestseller=d.get("is_bestseller", False),
                    is_available=True
                )
                db.add(dish)
                db.flush()

                for v_name, v_adj in d.get("variants", []):
                    db.add(MenuItemVariant(menu_item_id=dish.id, name=v_name, price_adjustment=v_adj))

                for a_name, a_price in d.get("addons", []):
                    db.add(MenuItemAddon(menu_item_id=dish.id, name=a_name, price=a_price))
        db.commit()

        # 6. Seed Restaurant Tables (T01 through T08)
        tables_data = [
            ("T01", 2, "Window Alcove"),
            ("T02", 4, "Main Dining Hall"),
            ("T03", 4, "Main Dining Hall"),
            ("T04", 6, "Courtyard Terrace"),
            ("T05", 4, "Courtyard Terrace"),
            ("T06", 8, "Private Dining Salon"),
            ("T07", 2, "Botanical Garden"),
            ("T08", 4, "Botanical Garden"),
        ]

        for t_num, cap, loc in tables_data:
            t = db.query(RestaurantTable).filter(RestaurantTable.table_number == t_num).first()
            if not t:
                qr_url = generate_table_qr(t_num)
                db.add(RestaurantTable(
                    table_number=t_num,
                    capacity=cap,
                    location_tag=loc,
                    qr_code_url=qr_url,
                    is_active=True
                ))
        generate_general_qr()
        db.commit()

        # 7. Seed Promotions
        promos = [
            ("WELCOME10", "10% off on orders above ₹500", "percentage", 10.0, 500.0),
            ("SAFFRON20", "20% off on grand dining above ₹1500", "percentage", 20.0, 1500.0),
            ("CHEF100", "Flat ₹100 discount on dinner above ₹800", "fixed", 100.0, 800.0),
        ]
        for code, desc, d_type, val, min_amt in promos:
            if not db.query(Promotion).filter(Promotion.code == code).first():
                db.add(Promotion(code=code, description=desc, discount_type=d_type, discount_value=val, min_order_amount=min_amt))
        db.commit()

        # 8. Seed Testimonials
        testimonials = [
            ("Rohan & Gayatri Sen", "Food Critics, Epicurean Daily", 5, "The 24-hour Dal Saffron & Sage is simply transcendent. The table QR ordering was effortless, fast, and remarkably refined."),
            ("Chef Ananya Kapoor", "Restaurateur & Sommelier", 5, "Remarkable balance of native spices with modern plating. Ordering straight from Table 05 made our celebration completely seamless."),
            ("Kavita Sundaram", "Verified Guest", 5, "Best dining experience in Bengaluru. The Mangalorean Prawn Ghee Roast and botanical spritz are unmatched. We'll be back every month.")
        ]
        for name, title, rating, comment in testimonials:
            if not db.query(Testimonial).filter(Testimonial.customer_name == name).first():
                db.add(Testimonial(customer_name=name, customer_title=title, rating=rating, comment=comment, is_approved=True))
        db.commit()

        # 9. Seed Gallery Images
        gallery_images = [
            ("Heritage Courtyard Ambience", "Ambience", "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&w=1000&q=80", 1),
            ("Truffle Portobello Galouti Plating", "Dishes", "https://images.unsplash.com/photo-1541544741938-0af808871cc0?auto=format&fit=crop&w=1000&q=80", 2),
            ("Handcrafted Kokum Spritz", "Cocktails", "https://images.unsplash.com/photo-1513558161293-cdaf765ed2fd?auto=format&fit=crop&w=1000&q=80", 3),
            ("Wood-Fired Clay Oven & Embers", "Kitchen", "https://images.unsplash.com/photo-1555396273-367ea4eb4db5?auto=format&fit=crop&w=1000&q=80", 4),
            ("Private Dining Salon", "Ambience", "https://images.unsplash.com/photo-1550966871-3ed3cdb5ed0c?auto=format&fit=crop&w=1000&q=80", 5),
            ("Aged Awadhi Dum Handi", "Dishes", "https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?auto=format&fit=crop&w=1000&q=80", 6),
        ]
        for title, cat, img_url, order in gallery_images:
            if not db.query(GalleryImage).filter(GalleryImage.title == title).first():
                db.add(GalleryImage(title=title, category=cat, image_url=img_url, display_order=order))
        db.commit()

        print("Database seeded successfully with users, settings, content, menu, tables, and promotions!")
    except Exception as e:
        print(f"Error seeding database: {e}")
        db.rollback()
    finally:
        db.close()

if __name__ == "__main__":
    seed_database()
