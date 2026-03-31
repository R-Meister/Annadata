"""Seed script — populate the database with initial quests and sample data."""

import asyncio
import uuid
from database import AsyncSessionLocal, init_db
from models.quest import Quest, QuestCategory, QuestType, VerificationType


SEED_QUESTS = [
    {
        "title": "Start Composting Farm Waste",
        "title_hi": "खेत के कचरे से खाद बनाना शुरू करें",
        "description": "Set up a compost pit and start converting crop residues and animal waste into organic compost.",
        "description_hi": "खाद गड्ढा बनाएं और फसल अवशेषों और पशु अपशिष्ट को जैविक खाद में बदलना शुरू करें।",
        "category": QuestCategory.ORGANIC,
        "quest_type": QuestType.WEEKLY,
        "difficulty": 1,
        "xp_reward": 150,
        "duration_days": 14,
        "verification_type": VerificationType.PHOTO,
        "steps": {"steps": [
            {"step": 1, "action": "Dig a compost pit (3ft x 3ft x 3ft)"},
            {"step": 2, "action": "Layer green waste, brown waste, and soil"},
            {"step": 3, "action": "Water the pile and cover it"},
            {"step": 4, "action": "Take a photo of your compost pit"},
        ]},
    },
    {
        "title": "Switch to Bio-Pesticides",
        "title_hi": "जैव कीटनाशकों पर स्विच करें",
        "description": "Replace chemical pesticides with neem-based or Trichoderma-based bio-pesticides for one crop cycle.",
        "description_hi": "एक फसल चक्र के लिए रासायनिक कीटनाशकों को नीम या ट्राइकोडर्मा आधारित जैव कीटनाशकों से बदलें।",
        "category": QuestCategory.PEST,
        "quest_type": QuestType.SEASONAL,
        "difficulty": 3,
        "xp_reward": 250,
        "duration_days": 90,
        "verification_type": VerificationType.PHOTO,
        "steps": {"steps": [
            {"step": 1, "action": "Purchase neem oil or Trichoderma from local agri-store"},
            {"step": 2, "action": "Prepare spray solution as per instructions"},
            {"step": 3, "action": "Apply to crops every 10-15 days"},
            {"step": 4, "action": "Document each application with photo"},
        ]},
    },
    {
        "title": "Install Drip Irrigation",
        "title_hi": "ड्रिप सिंचाई स्थापित करें",
        "description": "Set up drip irrigation on at least 0.5 acres to reduce water usage by 40-60%.",
        "description_hi": "पानी की खपत 40-60% कम करने के लिए कम से कम 0.5 एकड़ पर ड्रिप सिंचाई लगाएं।",
        "category": QuestCategory.WATER,
        "quest_type": QuestType.EPIC,
        "difficulty": 4,
        "xp_reward": 400,
        "duration_days": 30,
        "verification_type": VerificationType.PHOTO,
        "steps": {"steps": [
            {"step": 1, "action": "Plan layout for drip lines"},
            {"step": 2, "action": "Purchase drip kit (check government subsidy)"},
            {"step": 3, "action": "Install main line, sub-lines, and drippers"},
            {"step": 4, "action": "Test the system and take photo"},
        ]},
    },
    {
        "title": "Conduct Soil Test",
        "title_hi": "मिट्टी परीक्षण कराएं",
        "description": "Collect soil samples and get them tested at a soil testing lab. Upload the report.",
        "description_hi": "मिट्टी के नमूने इकट्ठा करें और उन्हें मिट्टी परीक्षण प्रयोगशाला में परीक्षण कराएं। रिपोर्ट अपलोड करें।",
        "category": QuestCategory.SOIL,
        "quest_type": QuestType.WEEKLY,
        "difficulty": 2,
        "xp_reward": 100,
        "duration_days": 14,
        "verification_type": VerificationType.PHOTO,
        "steps": {"steps": [
            {"step": 1, "action": "Collect soil samples from 5-6 spots in field (6 inch depth)"},
            {"step": 2, "action": "Mix samples and take 500g to the lab"},
            {"step": 3, "action": "Submit for N, P, K, pH, and organic carbon testing"},
            {"step": 4, "action": "Upload the soil test report"},
        ]},
    },
    {
        "title": "Plant Hedgerow Along Field Boundary",
        "title_hi": "खेत की सीमा पर बाड़ लगाएं",
        "description": "Plant native shrubs or trees along your field boundary to support pollinators and pest predators.",
        "description_hi": "परागणकों और कीट शिकारियों को सहारा देने के लिए अपने खेत की सीमा पर देशी झाड़ियां या पेड़ लगाएं।",
        "category": QuestCategory.BIODIVERSITY,
        "quest_type": QuestType.SEASONAL,
        "difficulty": 3,
        "xp_reward": 300,
        "duration_days": 60,
        "verification_type": VerificationType.PHOTO,
        "steps": {"steps": [
            {"step": 1, "action": "Select native species (e.g., Drumstick, Gliricidia, Subabul)"},
            {"step": 2, "action": "Prepare planting pits along boundary"},
            {"step": 3, "action": "Plant saplings at 2m spacing"},
            {"step": 4, "action": "Photo of planted hedgerow"},
        ]},
    },
    {
        "title": "Practice Crop Rotation",
        "title_hi": "फसल चक्र अपनाएं",
        "description": "Plan and implement crop rotation: follow a cereal with a legume to restore soil nitrogen.",
        "description_hi": "फसल चक्र की योजना बनाएं: मिट्टी में नाइट्रोजन बहाल करने के लिए अनाज के बाद दलहन उगाएं।",
        "category": QuestCategory.ROTATION,
        "quest_type": QuestType.SEASONAL,
        "difficulty": 2,
        "xp_reward": 200,
        "duration_days": 120,
        "verification_type": VerificationType.SELF_REPORT,
        "steps": {"steps": [
            {"step": 1, "action": "Plan next crop based on rotation chart"},
            {"step": 2, "action": "If planted cereal last season, choose legume (chickpea, lentil, moong)"},
            {"step": 3, "action": "Sow the rotational crop"},
            {"step": 4, "action": "Report completion after sowing"},
        ]},
    },
    {
        "title": "Log Daily Water Usage for 7 Days",
        "title_hi": "7 दिनों तक दैनिक पानी उपयोग दर्ज करें",
        "description": "Track how much water you use for irrigation each day for one week.",
        "description_hi": "एक सप्ताह तक प्रतिदिन सिंचाई में कितना पानी उपयोग करते हैं, इसे ट्रैक करें।",
        "category": QuestCategory.WATER,
        "quest_type": QuestType.DAILY,
        "difficulty": 1,
        "xp_reward": 75,
        "duration_days": 7,
        "verification_type": VerificationType.SELF_REPORT,
        "steps": {"steps": [
            {"step": 1, "action": "Note pump running time or water flow each day"},
            {"step": 2, "action": "Record in the app daily"},
            {"step": 3, "action": "Complete all 7 days"},
        ]},
    },
    {
        "title": "Attend a Sustainable Farming Workshop",
        "title_hi": "टिकाऊ खेती कार्यशाला में भाग लें",
        "description": "Attend a KVK or NGO workshop on sustainable farming and share your learnings.",
        "description_hi": "टिकाऊ खेती पर KVK या NGO कार्यशाला में भाग लें और अपनी सीख साझा करें।",
        "category": QuestCategory.COMMUNITY,
        "quest_type": QuestType.WEEKLY,
        "difficulty": 2,
        "xp_reward": 200,
        "duration_days": 30,
        "verification_type": VerificationType.PHOTO,
        "steps": {"steps": [
            {"step": 1, "action": "Find upcoming workshop (KVK, ATMA, or local NGO)"},
            {"step": 2, "action": "Attend the workshop"},
            {"step": 3, "action": "Take a selfie at the workshop"},
            {"step": 4, "action": "Share one key learning in the community feed"},
        ]},
    },
    {
        "title": "Mulch Your Field",
        "title_hi": "अपने खेत में मल्चिंग करें",
        "description": "Apply organic mulch (straw, dry leaves, or coir pith) to conserve soil moisture.",
        "description_hi": "मिट्टी की नमी बचाने के लिए जैविक मल्च (पुआल, सूखे पत्ते या नारियल जटा) डालें।",
        "category": QuestCategory.SOIL,
        "quest_type": QuestType.WEEKLY,
        "difficulty": 1,
        "xp_reward": 125,
        "duration_days": 7,
        "verification_type": VerificationType.PHOTO,
        "steps": {"steps": [
            {"step": 1, "action": "Collect mulch material (straw, leaves, coir)"},
            {"step": 2, "action": "Spread 2-3 inch layer around plants"},
            {"step": 3, "action": "Photo of mulched field"},
        ]},
    },
    {
        "title": "Help a Neighbor Complete a Quest",
        "title_hi": "पड़ोसी किसान की क्वेस्ट पूरी करने में मदद करें",
        "description": "Mentor another farmer and help them complete any quest on the platform.",
        "description_hi": "किसी अन्य किसान को मेंटर करें और उन्हें प्लेटफॉर्म पर कोई क्वेस्ट पूरी करने में मदद करें।",
        "category": QuestCategory.COMMUNITY,
        "quest_type": QuestType.WEEKLY,
        "difficulty": 2,
        "xp_reward": 175,
        "duration_days": 14,
        "verification_type": VerificationType.COMMUNITY_VERIFY,
        "steps": {"steps": [
            {"step": 1, "action": "Find a farmer who needs help (check Community tab)"},
            {"step": 2, "action": "Help them understand and complete their quest"},
            {"step": 3, "action": "Ask them to verify your help on the platform"},
        ]},
    },
]


async def seed_database():
    """Populate database with initial quest data."""
    await init_db()

    async with AsyncSessionLocal() as db:
        # Check if quests already seeded
        from sqlalchemy import select, func
        count_result = await db.execute(select(func.count()).select_from(Quest))
        existing = count_result.scalar() or 0

        if existing > 0:
            print(f"⚠️ Database already has {existing} quests. Skipping seed.")
            return

        for quest_data in SEED_QUESTS:
            quest = Quest(**quest_data)
            db.add(quest)

        await db.commit()
        print(f"✅ Seeded {len(SEED_QUESTS)} quests into the database.")


if __name__ == "__main__":
    asyncio.run(seed_database())
