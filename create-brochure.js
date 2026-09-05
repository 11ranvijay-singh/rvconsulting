const fs = require("fs");
const path = require("path");
const PDFDocument = require("./tmp/pdfbrochure/node_modules/pdfkit/js/pdfkit.js");

const outputDir = path.join(__dirname, "output", "pdf");
fs.mkdirSync(outputDir, { recursive: true });
const output = path.join(outputDir, "rv-consulting-brochure.pdf");
const doc = new PDFDocument({ size: "A4", margin: 46, info: { Title: "RV Consulting - Financial Crime Training" } });
doc.pipe(fs.createWriteStream(output));

const navy = "#0F2A5F";
const gold = "#F4B400";
const light = "#EAF2FF";
const muted = "#53657E";
const pageW = 595.28;

function text(value, x, y, size, options = {}) {
  doc.fillColor(options.color || navy).font(options.bold ? "Helvetica-Bold" : "Helvetica").fontSize(size).text(value, x, y, { width: options.width || 500, lineGap: options.lineGap || 3, align: options.align || "left" });
}
function pill(label, x, y, width) {
  doc.roundedRect(x, y, width, 23, 11).fill(light);
  text(label, x + 10, y + 7, 8, { bold: true, color: navy, width: width - 20 });
}
function line(y) { doc.strokeColor("#D6E2F3").lineWidth(1).moveTo(46, y).lineTo(pageW - 46, y).stroke(); }
function footer(page) {
  line(760);
  text("RV CONSULTING  |  FINANCIAL CRIME TRAINING", 46, 770, 8, { bold: true, color: muted });
  text("Page " + page, 490, 770, 8, { color: muted, align: "right", width: 58 });
}

doc.rect(0, 0, pageW, 842).fill("#FFFFFF");
doc.rect(0, 0, pageW, 12).fill(gold);
text("RV CONSULTING", 46, 52, 16, { bold: true, color: navy });
text("PRACTICAL FINANCIAL CRIME TRAINING", 46, 80, 9, { bold: true, color: gold });
text("Investigate with confidence.", 46, 112, 37, { bold: true, color: navy, width: 390, lineGap: 5 });
text("Practical AML, KYC, fraud and crypto investigation training for professionals ready to work with real financial-crime scenarios.", 46, 212, 14, { color: muted, width: 370, lineGap: 6 });
doc.roundedRect(46, 304, 190, 42, 5).fill(navy);
text("Call +91 97177 66543", 60, 318, 11, { bold: true, color: "#FFFFFF", width: 160 });
doc.roundedRect(252, 304, 165, 42, 5).fill(gold);
text("Watch on YouTube", 267, 318, 11, { bold: true, color: navy, width: 140 });

doc.circle(502, 175, 112).fill(light);
doc.circle(520, 165, 76).fill(navy);
doc.circle(520, 165, 45).fill(gold);
text("AML", 493, 150, 22, { bold: true, color: navy, width: 56, align: "center" });
text("KYC", 493, 176, 22, { bold: true, color: navy, width: 56, align: "center" });

text("Learn by doing", 46, 405, 22, { bold: true });
text("RV Consulting combines essential financial-crime concepts with case studies and practical exercises. Build a clear, structured approach to identifying, documenting and investigating risk.", 46, 441, 13, { color: muted, width: 495, lineGap: 6 });
const points = [
  ["Global AML frameworks", "FATF, OFAC, FinCEN and risk-based approaches"],
  ["Real-world investigations", "Fraud, sanctions and transaction-monitoring case studies"],
  ["Applied investigation skills", "Wallet review, suspicious transactions and SAR drafting"]
];
let y = 551;
points.forEach(([heading, detail], i) => {
  doc.circle(57, y + 8, 11).fill(gold);
  text(String(i + 1).padStart(2, "0"), 49, y + 4, 7, { bold: true, color: navy, width: 16, align: "center" });
  text(heading, 82, y, 12, { bold: true });
  text(detail, 82, y + 20, 10, { color: muted, width: 410 });
  y += 61;
});
footer(1);

doc.addPage();
doc.rect(0, 0, pageW, 842).fill("#FFFFFF");
doc.rect(0, 0, pageW, 12).fill(navy);
text("THE CURRICULUM", 46, 54, 9, { bold: true, color: gold });
text("Build knowledge you can apply in the field.", 46, 82, 29, { bold: true, width: 470 });

const modules = [
  ["01", "AML, KYC and Financial Crime Foundations", "Financial crime overview, money-laundering stages, AML typologies, KYC fundamentals, identity verification, CDD, EDD, sanctions, PEP screening and customer risk profiling."],
  ["02", "Fraud and Transaction Monitoring", "Monitoring systems, alerts, red flags, behavioural analysis, SAR workflow, banking fraud, payment fraud, chargebacks, identity theft and investigation methods."],
  ["03", "Crypto and Blockchain Investigation", "Blockchain basics, wallets, transaction tracing, wallet clustering, address identification, flow-of-funds analysis, crypto AML risks and investigation tools."]
];
y = 166;
modules.forEach(([number, heading, detail], i) => {
  doc.roundedRect(46, y, 503, 144, 7).fill(i === 1 ? light : "#FFFFFF").strokeColor("#D6E2F3").stroke();
  doc.roundedRect(65, y + 22, 43, 25, 4).fill(gold);
  text(number, 65, y + 30, 9, { bold: true, width: 43, align: "center" });
  text(heading, 127, y + 22, 16, { bold: true, width: 375 });
  text(detail, 127, y + 54, 10.5, { color: muted, width: 370, lineGap: 4 });
  y += 161;
});
text("BONUS INDUSTRY SKILLS", 46, 667, 9, { bold: true, color: gold });
text("OSINT | Blockchain intelligence | Financial investigation techniques | Risk scoring models", 46, 687, 12, { bold: true, width: 500 });
doc.roundedRect(46, 714, 503, 34, 5).fill(navy);
text("Ready to strengthen your financial-crime investigation skills?  Call +91 97177 66543", 61, 726, 10, { bold: true, color: "#FFFFFF", width: 475 });
footer(2);

doc.end();
console.log(output);
