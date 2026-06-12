"""Seed the database with sample STEM resources.

Mirrors the frontend mock data so the API serves the same records the UI
was prototyped against. Run with:  python -m app.seed
"""
from geoalchemy2.elements import WKTElement

from app.db.init_db import init_db
from app.db.session import SessionLocal
from app.models.machine import Machine
from app.models.resource import Resource

RESOURCES = [
    {
        "name": "FabLab IIT Delhi",
        "type": "Makerspace",
        "city": "New Delhi",
        "state": "Delhi",
        "status": "Working",
        "description": "A comprehensive makerspace with state-of-the-art equipment and facilities for prototyping and design. Open to students, researchers, and the wider innovation community.",
        "address": "Block IV, IIT Delhi, Hauz Khas, New Delhi, Delhi 110016",
        "contact": "fablab@iitd.ac.in",
        "phone": "+91-11-2659-1234",
        "website": "https://fablab.iitd.ac.in",
        "facilities": ["3D Printing", "Laser Cutting", "CNC Machines", "Electronics Lab"],
        "lat": 28.5450,
        "lng": 77.1926,
    },
    {
        "name": "ATAL Tinkering Lab — KV No. 1",
        "type": "ATAL Lab",
        "city": "Mumbai",
        "state": "Maharashtra",
        "status": "Working",
        "description": "ATAL Tinkering Lab focusing on innovation and entrepreneurship for young innovators. Equipped for robotics, electronics, and rapid prototyping projects.",
        "address": "Kendriya Vidyalaya No. 1, Colaba, Mumbai, Maharashtra 400005",
        "contact": "atl.kv1mum@gov.in",
        "phone": "+91-22-1234-5678",
        "website": "https://atl.gov.in",
        "facilities": ["Robotics", "Electronics Lab", "3D Printing"],
        "lat": 19.0760,
        "lng": 72.8777,
    },
    {
        "name": "Tinkerers' Paradise",
        "type": "Makerspace",
        "city": "Bangalore",
        "state": "Karnataka",
        "status": "Working",
        "description": "Community-run makerspace offering shared access to fabrication tools, workshops, and a collaborative environment for hobbyists and startups alike.",
        "address": "45, 2nd Cross Rd, Koramangala, Bengaluru, Karnataka 560034",
        "contact": "hello@tinkerersparadise.in",
        "phone": "+91-80-4567-8910",
        "website": "https://tinkerersparadise.in",
        "facilities": ["3D Printing", "Wood Workshop", "Electronics Lab", "Laser Cutting"],
        "lat": 12.9716,
        "lng": 77.5946,
    },
    {
        "name": "STEM Ventures India",
        "type": "Vendor",
        "city": "Pune",
        "state": "Maharashtra",
        "status": "Working",
        "description": "Supplier of STEM lab equipment, robotics kits, and classroom learning solutions for schools and institutions across India.",
        "address": "Plot 12, Hinjawadi Phase 1, Pune, Maharashtra 411057",
        "contact": "sales@stemventures.in",
        "phone": "+91-20-2345-6789",
        "website": "https://stemventures.in",
        "facilities": ["Robotics", "Electronics Lab", "Testing Equipment"],
        "lat": 18.5204,
        "lng": 73.8567,
    },
    {
        "name": "ATAL Innovation Centre Chennai",
        "type": "ATAL Lab",
        "city": "Chennai",
        "state": "Tamil Nadu",
        "status": "Working",
        "description": "Innovation centre nurturing early-stage hardware startups with mentorship, prototyping facilities, and incubation support.",
        "address": "IIT Madras Research Park, Taramani, Chennai, Tamil Nadu 600113",
        "contact": "info@aicchennai.org",
        "phone": "+91-44-3456-7890",
        "website": "https://aicchennai.org",
        "facilities": ["3D Printing", "PCB Fabrication", "Electronics Lab", "VR/AR Equipment"],
        "lat": 13.0827,
        "lng": 80.2707,
    },
    {
        "name": "Maker's Asylum",
        "type": "Makerspace",
        "city": "Mumbai",
        "state": "Maharashtra",
        "status": "Working",
        "description": "A hands-on innovation space running fellowships, bootcamps, and open lab hours focused on solving real-world problems through making.",
        "address": "Ground Floor, Sun Mill Compound, Lower Parel, Mumbai, Maharashtra 400013",
        "contact": "connect@makersasylum.com",
        "phone": "+91-22-9876-5432",
        "website": "https://makersasylum.com",
        "facilities": ["Laser Cutting", "CNC Machines", "Metal Workshop", "Wood Workshop"],
        "lat": 19.1136,
        "lng": 72.8697,
    },
    {
        "name": "ATAL Tinkering Lab — Govt. School Jaipur",
        "type": "ATAL Lab",
        "city": "Jaipur",
        "state": "Rajasthan",
        "status": "Planned",
        "description": "An upcoming ATAL Tinkering Lab set to bring hands-on STEM learning to government school students in the region.",
        "address": "Govt. Senior Secondary School, Civil Lines, Jaipur, Rajasthan 302006",
        "contact": "atl.jaipur@gov.in",
        "phone": "+91-141-2233-4455",
        "website": "https://atl.gov.in",
        "facilities": ["Robotics", "Electronics Lab"],
        "lat": 26.9124,
        "lng": 75.7873,
    },
    {
        "name": "Hyderabad Hardware Hub",
        "type": "Makerspace",
        "city": "Hyderabad",
        "state": "Telangana",
        "status": "Temporarily Closed",
        "description": "A fabrication-focused makerspace currently closed for facility upgrades. Reopening planned with expanded CNC and PCB capabilities.",
        "address": "3rd Floor, HITEC City, Madhapur, Hyderabad, Telangana 500081",
        "contact": "team@hwhub.in",
        "phone": "+91-40-6677-8899",
        "website": "https://hwhub.in",
        "facilities": ["CNC Machines", "PCB Fabrication", "3D Printing"],
        "lat": 17.3850,
        "lng": 78.4867,
    },
    {
        "name": "EduTech Instruments Pvt. Ltd.",
        "type": "Vendor",
        "city": "Ahmedabad",
        "state": "Gujarat",
        "status": "Working",
        "description": "Manufacturer and distributor of laboratory instruments and STEM teaching aids for educational institutions.",
        "address": "Unit 7, GIDC Estate, Vatva, Ahmedabad, Gujarat 382445",
        "contact": "support@edutechinstruments.com",
        "phone": "+91-79-5566-7788",
        "website": "https://edutechinstruments.com",
        "facilities": ["Testing Equipment", "Electronics Lab"],
        "lat": 23.0225,
        "lng": 72.5714,
    },
    {
        "name": "Kolkata Robotics Lab",
        "type": "Makerspace",
        "city": "Kolkata",
        "state": "West Bengal",
        "status": "Permanently Closed",
        "description": "A former community robotics lab that has ceased operations. Listing retained for historical reference.",
        "address": "21, Salt Lake Sector V, Kolkata, West Bengal 700091",
        "contact": "archive@kolkatarobotics.in",
        "phone": "+91-33-1122-3344",
        "website": "https://kolkatarobotics.in",
        "facilities": ["Robotics", "Electronics Lab"],
        "lat": 22.5726,
        "lng": 88.3639,
    },
]


def seed() -> None:
    init_db()
    db = SessionLocal()
    try:
        if db.query(Resource).count() > 0:
            print("Database already seeded — skipping.")
            return

        for item in RESOURCES:
            resource = Resource(
                name=item["name"],
                type=item["type"],
                status=item["status"],
                full_description=item["description"],
                short_description=item["description"][:500],
                address_line1=item["address"],
                city=item["city"],
                district=item["city"],
                state=item["state"],
                latitude=item["lat"],
                longitude=item["lng"],
                location=WKTElement(f"POINT({item['lng']} {item['lat']})", srid=4326),
                contact_phone=item["phone"],
                contact_email=item["contact"],
                website=item["website"],
                facilities=item["facilities"],
                is_verified=item["status"] == "Working",
            )
            # Create one machine per facility tag for structured data.
            resource.machines = [
                Machine(name=f, category=f, quantity=1, availability_status="Available")
                for f in item["facilities"]
            ]
            db.add(resource)

        db.commit()
        print(f"Seeded {len(RESOURCES)} resources.")
    finally:
        db.close()


if __name__ == "__main__":
    seed()
