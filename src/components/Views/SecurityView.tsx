import React, { useState } from 'react';
import { motion } from 'motion/react';
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
  Sparkles
} from 'lucide-react';
import { Tab, SecurityAuditReport } from '../../types';

interface SecurityViewProps {
  activeTab: Tab | null;
  onNavigate: (url: string) => void;
}

export const SecurityView: React.FC<SecurityViewProps> = ({ activeTab, onNavigate }) => {
  const [isScanning, setIsScanning] = useState(false);
  const [quantumEnforced, setQuantumEnforced] = useState(true);
  const [canvasNoise, setCanvasNoise] = useState(true);
  const [webrtcShield, setWebrtcShield] = useState(true);
  const [strictCsp, setStrictCsp] = useState(true);
  const [cookieIsolation, setCookieIsolation] = useState(true);
  const [activeTabPanel, setActiveTabPanel] = useState<'overview' | 'crypto' | 'shield' | 'certificates' | 'csp'>('overview');

  const currentDomain = activeTab?.url
    ? (() => {
        try {
          return new URL(activeTab.url).hostname;
        } catch {
          return activeTab.url;
        }
      })()
    : 'aksh.browser.internal';

  const mockAudit: SecurityAuditReport = {
    targetUrl: activeTab?.url || 'aksh://newtab',
    protocol: 'HTTP/3 (QUIC-v1 0-RTT)',
    tlsVersion: 'TLS 1.3 Draft / Post-Quantum Hybrid',
    cipherSuite: 'TLS_AES_256_GCM_SHA384 (X25519Kyber768Draft00)',
    postQuantumStatus: quantumEnforced ? 'enabled' : 'draft',
    certificate: {
      issuer: 'GTS Root R1 (Google Trust Services LLC)',
      subject: `CN=${currentDomain}`,
      validFrom: '2025-01-10',
      validTo: '2027-04-12',
      keyAlgorithm: 'ECDSA NIST P-384 / Ed25519 Hybrid',
      fingerprintSha256: '9F:8B:2A:7E:11:4C:6D:88:90:FE:41:A5:3B:82:1D:99:45:67:89:BC',
    },
    csp: {
      status: strictCsp ? 'enforced' : 'report-only',
      directivesCount: 14,
      upgradeInsecureRequests: true,
    },
    shieldStats: {
      trackersBlocked: 34,
      fingerprintsDeflected: 12,
      cookiesIsolated: 8,
      cryptominersKilled: 0,
      webrtcLeaksShielded: webrtcShield,
    },
    score: quantumEnforced && canvasNoise && webrtcShield ? 98 : 82,
  };

  const handleRescan = () => {
    setIsScanning(true);
    setTimeout(() => {
      setIsScanning(false);
    }, 700);
  };

  return (
    <div className="h-full flex flex-col bg-slate-950 text-slate-100 overflow-y-auto custom-scrollbar font-sans">
      {/* Top Header */}
      <div className="border-b border-slate-800 bg-slate-900/80 px-6 py-4 flex flex-wrap items-center justify-between gap-4 backdrop-blur-md shrink-0">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 shadow-sm">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-lg font-bold tracking-tight text-white">Quantum Security & Shield Inspector</h1>
              <span className="text-[11px] font-semibold tracking-wider uppercase px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                Kyber-768
              </span>
            </div>
            <p className="text-xs text-slate-400">
              Live cryptographic cipher verification, post-quantum key exchange, and multi-vector defense shield.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleRescan}
            disabled={isScanning}
            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold shadow-md transition-all cursor-pointer disabled:opacity-50"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isScanning ? 'animate-spin' : ''}`} />
            {isScanning ? 'Auditing Cipher...' : 'Re-scan Host'}
          </button>
        </div>
      </div>

      <div className="p-6 max-w-6xl w-full mx-auto space-y-6">
        {/* Top Summary Banner */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {/* Security Score Card */}
          <div className="p-5 rounded-2xl bg-gradient-to-br from-slate-900 via-slate-900 to-emerald-950/30 border border-slate-800 flex items-center justify-between">
            <div>
              <p className="text-xs text-slate-400 font-medium">Security Health Score</p>
              <div className="flex items-baseline gap-1 mt-1">
                <span className="text-3xl font-extrabold text-emerald-400">{mockAudit.score}</span>
                <span className="text-xs text-slate-500 font-semibold">/ 100</span>
              </div>
              <p className="text-[11px] text-emerald-300/80 mt-1 flex items-center gap-1">
                <CheckCircle2 className="w-3 h-3 text-emerald-400 inline" /> Post-Quantum Hardened
              </p>
            </div>
            <div className="w-14 h-14 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
              <ShieldCheck className="w-8 h-8" />
            </div>
          </div>

          {/* Connection Protocol */}
          <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800">
            <p className="text-xs text-slate-400 font-medium">Transport Protocol</p>
            <p className="text-sm font-bold text-white mt-1.5 truncate">{mockAudit.protocol}</p>
            <p className="text-[11px] text-slate-400 mt-1">Zero-Round-Trip Fast Resumption</p>
          </div>

          {/* Cipher Suite */}
          <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800">
            <p className="text-xs text-slate-400 font-medium">Post-Quantum Key Exchange</p>
            <div className="flex items-center gap-1.5 mt-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <p className="text-xs font-bold text-emerald-300 font-mono">Kyber-768 ML-KEM</p>
            </div>
            <p className="text-[11px] text-slate-400 mt-1">Quantum-Resistant Lattice Math</p>
          </div>

          {/* Shield Stats */}
          <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800">
            <p className="text-xs text-slate-400 font-medium">Shield Blocks in Session</p>
            <p className="text-2xl font-bold text-white mt-1">
              {mockAudit.shieldStats.trackersBlocked + mockAudit.shieldStats.fingerprintsDeflected}
            </p>
            <p className="text-[11px] text-cyan-400 mt-1">
              {mockAudit.shieldStats.trackersBlocked} Trackers • {mockAudit.shieldStats.fingerprintsDeflected} Fingerprints
            </p>
          </div>
        </div>

        {/* Tab Switcher */}
        <div className="flex items-center gap-2 border-b border-slate-800 pb-2">
          {[
            { id: 'overview', label: 'Shield & Protections', icon: ShieldCheck },
            { id: 'crypto', label: 'Cryptographic Ciphers', icon: Key },
            { id: 'certificates', label: 'Certificate Chain', icon: FileCheck },
            { id: 'csp', label: 'CSP & Content Policies', icon: Layers },
          ].map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTabPanel === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTabPanel(tab.id as any)}
                className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                  isActive
                    ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 shadow-xs'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                {tab.label}
              </button>
            );
          })}
        </div>

        {/* Active Panel Content */}
        {activeTabPanel === 'overview' && (
          <div className="space-y-6">
            {/* Interactive Shield Toggles */}
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
              <h3 className="text-sm font-bold text-white mb-1 flex items-center gap-2">
                <Sliders className="w-4 h-4 text-emerald-400" />
                Active Defensive Shields for {currentDomain}
              </h3>
              <p className="text-xs text-slate-400 mb-6">
                Fine-tune the browser's hardware and network-level shields for maximum privacy and resilience.
              </p>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Toggle 1: Post Quantum Cryptography */}
                <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800 flex items-center justify-between">
                  <div className="space-y-1 pr-4">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-semibold text-white">Post-Quantum Kyber-768 TLS</span>
                      <span className="text-[10px] bg-emerald-500/20 text-emerald-300 px-1.5 py-0.5 rounded border border-emerald-500/30">
                        NIST FIPS 203
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-400 leading-relaxed">
                      Requires lattice-based post-quantum key encapsulation to neutralize "Harvest Now, Decrypt Later" adversaries.
                    </p>
                  </div>
                  <button
                    onClick={() => setQuantumEnforced(!quantumEnforced)}
                    className={`w-10 h-6 rounded-full p-1 transition-colors cursor-pointer shrink-0 ${
                      quantumEnforced ? 'bg-emerald-600' : 'bg-slate-800'
                    }`}
                  >
                    <div
                      className={`w-4 h-4 rounded-full bg-white transition-transform ${
                        quantumEnforced ? 'translate-x-4' : 'translate-x-0'
                      }`}
                    />
                  </button>
                </div>

                {/* Toggle 2: Canvas Noise Randomizer */}
                <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800 flex items-center justify-between">
                  <div className="space-y-1 pr-4">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-semibold text-white">Canvas & WebGL Fingerprint Noise</span>
                      <span className="text-[10px] bg-cyan-500/20 text-cyan-300 px-1.5 py-0.5 rounded border border-cyan-500/30">
                        Zero-Entropy
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-400 leading-relaxed">
                      Injects sub-pixel imperceptible pseudo-random noise into HTML5 Canvas readbacks to make device profiling impossible.
                    </p>
                  </div>
                  <button
                    onClick={() => setCanvasNoise(!canvasNoise)}
                    className={`w-10 h-6 rounded-full p-1 transition-colors cursor-pointer shrink-0 ${
                      canvasNoise ? 'bg-emerald-600' : 'bg-slate-800'
                    }`}
                  >
                    <div
                      className={`w-4 h-4 rounded-full bg-white transition-transform ${
                        canvasNoise ? 'translate-x-4' : 'translate-x-0'
                      }`}
                    />
                  </button>
                </div>

                {/* Toggle 3: WebRTC Leak Shield */}
                <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800 flex items-center justify-between">
                  <div className="space-y-1 pr-4">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-semibold text-white">WebRTC Local IP Leak Shield</span>
                    </div>
                    <p className="text-[11px] text-slate-400 leading-relaxed">
                      Blocks STUN/TURN ICE candidate queries from revealing private LAN IPv4/IPv6 addresses to websites.
                    </p>
                  </div>
                  <button
                    onClick={() => setWebrtcShield(!webrtcShield)}
                    className={`w-10 h-6 rounded-full p-1 transition-colors cursor-pointer shrink-0 ${
                      webrtcShield ? 'bg-emerald-600' : 'bg-slate-800'
                    }`}
                  >
                    <div
                      className={`w-4 h-4 rounded-full bg-white transition-transform ${
                        webrtcShield ? 'translate-x-4' : 'translate-x-0'
                      }`}
                    />
                  </button>
                </div>

                {/* Toggle 4: Multi-Account Cookie Isolation */}
                <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800 flex items-center justify-between">
                  <div className="space-y-1 pr-4">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-semibold text-white">Dynamic Cookie Sandbox Isolation</span>
                    </div>
                    <p className="text-[11px] text-slate-400 leading-relaxed">
                      Stores cookies in partitioned sub-domains preventing cross-site session correlation and tracking pixels.
                    </p>
                  </div>
                  <button
                    onClick={() => setCookieIsolation(!cookieIsolation)}
                    className={`w-10 h-6 rounded-full p-1 transition-colors cursor-pointer shrink-0 ${
                      cookieIsolation ? 'bg-emerald-600' : 'bg-slate-800'
                    }`}
                  >
                    <div
                      className={`w-4 h-4 rounded-full bg-white transition-transform ${
                        cookieIsolation ? 'translate-x-4' : 'translate-x-0'
                      }`}
                    />
                  </button>
                </div>
              </div>
            </div>

            {/* Live Block Logs */}
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
              <h3 className="text-sm font-bold text-white mb-3 flex items-center gap-2">
                <Terminal className="w-4 h-4 text-emerald-400" />
                Interception & Deflection Radar
              </h3>
              <div className="space-y-2">
                {[
                  { type: 'TRACKER', target: 'analytics.google.com/g/collect', status: 'DROPPED', time: '12s ago' },
                  { type: 'BEACON', target: 'connect.facebook.net/signals/config', status: 'BLOCKED', time: '28s ago' },
                  { type: 'CANVAS', target: 'HTMLCanvasElement.toDataURL() spoofed with random salt', status: 'DEFLECTED', time: '45s ago' },
                  { type: 'WEBRTC', target: 'RTCPeerConnection STUN candidate discovery masked', status: 'ISOLATED', time: '1m ago' },
                ].map((item, idx) => (
                  <div
                    key={idx}
                    className="p-3 rounded-lg bg-slate-950/80 border border-slate-800/80 flex items-center justify-between text-xs font-mono"
                  >
                    <div className="flex items-center gap-2.5">
                      <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-rose-500/10 text-rose-400 border border-rose-500/20">
                        {item.type}
                      </span>
                      <span className="text-slate-300 truncate max-w-md">{item.target}</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-emerald-400 font-semibold">{item.status}</span>
                      <span className="text-slate-500 text-[11px]">{item.time}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {activeTabPanel === 'crypto' && (
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-4">
            <h3 className="text-sm font-bold text-white mb-2">Cryptographic Handshake Architecture</h3>
            <div className="space-y-3 font-mono text-xs">
              <div className="p-4 rounded-xl bg-slate-950 border border-slate-800">
                <span className="text-slate-400 block mb-1 text-[11px] uppercase tracking-wider font-sans">
                  Active Cipher Suite
                </span>
                <p className="text-emerald-300 font-bold">{mockAudit.cipherSuite}</p>
              </div>

              <div className="p-4 rounded-xl bg-slate-950 border border-slate-800">
                <span className="text-slate-400 block mb-1 text-[11px] uppercase tracking-wider font-sans">
                  Key Encapsulation Mechanism (KEM)
                </span>
                <p className="text-purple-300 font-bold">X25519 + Kyber-768 (Module-Lattice-Based KEM)</p>
                <p className="text-[11px] font-sans text-slate-400 mt-1">
                  Protects symmetric session keys even against hypothetical cryptanalytically relevant quantum computers (CRQC).
                </p>
              </div>

              <div className="p-4 rounded-xl bg-slate-950 border border-slate-800">
                <span className="text-slate-400 block mb-1 text-[11px] uppercase tracking-wider font-sans">
                  Symmetric Encryption & Authentication
                </span>
                <p className="text-cyan-300 font-bold">AES-256-GCM (Galois/Counter Mode with 128-bit ICV)</p>
              </div>
            </div>
          </div>
        )}

        {activeTabPanel === 'certificates' && (
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-4">
            <h3 className="text-sm font-bold text-white mb-2">X.509 Digital Certificate Validation</h3>
            <div className="space-y-3 text-xs">
              <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
                <div className="flex justify-between">
                  <span className="text-slate-400">Subject Name (CN):</span>
                  <span className="text-white font-mono font-semibold">{mockAudit.certificate.subject}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Certificate Authority (Issuer):</span>
                  <span className="text-emerald-300 font-semibold">{mockAudit.certificate.issuer}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Validity Horizon:</span>
                  <span className="text-slate-300">{mockAudit.certificate.validFrom} to {mockAudit.certificate.validTo}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Public Key Algorithm:</span>
                  <span className="text-slate-300 font-mono">{mockAudit.certificate.keyAlgorithm}</span>
                </div>
                <div className="pt-2 border-t border-slate-800">
                  <span className="text-slate-400 block mb-1">SHA-256 Fingerprint:</span>
                  <p className="font-mono text-purple-300 text-[11px] break-all">{mockAudit.certificate.fingerprintSha256}</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTabPanel === 'csp' && (
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-4">
            <h3 className="text-sm font-bold text-white mb-2">Content Security Policy (CSP) Directives</h3>
            <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 font-mono text-xs text-slate-300 space-y-2">
              <p><span className="text-purple-400 font-bold">default-src</span> 'self';</p>
              <p><span className="text-purple-400 font-bold">script-src</span> 'self' https://trusted.cdn.com 'wasm-unsafe-eval';</p>
              <p><span className="text-purple-400 font-bold">style-src</span> 'self' 'unsafe-inline' https://fonts.googleapis.com;</p>
              <p><span className="text-purple-400 font-bold">connect-src</span> 'self' https://api.aksh.browser wss://quic.aksh.internal;</p>
              <p><span className="text-purple-400 font-bold">upgrade-insecure-requests</span>;</p>
              <p><span className="text-purple-400 font-bold">frame-ancestors</span> 'none';</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
