FROM node:20-bookworm-slim

WORKDIR /app

RUN apt-get update \
  && apt-get install -y --no-install-recommends python3 python3-venv fonts-dejavu-core \
  && rm -rf /var/lib/apt/lists/* \
  && python3 -m venv /opt/certificate-venv

ENV CERTIFICATE_PYTHON=/opt/certificate-venv/bin/python
ENV PATH="/opt/certificate-venv/bin:${PATH}"

COPY package.json ./
RUN npm install --omit=dev

COPY requirements.txt ./
RUN pip install --no-cache-dir -r requirements.txt

COPY . .

EXPOSE 8001

CMD ["npm", "start"]
