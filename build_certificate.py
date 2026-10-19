from pathlib import Path
from PIL import Image, ImageDraw, ImageFont, ImageChops
from docx import Document
from docx.shared import Inches, Pt, RGBColor
from docx.enum.text import WD_ALIGN_PARAGRAPH
from docx.enum.section import WD_SECTION
from docx.oxml import OxmlElement, parse_xml
from docx.oxml.ns import qn
from reportlab.pdfgen import canvas
from reportlab.pdfbase import pdfmetrics
from reportlab.pdfbase.ttfonts import TTFont

ROOT = Path(__file__).resolve().parent
ASSETS = ROOT / "assets"
OUT = ROOT / "output"
OUT.mkdir(exist_ok=True)

def load_font(size, *candidates):
    for candidate in candidates:
        if Path(candidate).exists():
            return ImageFont.truetype(candidate, size)
    return ImageFont.load_default(size=size)

# Build a clean background that retains the supplied certificate's border, text,
# seals and signatures while removing the previous brand, recipient and date.
base = Image.open(ASSETS / "certificate-source.png").convert("RGB")
draw = ImageDraw.Draw(base)
# Remove the pale, colored central watermark.  The surrounding certificate
# artwork is monochrome here, so color-only cleanup preserves its text and line.
for y in range(780, 1315):
    for x in range(385, 1105):
        red, green, blue = base.getpixel((x, y))
        if max(red, green, blue) - min(red, green, blue) > 5 and (red + green + blue) // 3 > 130:
            base.putpixel((x, y), (255, 255, 255))
# Remove the remaining low-saturation watermark traces, then restore the two
# intended foreground elements in that band.
draw.rectangle((300, 825, 1190, 1315), fill="white")
caption_font = load_font(43, r'C:\Windows\Fonts\comic.ttf', '/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf')
caption = 'This Certificate is Proudly Presented to'
caption_box = draw.textbbox((0, 0), caption, font=caption_font)
draw.text(((base.width - (caption_box[2] - caption_box[0])) / 2, 850), caption, fill='black', font=caption_font)
draw.line((260, 1275, 1230, 1275), fill=(75, 75, 75), width=3)
draw.rectangle((390, 1280, 1110, 1340), fill="white")
# Rebuild the course description on a clean white block so none of the prior
# background logo remains visible through its lines.
draw.rectangle((170, 1340, 1320, 1645), fill="white")
course_font = load_font(33, r'C:\Windows\Fonts\comic.ttf', '/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf')
course_lines = [
    'For successfully completing the Advanced AML and KYC monitoring',
    'specialist Course. Your commitment to learning, active participation,',
    'and dedication to mastering new skills have demonstrated true',
    'professionalism and a passion for growth. Through perseverance and',
    'determination, you have achieved an outstanding milestone in your',
    'educational journey.',
]
for index, line in enumerate(course_lines):
    line_box = draw.textbbox((0, 0), line, font=course_font)
    line_x = (base.width - (line_box[2] - line_box[0])) / 2
    draw.text((line_x, 1345 + index * 45), line, fill='black', font=course_font)
draw.rectangle((500, 135, 985, 560), fill="white")
draw.rectangle((255, 980, 1225, 1240), fill="white")
logo = Image.open(ASSETS / "rv-logo.png").convert("RGB")
logo.thumbnail((360, 215), Image.Resampling.LANCZOS)
lx = (base.width - logo.width) // 2
base.paste(logo, (lx, 185))
# Add the supplied RV mark as a subtle central watermark. White logo background
# pixels are transparent, so the certificate remains clean and readable.
watermark = Image.open(ASSETS / "rv-logo.png").convert("RGBA")
watermark.thumbnail((470, 280), Image.Resampling.LANCZOS)
watermark_alpha = Image.new('L', watermark.size)
watermark_alpha.putdata([30 if min(pixel[:3]) < 250 else 0 for pixel in watermark.getdata()])
watermark.putalpha(watermark_alpha)
base.paste(watermark, ((base.width - watermark.width) // 2, 900), watermark)
background = ASSETS / "certificate-background.png"
base.save(background, quality=95)

doc = Document()
section = doc.sections[0]
section.page_width = Inches(8.27)
section.page_height = Inches(11.69)
section.top_margin = Inches(0)
section.bottom_margin = Inches(0)
section.left_margin = Inches(0)
section.right_margin = Inches(0)
section.header_distance = Inches(0)
section.footer_distance = Inches(0)

# Place the background in the header, behind document text, so the two fields
# below remain ordinary, editable Word text.
header = section.header
p = header.paragraphs[0]
p.alignment = WD_ALIGN_PARAGRAPH.CENTER
run = p.add_run()
part = header.part
rid, image = part.get_or_add_image(str(background))
cx = int(8.27 * 914400)
cy = int(11.69 * 914400)
xml = f'''<w:pict xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main" xmlns:v="urn:schemas-microsoft-com:vml" xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships">
  <v:shape id="certificateBackground" type="#_x0000_t75"
     style="position:absolute;margin-left:0;margin-top:0;width:8.27in;height:11.69in;z-index:-251658240;mso-position-horizontal:page;mso-position-vertical:page" filled="f" stroked="f">
    <v:imagedata r:id="{rid}" o:title="Certificate background"/>
  </v:shape>
</w:pict>'''
run._r.append(parse_xml(xml))

# Body text is transparent and positioned over the cleared source areas.
normal = doc.styles['Normal']
normal.font.name = 'Arial'
normal._element.rPr.rFonts.set(qn('w:eastAsia'), 'Arial')

def spacer(points):
    para = doc.add_paragraph()
    para.paragraph_format.space_before = Pt(0)
    para.paragraph_format.space_after = Pt(0)
    para.paragraph_format.line_spacing = Pt(points)
    para.add_run('')
    return para

# At A4 height the recipient baseline falls around 5.25in from top.
spacer(364)
name = doc.add_paragraph()
name.alignment = WD_ALIGN_PARAGRAPH.CENTER
name.paragraph_format.space_before = Pt(0)
name.paragraph_format.space_after = Pt(0)
name.paragraph_format.line_spacing = Pt(58)
r = name.add_run('Chetna')
r.font.name = 'Monotype Corsiva'
r._element.rPr.rFonts.set(qn('w:eastAsia'), 'Monotype Corsiva')
r.font.size = Pt(45)
r.font.bold = False
r.font.color.rgb = RGBColor(0, 0, 0)

date = doc.add_paragraph()
date.alignment = WD_ALIGN_PARAGRAPH.CENTER
date.paragraph_format.space_before = Pt(0)
date.paragraph_format.space_after = Pt(0)
date.paragraph_format.line_spacing = Pt(55)
r = date.add_run('17th AUGUST 2026')
r.font.name = 'Monotype Corsiva'
r._element.rPr.rFonts.set(qn('w:eastAsia'), 'Monotype Corsiva')
r.font.size = Pt(38)
r.font.bold = False
r.font.color.rgb = RGBColor(0, 0, 0)

# Semantic marker for the editable fields in Word's navigation/accessibility data.
for para, label in [(name, 'Recipient name'), (date, 'Certificate date')]:
    para._p.set(qn('w:rsidR'), '00000000')
    para._p.set(qn('w:rsidRDefault'), '00000000')
    para._p.set(qn('w:paraId'), '00000001')
    para._p.set(qn('w:textId'), '00000001')

doc.core_properties.title = 'Portrait Certificate of Excellence'
doc.core_properties.subject = 'Editable recipient name and date certificate'
doc.core_properties.author = 'RV Consulting'
doc.save(OUT / 'RV_Certificate_Editable.docx')

# The distributed PDF is a raster-only export: the complete certificate,
# including name and date, is painted into one image before it is embedded.
final = Image.open(background).convert('RGB')
final_draw = ImageDraw.Draw(final)
script_font_candidates = (str(ASSETS / 'GreatVibes-Regular.ttf'), r'C:\Windows\Fonts\MTCORSVA.TTF', '/usr/share/fonts/truetype/dejavu/DejaVuSerif-Italic.ttf')

def fitted_font(text, initial_size, max_width):
    for size in range(initial_size, 31, -2):
        font = load_font(size, *script_font_candidates)
        if final_draw.textbbox((0, 0), text, font=font, stroke_width=1)[2] <= max_width:
            return font
    return load_font(32, *script_font_candidates)

name_font = fitted_font('Chetna', 82, 850)
date_font = fitted_font('17th AUGUST 2026', 62, 650)

def centered_text(y, text, font):
    bbox = final_draw.textbbox((0, 0), text, font=font, stroke_width=1)
    x = (final.width - (bbox[2] - bbox[0])) / 2
    final_draw.text((x, y), text, fill='black', font=font, stroke_width=1, stroke_fill='black')

centered_text(1007, 'Chetna', name_font)
centered_text(1142, '17th AUGUST 2026', date_font)
flattened_image = OUT / 'RV_Certificate_Flattened.png'
final.save(flattened_image, quality=98)
pdf_path = OUT / 'RV_Certificate_Flattened.pdf'
page_w, page_h = 8.27 * 72, 11.69 * 72
pdf = canvas.Canvas(str(pdf_path), pagesize=(page_w, page_h), pageCompression=1)
pdf.drawImage(str(flattened_image), 0, 0, width=page_w, height=page_h, mask='auto')
pdf.showPage()
pdf.save()
flattened_image.unlink()
print(OUT / 'RV_Certificate_Editable.docx')
print(pdf_path)
