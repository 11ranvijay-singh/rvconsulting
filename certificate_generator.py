"""Called by server.js. Requires Pillow, python-docx and reportlab in the project venv."""
import argparse, subprocess, sys
from datetime import date as date_value
from pathlib import Path

ROOT=Path(__file__).resolve().parent
parser=argparse.ArgumentParser();parser.add_argument('--name',required=True);parser.add_argument('--date',required=True);parser.add_argument('--format',choices=('docx','pdf'),required=True);args=parser.parse_args()
try:
    parsed_date = date_value.fromisoformat(args.date)
except ValueError as error:
    raise SystemExit('Certificate date must use YYYY-MM-DD.') from error

def ordinal(day):
    return f'{day}{"th" if 11 <= day % 100 <= 13 else {1: "st", 2: "nd", 3: "rd"}.get(day % 10, "th")}'

certificate_date = f'{ordinal(parsed_date.day)} {parsed_date.strftime("%B").upper()} {parsed_date.year}'
# The shared builder reads these values when called from the website.
target=ROOT/'build_certificate.py'
if not target.exists(): raise SystemExit('Certificate builder is missing.')
# Replace the default values temporarily only in memory, leaving the template untouched.
source=target.read_text(encoding='utf-8').replace("ROOT = Path(__file__).resolve().parent",f"ROOT = Path({str(ROOT)!r})").replace("'Chetna'",repr(args.name)).replace("'17th AUGUST 2026'",repr(certificate_date))
temporary=ROOT/'tmp'/'generated_certificate.py';temporary.parent.mkdir(exist_ok=True);temporary.write_text(source,encoding='utf-8')
subprocess.run([sys.executable,str(temporary)],cwd=ROOT,check=True)
result=ROOT/'output'/('RV_Certificate_Editable.docx' if args.format=='docx' else 'RV_Certificate_Flattened.pdf')
print(result)
