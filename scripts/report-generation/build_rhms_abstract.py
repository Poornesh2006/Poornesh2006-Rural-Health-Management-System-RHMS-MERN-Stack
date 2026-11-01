from pathlib import Path
from docx import Document
from docx.shared import Inches, Pt
from docx.enum.text import WD_ALIGN_PARAGRAPH
from docx.oxml.ns import qn

OUT = Path(__file__).resolve().parents[2] / "submission" / "abstract" / "RHMS_Abstract.docx"

doc = Document()
section = doc.sections[0]
section.top_margin = Inches(0.85)
section.bottom_margin = Inches(0.85)
section.left_margin = Inches(0.9)
section.right_margin = Inches(0.9)

style = doc.styles["Normal"]
style.font.name = "Arial"
style._element.rPr.rFonts.set(qn("w:eastAsia"), "Arial")
style.font.size = Pt(11)

title = doc.add_paragraph()
title.alignment = WD_ALIGN_PARAGRAPH.CENTER
title.paragraph_format.space_after = Pt(14)
run = title.add_run("Abstract")
run.bold = True
run.font.name = "Arial"
run.font.size = Pt(16)

paragraphs = [
    "The Rural Health Management System (RHMS) is a technology-driven healthcare portal designed to improve the delivery and administration of services in rural Primary Health Centres. In many rural healthcare settings, patient registration, appointment booking, queue handling, clinical records, medicine dispensing, laboratory follow-up, and vaccination tracking are managed through paper-based or disconnected processes. These practices can lead to duplicate records, delayed access to patient history, inefficient queues, limited medicine-stock visibility, and difficulties in coordinated care. To address these challenges, RHMS presents an integrated digital platform that brings clinical and administrative health services into a single, structured workflow.",
    "The proposed system provides a centralized platform through which authorized staff can register patients, maintain visit histories, schedule appointments, generate token queues, and access patient information efficiently. Clinicians can record consultations, create prescriptions, and generate laboratory requests, while pharmacy personnel can manage inventory, track batches, and record dispensing. Laboratory staff can process requests, enter results, and notify clinicians for review. The portal also supports vaccination schedules, due lists, certificate generation, notifications, and reporting, enabling healthcare workers and administrators to monitor essential services through a shared system.",
    "RHMS uses modern web technologies to provide an accessible and role-aware healthcare environment. The platform is implemented with React, React Router, Tailwind CSS, and Vite PWA capabilities for the frontend; Node.js and Express.js for backend services; and MongoDB for centralized data management. Authentication, JWT-based session controls, role-based access control, validation, audit logging, and privacy-aware exports protect sensitive health information. Offline drafts, pending synchronization, connectivity indicators, and English and Tamil interface foundations support practical use in low-connectivity rural environments.",
    "By integrating patient management, appointments, token queues, consultations, pharmacy, laboratory, vaccination, notifications, and analytics within a unified digital framework, RHMS aims to improve service visibility, operational coordination, and continuity of care in rural communities. The system provides a foundation for future enhancements such as telemedicine, FHIR-based interoperability, multilingual expansion, predictive healthcare analytics, outreach management, and mobile deployment."
]

for text in paragraphs:
    p = doc.add_paragraph()
    p.alignment = WD_ALIGN_PARAGRAPH.JUSTIFY
    p.paragraph_format.first_line_indent = Inches(0.0)
    p.paragraph_format.space_after = Pt(10)
    p.paragraph_format.line_spacing = 1.15
    p.add_run(text)

doc.core_properties.title = "Abstract — Rural Health Management System"
doc.core_properties.author = "POORNESH S, NITHISHKUMAR K C, MYTHISH S, JAI AKASH A"
OUT.parent.mkdir(parents=True, exist_ok=True)
doc.save(OUT)
print(OUT)
