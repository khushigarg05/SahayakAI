import re
import secrets
from typing import Dict, Any, List
from app.schemas.grievance import GrievanceAnalyzeRequest, GrievanceAnalyzeResponse, GrievanceActionStep

class GrievanceService:
    """
    CPGRAMS-Aligned AI Grievance Diagnostic & Resolution Service.
    Analyzes citizen complaints in Hindi, English, and Hinglish.
    Maps issues to statutory Ministry guidelines and generates concrete resolution steps.
    """

    KNOWLEDGE_BASE = [
        {
            "id": "pm_kisan_dbt",
            "keywords": ["pm-kisan", "pm kisan", "kisan", "installment", "किस्त", "dbt", "aadhaar link", "खाता", "bank link", "npci"],
            "ministry_en": "Ministry of Agriculture & Farmers Welfare",
            "ministry_hi": "कृषि एवं किसान कल्याण मंत्रालय",
            "scheme": "PM-KISAN (Pradhan Mantri Kisan Samman Nidhi)",
            "problem_en": "Aadhaar-Bank NPCI DBT mandate not active or e-KYC pending",
            "problem_hi": "बैंक खाते में आधार NPCI DBT लिंक न होना अथवा e-KYC लंबित होना",
            "severity": "HIGH",
            "authority_en": "District Agriculture Officer / PFMS Nodal Officer",
            "authority_hi": "जिला कृषि अधिकारी / PFMS नोडल अधिकारी",
            "helpline": "155261 / 1800-11-5526",
            "steps_en": [
                {
                    "title": "Aadhaar Seeding Mandate at Bank",
                    "desc": "Visit your bank branch with Aadhaar copy and submit the 'NPCI Aadhaar Mapping Consent Form' to link DBT.",
                    "doc": "Aadhaar Card, Bank Passbook, NPCI Form"
                },
                {
                    "title": "Biometric e-KYC Verification",
                    "desc": "Visit nearest CSC Jan Seva Kendra for biometric iris/fingerprint e-KYC on the PM-Kisan portal.",
                    "doc": "Aadhaar Card"
                },
                {
                    "title": "PFMS Status Re-validation",
                    "desc": "Once seeded, the PFMS portal auto-updates your installment status within 15 working days.",
                    "doc": "Updated Bank Passbook Copy"
                }
            ],
            "steps_hi": [
                {
                    "title": "बैंक शाखा में आधार DBT सीडिंग",
                    "desc": "अपनी बैंक शाखा में जाएं और आधार कार्ड के साथ 'NPCI आधार मैपिंग फॉर्म' भरकर DBT सक्रिय करवाएं।",
                    "doc": "आधार कार्ड, बैंक पासबुक, NPCI फॉर्म"
                },
                {
                    "title": "बायोमेट्रिक e-KYC सत्यापन",
                    "desc": "नजदीकी जन सेवा केंद्र (CSC) पर जाकर PM-किसान पोर्टल पर बायोमेट्रिक फिंगरप्रिंट e-KYC पूरा करें।",
                    "doc": "मूल आधार कार्ड"
                },
                {
                    "title": "PFMS पोर्टल सत्यापन",
                    "desc": "सीडिंग के बाद 15 कार्य दिवसों में PFMS पोर्टल पर आपकी रुकी हुई किस्त जारी कर दी जाएगी।",
                    "doc": "अद्यतन बैंक पासबुक"
                }
            ],
            "csc_action_en": "Book Priority CSC Pass for assisted PM-Kisan biometric e-KYC update.",
            "csc_action_hi": "PM-किसान बायोमेट्रिक e-KYC के लिए जन सेवा केंद्र का प्राथमिकता पास बुक करें।"
        },
        {
            "id": "pmay_income_cert",
            "keywords": ["pmay", "awas", "housing", "आवास", "income certificate", "आय प्रमाण पत्र", "tehsil", "तहसील", "reject", "निरस्त"],
            "ministry_en": "Ministry of Rural Development",
            "ministry_hi": "ग्रामीण विकास मंत्रालय",
            "scheme": "PMAY-G (Pradhan Mantri Awas Yojana - Gramin)",
            "problem_en": "Income certificate expired (>6 months) or Tehsil verification discrepancy",
            "problem_hi": "आय प्रमाण पत्र 6 माह से पुराना होना अथवा तहसील स्तर पर सत्यापन विसंगति",
            "severity": "HIGH",
            "authority_en": "Block Development Officer (BDO) / Tehsildar",
            "authority_hi": "खंड विकास अधिकारी (BDO) / तहसीलदार",
            "helpline": "1800-11-6446",
            "steps_en": [
                {
                    "title": "Renew Tehsil Income Certificate",
                    "desc": "Apply for a fresh 3-year validity Income Certificate through the state e-District portal at nearest CSC.",
                    "doc": "Self-declaration, Ration card, Aadhaar"
                },
                {
                    "title": "BDO Office Re-Attestation",
                    "desc": "Submit newly issued certificate to Village Panchayat Secretary (Gram Rozgar Sahayak) for geo-tag re-audit.",
                    "doc": "New Income Certificate, Land Title (Khatauni)"
                },
                {
                    "title": "AwaasSoft Portal Refresh",
                    "desc": "The Panchayat will update your beneficiary status in the priority SECC/Awaas+ waitlist.",
                    "doc": "Application Reference ID"
                }
            ],
            "steps_hi": [
                {
                    "title": "तहसील से नया आय प्रमाण पत्र बनवाना",
                    "desc": "नजदीकी CSC केंद्र से ई-डिस्ट्रिक्ट पोर्टल के माध्यम से 3 वर्ष की वैधता वाला नया आय प्रमाण पत्र बनवाएं।",
                    "doc": "स्वप्रमाणित घोषणा, राशन कार्ड, आधार"
                },
                {
                    "title": "पंचायत सचिव से सत्यापन",
                    "desc": "नया आय प्रमाण पत्र ग्राम पंचायत सचिव/रोजगार सहायक को सौंपकर आवास जियो-टैगिंग सूची में अपडेट करवाएं।",
                    "doc": "नया आय प्रमाण पत्र, खतौनी"
                },
                {
                    "title": "आवास-सॉफ्ट पोर्टल नवीनीकरण",
                    "desc": "ग्राम पंचायत स्तर पर आपकी पत्रावली को Awaas+ वरीयता सूची में पुनः अनुमोदित किया जाएगा।",
                    "doc": "आवेदन संदर्भ संख्या"
                }
            ],
            "csc_action_en": "Apply for fast-track e-District income certificate at nearest CSC.",
            "csc_action_hi": "नजदीकी CSC केंद्र पर ई-डिस्ट्रिक्ट त्वरित आय प्रमाण पत्र हेतु आवेदन करें।"
        },
        {
            "id": "ayushman_denial",
            "keywords": ["ayushman", "pmjay", "pm-jay", "hospital", "अस्पताल", "card", "कार्ड", "golden card", "golden", "इलाज", "free"],
            "ministry_en": "National Health Authority (NHA) • Ministry of Health",
            "ministry_hi": "राष्ट्रीय स्वास्थ्य प्राधिकरण (NHA) • स्वास्थ्य एवं परिवार कल्याण मंत्रालय",
            "scheme": "Ayushman Bharat PM-JAY",
            "problem_en": "Empaneled hospital refusal of cashless treatment or e-Card generation stall",
            "problem_hi": "सूचीबद्ध अस्पताल द्वारा कैशलेस इलाज से इनकार अथवा आयुष्मान कार्ड निर्माण में रुकावट",
            "severity": "HIGH",
            "authority_en": "District Ayushman Nodal Officer / Arogya Mitra Supervisor",
            "authority_hi": "जिला आयुष्मान नोडल अधिकारी / आरोग्य मित्र पर्यवेक्षक",
            "helpline": "14555 / 1800-111-565",
            "steps_en": [
                {
                    "title": "Meet Hospital Ayushman Mitra",
                    "desc": "Approach the dedicated Ayushman Helpdesk inside the empaneled hospital and provide your Ration Card or Aadhaar.",
                    "doc": "Aadhaar Card, BPL Ration Card"
                },
                {
                    "title": "Generate Ayushman Golden Card at CSC",
                    "desc": "If card is missing, get instant laminated Golden Card printed at any CSC Jan Seva Kendra via PMAM biometric check.",
                    "doc": "Aadhaar linked Mobile"
                },
                {
                    "title": "Lodge Toll-Free Grievance on 14555",
                    "desc": "If hospital refuses, call 14555 directly. An inquiry is mandated within 24 hours under NHA grievance rules.",
                    "doc": "Hospital Pre-authorization Rejection Slip"
                }
            ],
            "steps_hi": [
                {
                    "title": "अस्पताल में आरोग्य मित्र से संपर्क",
                    "desc": "सूचीबद्ध अस्पताल के आयुष्मान हेल्पडेस्क पर जाकर आधार कार्ड व राशन कार्ड प्रस्तुत कर प्री-ऑथराइजेशन करवाएं।",
                    "doc": "आधार कार्ड, BPL राशन कार्ड"
                },
                {
                    "title": "जन सेवा केंद्र पर गोल्डन कार्ड प्रिंटिंग",
                    "desc": "यदि कार्ड नहीं है, तो नजदीकी CSC केंद्र पर बायोमेट्रिक सत्यापन द्वारा 5 मिनट में आयुष्मान कार्ड बनवाएं।",
                    "doc": "आधार कार्ड"
                },
                {
                    "title": "14555 टोल-फ्री पर शिकायत दर्ज",
                    "desc": "अस्पताल द्वारा इनकार किए जाने पर तुरंत 14555 पर शिकायत दर्ज कराएं। 24 घंटे में कार्रवाई अनिवार्य है।",
                    "doc": "अस्पताल का नाम व डॉक्टर पर्ची"
                }
            ],
            "csc_action_en": "Get instant BIS 2.0 biometric Ayushman Card printed at your nearest CSC.",
            "csc_action_hi": "नजदीकी CSC केंद्र से त्वरित बायोमेट्रिक आयुष्मान कार्ड प्राप्त करें।"
        }
    ]

    DEFAULT_FALLBACK = {
        "ministry_en": "Department of Administrative Reforms & Public Grievances (CPGRAMS)",
        "ministry_hi": "प्रशासनिक सुधार एवं लोक शिकायत विभाग (CPGRAMS)",
        "scheme": "National Public Welfare Redressal Mechanism",
        "problem_en": "Administrative application stall or delayed departmental response",
        "problem_hi": "विभागीय स्तर पर आवेदन लंबित होना अथवा समय पर कार्रवाई न होना",
        "severity": "MEDIUM",
        "authority_en": "District Grievance Redressal Officer (DGRO)",
        "authority_hi": "जिला लोक शिकायत निवारण अधिकारी (DGRO)",
        "helpline": "1800-11-5501",
        "steps_en": [
            {
                "title": "Assemble Scheme Application Documents",
                "desc": "Gather your application acknowledgment receipt, Aadhaar card, and relevant certificates.",
                "doc": "Application Receipt, Identity Proof"
            },
            {
                "title": "Visit Nearest CSC Jan Seva Kendra",
                "desc": "Ask the VLE operator to track your application on the departmental portal and check the exact rejection code.",
                "doc": "Reference Number"
            },
            {
                "title": "Lodge Formal CPGRAMS Redressal Ticket",
                "desc": "Lodge an online complaint on pgportal.gov.in. Statutory timeline for resolution is 30 days.",
                "doc": "Summary of Grievance"
            }
        ],
        "steps_hi": [
            {
                "title": "आवेदन पावती दस्तावेज एकत्रित करें",
                "desc": "अपने आवेदन की पावती रसीद, आधार कार्ड और संबंधित प्रमाण पत्र साथ रखें।",
                "doc": "आवेदन पावती, आधार कार्ड"
            },
            {
                "title": "जन सेवा केंद्र पर स्थिति जांच",
                "desc": "नजदीकी CSC केंद्र के ऑपरेटर से पोर्टल पर आवेदन की स्थिति व रिजेक्शन कोड चेक करवाएं।",
                "doc": "आवेदन संदर्भ संख्या"
            },
            {
                "title": "CPGRAMS पोर्टल पर औपचारिक शिकायत",
                "desc": "pgportal.gov.in पर ऑनलाइन शिकायत दर्ज करें। सरकारी नियमानुसार 30 दिनों में निस्तारण अनिवार्य है।",
                "doc": "शिकायत का संक्षिप्त विवरण"
            }
        ],
        "csc_action_en": "Book priority assisted filing token at nearest CSC Kendra.",
        "csc_action_hi": "नजदीकी जन सेवा केंद्र पर जाकर आवेदन निवारण हेतु सहायता लें।"
    }

    def analyze(self, req: GrievanceAnalyzeRequest) -> GrievanceAnalyzeResponse:
        """
        Analyzes grievance text and returns concrete CPGRAMS resolution protocol.
        """
        text = (req.grievance_text or "").lower()
        is_hindi = req.preferred_language.lower() == "hi"

        # Match against knowledge base
        matched_kb = None
        for entry in self.KNOWLEDGE_BASE:
            if any(kw in text for kw in entry["keywords"]):
                matched_kb = entry
                break

        if not matched_kb:
            matched_kb = self.DEFAULT_FALLBACK

        # Build random case ID e.g. CPG-8412
        case_id = f"CPG-{secrets.randbelow(9000) + 1000}"

        raw_steps = matched_kb["steps_hi"] if is_hindi else matched_kb["steps_en"]
        steps = [
            GrievanceActionStep(
                step_number=idx + 1,
                title=s["title"],
                description=s["desc"],
                document_required=s.get("doc")
            )
            for idx, s in enumerate(raw_steps)
        ]

        return GrievanceAnalyzeResponse(
            case_id=case_id,
            detected_ministry=matched_kb["ministry_hi"] if is_hindi else matched_kb["ministry_en"],
            scheme_matched=matched_kb["scheme"],
            problem_summary=matched_kb["problem_hi"] if is_hindi else matched_kb["problem_en"],
            severity_level=matched_kb["severity"],
            action_steps=steps,
            authority_contact=matched_kb["authority_hi"] if is_hindi else matched_kb["authority_en"],
            official_helpline=matched_kb["helpline"],
            recommended_csc_action=matched_kb["csc_action_hi"] if is_hindi else matched_kb["csc_action_en"]
        )

grievance_service = GrievanceService()
