const http = require('http');
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

const root = __dirname;
const database = path.join(root, 'data', 'content.json');
const proofDirectory = path.join(root, 'assets', 'testimonial-proofs');
const offerLetterDirectory = path.join(root, 'assets', 'offer-letter-uploads');
const username = process.env.ADMIN_USERNAME || 'admin';
const password = process.env.ADMIN_PASSWORD || 'ChangeMeNow123!';
const types = { '.css': 'text/css; charset=utf-8', '.html': 'text/html; charset=utf-8', '.jpeg': 'image/jpeg', '.jpg': 'image/jpeg', '.js': 'text/javascript; charset=utf-8', '.json': 'application/json; charset=utf-8', '.png': 'image/png', '.svg': 'image/svg+xml' };

const sendJson = (response, status, body) => {
  response.writeHead(status, { 'Content-Type': 'application/json; charset=utf-8' });
  response.end(JSON.stringify(body));
};
const readContent = () => JSON.parse(fs.readFileSync(database, 'utf8'));
const writeContent = (content) => fs.writeFileSync(database, `${JSON.stringify(content, null, 2)}\n`);
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
  let body = '';
  request.on('data', (chunk) => { body += chunk; if (body.length > 100000) request.destroy(); });
  request.on('end', () => { try { resolve(JSON.parse(body || '{}')); } catch { reject(new Error('Invalid JSON')); } });
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
  if (url.pathname === '/admin.html' && !requireAdmin(request, response)) return;
  if (url.pathname === '/api/content' && request.method === 'PUT') {
    if (!requireAdmin(request, response)) return;
    try {
      const content = await readBody(request);
      if (!Array.isArray(content.courses) || !Array.isArray(content.testimonials)) return sendJson(response, 400, { error: 'Courses and testimonials are required.' });
      if (!Array.isArray(content.offerLetters)) content.offerLetters = [];
      if (!Array.isArray(content.studyMaterials)) content.studyMaterials = [];
      content.testimonials = content.testimonials.map(saveProofImage);
      content.offerLetters = content.offerLetters.map(saveOfferLetterImage);
      writeContent(content);
      return sendJson(response, 200, content);
    } catch (error) { return sendJson(response, 400, { error: error.message }); }
  }
  const pathname = url.pathname === '/' ? '/index.html' : url.pathname;
  if (pathname === '/server.js' || pathname.startsWith('/data/') || pathname.startsWith('/.github-cli')) return response.writeHead(404).end('Not found');
  const file = path.resolve(root, `.${decodeURIComponent(pathname)}`);
  if (!file.startsWith(`${root}${path.sep}`)) return response.writeHead(403).end('Forbidden');
  fs.readFile(file, (error, data) => {
    if (error) return response.writeHead(error.code === 'ENOENT' ? 404 : 500).end('Not found');
    response.writeHead(200, { 'Content-Type': types[path.extname(file).toLowerCase()] || 'application/octet-stream' });
    response.end(data);
  });
}).listen(process.env.PORT || 8001, '0.0.0.0', () => console.log('RV Consulting backend running on port 8001'));
