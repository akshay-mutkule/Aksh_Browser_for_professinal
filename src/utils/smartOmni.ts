export interface SmartOmniResult {
  type: 'math' | 'unit' | 'currency' | 'timezone' | 'bang' | 'protocol';
  title: string;
  value: string;
  description?: string;
  targetUrl?: string;
  iconName?: string;
}

export const BANG_COMMANDS: Record<
  string,
  { title: string; description: string; targetUrl: string; category: string }
> = {
  '!agent': {
    title: 'Autonomous Agent Swarm',
    description: 'Launch multi-agent autonomous web research and DOM automation',
    targetUrl: 'aksh://agent',
    category: 'Autonomous AI',
  },
  '!swarm': {
    title: 'Autonomous Agent Swarm',
    description: 'Launch multi-agent autonomous web research and DOM automation',
    targetUrl: 'aksh://agent',
    category: 'Autonomous AI',
  },
  '!ai': {
    title: 'Gemini 3.7 Deep Research',
    description: 'Autonomous multi-step synthesis and academic research',
    targetUrl: 'aksh://research',
    category: 'Frontier AI',
  },
  '!gemini': {
    title: 'Gemini 3.7 Deep Research',
    description: 'Autonomous multi-step synthesis and academic research',
    targetUrl: 'aksh://research',
    category: 'Frontier AI',
  },
  '!term': {
    title: 'Omni Terminal Quake Shell',
    description: 'Integrated browser command line interface & dev tools',
    targetUrl: 'aksh://terminal',
    category: 'Dev Tools',
  },
  '!cli': {
    title: 'Omni Terminal Quake Shell',
    description: 'Integrated browser command line interface & dev tools',
    targetUrl: 'aksh://terminal',
    category: 'Dev Tools',
  },
  '!sh': {
    title: 'Omni Terminal Quake Shell',
    description: 'Integrated browser command line interface & dev tools',
    targetUrl: 'aksh://terminal',
    category: 'Dev Tools',
  },
  '!matrix': {
    title: 'Model Matrix Arena',
    description: 'Side-by-side LLM benchmark: Gemini 3.7 vs Claude 3.7 vs GPT-4o',
    targetUrl: 'aksh://matrix',
    category: 'Frontier AI',
  },
  '!sandbox': {
    title: 'Code Sandbox REPL',
    description: 'Live in-browser multi-language compiler & execution playground',
    targetUrl: 'aksh://sandbox',
    category: 'Dev Tools',
  },
  '!code': {
    title: 'Code Sandbox REPL',
    description: 'Live in-browser multi-language compiler & execution playground',
    targetUrl: 'aksh://sandbox',
    category: 'Dev Tools',
  },
  '!repl': {
    title: 'Code Sandbox REPL',
    description: 'Live in-browser multi-language compiler & execution playground',
    targetUrl: 'aksh://sandbox',
    category: 'Dev Tools',
  },
  '!diff': {
    title: 'Semantic Diff & Time Machine',
    description: 'Visual side-by-side diffing and DOM evolution inspector',
    targetUrl: 'aksh://diff',
    category: 'Dev Tools',
  },
  '!vault': {
    title: 'Neural Memory Vault',
    description: 'Persistent knowledge graph & semantic memory retrieval',
    targetUrl: 'aksh://memory',
    category: 'Knowledge',
  },
  '!memory': {
    title: 'Neural Memory Vault',
    description: 'Persistent knowledge graph & semantic memory retrieval',
    targetUrl: 'aksh://memory',
    category: 'Knowledge',
  },
  '!network': {
    title: 'Network Studio & Traffic Radar',
    description: 'HAR inspector, WebSocket debugger, and latency visualizer',
    targetUrl: 'aksh://network',
    category: 'Dev Tools',
  },
  '!tools': {
    title: 'Developer Micro-Tools Matrix',
    description: 'JWT, Regex, Base64, UUID, Hash, and JSON formatters',
    targetUrl: 'aksh://tools',
    category: 'Dev Tools',
  },
  '!api': {
    title: 'Mock API & Webhook Studio',
    description: 'Design mock endpoints, schema validation, and webhooks',
    targetUrl: 'aksh://apibuilder',
    category: 'Dev Tools',
  },
  '!notes': {
    title: 'AI Notebook & Cornell Notes',
    description: 'Bilingual Cornell notes, markdown exporter, and mindmaps',
    targetUrl: 'aksh://notes',
    category: 'Knowledge',
  },
  '!security': {
    title: 'Post-Quantum Security Center',
    description: 'Kyber-1024 cipher diagnostics and tracker blocking shield',
    targetUrl: 'aksh://security',
    category: 'Security',
  },
  '!tasks': {
    title: 'Quantum Task Manager',
    description: 'Tab memory saver, process manager, and V8 garbage collector',
    targetUrl: 'aksh://tasks',
    category: 'System',
  },
  '!synth': {
    title: 'Cross-Tab Dossier Synthesis',
    description: 'Synthesize insights across all currently open tabs',
    targetUrl: 'action:synth',
    category: 'Frontier AI',
  },
  '!dossier': {
    title: 'Cross-Tab Dossier Synthesis',
    description: 'Synthesize insights across all currently open tabs',
    targetUrl: 'action:synth',
    category: 'Frontier AI',
  },
  '!voice': {
    title: 'Voice Assistant Co-Pilot',
    description: 'Hands-free ambient voice recognition & audio controls',
    targetUrl: 'action:voice',
    category: 'Frontier AI',
  },
};

export const evaluateSmartOmni = (input: string): SmartOmniResult | null => {
  const clean = input.trim();
  if (!clean || clean.length < 2) return null;

  // 1. Bang commands
  if (clean.startsWith('!')) {
    const parts = clean.split(' ');
    const bang = parts[0].toLowerCase();
    const query = parts.slice(1).join(' ').trim();
    if (BANG_COMMANDS[bang]) {
      const b = BANG_COMMANDS[bang];
      let target = b.targetUrl;
      if (query && !target.startsWith('action:')) {
        target = `${target}${target.includes('?') ? '&' : '?'}q=${encodeURIComponent(query)}`;
      }
      return {
        type: 'bang',
        title: b.title,
        value: query ? `${b.title}: "${query}"` : b.title,
        description: b.description,
        targetUrl: target,
        iconName: 'Zap',
      };
    }
  }

  // 2. Math percentages
  const percentMatch = clean.match(/^([\d.]+)\s*%\s*(?:of|\*)\s*([\d.]+)$/i);
  if (percentMatch) {
    const p = parseFloat(percentMatch[1]);
    const total = parseFloat(percentMatch[2]);
    if (!isNaN(p) && !isNaN(total)) {
      const res = (p / 100) * total;
      return {
        type: 'math',
        title: 'Percentage Calculator',
        value: Number.isInteger(res) ? String(res) : String(Number(res.toFixed(4))),
        description: `${p}% of ${total}`,
        iconName: 'Calculator',
      };
    }
  }

  // 3. Distance & Unit conversions
  const kmToMiles = clean.match(/^([\d.]+)\s*(?:km|kms|kilometers?)\s*(?:to|in)\s*(?:miles?|mi)$/i);
  if (kmToMiles) {
    const v = parseFloat(kmToMiles[1]);
    if (!isNaN(v)) {
      return {
        type: 'unit',
        title: 'Length Conversion',
        value: `${(v * 0.621371).toFixed(2)} miles`,
        description: `${v} km`,
        iconName: 'Scale',
      };
    }
  }

  const milesToKm = clean.match(/^([\d.]+)\s*(?:miles?|mi)\s*(?:to|in)\s*(?:km|kms|kilometers?)$/i);
  if (milesToKm) {
    const v = parseFloat(milesToKm[1]);
    if (!isNaN(v)) {
      return {
        type: 'unit',
        title: 'Length Conversion',
        value: `${(v * 1.60934).toFixed(2)} km`,
        description: `${v} miles`,
        iconName: 'Scale',
      };
    }
  }

  // 4. Temperature conversions
  const cToF = clean.match(/^([\d.]+)\s*(?:c|celsius)\s*(?:to|in)\s*(?:f|fahrenheit)$/i);
  if (cToF) {
    const v = parseFloat(cToF[1]);
    if (!isNaN(v)) {
      return {
        type: 'unit',
        title: 'Temperature Conversion',
        value: `${(v * 1.8 + 32).toFixed(1)} °F`,
        description: `${v} °C`,
        iconName: 'Scale',
      };
    }
  }

  const fToC = clean.match(/^([\d.]+)\s*(?:f|fahrenheit)\s*(?:to|in)\s*(?:c|celsius)$/i);
  if (fToC) {
    const v = parseFloat(fToC[1]);
    if (!isNaN(v)) {
      return {
        type: 'unit',
        title: 'Temperature Conversion',
        value: `${((v - 32) * (5 / 9)).toFixed(1)} °C`,
        description: `${v} °F`,
        iconName: 'Scale',
      };
    }
  }

  // 5. Currency conversions
  const usdToEur = clean.match(/^([\d.]+)\s*(?:usd|dollars?)\s*(?:to|in)\s*eur(?:o|os)?$/i);
  if (usdToEur) {
    const v = parseFloat(usdToEur[1]);
    if (!isNaN(v)) {
      return {
        type: 'currency',
        title: 'Currency Conversion',
        value: `€${(v * 0.92).toFixed(2)} EUR`,
        description: `$${v} USD`,
        iconName: 'Zap',
      };
    }
  }

  const eurToUsd = clean.match(/^([\d.]+)\s*eur(?:o|os)?\s*(?:to|in)\s*(?:usd|dollars?)$/i);
  if (eurToUsd) {
    const v = parseFloat(eurToUsd[1]);
    if (!isNaN(v)) {
      return {
        type: 'currency',
        title: 'Currency Conversion',
        value: `$${(v * 1.09).toFixed(2)} USD`,
        description: `€${v} EUR`,
        iconName: 'Zap',
      };
    }
  }

  // 6. Data Storage conversions
  const mbToGb = clean.match(/^([\d.]+)\s*mb\s*(?:to|in)\s*gb$/i);
  if (mbToGb) {
    const v = parseFloat(mbToGb[1]);
    if (!isNaN(v)) {
      return {
        type: 'unit',
        title: 'Data Storage',
        value: `${(v / 1024).toFixed(3)} GB`,
        description: `${v} MB`,
        iconName: 'Cpu',
      };
    }
  }

  const gbToMb = clean.match(/^([\d.]+)\s*gb\s*(?:to|in)\s*mb$/i);
  if (gbToMb) {
    const v = parseFloat(gbToMb[1]);
    if (!isNaN(v)) {
      return {
        type: 'unit',
        title: 'Data Storage',
        value: `${(v * 1024).toLocaleString()} MB`,
        description: `${v} GB`,
        iconName: 'Cpu',
      };
    }
  }

  // 7. Time in City / Timezone
  const timeCityMatch = clean.match(/^time\s*(?:in|for)?\s*([a-zA-Z\s]+)$/i);
  if (timeCityMatch) {
    const city = timeCityMatch[1].trim().toLowerCase();
    const tzMap: Record<string, string> = {
      tokyo: 'Asia/Tokyo',
      japan: 'Asia/Tokyo',
      london: 'Europe/London',
      uk: 'Europe/London',
      paris: 'Europe/Paris',
      france: 'Europe/Paris',
      berlin: 'Europe/Berlin',
      germany: 'Europe/Berlin',
      dubai: 'Asia/Dubai',
      singapore: 'Asia/Singapore',
      sydney: 'Australia/Sydney',
      melbourne: 'Australia/Sydney',
      'new york': 'America/New_York',
      nyc: 'America/New_York',
      sf: 'America/Los_Angeles',
      'san francisco': 'America/Los_Angeles',
      california: 'America/Los_Angeles',
      toronto: 'America/Toronto',
      delhi: 'Asia/Kolkata',
      mumbai: 'Asia/Kolkata',
      india: 'Asia/Kolkata',
    };
    if (tzMap[city]) {
      try {
        const timeStr = new Intl.DateTimeFormat('en-US', {
          timeZone: tzMap[city],
          hour: '2-digit',
          minute: '2-digit',
          second: '2-digit',
          hour12: true,
          weekday: 'short',
        }).format(new Date());
        return {
          type: 'timezone',
          title: `Current Time in ${city.charAt(0).toUpperCase() + city.slice(1)}`,
          value: timeStr,
          description: tzMap[city],
          iconName: 'Clock',
        };
      } catch {}
    }
  }

  // 8. General Math expressions (+, -, *, /, ^, sqrt, sin, cos)
  const cleanMath = clean
    .replace(/sqrt\(([^)]+)\)/gi, 'Math.sqrt($1)')
    .replace(/sin\(([^)]+)\)/gi, 'Math.sin($1)')
    .replace(/cos\(([^)]+)\)/gi, 'Math.cos($1)')
    .replace(/log\(([^)]+)\)/gi, 'Math.log10($1)')
    .replace(/\^/g, '**');

  if (/^[\d\s+\-*/().^%]|Math\./.test(cleanMath) && /[+\-*/^%]|Math\./.test(cleanMath)) {
    try {
      const result = new Function(`"use strict"; return (${cleanMath});`)();
      if (typeof result === 'number' && !isNaN(result) && isFinite(result)) {
        const displayVal = Number.isInteger(result) ? String(result) : String(Number(result.toFixed(4)));
        return {
          type: 'math',
          title: 'Instant Math Calculation',
          value: displayVal,
          description: clean,
          iconName: 'Calculator',
        };
      }
    } catch {
      return null;
    }
  }

  return null;
};
