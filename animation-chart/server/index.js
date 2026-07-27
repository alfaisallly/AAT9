import { execFile } from 'node:child_process';
import { promisify } from 'node:util';
import express from 'express';
import cors from 'cors';

const execFileAsync = promisify(execFile);
const PORT = Number(process.env.API_PORT) || 3001;

const app = express();
app.use(cors());
app.use(express.json({ limit: '1mb' }));

async function pingHost(host) {
  try {
    const { stdout } = await execFileAsync('ping', ['-c', '3', '-W', '2', host], { timeout: 8000 });
    const match = stdout.match(/min\/avg\/max\/(?:mdev|stddev)\s*=\s*[\d.]+\/([\d.]+)/);
    const lossMatch = stdout.match(/(\d+)% packet loss/);
    return {
      reachable: true,
      latencyMs: match ? Number(match[1]) : undefined,
      packetLoss: lossMatch ? Number(lossMatch[1]) : 0,
      message: 'ICMP reachable',
    };
  } catch (err) {
    const msg = err instanceof Error ? err.message : 'Ping failed';
    return { reachable: false, packetLoss: 100, message: msg.slice(0, 120) };
  }
}

async function httpProbe(url) {
  const start = Date.now();
  try {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 5000);
    const res = await fetch(url, { signal: controller.signal, redirect: 'follow' });
    clearTimeout(timer);
    return {
      ok: res.ok,
      status: res.status,
      latencyMs: Date.now() - start,
      message: res.ok ? `HTTP ${res.status}` : `HTTP error ${res.status}`,
    };
  } catch (err) {
    return {
      ok: false,
      latencyMs: Date.now() - start,
      message: err instanceof Error ? err.message : 'HTTP probe failed',
    };
  }
}

app.get('/api/health', (_req, res) => {
  res.json({ ok: true, service: 'animation-chart-api', time: new Date().toISOString() });
});

app.post('/api/probe/host', async (req, res) => {
  const { host, healthUrl } = req.body ?? {};
  if (!host || typeof host !== 'string') {
    res.status(400).json({ error: 'host required' });
    return;
  }

  const ping = await pingHost(host);
  let httpResult = null;
  if (healthUrl && typeof healthUrl === 'string') {
    httpResult = await httpProbe(healthUrl);
  }

  const reachable = ping.reachable || (httpResult?.ok ?? false);
  res.json({
    host,
    reachable,
    latencyMs: httpResult?.latencyMs ?? ping.latencyMs,
    packetLoss: ping.packetLoss,
    httpStatus: httpResult?.status,
    message: reachable
      ? httpResult?.message ?? ping.message
      : `Unreachable: ${ping.message}`,
  });
});

app.post('/api/probe/batch', async (req, res) => {
  const { targets } = req.body ?? {};
  if (!Array.isArray(targets)) {
    res.status(400).json({ error: 'targets array required' });
    return;
  }

  const results = [];
  for (const t of targets) {
    const host = t.host ?? t.ip;
    if (!host) continue;
    const ping = await pingHost(host);
    let httpResult = null;
    if (t.healthUrl) {
      httpResult = await httpProbe(t.healthUrl);
    }
    results.push({
      nodeId: t.nodeId,
      host,
      reachable: ping.reachable || (httpResult?.ok ?? false),
      latencyMs: httpResult?.latencyMs ?? ping.latencyMs,
      packetLoss: ping.packetLoss,
      httpStatus: httpResult?.status,
      message: ping.reachable || httpResult?.ok ? 'Online' : 'Offline',
    });
  }
  res.json({ results });
});

app.post('/api/probe/link', async (req, res) => {
  const { sourceHost, targetHost } = req.body ?? {};
  if (!sourceHost || !targetHost) {
    res.status(400).json({ error: 'sourceHost and targetHost required' });
    return;
  }

  const [src, tgt] = await Promise.all([pingHost(sourceHost), pingHost(targetHost)]);
  const pass = src.reachable && tgt.reachable;
  res.json({
    status: pass ? 'pass' : 'fail',
    latencyMs: src.latencyMs && tgt.latencyMs ? (src.latencyMs + tgt.latencyMs) / 2 : undefined,
    packetLoss: Math.max(src.packetLoss ?? 0, tgt.packetLoss ?? 0),
    message: pass ? 'Both endpoints reachable' : 'One or both endpoints unreachable',
  });
});

app.post('/api/ai/analyze', async (req, res) => {
  const { apiKey, model, prompt, locale } = req.body ?? {};
  if (!apiKey) {
    res.status(400).json({ error: 'apiKey required for AI analysis' });
    return;
  }

  const systemPrompt =
    locale === 'ar'
      ? 'أنت مهندس بنية تحتية خبير. حلّل مخطط مركز البيانات ونتائج الاختبار. أجب بJSON فقط بالحقول: summary, summaryAr, score (0-100), insights[{severity,title,titleAr,detail,detailAr}], recommendations[], recommendationsAr[]'
      : 'You are an expert infrastructure architect. Analyze the data center diagram and test results. Reply with JSON only: summary, summaryAr, score (0-100), insights[{severity,title,titleAr,detail,detailAr}], recommendations[], recommendationsAr[]';

  try {
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: model || 'gpt-4o-mini',
        temperature: 0.3,
        response_format: { type: 'json_object' },
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: prompt },
        ],
      }),
    });

    if (!response.ok) {
      const errText = await response.text();
      res.status(response.status).json({ error: errText.slice(0, 300) });
      return;
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content;
    const parsed = JSON.parse(content);
    res.json({ ...parsed, source: 'ai', generatedAt: new Date().toISOString() });
  } catch (err) {
    res.status(500).json({ error: err instanceof Error ? err.message : 'AI request failed' });
  }
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`Animation Chart API running on http://0.0.0.0:${PORT}`);
});
