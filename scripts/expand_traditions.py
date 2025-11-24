#!/usr/bin/env python3
"""
Expand traditions dataset to be comprehensive.
Adds meditation, psychedelics, therapy, somatic practices, etc.
"""

import json

# Read existing data
with open('data/traditions.json', 'r') as f:
    data = json.load(f)

# New traditions to add
new_traditions = [
    # === MEDITATION TRADITIONS ===
    {
        "id": "zen",
        "name": "Zen (Zazen)",
        "origin": "Japanese Buddhism",
        "yearOrigin": 1200,
        "parentTraditions": ["buddhism"],
        "description": "Sitting meditation emphasizing present-moment awareness and direct experience beyond conceptual thinking",
        "practices": ["Breath counting", "Shikantaza (just sitting)", "Koan practice", "Walking meditation"],
        "timeCommitment": "25-40 min daily",
        "guidanceNeeded": "Medium-High",
        "accessibility": "High",
        "effectiveness": {"adhd": 4, "depression": 4, "anxiety": 4, "trauma": 3, "focus": 5, "metacognition": 5, "insight": 5, "compassion": 4, "communication": 3, "empathy": 4, "bodyAwareness": 4, "emotionalRegulation": 4},
        "researchSupport": "High",
        "citations": ["Murata et al. (2004). EEG study of Zen meditation", "Chiesa & Malinowski (2011). Mindfulness-based approaches"]
    },
    {
        "id": "tm",
        "name": "Transcendental Meditation (TM)",
        "origin": "Vedic Tradition",
        "yearOrigin": 1955,
        "parentTraditions": ["vedanta"],
        "description": "Mantra-based meditation for accessing transcendent consciousness",
        "practices": ["Silent mantra repetition", "Effortless attention"],
        "timeCommitment": "20 min twice daily",
        "guidanceNeeded": "High",
        "accessibility": "Medium",
        "effectiveness": {"adhd": 4, "depression": 4, "anxiety": 5, "trauma": 3, "focus": 4, "metacognition": 3, "insight": 3, "compassion": 3, "communication": 2, "empathy": 3, "bodyAwareness": 2, "emotionalRegulation": 4},
        "researchSupport": "Very High",
        "citations": ["Orme-Johnson & Barnes (2014). Effects of TM on cardiovascular health", "Travis & Arenander (2006). Cross-sectional and longitudinal study of TM"]
    },
    {
        "id": "mbsr",
        "name": "Mindfulness-Based Stress Reduction (MBSR)",
        "origin": "Clinical Mindfulness",
        "yearOrigin": 1979,
        "parentTraditions": ["vipassana"],
        "description": "Structured 8-week program combining vipassana, body scan, and yoga for stress reduction",
        "practices": ["Body scan", "Sitting meditation", "Mindful yoga", "Walking meditation"],
        "timeCommitment": "45 min daily + weekly class",
        "guidanceNeeded": "Medium",
        "accessibility": "Very High",
        "effectiveness": {"adhd": 3, "depression": 5, "anxiety": 5, "trauma": 4, "focus": 4, "metacognition": 4, "insight": 4, "compassion": 4, "communication": 3, "empathy": 4, "bodyAwareness": 5, "emotionalRegulation": 5},
        "researchSupport": "Very High",
        "citations": ["Kabat-Zinn (1990). Full Catastrophe Living", "Grossman et al. (2004). Meta-analysis of MBSR"]
    },
    {
        "id": "mbct",
        "name": "Mindfulness-Based Cognitive Therapy (MBCT)",
        "origin": "Clinical Psychology",
        "yearOrigin": 1995,
        "parentTraditions": ["mbsr", "cbt"],
        "description": "Integration of mindfulness and cognitive therapy for depression relapse prevention",
        "practices": ["Mindfulness meditation", "Cognitive reframing", "Decentering from thoughts"],
        "timeCommitment": "8-week program + daily practice",
        "guidanceNeeded": "High",
        "accessibility": "High",
        "effectiveness": {"adhd": 3, "depression": 5, "anxiety": 5, "trauma": 3, "focus": 4, "metacognition": 5, "insight": 5, "compassion": 3, "communication": 3, "empathy": 3, "bodyAwareness": 4, "emotionalRegulation": 5},
        "researchSupport": "Very High",
        "citations": ["Segal et al. (2002). Mindfulness-Based Cognitive Therapy", "Piet & Hougaard (2011). MBCT meta-analysis"]
    },
    {
        "id": "tonglen",
        "name": "Tonglen (Giving and Receiving)",
        "origin": "Tibetan Buddhism",
        "yearOrigin": 1000,
        "parentTraditions": ["buddhism"],
        "description": "Compassion practice involving visualized exchange of suffering for wellbeing",
        "practices": ["Breath-based visualization", "Taking in suffering", "Sending out relief"],
        "timeCommitment": "15-30 min daily",
        "guidanceNeeded": "Medium",
        "accessibility": "Medium",
        "effectiveness": {"adhd": 2, "depression": 4, "anxiety": 3, "trauma": 3, "focus": 3, "metacognition": 4, "insight": 4, "compassion": 5, "communication": 4, "empathy": 5, "bodyAwareness": 3, "emotionalRegulation": 4},
        "researchSupport": "Low",
        "citations": ["Jinpa (2015). Compassion cultivation research", "Phenomenological studies of Tibetan practices"]
    },
    {
        "id": "shamatha",
        "name": "Shamatha (Calm Abiding)",
        "origin": "Buddhist",
        "yearOrigin": -500,
        "parentTraditions": ["buddhism"],
        "description": "Concentration practice developing stable attention and mental calm",
        "practices": ["Breath focus", "Visual object meditation", "Progressive settling"],
        "timeCommitment": "20-60 min daily",
        "guidanceNeeded": "Medium",
        "accessibility": "High",
        "effectiveness": {"adhd": 5, "depression": 4, "anxiety": 4, "trauma": 2, "focus": 5, "metacognition": 4, "insight": 3, "compassion": 3, "communication": 2, "empathy": 3, "bodyAwareness": 3, "emotionalRegulation": 4},
        "researchSupport": "High",
        "citations": ["MacLean et al. (2010). Intensive meditation training improves attention", "Wallace (2006). The Attention Revolution"]
    },

    # === PSYCHEDELIC-ASSISTED THERAPIES ===
    {
        "id": "psilocybin-therapy",
        "name": "Psilocybin-Assisted Psychotherapy",
        "origin": "Psychedelic Medicine",
        "yearOrigin": 2000,
        "parentTraditions": [],
        "description": "Therapeutic use of psilocybin with psychological support for depression, anxiety, and existential distress",
        "practices": ["Preparation sessions", "Supported psychedelic experience", "Integration therapy"],
        "timeCommitment": "1-3 sessions + integration",
        "guidanceNeeded": "Very High",
        "accessibility": "Low",
        "effectiveness": {"adhd": 2, "depression": 5, "anxiety": 5, "trauma": 4, "focus": 2, "metacognition": 5, "insight": 5, "compassion": 4, "communication": 3, "empathy": 5, "bodyAwareness": 4, "emotionalRegulation": 4},
        "researchSupport": "Very High",
        "citations": ["Carhart-Harris et al. (2016). Psilocybin for treatment-resistant depression", "Griffiths et al. (2016). Psilocybin for cancer-related anxiety"]
    },
    {
        "id": "mdma-therapy",
        "name": "MDMA-Assisted Psychotherapy",
        "origin": "Psychedelic Medicine",
        "yearOrigin": 2000,
        "parentTraditions": [],
        "description": "MDMA-facilitated therapy for PTSD combining empathogenic effects with trauma processing",
        "practices": ["Trauma-focused therapy", "Supported MDMA sessions", "Integration work"],
        "timeCommitment": "3 sessions + preparation/integration",
        "guidanceNeeded": "Very High",
        "accessibility": "Low",
        "effectiveness": {"adhd": 1, "depression": 4, "anxiety": 4, "trauma": 5, "focus": 2, "metacognition": 4, "insight": 5, "compassion": 5, "communication": 5, "empathy": 5, "bodyAwareness": 4, "emotionalRegulation": 5},
        "researchSupport": "Very High",
        "citations": ["Mithoefer et al. (2018). MDMA for PTSD", "Mitchell et al. (2021). Phase 3 trial of MDMA"]
    },
    {
        "id": "ayahuasca",
        "name": "Ayahuasca Ceremonies",
        "origin": "Amazonian Shamanism",
        "yearOrigin": -1000,
        "parentTraditions": ["shamanism"],
        "description": "Traditional plant medicine ceremony for healing, insight, and spiritual connection",
        "practices": ["Ceremonial drinking", "Guided visualization", "Group ceremony", "Integration"],
        "timeCommitment": "Full night ceremonies + integration",
        "guidanceNeeded": "Very High",
        "accessibility": "Low",
        "effectiveness": {"adhd": 2, "depression": 5, "anxiety": 4, "trauma": 4, "focus": 2, "metacognition": 5, "insight": 5, "compassion": 4, "communication": 3, "empathy": 5, "bodyAwareness": 4, "emotionalRegulation": 4},
        "researchSupport": "Medium",
        "citations": ["Palhano-Fontes et al. (2019). Ayahuasca for treatment-resistant depression", "Frecska et al. (2016). Therapeutic potential of ayahuasca"]
    },
    {
        "id": "ketamine-therapy",
        "name": "Ketamine-Assisted Psychotherapy",
        "origin": "Psychedelic Medicine",
        "yearOrigin": 2000,
        "parentTraditions": [],
        "description": "Low-dose ketamine with psychotherapy for depression and trauma",
        "practices": ["Ketamine infusion/lozenge", "Psychotherapeutic support", "Integration sessions"],
        "timeCommitment": "Weekly sessions for 6-12 weeks",
        "guidanceNeeded": "Very High",
        "accessibility": "Medium",
        "effectiveness": {"adhd": 2, "depression": 5, "anxiety": 4, "trauma": 4, "focus": 2, "metacognition": 4, "insight": 4, "compassion": 3, "communication": 3, "empathy": 4, "bodyAwareness": 3, "emotionalRegulation": 4},
        "researchSupport": "Very High",
        "citations": ["Zarate et al. (2006). Ketamine for major depression", "Daly et al. (2018). Efficacy of esketamine nasal spray"]
    },

    # === THERAPEUTIC MODALITIES ===
    {
        "id": "ifs",
        "name": "Internal Family Systems (IFS)",
        "origin": "Psychotherapy",
        "yearOrigin": 1990,
        "parentTraditions": ["family-therapy"],
        "description": "Parts-based therapy accessing compassionate Self to heal internal conflicts",
        "practices": ["Parts identification", "Unburdening", "Self-leadership", "Internal dialogue"],
        "timeCommitment": "Weekly therapy sessions",
        "guidanceNeeded": "High",
        "accessibility": "Medium",
        "effectiveness": {"adhd": 3, "depression": 5, "anxiety": 5, "trauma": 5, "focus": 3, "metacognition": 5, "insight": 5, "compassion": 5, "communication": 4, "empathy": 5, "bodyAwareness": 3, "emotionalRegulation": 5},
        "researchSupport": "High",
        "citations": ["Schwartz & Sweezy (2020). Internal Family Systems Therapy", "Shadick et al. (2013). RCT of IFS for rheumatoid arthritis"]
    },
    {
        "id": "emdr",
        "name": "EMDR (Eye Movement Desensitization and Reprocessing)",
        "origin": "Trauma Therapy",
        "yearOrigin": 1989,
        "parentTraditions": [],
        "description": "Bilateral stimulation to process traumatic memories and reduce distress",
        "practices": ["Eye movements", "Memory reprocessing", "Resource installation"],
        "timeCommitment": "8-12 therapy sessions",
        "guidanceNeeded": "Very High",
        "accessibility": "High",
        "effectiveness": {"adhd": 2, "depression": 4, "anxiety": 5, "trauma": 5, "focus": 2, "metacognition": 3, "insight": 4, "compassion": 3, "communication": 2, "empathy": 3, "bodyAwareness": 3, "emotionalRegulation": 5},
        "researchSupport": "Very High",
        "citations": ["Shapiro (2001). Eye Movement Desensitization and Reprocessing", "Chen et al. (2014). EMDR for PTSD meta-analysis"]
    },
    {
        "id": "act",
        "name": "Acceptance and Commitment Therapy (ACT)",
        "origin": "Clinical Psychology",
        "yearOrigin": 1986,
        "parentTraditions": ["cbt"],
        "description": "Psychological flexibility through acceptance, mindfulness, and values-based action",
        "practices": ["Cognitive defusion", "Values clarification", "Committed action", "Mindfulness"],
        "timeCommitment": "Weekly therapy + daily practice",
        "guidanceNeeded": "Medium-High",
        "accessibility": "High",
        "effectiveness": {"adhd": 4, "depression": 5, "anxiety": 5, "trauma": 4, "focus": 4, "metacognition": 5, "insight": 5, "compassion": 4, "communication": 4, "empathy": 4, "bodyAwareness": 3, "emotionalRegulation": 5},
        "researchSupport": "Very High",
        "citations": ["Hayes et al. (2006). Acceptance and Commitment Therapy", "A-Tjak et al. (2015). Meta-analysis of ACT effectiveness"]
    },
    {
        "id": "dbt",
        "name": "Dialectical Behavior Therapy (DBT)",
        "origin": "Clinical Psychology",
        "yearOrigin": 1993,
        "parentTraditions": ["cbt", "zen"],
        "description": "Skills-based therapy combining CBT and mindfulness for emotion regulation",
        "practices": ["Mindfulness", "Distress tolerance", "Emotion regulation", "Interpersonal effectiveness"],
        "timeCommitment": "Weekly individual + group therapy",
        "guidanceNeeded": "Very High",
        "accessibility": "Medium",
        "effectiveness": {"adhd": 4, "depression": 5, "anxiety": 5, "trauma": 4, "focus": 4, "metacognition": 4, "insight": 4, "compassion": 4, "communication": 5, "empathy": 4, "bodyAwareness": 3, "emotionalRegulation": 5},
        "researchSupport": "Very High",
        "citations": ["Linehan (1993). Cognitive-Behavioral Treatment of Borderline Personality Disorder", "Panos et al. (2014). Meta-analysis of DBT"]
    },

    # === SOMATIC PRACTICES ===
    {
        "id": "tre",
        "name": "Trauma Release Exercises (TRE)",
        "origin": "Somatic Therapy",
        "yearOrigin": 2005,
        "parentTraditions": ["body-psychotherapy"],
        "description": "Neurogenic tremoring to release tension and trauma from the nervous system",
        "practices": ["Muscle fatigue exercises", "Neurogenic tremors", "Self-regulation"],
        "timeCommitment": "15-30 min 2-3x weekly",
        "guidanceNeeded": "Medium",
        "accessibility": "Very High",
        "effectiveness": {"adhd": 2, "depression": 4, "anxiety": 5, "trauma": 5, "focus": 2, "metacognition": 2, "insight": 3, "compassion": 2, "communication": 2, "empathy": 2, "bodyAwareness": 5, "emotionalRegulation": 5},
        "researchSupport": "Medium",
        "citations": ["Berceli et al. (2005). TRE for tension and trauma", "Clinical case studies and pilot research"]
    },
    {
        "id": "hatha-yoga",
        "name": "Hatha Yoga",
        "origin": "Indian",
        "yearOrigin": 1000,
        "parentTraditions": ["yoga"],
        "description": "Physical postures, breath control, and meditation for body-mind integration",
        "practices": ["Asanas (postures)", "Pranayama (breath)", "Meditation", "Relaxation"],
        "timeCommitment": "30-90 min 3-7x weekly",
        "guidanceNeeded": "Low-Medium",
        "accessibility": "Very High",
        "effectiveness": {"adhd": 3, "depression": 5, "anxiety": 5, "trauma": 4, "focus": 4, "metacognition": 3, "insight": 3, "compassion": 3, "communication": 2, "empathy": 3, "bodyAwareness": 5, "emotionalRegulation": 5},
        "researchSupport": "Very High",
        "citations": ["Cramer et al. (2013). Yoga for depression meta-analysis", "Streeter et al. (2012). Effects of yoga on GABA"]
    },
    {
        "id": "qigong",
        "name": "Qigong",
        "origin": "Chinese",
        "yearOrigin": -500,
        "parentTraditions": ["taoism"],
        "description": "Coordinated movement, breathing, and meditation for cultivating life energy",
        "practices": ["Moving meditation", "Breath regulation", "Energy cultivation", "Standing practice"],
        "timeCommitment": "20-40 min daily",
        "guidanceNeeded": "Low-Medium",
        "accessibility": "Very High",
        "effectiveness": {"adhd": 3, "depression": 4, "anxiety": 5, "trauma": 3, "focus": 4, "metacognition": 3, "insight": 3, "compassion": 3, "communication": 2, "empathy": 3, "bodyAwareness": 5, "emotionalRegulation": 5},
        "researchSupport": "High",
        "citations": ["Wang et al. (2014). Qigong systematic review", "Oh et al. (2018). Qigong for health"]
    },
    {
        "id": "tai-chi",
        "name": "Tai Chi",
        "origin": "Chinese Martial Arts",
        "yearOrigin": 1300,
        "parentTraditions": ["qigong", "taoism"],
        "description": "Slow, flowing movements integrating mind, body, and breath",
        "practices": ["Form practice", "Push hands", "Meditation in movement"],
        "timeCommitment": "30-60 min 3-7x weekly",
        "guidanceNeeded": "Medium",
        "accessibility": "Very High",
        "effectiveness": {"adhd": 3, "depression": 4, "anxiety": 5, "trauma": 3, "focus": 4, "metacognition": 3, "insight": 3, "compassion": 3, "communication": 2, "empathy": 3, "bodyAwareness": 5, "emotionalRegulation": 5},
        "researchSupport": "Very High",
        "citations": ["Wang et al. (2010). Tai Chi on psychological well-being", "Wayne & Kaptchuk (2008). Tai Chi systematic review"]
    },
    {
        "id": "holotropic-breathwork",
        "name": "Holotropic Breathwork",
        "origin": "Transpersonal Psychology",
        "yearOrigin": 1970,
        "parentTraditions": ["psychedelic-therapy"],
        "description": "Accelerated breathing to access non-ordinary states of consciousness for healing",
        "practices": ["Circular breathing", "Evocative music", "Focused bodywork", "Mandala drawing"],
        "timeCommitment": "3-hour sessions",
        "guidanceNeeded": "Very High",
        "accessibility": "Medium",
        "effectiveness": {"adhd": 2, "depression": 4, "anxiety": 3, "trauma": 4, "focus": 2, "metacognition": 4, "insight": 5, "compassion": 4, "communication": 3, "empathy": 4, "bodyAwareness": 5, "emotionalRegulation": 4},
        "researchSupport": "Low",
        "citations": ["Grof (2010). The Holotropic Mind", "Holmes et al. (1996). Immediate effects of breathwork"]
    },
    {
        "id": "wim-hof",
        "name": "Wim Hof Method",
        "origin": "Modern Breathwork",
        "yearOrigin": 2010,
        "parentTraditions": ["pranayama"],
        "description": "Breathing techniques, cold exposure, and commitment for stress resilience",
        "practices": ["Controlled hyperventilation", "Breath retention", "Cold exposure"],
        "timeCommitment": "15-30 min daily",
        "guidanceNeeded": "Low-Medium",
        "accessibility": "High",
        "effectiveness": {"adhd": 3, "depression": 4, "anxiety": 4, "trauma": 2, "focus": 4, "metacognition": 2, "insight": 2, "compassion": 2, "communication": 2, "empathy": 2, "bodyAwareness": 5, "emotionalRegulation": 5},
        "researchSupport": "Medium",
        "citations": ["Kox et al. (2014). Voluntary activation of sympathetic nervous system", "Buijze et al. (2016). Cold showers and health"]
    },

    # === RELATIONAL PRACTICES ===
    {
        "id": "nvc",
        "name": "Nonviolent Communication (NVC)",
        "origin": "Conflict Resolution",
        "yearOrigin": 1960,
        "parentTraditions": ["humanistic-psychology"],
        "description": "Compassionate communication framework for needs-based dialogue",
        "practices": ["Observations", "Feelings", "Needs", "Requests"],
        "timeCommitment": "Ongoing practice + training",
        "guidanceNeeded": "Medium",
        "accessibility": "Very High",
        "effectiveness": {"adhd": 2, "depression": 3, "anxiety": 3, "trauma": 3, "focus": 3, "metacognition": 4, "insight": 4, "compassion": 5, "communication": 5, "empathy": 5, "bodyAwareness": 2, "emotionalRegulation": 4},
        "researchSupport": "Medium",
        "citations": ["Rosenberg (2003). Nonviolent Communication", "Steckal (2007). Effectiveness of NVC training"]
    },
    {
        "id": "authentic-relating",
        "name": "Authentic Relating",
        "origin": "Relational Practice",
        "yearOrigin": 2010,
        "parentTraditions": ["circling", "encounter-groups"],
        "description": "Structured practices for vulnerability, connection, and relational awareness",
        "practices": ["Noticing games", "Revealing exercises", "Relational meditation", "Eye gazing"],
        "timeCommitment": "Weekly groups or practices",
        "guidanceNeeded": "Medium",
        "accessibility": "Medium",
        "effectiveness": {"adhd": 2, "depression": 4, "anxiety": 3, "trauma": 3, "focus": 3, "metacognition": 5, "insight": 5, "compassion": 5, "communication": 5, "empathy": 5, "bodyAwareness": 3, "emotionalRegulation": 4},
        "researchSupport": "Low",
        "citations": ["Phenomenological reports", "Community-based outcome studies"]
    },

    # === PHILOSOPHICAL/WISDOM TRADITIONS ===
    {
        "id": "sufism",
        "name": "Sufism",
        "origin": "Islamic Mysticism",
        "yearOrigin": 800,
        "parentTraditions": ["islam"],
        "description": "Mystical path of divine love through dhikr (remembrance) and purification",
        "practices": ["Dhikr (chanting)", "Whirling", "Poetry", "Heart meditation"],
        "timeCommitment": "Daily practice + weekly gatherings",
        "guidanceNeeded": "High",
        "accessibility": "Medium",
        "effectiveness": {"adhd": 2, "depression": 4, "anxiety": 4, "trauma": 3, "focus": 4, "metacognition": 4, "insight": 5, "compassion": 5, "communication": 4, "empathy": 5, "bodyAwareness": 3, "emotionalRegulation": 4},
        "researchSupport": "Low",
        "citations": ["Traditional texts and phenomenological studies", "Chittick (2007). Sufism: A Beginner's Guide"]
    },
    {
        "id": "vedanta",
        "name": "Vedanta",
        "origin": "Hindu Philosophy",
        "yearOrigin": -500,
        "parentTraditions": ["hinduism"],
        "description": "Inquiry into nature of self and reality through study, reflection, and meditation",
        "practices": ["Self-inquiry", "Scriptural study", "Meditation", "Discrimination"],
        "timeCommitment": "Variable - from 30 min to hours daily",
        "guidanceNeeded": "High",
        "accessibility": "Medium",
        "effectiveness": {"adhd": 2, "depression": 4, "anxiety": 4, "trauma": 2, "focus": 4, "metacognition": 5, "insight": 5, "compassion": 4, "communication": 3, "empathy": 4, "bodyAwareness": 2, "emotionalRegulation": 4},
        "researchSupport": "Low",
        "citations": ["Traditional commentaries", "Philosophical and contemplative texts"]
    },
    {
        "id": "christian-contemplation",
        "name": "Christian Contemplative Prayer",
        "origin": "Christian Mysticism",
        "yearOrigin": 300,
        "parentTraditions": ["christianity"],
        "description": "Silent prayer and contemplation for union with divine presence",
        "practices": ["Centering prayer", "Lectio divina", "Jesus prayer", "Contemplative silence"],
        "timeCommitment": "20-40 min daily",
        "guidanceNeeded": "Medium",
        "accessibility": "High",
        "effectiveness": {"adhd": 3, "depression": 4, "anxiety": 5, "trauma": 3, "focus": 4, "metacognition": 4, "insight": 4, "compassion": 5, "communication": 3, "empathy": 5, "bodyAwareness": 2, "emotionalRegulation": 4},
        "researchSupport": "Medium",
        "citations": ["Keating (2006). Open Mind, Open Heart", "Clinical studies of centering prayer"]
    },
]

# Append new traditions
data['traditions'].extend(new_traditions)

# Write updated data
with open('data/traditions.json', 'w') as f:
    json.dump(data, f, indent=2)

print(f"✓ Expanded to {len(data['traditions'])} total traditions")
print(f"  Added {len(new_traditions)} new traditions")
