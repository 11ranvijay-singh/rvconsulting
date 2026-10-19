const http = require('http');
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const { PDFDocument } = require('pdf-lib');
const sharp = require('sharp');
const archiver = require('archiver');
const { PassThrough } = require('stream');

const root = __dirname;
const database = path.join(root, 'data', 'content.json');
const analyticsDatabase = path.join(root, 'data', 'analytics.json');
const proofDirectory = path.join(root, 'assets', 'testimonial-proofs');
const offerLetterDirectory = path.join(root, 'assets', 'offer-letter-uploads');
const maxAdminRequestBytes = 8 * 1024 * 1024;
const certificateBackground = path.join(root, 'assets', 'certificate-background.png');
const certificateDateFont = path.join(root, 'assets', 'Merriweather-Italic.ttf');
const username = process.env.ADMIN_USERNAME || 'admin';
const password = process.env.ADMIN_PASSWORD || 'ChangeMeNow123!';
const types = { '.css': 'text/css; charset=utf-8', '.html': 'text/html; charset=utf-8', '.jpeg': 'image/jpeg', '.jpg': 'image/jpeg', '.js': 'text/javascript; charset=utf-8', '.json': 'application/json; charset=utf-8', '.png': 'image/png', '.svg': 'image/svg+xml', '.txt': 'text/plain; charset=utf-8', '.webp': 'image/webp', '.xml': 'application/xml; charset=utf-8' };

const sendJson = (response, status, body) => {
  response.writeHead(status, { 'Content-Type': 'application/json; charset=utf-8' });
  response.end(JSON.stringify(body));
};
const ordinalDate = (value) => {
  const date = new Date(`${value}T12:00:00Z`);
  const day = date.getUTCDate();
  const suffix = day >= 11 && day <= 13 ? 'th' : ({ 1: 'st', 2: 'nd', 3: 'rd' }[day % 10] || 'th');
  return `${day}${suffix} ${date.toLocaleString('en-US', { month: 'long', timeZone: 'UTC' }).toUpperCase()} ${date.getUTCFullYear()}`;
};
const escapeXml = (value) => String(value).replace(/[<>&'\"]/g, (character) => ({ '<': '&lt;', '>': '&gt;', '&': '&amp;', "'": '&apos;', '"': '&quot;' })[character]);
const certificateTextLayer = (text, size, weight = 400) => {
  const font = fs.readFileSync(certificateDateFont).toString('base64');
  return Buffer.from(`<svg width="1488" height="150" xmlns="http://www.w3.org/2000/svg"><style>@font-face{font-family:Certificate;src:url(data:font/ttf;base64,${font})}text{font-family:Certificate,serif;font-style:italic;font-weight:${weight};fill:#000}</style><text x="744" y="${size + 16}" font-size="${size}" text-anchor="middle">${escapeXml(text)}</text></svg>`);
};
const createCertificatePdf = async (name, date) => {
  const nameSize = Math.max(32, Math.min(82, Math.floor(1200 / Math.max(name.length, 1) / 0.62)));
  const flattenedImage = await sharp(certificateBackground).composite([
    { input: certificateTextLayer(name, nameSize, 700), top: 980, left: 0 },
    { input: certificateTextLayer(ordinalDate(date), 58), top: 1120, left: 0 },
  ]).png().toBuffer();
  const pdf = await PDFDocument.create();
  const page = pdf.addPage([595.44, 841.68]);
  const background = await pdf.embedPng(flattenedImage);
  const { width, height } = page.getSize();
  page.drawImage(background, { x: 0, y: 0, width, height });
  return Buffer.from(await pdf.save());
};
const certificateFilename = (name) => `RV_Certificate_${name.replace(/[^a-z0-9]+/gi, '_').replace(/^_+|_+$/g, '').slice(0, 70) || 'recipient'}.pdf`;
const validCertificate = ({ name, date }) => typeof name === 'string' && name.trim() && name.length <= 80 && /^\d{4}-\d{2}-\d{2}$/.test(date || '');
const createCertificateZip = async (entries) => new Promise((resolve, reject) => {
  const output = new PassThrough(); const chunks = [];
  output.on('data', (chunk) => chunks.push(chunk)); output.on('end', () => resolve(Buffer.concat(chunks))); output.on('error', reject);
  const zip = archiver('zip', { zlib: { level: 9 } }); zip.on('error', reject); zip.pipe(output);
  (async () => {
    try {
      for (const [index, entry] of entries.entries()) {
        zip.append(await createCertificatePdf(entry.name.trim(), entry.date), { name: `${String(index + 1).padStart(3, '0')}_${certificateFilename(entry.name)}` });
      }
      zip.finalize();
    } catch (error) { reject(error); }
  })();
});
const readContent = () => JSON.parse(fs.readFileSync(database, 'utf8'));
const writeContent = (content) => fs.writeFileSync(database, `${JSON.stringify(content, null, 2)}\n`);
const readAnalytics = () => {
  try { return JSON.parse(fs.readFileSync(analyticsDatabase, 'utf8')); } catch { return { days: {} }; }
};
const writeAnalytics = (analytics) => fs.writeFileSync(analyticsDatabase, `${JSON.stringify(analytics, null, 2)}\n`);
const visitorDay = () => new Intl.DateTimeFormat('en-CA', { timeZone: 'Asia/Kolkata', year: 'numeric', month: '2-digit', day: '2-digit' }).format(new Date());
const isPageVisit = (request, pathname) => request.method === 'GET' && (pathname === '/' || pathname.endsWith('.html')) && !pathname.startsWith('/admin');
const recordVisit = (request) => {
  const day = visitorDay();
  const forwarded = request.headers['x-forwarded-for'];
  const address = typeof forwarded === 'string' ? forwarded.split(',')[0].trim() : request.socket.remoteAddress || '';
  const agent = request.headers['user-agent'] || '';
  if (!address || /bot|crawler|spider|preview|lighthouse/i.test(agent)) return;
  const analytics = readAnalytics();
  const entry = analytics.days[day] ||= { uniqueVisitors: 0, visitorIds: [] };
  const visitorId = crypto.createHash('sha256').update(`${day}\0${address}\0${agent}`).digest('hex');
  if (!entry.visitorIds.includes(visitorId)) { entry.visitorIds.push(visitorId); entry.uniqueVisitors += 1; }
  Object.entries(analytics.days).forEach(([date, value]) => {
    if (date !== day && Array.isArray(value.visitorIds)) delete value.visitorIds;
    if (date < new Date(Date.now() - 180 * 86400000).toISOString().slice(0, 10)) delete analytics.days[date];
  });
  writeAnalytics(analytics);
};
const analyticsSummary = () => {
  const days = readAnalytics().days || {}; const today = visitorDay();
  const trend = Array.from({ length: 30 }, (_, offset) => {
    const date = new Date(`${today}T12:00:00+05:30`); date.setDate(date.getDate() - (29 - offset));
    const key = date.toLocaleDateString('en-CA', { timeZone: 'Asia/Kolkata' });
    return { date: key, visitors: days[key]?.uniqueVisitors || 0 };
  });
  return { today, todayVisitors: days[today]?.uniqueVisitors || 0, last30DaysVisitors: trend.reduce((total, item) => total + item.visitors, 0), trend };
};
const authorised = (request) => {
  const value = request.headers.authorization || '';
  const expected = `Basic ${Buffer.from(`${username}:${password}`).toString('base64')}`;
  return value.length === expected.length && crypto.timingSafeEqual(Buffer.from(value), Buffer.from(expected));
};
const requireAdmin = (request, response) => {
  if (authorised(request)) return true;
  response.writeHead(401, { 'WWW-Authenticate': 'Basic realm="RV Consulting admin"' }).end('Login required');
  return false;
};
const readBody = (request) => new Promise((resolve, reject) => {
  let body = ''; let size = 0;
  request.on('data', (chunk) => { size += chunk.length; if (size <= maxAdminRequestBytes) body += chunk; });
  request.on('end', () => {
    if (size > maxAdminRequestBytes) return reject(new Error('Upload is too large. Choose an image smaller than 5 MB.'));
    try { resolve(JSON.parse(body || '{}')); } catch { reject(new Error('Invalid request data. Please try again.')); }
  });
});
const saveProofImage = (testimonial) => {
  if (!testimonial.proofImageData?.startsWith('data:image/')) return testimonial;
  const match = testimonial.proofImageData.match(/^data:image\/(png|jpeg|webp);base64,(.+)$/);
  if (!match) throw new Error('Proof image must be a PNG, JPG, or WebP file.');
  const image = Buffer.from(match[2], 'base64');
  if (!image.length || image.length > 5 * 1024 * 1024) throw new Error('Proof image must be smaller than 5 MB.');
  const extension = match[1] === 'jpeg' ? 'jpg' : match[1];
  fs.mkdirSync(proofDirectory, { recursive: true });
  const filename = `${crypto.randomUUID()}.${extension}`;
  fs.writeFileSync(path.join(proofDirectory, filename), image);
  const { proofImageData, ...cleanTestimonial } = testimonial;
  return { ...cleanTestimonial, proofImage: `assets/testimonial-proofs/${filename}` };
};
const saveOfferLetterImage = (offerLetter) => {
  if (!offerLetter.imageData?.startsWith('data:image/')) return offerLetter;
  const match = offerLetter.imageData.match(/^data:image\/(png|jpeg|webp);base64,(.+)$/);
  if (!match) throw new Error('Offer letter must be a PNG, JPG, or WebP image.');
  const image = Buffer.from(match[2], 'base64');
  if (!image.length || image.length > 5 * 1024 * 1024) throw new Error('Offer letter image must be smaller than 5 MB.');
  const extension = match[1] === 'jpeg' ? 'jpg' : match[1];
  fs.mkdirSync(offerLetterDirectory, { recursive: true });
  const filename = `${crypto.randomUUID()}.${extension}`;
  fs.writeFileSync(path.join(offerLetterDirectory, filename), image);
  const { imageData, ...cleanOfferLetter } = offerLetter;
  return { ...cleanOfferLetter, image: `assets/offer-letter-uploads/${filename}` };
};

http.createServer(async (request, response) => {
  const url = new URL(request.url, 'http://localhost');
  if (url.pathname === '/api/content' && request.method === 'GET') return sendJson(response, 200, readContent());
  if (url.pathname === '/api/analytics' && request.method === 'GET') {
    if (!requireAdmin(request, response)) return;
    return sendJson(response, 200, analyticsSummary());
  }
  if (url.pathname === '/api/certificates' && request.method === 'POST') {
    if (!requireAdmin(request, response)) return;
    try {
      const { name, date } = await readBody(request);
      if (typeof name !== 'string' || !name.trim() || name.length > 80) return sendJson(response, 400, { error: 'A recipient name of up to 80 characters is required.' });
      if (!/^\d{4}-\d{2}-\d{2}$/.test(date || '')) return sendJson(response, 400, { error: 'Provide a valid certificate date.' });
      const pdf = await createCertificatePdf(name.trim(), date);
      response.writeHead(200, { 'Content-Type': 'application/pdf', 'Content-Disposition': 'attachment; filename="RV_Certificate.pdf"' });
      response.end(pdf);
    } catch (error) { return sendJson(response, 400, { error: error.message }); }
    return;
  }
  if (url.pathname === '/api/certificates/bulk' && request.method === 'POST') {
    if (!requireAdmin(request, response)) return;
    try {
      const { entries } = await readBody(request);
      if (!Array.isArray(entries) || !entries.length) return sendJson(response, 400, { error: 'Add at least one certificate recipient.' });
      if (entries.length > 100) return sendJson(response, 400, { error: 'Generate up to 100 certificates at a time.' });
      if (!entries.every(validCertificate)) return sendJson(response, 400, { error: 'Each row needs a name (up to 80 characters) and a date in YYYY-MM-DD format.' });
      const zip = await createCertificateZip(entries);
      response.writeHead(200, { 'Content-Type': 'application/zip', 'Content-Disposition': 'attachment; filename="RV_Certificates.zip"' });
      response.end(zip);
    } catch (error) { return sendJson(response, 400, { error: error.message || 'Unable to generate certificates.' }); }
    return;
  }
  if (url.pathname === '/certificate-generator.html' && !requireAdmin(request, response)) return;
  if (url.pathname === '/admin.html' && !requireAdmin(request, response)) return;
  if (url.pathname === '/api/content' && request.method === 'PUT') {
    if (!requireAdmin(request, response)) return;
    try {
      const content = await readBody(request);
      if (!Array.isArray(content.courses) || !Array.isArray(content.testimonials)) return sendJson(response, 400, { error: 'Courses and testimonials are required.' });
      if (!Array.isArray(content.offerLetters)) content.offerLetters = [];
      if (!Array.isArray(content.studyMaterials)) content.studyMaterials = [];
      if (!Array.isArray(content.faqs)) content.faqs = [];
      if (!content.demoClass || typeof content.demoClass !== 'object' || Array.isArray(content.demoClass)) content.demoClass = {};
      content.testimonials = content.testimonials.map(saveProofImage);
      content.offerLetters = content.offerLetters.map(saveOfferLetterImage);
      writeContent(content);
      return sendJson(response, 200, content);
    } catch (error) { return sendJson(response, 400, { error: error.message }); }
  }
  const pathname = url.pathname === '/' ? '/index.html' : url.pathname;
  if (isPageVisit(request, url.pathname)) recordVisit(request);
  if (pathname === '/server.js' || pathname.startsWith('/data/') || pathname.startsWith('/.github-cli')) return response.writeHead(404).end('Not found');
  const file = path.resolve(root, `.${decodeURIComponent(pathname)}`);
  if (!file.startsWith(`${root}${path.sep}`)) return response.writeHead(403).end('Forbidden');
  fs.readFile(file, (error, data) => {
    if (error) return response.writeHead(error.code === 'ENOENT' ? 404 : 500).end('Not found');
    response.writeHead(200, { 'Content-Type': types[path.extname(file).toLowerCase()] || 'application/octet-stream' });
    response.end(data);
  });
}).listen(process.env.PORT || 8001, '0.0.0.0', () => console.log('RV Consulting backend running on port 8001'));
