from reportlab.lib import colors
from reportlab.lib.enums import TA_CENTER, TA_LEFT
from reportlab.lib.pagesizes import A4
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib.units import mm
from reportlab.platypus import (
    BaseDocTemplate, PageTemplate, Frame, Paragraph, Spacer, Table, TableStyle,
    PageBreak, Image, KeepTogether
)
from reportlab.pdfbase.ttfonts import TTFont
from reportlab.pdfbase import pdfmetrics
from reportlab.lib.utils import ImageReader
from reportlab.pdfgen.canvas import Canvas
import os

ROOT = "/Users/dexter/projects/Araucana"
OUT = os.path.join(ROOT, "output/pdf/propuesta-plataforma-digital-araucana.pdf")
os.makedirs(os.path.dirname(OUT), exist_ok=True)

PAGE_W, PAGE_H = A4
GREEN = colors.HexColor("#173E36")
GREEN_2 = colors.HexColor("#2E6B59")
CREAM = colors.HexColor("#F4EEDF")
RED = colors.HexColor("#C9563E")
SKY = colors.HexColor("#DCEBE7")
INK = colors.HexColor("#1E2B28")
MUTED = colors.HexColor("#64736E")
WHITE = colors.white

try:
    pdfmetrics.registerFont(TTFont("DejaVu", "/System/Library/Fonts/Supplemental/Arial.ttf"))
    pdfmetrics.registerFont(TTFont("DejaVu-Bold", "/System/Library/Fonts/Supplemental/Arial Bold.ttf"))
    FONT, BOLD = "DejaVu", "DejaVu-Bold"
except Exception:
    FONT, BOLD = "Helvetica", "Helvetica-Bold"

styles = getSampleStyleSheet()
styles.add(ParagraphStyle(name="CoverKicker", fontName=BOLD, fontSize=10, leading=13, textColor=CREAM, tracking=1.5, spaceAfter=15))
styles.add(ParagraphStyle(name="CoverTitle", fontName=BOLD, fontSize=33, leading=36, textColor=WHITE, spaceAfter=12))
styles.add(ParagraphStyle(name="CoverSub", fontName=FONT, fontSize=14, leading=19, textColor=CREAM))
styles.add(ParagraphStyle(name="Eyebrow", fontName=BOLD, fontSize=8.5, leading=11, textColor=RED, tracking=1.1, spaceAfter=7))
styles.add(ParagraphStyle(name="H1x", fontName=BOLD, fontSize=25, leading=29, textColor=GREEN, spaceAfter=10))
styles.add(ParagraphStyle(name="H2x", fontName=BOLD, fontSize=15, leading=19, textColor=GREEN, spaceBefore=7, spaceAfter=6))
styles.add(ParagraphStyle(name="Bodyx", fontName=FONT, fontSize=10.2, leading=14.5, textColor=INK, spaceAfter=6))
styles.add(ParagraphStyle(name="Smallx", fontName=FONT, fontSize=8.6, leading=12, textColor=MUTED, spaceAfter=4))
styles.add(ParagraphStyle(name="WhiteBody", fontName=FONT, fontSize=10.5, leading=15, textColor=WHITE, spaceAfter=6))
styles.add(ParagraphStyle(name="CardTitle", fontName=BOLD, fontSize=13, leading=16, textColor=GREEN, spaceAfter=5))
styles.add(ParagraphStyle(name="Price", fontName=BOLD, fontSize=24, leading=28, textColor=RED, alignment=TA_LEFT))
styles.add(ParagraphStyle(name="CenterSmall", fontName=FONT, fontSize=9, leading=12, textColor=MUTED, alignment=TA_CENTER))
styles.add(ParagraphStyle(name="Footer", fontName=FONT, fontSize=7.5, textColor=colors.HexColor("#8C9994"), alignment=TA_CENTER))

logo = os.path.join(ROOT, "Design/assets/araucana-logo.png")

def P(text, style="Bodyx"):
    return Paragraph(text, styles[style])

def bullets(items, color=INK):
    return [P("<font color='#C9563E'>•</font>&nbsp; " + item, "Bodyx") for item in items]

def logo_image(width=54*mm):
    im = Image(logo, width=width, height=width * 481 / 1097)
    im.hAlign = "LEFT"
    return im

def header_footer(canvas, doc):
    canvas.saveState()
    if doc.page == 1:
        canvas.setFillColor(GREEN)
        canvas.rect(0, 0, PAGE_W, PAGE_H, fill=1, stroke=0)
        canvas.drawImage(logo, 17*mm, PAGE_H-63*mm, width=62*mm, height=62*mm*481/1097, mask='auto', preserveAspectRatio=True)
    else:
        canvas.setFillColor(GREEN)
        canvas.rect(0, PAGE_H-13*mm, PAGE_W, 13*mm, fill=1, stroke=0)
        canvas.setFillColor(WHITE)
        canvas.setFont(BOLD, 8)
        canvas.drawString(17*mm, PAGE_H-8.5*mm, "LA ARAUCANA")
        canvas.setFont(FONT, 8)
        canvas.drawRightString(PAGE_W-17*mm, PAGE_H-8.5*mm, "Plataforma digital · Propuesta especial")
        canvas.setStrokeColor(colors.HexColor("#D7DFDB"))
        canvas.line(17*mm, 16*mm, PAGE_W-17*mm, 16*mm)
        canvas.setFillColor(MUTED)
        canvas.setFont(FONT, 7.5)
        canvas.drawString(17*mm, 10*mm, "Propuesta preparada para La Araucana")
        canvas.drawRightString(PAGE_W-17*mm, 10*mm, f"{doc.page}")
    canvas.restoreState()

class ProposalDoc(BaseDocTemplate):
    def __init__(self, filename):
        super().__init__(filename, pagesize=A4, leftMargin=17*mm, rightMargin=17*mm, topMargin=22*mm, bottomMargin=21*mm)
        frame = Frame(self.leftMargin, self.bottomMargin, self.width, self.height, id="normal")
        self.addPageTemplates([PageTemplate(id="all", frames=frame, onPage=header_footer)])

def card(title, body, width=None, bg=SKY):
    t = Table([[P(title, "CardTitle")], [body]], colWidths=[width] if width else None)
    t.setStyle(TableStyle([
        ("BACKGROUND", (0,0), (-1,-1), bg), ("BOX", (0,0), (-1,-1), 0, bg),
        ("LEFTPADDING", (0,0), (-1,-1), 12), ("RIGHTPADDING", (0,0), (-1,-1), 12),
        ("TOPPADDING", (0,0), (-1,-1), 11), ("BOTTOMPADDING", (0,0), (-1,-1), 10),
    ]))
    return t

def two_col(left, right, gap=8*mm):
    t = Table([[left, right]], colWidths=[(PAGE_W-34*mm-gap)/2, (PAGE_W-34*mm-gap)/2])
    t.setStyle(TableStyle([("VALIGN", (0,0), (-1,-1), "TOP"), ("LEFTPADDING", (0,0), (-1,-1), 0), ("RIGHTPADDING", (0,0), (-1,-1), gap/2), ("TOPPADDING", (0,0), (-1,-1), 0), ("BOTTOMPADDING", (0,0), (-1,-1), 0)]))
    return t

story = []

# Cover
story += [Spacer(1, 49*mm), P("PROPUESTA COMERCIAL", "CoverKicker"), P("La nueva plataforma digital<br/>para La Araucana", "CoverTitle"), P("Una herramienta para vender, administrar y operar los servicios turísticos y de transporte.", "CoverSub"), Spacer(1, 37*mm), P("Etapa 1 bonificada · Etapa 2 USD 2.500 · Etapa 3 USD 2.500", "CoverSub"), PageBreak()]

# Summary
story += [P("PRESENTACIÓN", "Eyebrow"), P("Una plataforma, no solo una página web.", "H1x"), P("La propuesta contempla la evolución del sitio institucional hacia una plataforma digital propia para La Araucana. El sistema reúne la experiencia pública del viajero y las herramientas internas necesarias para administrar rutas, horarios, reservas, vehículos y operación.", "Bodyx"), Spacer(1, 4*mm)]
summary_left = [P("Qué cambia", "H2x")] + bullets(["El pasajero puede consultar rutas y reservar online.", "La empresa administra salidas, vehículos, asientos y reservas.", "La operación de Chapelco tiene su propio circuito de capacidad, ascensos, retiros y choferes.", "La información queda centralizada en una base de datos y una API compartida."])
summary_right = [P("Qué se construyó", "H2x")] + bullets(["Web pública responsive con identidad propia.", "Panel administrativo con roles y permisos.", "Sistema de reservas y comprobantes de pago.", "Seguimiento de choferes y aplicación iPhone operativa."])
story += [two_col(summary_left, summary_right), Spacer(1, 8*mm)]
story += [card("Valor de referencia del desarrollo realizado", P("USD 10.500", "Price") , bg=CREAM), Spacer(1, 5*mm), P("Como gesto comercial y por la relación con La Araucana, la Etapa 1 se entrega completamente bonificada: <b>precio a pagar: USD 0</b>.", "Bodyx"), PageBreak()]

# Stage 1 detailed
story += [P("ETAPA 1 · BONIFICADA", "Eyebrow"), P("Lo que ya está hecho", "H1x"), P("Esta etapa representa el núcleo de la plataforma y se entrega sin cargo como beneficio comercial especial.", "Bodyx")]
items1 = [
    ("Web pública y experiencia", "Página de inicio, secciones de servicios, rutas, destinos, contacto, mapas, responsive y diseño visual personalizado."),
    ("Reservas online", "Consulta de rutas y horarios, selección de salida, selección de asiento, datos del pasajero, confirmación y código de reserva."),
    ("Administración", "Panel protegido para administrar rutas, salidas, reservas, usuarios, vehículos, choferes, secretarias y permisos."),
    ("Pagos manuales", "Carga de comprobantes, almacenamiento, revisión y aprobación de pagos por parte del equipo."),
    ("Operación Chapelco", "Capacidad por persona, puntos de retiro, slots de ascenso, vehículos, manifestos y tablero operativo."),
    ("Choferes y ubicación", "Panel de chofer, ubicación de la unidad, horarios próximos y aplicación iPhone con sesión segura."),
    ("Datos y API", "PostgreSQL, migraciones, API JSON, autenticación, sesiones, códigos de error consistentes y documentación OpenAPI."),
    ("Contabilidad y reportes", "Carga de gastos, sueldos, períodos y reportes operativos para facilitar el control interno.")
]
rows = []
for i in range(0, len(items1), 2):
    pair=[]
    for title, desc in items1[i:i+2]:
        pair.append(P(f"<b>{title}</b><br/>{desc}", "Bodyx"))
    if len(pair)==1: pair.append(P("", "Bodyx"))
    rows.append(pair)
t = Table(rows, colWidths=[(PAGE_W-34*mm-7*mm)/2]*2, hAlign="LEFT")
t.setStyle(TableStyle([("VALIGN",(0,0),(-1,-1),"TOP"),("BACKGROUND",(0,0),(-1,-1),colors.HexColor("#F5F8F6")),("BOX",(0,0),(-1,-1),0.4,colors.HexColor("#D8E4DF")),("INNERGRID",(0,0),(-1,-1),0.4,colors.HexColor("#D8E4DF")),("LEFTPADDING",(0,0),(-1,-1),10),("RIGHTPADDING",(0,0),(-1,-1),10),("TOPPADDING",(0,0),(-1,-1),9),("BOTTOMPADDING",(0,0),(-1,-1),8)]))
story += [t, Spacer(1, 7*mm), P("Importante: esta etapa está funcional en ambiente de desarrollo y requiere validación final con datos reales, configuración de producción, pruebas operativas y publicación para quedar lista para uso comercial.", "Smallx"), PageBreak()]

# Stage 2
story += [P("ETAPA 2 · USD 2.500", "Eyebrow"), P("Cierre operativo y salida a producción", "H1x"), P("Objetivo: transformar lo desarrollado en una plataforma lista para ser utilizada por el equipo y por los pasajeros.", "Bodyx")]
stage2 = [
    "Revisión y corrección de las pruebas automatizadas pendientes.",
    "Validación completa del flujo de reserva con rutas y horarios reales.",
    "Carga y revisión de datos reales de rutas, tarifas, horarios, vehículos y usuarios.",
    "Configuración de dominio, hosting, SSL, variables de entorno y base de datos productiva.",
    "Cambio de credenciales iniciales y revisión de roles y permisos.",
    "Backups, monitoreo básico y procedimiento de recuperación.",
    "Pruebas de aceptación con administración, secretaría y choferes.",
    "Configuración de la aplicación iPhone contra la API de producción.",
    "Capacitación inicial para el personal responsable.",
    "Publicación del sitio y garantía de correcciones durante 30 días."
]
story += [two_col([P("Incluye", "H2x")]+bullets(stage2[:5]), [P("También incluye", "H2x")]+bullets(stage2[5:])), Spacer(1, 9*mm)]
story += [card("Inversión Etapa 2", [P("USD 2.500", "Price"), P("Cincuenta por ciento al iniciar y cincuenta por ciento antes de la publicación final.", "Smallx")], bg=CREAM), Spacer(1, 6*mm), P("Resultado esperado", "H2x"), P("Una versión productiva, probada y lista para que La Araucana comience a recibir reservas y administrar su operación desde la nueva plataforma.", "Bodyx"), PageBreak()]

# Stage 3
story += [P("ETAPA 3 · USD 2.500", "Eyebrow"), P("Evolución comercial y mejoras avanzadas", "H1x"), P("Objetivo: convertir la plataforma en una herramienta de crecimiento, seguimiento y mejora continua.", "Bodyx")]
stage3 = [
    "Integración con pagos online, si el proveedor y las condiciones comerciales quedan definidos.",
    "Notificaciones automáticas por correo y/o WhatsApp para reservas, pagos y confirmaciones.",
    "Mejoras del panel con filtros, estados, reportes y exportación de información.",
    "Optimización del flujo de reserva para reducir consultas manuales.",
    "Analítica de visitas, rutas consultadas, reservas y conversiones.",
    "SEO de contenidos y páginas de servicios prioritarios.",
    "Mejoras de la experiencia móvil y de la aplicación de choferes.",
    "Documentación operativa y técnica para el equipo.",
    "Bolsa inicial de horas para ajustes derivados del uso real.",
    "Plan de mantenimiento evolutivo para los siguientes meses."
]
story += [two_col([P("Funcionalidades comerciales", "H2x")]+bullets(stage3[:5]), [P("Optimización y continuidad", "H2x")]+bullets(stage3[5:])), Spacer(1, 9*mm)]
story += [card("Inversión Etapa 3", [P("USD 2.500", "Price"), P("Cincuenta por ciento al iniciar y cincuenta por ciento contra entrega de las mejoras acordadas.", "Smallx")], bg=CREAM), Spacer(1, 6*mm), P("Resultado esperado", "H2x"), P("Una plataforma más automatizada, medible y preparada para acompañar el crecimiento comercial y operativo de La Araucana.", "Bodyx"), PageBreak()]

# Investment and terms
story += [P("INVERSIÓN Y CONDICIONES", "Eyebrow"), P("Una propuesta especial para avanzar juntos.", "H1x"), P("La Etapa 1 se entrega como bonificación total. Las siguientes dos etapas se cotizan a un valor preferencial de USD 2.500 cada una.", "Bodyx"), Spacer(1, 5*mm)]
data = [
    [P("ETAPA", "WhiteBody"), P("ALCANCE", "WhiteBody"), P("VALOR DE LISTA", "WhiteBody"), P("VALOR ESPECIAL", "WhiteBody")],
    [P("1 · Base de plataforma", "Bodyx"), P("Web, reservas, administración, Chapelco, choferes, API, app iPhone y contabilidad.", "Bodyx"), P("USD 10.500", "Bodyx"), P("<b>Bonificada</b><br/>USD 0", "Bodyx")],
    [P("2 · Producción", "Bodyx"), P("Datos reales, seguridad, pruebas, capacitación y publicación.", "Bodyx"), P("USD 3.500", "Bodyx"), P("<b>USD 2.500</b>", "Bodyx")],
    [P("3 · Evolución", "Bodyx"), P("Pagos, automatizaciones, analítica, SEO y mejoras avanzadas.", "Bodyx"), P("USD 3.500", "Bodyx"), P("<b>USD 2.500</b>", "Bodyx")],
    [P("TOTAL", "CardTitle"), P("Plataforma completa en tres etapas.", "Bodyx"), P("USD 17.500", "Bodyx"), P("<b>USD 5.000</b>", "Bodyx")],
]
tbl = Table(data, colWidths=[29*mm, 72*mm, 34*mm, 34*mm])
tbl.setStyle(TableStyle([("BACKGROUND",(0,0),(-1,0),GREEN),("TEXTCOLOR",(0,0),(-1,0),WHITE),("BACKGROUND",(0,1),(-1,-2),colors.HexColor("#F5F8F6")),("BACKGROUND",(0,-1),(-1,-1),CREAM),("GRID",(0,0),(-1,-1),0.4,colors.HexColor("#D0DDD8")),("VALIGN",(0,0),(-1,-1),"TOP"),("LEFTPADDING",(0,0),(-1,-1),7),("RIGHTPADDING",(0,0),(-1,-1),7),("TOPPADDING",(0,0),(-1,-1),9),("BOTTOMPADDING",(0,0),(-1,-1),9)]))
story += [tbl, Spacer(1, 9*mm), P("Condiciones generales", "H2x")]
story += bullets(["Los valores están expresados en dólares estadounidenses.", "Los costos de hosting, dominio, licencias, proveedores de mapas, mensajería y pasarelas de pago no están incluidos y serán contratados por La Araucana.", "Cada etapa comienza con la aprobación del alcance y el pago del anticipo correspondiente.", "Los cambios que excedan el alcance detallado se cotizarán por separado.", "La propuesta tiene una vigencia de 15 días."])
story += [Spacer(1, 8*mm), card("Mantenimiento recomendado luego de la Etapa 2", [P("USD 350 por mes", "Price"), P("Incluye soporte técnico, backups, actualizaciones, monitoreo y cambios menores. Nuevas funcionalidades se cotizan aparte.", "Smallx")], bg=SKY)]

doc = ProposalDoc(OUT)
doc.build(story)
print(OUT)
