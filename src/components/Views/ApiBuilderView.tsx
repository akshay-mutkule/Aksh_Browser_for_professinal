import React, { useState, useMemo } from 'react';
import {
  Webhook,
  Play,
  RotateCw,
  Copy,
  Check,
  Download,
  Terminal,
  Code2,
  FileJson,
  Layers,
  Sparkles,
  Send,
  Database,
  Globe,
  Radio,
  CheckCircle2,
  ExternalLink,
  Plus,
  Trash2,
  Sliders,
  Shield,
  Activity,
  FileCode,
  Share2,
  Save,
  Braces,
  Settings,
  Server
} from 'lucide-react';
import { Tab } from '../../types';
import { scrapeWebpage, sendAIChat } from '../../services/api';

interface ApiBuilderViewProps {
  activeTab: Tab | null;
  onSaveAsNote: (title: string, content: string) => void;
  onNavigateUrl: (url: string) => void;
}

interface EndpointParam {
  key: string;
  value: string;
  enabled: boolean;
  description?: string;
}

interface RequestHeader {
  key: string;
  value: string;
  enabled: boolean;
}

interface EndpointSpec {
  method: 'GET' | 'POST' | 'PUT' | 'DELETE';
  path: string;
  desc: string;
  params: string[];
  sampleResponse: any;
  requestBody?: any;
}

interface ApiSpec {
  title: string;
  description: string;
  version: string;
  baseUrl: string;
  endpoints: EndpointSpec[];
  typescriptTypes: string;
  graphQlSchema?: string;
}

const PRESET_TARGETS = [
  {
    name: 'Hacker News Frontpage',
    url: 'https://news.ycombinator.com',
    desc: 'Tech intelligence, submissions & scores'
  },
  {
    name: 'GitHub Trending',
    url: 'https://github.com/trending',
    desc: 'Open-source repositories, stars & authors'
  },
  {
    name: 'ArXiv Quantum AI',
    url: 'https://arxiv.org/archive/quant-ph',
    desc: 'Scientific preprints, abstracts & citations'
  },
  {
    name: 'CoinGecko Crypto',
    url: 'https://www.coingecko.com',
    desc: 'Market caps, tokens, volumes & 24h delta'
  }
];

export const ApiBuilderView: React.FC<ApiBuilderViewProps> = ({
  activeTab,
  onSaveAsNote,
  onNavigateUrl,
}) => {
  const [targetUrl, setTargetUrl] = useState<string>(
    activeTab?.url && activeTab.url.startsWith('http')
      ? activeTab.url
      : 'https://news.ycombinator.com'
  );
  const [isGenerating, setIsGenerating] = useState<boolean>(false);
  const [activeTabCode, setActiveTabCode] = useState<
    'endpoints' | 'openapi' | 'graphql' | 'express' | 'types' | 'curl' | 'python' | 'webhooks'
  >('endpoints');
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  // OpenAPI format toggle (yaml vs json)
  const [openApiFormat, setOpenApiFormat] = useState<'yaml' | 'json'>('yaml');

  // GraphQL Playground State
  const [gqlQuery, setGqlQuery] = useState<string>(
`query GetTopStories {
  stories(limit: 3, sort: "points") {
    id
    title
    domain
    points
    comments
  }
}`
  );
  const [gqlResult, setGqlResult] = useState<any>(null);
  const [isExecutingGql, setIsExecutingGql] = useState<boolean>(false);

  // Live Test Client State
  const [selectedEndpointKey, setSelectedEndpointKey] = useState<string>('GET /api/v1/stories');
  const [testResponse, setTestResponse] = useState<any>(null);
  const [testLatency, setTestLatency] = useState<number>(0);
  const [testStatusCode, setTestStatusCode] = useState<number>(200);
  const [isTesting, setIsTesting] = useState<boolean>(false);
  const [testClientTab, setTestClientTab] = useState<'params' | 'headers' | 'body'>('params');

  // Webhook State
  const [webhookUrl, setWebhookUrl] = useState<string>('https://webhook.site/aksh-live-dispatch');
  const [webhookSecret, setWebhookSecret] = useState<string>('whsec_live_9f82k3m401a9x');
  const [selectedWebhookEvents, setSelectedWebhookEvents] = useState<string[]>([
    'data.updated',
    'entity.extracted'
  ]);
  const [webhookLogs, setWebhookLogs] = useState<
    Array<{ id: string; timestamp: string; event: string; status: number; signature: string; payload: any }>
  >([]);

  // Interactive Query Parameters for Live Test Client
  const [queryParams, setQueryParams] = useState<EndpointParam[]>([
    { key: 'limit', value: '3', enabled: true, description: 'Max items to return' },
    { key: 'sort', value: 'points', enabled: true, description: 'Sort criteria' },
    { key: 'filter', value: 'all', enabled: false, description: 'Category filter' }
  ]);

  // Request Headers for Live Test Client
  const [requestHeaders, setRequestHeaders] = useState<RequestHeader[]>([
    { key: 'Authorization', value: 'Bearer aksh_live_session_token', enabled: true },
    { key: 'Accept', value: 'application/json', enabled: true },
    { key: 'X-Aksh-Client-Version', value: '3.8.4', enabled: true }
  ]);

  // Request Body for POST/PUT endpoints
  const [postRequestBody, setPostRequestBody] = useState<string>(
    JSON.stringify({ query: 'quantum computing benchmarks', depth: 'deep', maxResults: 10 }, null, 2)
  );

  // New Endpoint Modal state
  const [showAddEndpointModal, setShowAddEndpointModal] = useState<boolean>(false);
  const [newEndpointData, setNewEndpointData] = useState<{
    method: 'GET' | 'POST';
    path: string;
    desc: string;
    params: string;
    sampleResponse: string;
  }>({
    method: 'GET',
    path: '/api/v1/metrics',
    desc: 'Retrieve extracted benchmark telemetry and engagement stats',
    params: 'format=json,aggregate=true',
    sampleResponse: JSON.stringify({ status: 'success', totalReads: 1420, avgLatencyMs: 38 }, null, 2)
  });

  // Generated Spec Data
  const [apiSpec, setApiSpec] = useState<ApiSpec>({
    title: 'HackerNews Intelligence REST API',
    description: 'Autonomous structured entity, ranking, and discussion API derived from live DOM.',
    version: '1.0.0',
    baseUrl: 'https://api.aksh.dev',
    endpoints: [
      {
        method: 'GET',
        path: '/api/v1/stories',
        desc: 'Retrieve top trending tech submissions, points, and domain sources',
        params: ['limit=10', 'sort=points'],
        sampleResponse: {
          status: 'success',
          count: 3,
          data: [
            { id: 40129, title: 'Show HN: Aksh AI Browser with Neural Canvas & Sandbox', domain: 'aksh.dev', points: 342, comments: 84 },
            { id: 40130, title: 'Quantum Supremacy in 2026: Benchmark Results', domain: 'nature.com', points: 289, comments: 112 },
            { id: 40131, title: 'TypeScript 5.8: ECMAScript 2026 Features', domain: 'typescriptlang.org', points: 215, comments: 46 }
          ]
        }
      },
      {
        method: 'GET',
        path: '/api/v1/entities',
        desc: 'Extract named corporate entities, technological frameworks, and benchmark metrics',
        params: ['filter=tech,org', 'limit=5'],
        sampleResponse: {
          status: 'success',
          entities: [
            { name: 'Google Quantum AI', category: 'org', mentions: 14, confidence: 0.98 },
            { name: 'Gemini 3.7 Flash', category: 'tech', mentions: 9, confidence: 0.99 },
            { name: 'WebGPU 2.0', category: 'tech', mentions: 6, confidence: 0.95 }
          ]
        }
      },
      {
        method: 'POST',
        path: '/api/v1/synthesize',
        desc: 'Execute Gemini multi-stage synthesis across extracted articles',
        params: ['depth=deep'],
        requestBody: {
          query: 'quantum error correction',
          depth: 'deep',
          includeCitations: true
        },
        sampleResponse: {
          status: 'success',
          summary: 'Dominant theme centers on quantum error correction threshold breakthroughs and client-side AI inference scaling.',
          entitiesDetected: ['Kyber-1024', 'Qiskit', 'Cirq'],
          confidence: 0.986,
          latencyMs: 38
        }
      }
    ],
    typescriptTypes: `export interface StoryItem {
  id: number;
  title: string;
  domain: string;
  points: number;
  comments: number;
}

export interface ExtractedEntity {
  name: string;
  category: 'org' | 'tech' | 'metric';
  mentions: number;
  confidence: number;
}

export interface SynthesisRequest {
  query: string;
  depth?: 'fast' | 'deep';
  includeCitations?: boolean;
}

export interface ApiResponse<T> {
  status: 'success' | 'error';
  data?: T;
  entities?: ExtractedEntity[];
  summary?: string;
  latencyMs?: number;
}`,
    graphQlSchema: `type StoryItem {
  id: Int!
  title: String!
  domain: String!
  points: Int!
  comments: Int!
}

type ExtractedEntity {
  name: String!
  category: String!
  mentions: Int!
  confidence: Float!
}

type SynthesisResult {
  status: String!
  summary: String!
  entitiesDetected: [String!]!
  confidence: Float!
  latencyMs: Int!
}

type Query {
  stories(limit: Int = 10, sort: String = "points"): [StoryItem!]!
  entities(filter: String, limit: Int = 5): [ExtractedEntity!]!
}

type Mutation {
  synthesize(query: String!, depth: String = "deep"): SynthesisResult!
}`
  });

  // Calculate current active endpoint
  const currentEndpoint = useMemo(() => {
    const [method, path] = selectedEndpointKey.split(' ');
    return apiSpec.endpoints.find((e) => e.method === method && e.path === path) || apiSpec.endpoints[0];
  }, [selectedEndpointKey, apiSpec.endpoints]);

  // Synchronize queryParams when switching endpoints
  const handleSelectEndpoint = (ep: EndpointSpec) => {
    setSelectedEndpointKey(`${ep.method} ${ep.path}`);
    const parsedParams: EndpointParam[] = (ep.params || []).map((p) => {
      const [key, value] = p.split('=');
      return {
        key: key || 'param',
        value: value || '',
        enabled: true,
        description: `Query parameter ${key}`
      };
    });
    setQueryParams(parsedParams.length > 0 ? parsedParams : [{ key: 'limit', value: '10', enabled: true }]);
    if (ep.requestBody) {
      setPostRequestBody(JSON.stringify(ep.requestBody, null, 2));
    }
  };

  // Build the effective live test URL
  const effectiveRequestUrl = useMemo(() => {
    const activeParams = queryParams
      .filter((p) => p.enabled && p.key.trim())
      .map((p) => `${encodeURIComponent(p.key.trim())}=${encodeURIComponent(p.value.trim())}`);
    const qs = activeParams.length > 0 ? `?${activeParams.join('&')}` : '';
    return `${apiSpec.baseUrl}${currentEndpoint.path}${qs}`;
  }, [apiSpec.baseUrl, currentEndpoint.path, queryParams]);

  // Handle AI API Generation
  const handleGenerateApi = async (overrideUrl?: string) => {
    const urlToScrape = overrideUrl || targetUrl;
    if (!urlToScrape) return;
    setIsGenerating(true);
    try {
      const pageData = await scrapeWebpage(urlToScrape);
      const prompt = `You are the Aksh Autonomous Web-to-API & GraphQL Architect.
Analyze this webpage and synthesize a developer-grade REST API, GraphQL Schema, and TypeScript definitions:
URL: ${urlToScrape}
Title: ${pageData.title}
Headings: ${(pageData.headings || []).slice(0, 8).join(', ')}

Content Sample:
"""
${(pageData.textContent || '').slice(0, 4000)}
"""

Produce ONLY valid JSON with this exact schema:
{
  "title": "${(pageData.title || 'Extracted Web').replace(/"/g, '')} Intelligence API",
  "description": "Autonomous structured API generated directly from live web DOM.",
  "version": "1.0.0",
  "baseUrl": "https://api.aksh.dev",
  "endpoints": [
    {
      "method": "GET",
      "path": "/api/v1/items",
      "desc": "Retrieve structured items, scores, and metadata from the page",
      "params": ["limit=10", "sort=desc"],
      "sampleResponse": {
        "status": "success",
        "count": 3,
        "data": [
          { "id": 1, "title": "Example extracted item 1", "score": 98 },
          { "id": 2, "title": "Example extracted item 2", "score": 85 }
        ]
      }
    },
    {
      "method": "GET",
      "path": "/api/v1/entities",
      "desc": "Extract named entities, frameworks, and metrics",
      "params": ["category=all", "confidence=0.9"],
      "sampleResponse": {
        "status": "success",
        "entities": [
          { "name": "Key Entity", "category": "tech", "confidence": 0.98 }
        ]
      }
    },
    {
      "method": "POST",
      "path": "/api/v1/synthesize",
      "desc": "Execute cognitive synthesis query",
      "params": ["depth=deep"],
      "requestBody": { "query": "string", "depth": "deep" },
      "sampleResponse": {
        "status": "success",
        "summary": "Synthesized executive findings from page content.",
        "latencyMs": 35
      }
    }
  ],
  "typescriptTypes": "export interface Item { ... }",
  "graphQlSchema": "type Item { id: ID! title: String! } type Query { items(limit: Int): [Item!]! }"
}`;

      const res = await sendAIChat(prompt, [], undefined, 'technical', 'gemini-3.7-flash');
      try {
        const cleanJson = res.reply.replace(/^```(?:json)?\n?/i, '').replace(/```$/i, '').trim();
        const parsed = JSON.parse(cleanJson);
        if (parsed.endpoints && parsed.typescriptTypes) {
          setApiSpec(parsed);
          handleSelectEndpoint(parsed.endpoints[0]);
        }
      } catch (parseErr) {
        console.warn('Fallback: parsed raw spec text', parseErr);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsGenerating(false);
    }
  };

  // Test Endpoint Execution with Realistic Data Slicing
  const handleTestEndpoint = () => {
    setIsTesting(true);
    setTestResponse(null);
    const start = performance.now();

    setTimeout(() => {
      let responseData = JSON.parse(JSON.stringify(currentEndpoint.sampleResponse));

      // Slicing logic based on active 'limit' param
      const limitParam = queryParams.find((p) => p.enabled && p.key === 'limit');
      if (limitParam && responseData.data && Array.isArray(responseData.data)) {
        const limit = parseInt(limitParam.value, 10);
        if (!isNaN(limit) && limit > 0) {
          responseData.data = responseData.data.slice(0, limit);
          responseData.count = responseData.data.length;
        }
      }

      setTestResponse(responseData);
      setTestStatusCode(200);
      setTestLatency(Math.round(performance.now() - start + 24));
      setIsTesting(false);
    }, 320);
  };

  // Execute Simulated GraphQL Query
  const handleExecuteGraphQL = () => {
    setIsExecutingGql(true);
    setTimeout(() => {
      // Mock resolver responding to GraphQL Query
      if (gqlQuery.includes('stories') || gqlQuery.includes('items')) {
        const storiesEp = apiSpec.endpoints.find((e) => e.path.includes('stories') || e.path.includes('items')) || apiSpec.endpoints[0];
        const rawItems = storiesEp.sampleResponse.data || storiesEp.sampleResponse.items || [];
        setGqlResult({
          data: {
            stories: rawItems.slice(0, 3)
          }
        });
      } else if (gqlQuery.includes('entities')) {
        const entitiesEp = apiSpec.endpoints.find((e) => e.path.includes('entities')) || apiSpec.endpoints[1];
        setGqlResult({
          data: {
            entities: entitiesEp.sampleResponse.entities || []
          }
        });
      } else {
        setGqlResult({
          data: {
            result: apiSpec.endpoints[0].sampleResponse
          }
        });
      }
      setIsExecutingGql(false);
    }, 280);
  };

  // Trigger Simulated Webhook Dispatch
  const handleTriggerWebhook = () => {
    const timestamp = new Date().toISOString();
    const eventType = selectedWebhookEvents[0] || 'data.updated';
    const mockHmac = 'sha256=' + Array.from({ length: 40 }, () => Math.floor(Math.random() * 16).toString(16)).join('');

    const newLog = {
      id: `wh_${Date.now()}`,
      timestamp,
      event: eventType,
      status: 200,
      signature: mockHmac,
      payload: {
        event: eventType,
        source: targetUrl,
        timestamp,
        data: currentEndpoint.sampleResponse
      }
    };

    setWebhookLogs((prev) => [newLog, ...prev.slice(0, 9)]);
  };

  const copyToClipboard = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  const downloadFile = (content: string, filename: string, type: string) => {
    const blob = new Blob([content], { type });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
  };

  // Helper to generate OpenAPI 3.1 YAML
  const generateOpenApiYaml = (): string => {
    const pathsYaml = apiSpec.endpoints
      .map((ep) => {
        const methodLower = ep.method.toLowerCase();
        const paramList = (ep.params || [])
          .map((p) => {
            const [name] = p.split('=');
            return `        - name: ${name}
          in: query
          required: false
          schema:
            type: string`;
          })
          .join('\n');

        const requestBodyYaml = ep.requestBody
          ? `      requestBody:
        required: true
        content:
          application/json:
            schema:
              type: object`
          : '';

        return `  ${ep.path}:
    ${methodLower}:
      summary: "${ep.desc.replace(/"/g, "'")}"
      operationId: "${methodLower}_${ep.path.replace(/[^a-zA-Z0-9]/g, '_')}"
      ${paramList ? `parameters:\n${paramList}` : ''}
${requestBodyYaml}
      responses:
        '200':
          description: Successful response
          content:
            application/json:
              schema:
                type: object`;
      })
      .join('\n');

    return `openapi: 3.1.0
info:
  title: "${apiSpec.title}"
  description: "${apiSpec.description}"
  version: "${apiSpec.version}"
servers:
  - url: "${apiSpec.baseUrl}"
    description: Production Edge Gateway
paths:
${pathsYaml}
components:
  securitySchemes:
    BearerAuth:
      type: http
      scheme: bearer
      bearerFormat: JWT
security:
  - BearerAuth: []`;
  };

  // Helper to generate OpenAPI 3.1 JSON
  const generateOpenApiJson = (): string => {
    const pathsObj: Record<string, any> = {};
    apiSpec.endpoints.forEach((ep) => {
      const methodLower = ep.method.toLowerCase();
      if (!pathsObj[ep.path]) pathsObj[ep.path] = {};
      pathsObj[ep.path][methodLower] = {
        summary: ep.desc,
        operationId: `${methodLower}_${ep.path.replace(/[^a-zA-Z0-9]/g, '_')}`,
        parameters: (ep.params || []).map((p) => {
          const [name] = p.split('=');
          return {
            name,
            in: 'query',
            required: false,
            schema: { type: 'string' }
          };
        }),
        responses: {
          '200': {
            description: 'Successful response',
            content: {
              'application/json': {
                schema: { type: 'object' },
                example: ep.sampleResponse
              }
            }
          }
        }
      };
      if (ep.requestBody) {
        pathsObj[ep.path][methodLower].requestBody = {
          required: true,
          content: {
            'application/json': {
              schema: { type: 'object' },
              example: ep.requestBody
            }
          }
        };
      }
    });

    return JSON.stringify(
      {
        openapi: '3.1.0',
        info: {
          title: apiSpec.title,
          description: apiSpec.description,
          version: apiSpec.version
        },
        servers: [{ url: apiSpec.baseUrl, description: 'Production Edge Gateway' }],
        paths: pathsObj,
        components: {
          securitySchemes: {
            BearerAuth: {
              type: 'http',
              scheme: 'bearer',
              bearerFormat: 'JWT'
            }
          }
        },
        security: [{ BearerAuth: [] }]
      },
      null,
      2
    );
  };

  // Helper to generate Node.js Express server
  const generateExpressServerCode = (): string => {
    return `import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import rateLimit from 'express-rate-limit';

const app = express();
const PORT = process.env.PORT || 3000;

// Security & Middleware
app.use(cors({ origin: '*' }));
app.use(express.json());

// Rate Limiter: 100 requests per 15 minutes
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  message: { status: 'error', message: 'Too many requests, please slow down.' }
});
app.use('/api/', limiter);

// Target Source Webpage: ${targetUrl}

${apiSpec.endpoints
  .map((ep) => {
    const methodLower = ep.method.toLowerCase();
    return `// ${ep.desc}
app.${methodLower}('${ep.path}', async (req: Request, res: Response) => {
  try {
    const queryParams = req.query;
    // Real extraction or live proxy logic can be injected here
    const result = ${JSON.stringify(ep.sampleResponse, null, 2)};
    return res.json(result);
  } catch (error: any) {
    return res.status(500).json({ status: 'error', error: error.message });
  }
});`;
  })
  .join('\n\n')}

// Health Check
app.get('/health', (_req: Request, res: Response) => {
  res.json({ status: 'healthy', uptime: process.uptime(), timestamp: new Date() });
});

// Global Error Handler
app.use((err: Error, _req: Request, res: Response, _next: NextFunction) => {
  console.error('[API Error]:', err);
  res.status(500).json({ status: 'error', message: 'Internal Server Error' });
});

app.listen(PORT, () => {
  console.log(\`⚡ Aksh Intelligence API listening on http://localhost:\${PORT}\`);
});`;
  };

  // Helper to generate cURL
  const getCurlCode = (): string => {
    const activeParams = queryParams
      .filter((p) => p.enabled && p.key.trim())
      .map((p) => `${p.key}=${p.value}`);
    const qs = activeParams.length > 0 ? `?${activeParams.join('&')}` : '';

    return `curl -X ${currentEndpoint.method} "${apiSpec.baseUrl}${currentEndpoint.path}${qs}" \\
  -H "Authorization: Bearer aksh_live_session_token" \\
  -H "Accept: application/json"${
    currentEndpoint.method === 'POST'
      ? ` \\
  -H "Content-Type: application/json" \\
  -d '${postRequestBody.replace(/\n/g, '')}'`
      : ''
  }`;
  };

  // Helper to generate Python SDK
  const getPythonCode = (): string => {
    return `import requests
import json

BASE_URL = "${apiSpec.baseUrl}"
ENDPOINT = "${currentEndpoint.path}"

headers = {
    "Authorization": "Bearer aksh_live_session_token",
    "Accept": "application/json",
    "Content-Type": "application/json"
}

params = {
${queryParams
  .filter((p) => p.enabled && p.key.trim())
  .map((p) => `    "${p.key}": "${p.value}",`)
  .join('\n')}
}

${
  currentEndpoint.method === 'POST'
    ? `payload = ${postRequestBody}
response = requests.post(f"{BASE_URL}{ENDPOINT}", headers=headers, json=payload, params=params)`
    : `response = requests.get(f"{BASE_URL}{ENDPOINT}", headers=headers, params=params)`
}

if response.status_code == 200:
    data = response.json()
    print("Successfully retrieved payload:")
    print(json.dumps(data, indent=2))
else:
    print(f"Error {response.status_code}: {response.text}")`;
  };

  // Save current API spec as note
  const handleSaveToNotes = () => {
    const content = `# ${apiSpec.title}
**Base URL**: \`${apiSpec.baseUrl}\`
**Source URL**: ${targetUrl}
**Version**: ${apiSpec.version}

## Description
${apiSpec.description}

## Endpoints
${apiSpec.endpoints
  .map((e) => `### \`${e.method} ${e.path}\`\n${e.desc}\n- Query Params: \`${e.params.join(', ') || 'none'}\`\n`)
  .join('\n')}

## TypeScript SDK Definitions
\`\`\`typescript
${apiSpec.typescriptTypes}
\`\`\`
`;
    onSaveAsNote(`${apiSpec.title} (API Spec)`, content);
  };

  // Add Custom Endpoint
  const handleAddCustomEndpoint = () => {
    try {
      const parsedSample = JSON.parse(newEndpointData.sampleResponse);
      const newEp: EndpointSpec = {
        method: newEndpointData.method,
        path: newEndpointData.path.startsWith('/') ? newEndpointData.path : `/${newEndpointData.path}`,
        desc: newEndpointData.desc,
        params: newEndpointData.params.split(',').map((s) => s.trim()).filter(Boolean),
        sampleResponse: parsedSample
      };

      setApiSpec((prev) => ({
        ...prev,
        endpoints: [...prev.endpoints, newEp]
      }));
      setShowAddEndpointModal(false);
      handleSelectEndpoint(newEp);
    } catch {
      // invalid JSON fallback
    }
  };

  return (
    <div className="h-full flex flex-col bg-slate-950 text-slate-100 select-text overflow-hidden font-sans">
      {/* Top Header */}
      <div className="h-14 px-6 bg-slate-900 border-b border-slate-800 flex items-center justify-between shrink-0 gap-4">
        <div className="flex items-center gap-3 shrink-0">
          <div className="p-2 rounded-xl bg-purple-950 text-purple-400 border border-purple-800/40">
            <Webhook className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-sm font-bold text-white tracking-tight">
                Autonomous Web-to-API & GraphQL Suite
              </h1>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-purple-950 text-purple-300 border border-purple-800/60 font-semibold">
                aksh://apibuilder
              </span>
            </div>
            <p className="text-xs text-slate-400">
              Instant REST endpoints, OpenAPI 3.1, GraphQL SDL, and Node.js Express microservices
            </p>
          </div>
        </div>

        {/* Target URL Ingestion Bar & Presets */}
        <div className="flex items-center gap-2 flex-1 max-w-xl justify-end">
          <div className="relative flex-1 max-w-md">
            <input
              type="text"
              value={targetUrl}
              onChange={(e) => setTargetUrl(e.target.value)}
              placeholder="Enter live webpage URL to convert into API..."
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-1.5 text-xs text-slate-100 placeholder-slate-500 outline-none focus:border-purple-500 pr-20"
            />
            <span className="absolute right-2.5 top-2 text-[10px] font-mono text-slate-500">
              Live DOM
            </span>
          </div>

          <button
            onClick={() => handleGenerateApi()}
            disabled={isGenerating || !targetUrl.trim()}
            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-purple-600 hover:bg-purple-500 disabled:opacity-50 text-white font-bold text-xs shadow-md transition-all cursor-pointer shrink-0"
          >
            {isGenerating ? <RotateCw className="w-3.5 h-3.5 animate-spin" /> : <Sparkles className="w-3.5 h-3.5" />}
            <span>{isGenerating ? 'Synthesizing...' : 'Generate API'}</span>
          </button>

          <button
            onClick={handleSaveToNotes}
            className="p-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors cursor-pointer border border-slate-700"
            title="Save Spec to AI Notes"
          >
            <Save className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Target Presets Bar */}
      <div className="px-6 py-1.5 bg-slate-900/60 border-b border-slate-800/80 flex items-center gap-2 text-xs overflow-x-auto shrink-0">
        <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 shrink-0">
          Preset Targets:
        </span>
        {PRESET_TARGETS.map((preset, idx) => (
          <button
            key={idx}
            onClick={() => {
              setTargetUrl(preset.url);
              handleGenerateApi(preset.url);
            }}
            className="px-2.5 py-1 rounded-lg bg-slate-950/80 hover:bg-slate-800 text-slate-400 hover:text-purple-300 border border-slate-800/80 text-[11px] font-medium transition-colors cursor-pointer shrink-0"
          >
            {preset.name}
          </button>
        ))}
      </div>

      {/* Main Split Layout */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left: Specification & Code Studio */}
        <div className="w-1/2 border-r border-slate-800 flex flex-col bg-slate-950">
          {/* Tab Selector */}
          <div className="h-10 px-4 bg-slate-900/80 border-b border-slate-800 flex items-center justify-between text-xs overflow-x-auto shrink-0">
            <div className="flex items-center gap-1">
              {[
                { id: 'endpoints', label: 'Endpoints', icon: Layers },
                { id: 'openapi', label: 'OpenAPI 3.1', icon: FileJson },
                { id: 'graphql', label: 'GraphQL SDL', icon: Braces },
                { id: 'express', label: 'Express.js', icon: Server },
                { id: 'types', label: 'TypeScript', icon: Code2 },
                { id: 'curl', label: 'cURL', icon: Terminal },
                { id: 'python', label: 'Python', icon: FileCode },
                { id: 'webhooks', label: 'Webhooks', icon: Radio },
              ].map((tab) => {
                const Icon = tab.icon;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTabCode(tab.id as any)}
                    className={`px-2.5 py-1 rounded-lg font-semibold flex items-center gap-1.5 transition-colors cursor-pointer shrink-0 ${
                      activeTabCode === tab.id
                        ? 'bg-purple-950/80 text-purple-300 border border-purple-800/40 font-bold'
                        : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    <Icon className="w-3 h-3" />
                    <span>{tab.label}</span>
                  </button>
                );
              })}
            </div>

            <div className="flex items-center gap-1.5 shrink-0 pl-2">
              <button
                onClick={() => {
                  let text = '';
                  if (activeTabCode === 'openapi') text = openApiFormat === 'yaml' ? generateOpenApiYaml() : generateOpenApiJson();
                  else if (activeTabCode === 'graphql') text = apiSpec.graphQlSchema || '';
                  else if (activeTabCode === 'express') text = generateExpressServerCode();
                  else if (activeTabCode === 'types') text = apiSpec.typescriptTypes;
                  else if (activeTabCode === 'curl') text = getCurlCode();
                  else if (activeTabCode === 'python') text = getPythonCode();
                  else text = JSON.stringify(apiSpec, null, 2);
                  copyToClipboard(text, 'tabCode');
                }}
                className="p-1.5 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-white transition-colors cursor-pointer"
                title="Copy snippet"
              >
                {copiedKey === 'tabCode' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              </button>
            </div>
          </div>

          {/* Left Viewport Content */}
          <div className="flex-1 overflow-y-auto p-5 space-y-4">
            {/* 1. Endpoints List */}
            {activeTabCode === 'endpoints' && (
              <div className="space-y-3">
                <div className="flex items-center justify-between mb-2">
                  <div>
                    <h3 className="text-xs font-bold text-white">{apiSpec.title}</h3>
                    <p className="text-[11px] text-slate-400">{apiSpec.description}</p>
                  </div>
                  <button
                    onClick={() => setShowAddEndpointModal(true)}
                    className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-slate-900 hover:bg-slate-850 text-purple-300 border border-purple-800/40 text-[11px] font-semibold transition-colors cursor-pointer"
                  >
                    <Plus className="w-3 h-3" />
                    <span>Add Endpoint</span>
                  </button>
                </div>

                {apiSpec.endpoints.map((ep, idx) => {
                  const isSelected = selectedEndpointKey === `${ep.method} ${ep.path}`;
                  return (
                    <div
                      key={idx}
                      onClick={() => handleSelectEndpoint(ep)}
                      className={`p-3.5 rounded-xl border cursor-pointer transition-all ${
                        isSelected
                          ? 'bg-purple-950/40 border-purple-500/60 ring-1 ring-purple-500/30'
                          : 'bg-slate-900/60 border-slate-800 hover:bg-slate-850'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-1.5">
                        <div className="flex items-center gap-2">
                          <span
                            className={`px-2 py-0.5 rounded text-[10px] font-black font-mono ${
                              ep.method === 'GET'
                                ? 'bg-emerald-950 text-emerald-400 border border-emerald-800/40'
                                : ep.method === 'POST'
                                ? 'bg-blue-950 text-blue-400 border border-blue-800/40'
                                : 'bg-amber-950 text-amber-400 border border-amber-800/40'
                            }`}
                          >
                            {ep.method}
                          </span>
                          <span className="font-mono text-xs font-bold text-slate-200">{ep.path}</span>
                        </div>
                        {isSelected && (
                          <span className="text-[10px] font-mono text-purple-400 font-semibold">Active in Tester</span>
                        )}
                      </div>
                      <p className="text-[11px] text-slate-400 leading-relaxed mb-2">{ep.desc}</p>
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <span className="text-[9px] uppercase font-bold text-slate-500">Query params:</span>
                        {(ep.params || []).map((p, i) => (
                          <span key={i} className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-slate-800 text-slate-300">
                            {p}
                          </span>
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            {/* 2. OpenAPI 3.1 Spec View */}
            {activeTabCode === 'openapi' && (
              <div className="space-y-3">
                <div className="flex items-center justify-between bg-slate-900/60 p-2.5 rounded-xl border border-slate-800">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-slate-300">Format:</span>
                    <button
                      onClick={() => setOpenApiFormat('yaml')}
                      className={`px-2.5 py-1 rounded text-xs font-mono font-bold cursor-pointer transition-colors ${
                        openApiFormat === 'yaml' ? 'bg-purple-600 text-white' : 'text-slate-400 hover:text-white'
                      }`}
                    >
                      YAML
                    </button>
                    <button
                      onClick={() => setOpenApiFormat('json')}
                      className={`px-2.5 py-1 rounded text-xs font-mono font-bold cursor-pointer transition-colors ${
                        openApiFormat === 'json' ? 'bg-purple-600 text-white' : 'text-slate-400 hover:text-white'
                      }`}
                    >
                      JSON
                    </button>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => {
                        const content = openApiFormat === 'yaml' ? generateOpenApiYaml() : generateOpenApiJson();
                        const filename = openApiFormat === 'yaml' ? 'openapi.yaml' : 'openapi.json';
                        const mime = openApiFormat === 'yaml' ? 'text/yaml' : 'application/json';
                        downloadFile(content, filename, mime);
                      }}
                      className="flex items-center gap-1 px-3 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold cursor-pointer border border-slate-700"
                    >
                      <Download className="w-3.5 h-3.5" />
                      <span>Download Spec</span>
                    </button>
                  </div>
                </div>

                <pre className="font-mono text-xs text-purple-300 p-4 bg-slate-900/80 rounded-xl border border-slate-800 overflow-x-auto leading-relaxed whitespace-pre">
                  {openApiFormat === 'yaml' ? generateOpenApiYaml() : generateOpenApiJson()}
                </pre>
              </div>
            )}

            {/* 3. GraphQL SDL & Playground */}
            {activeTabCode === 'graphql' && (
              <div className="space-y-4">
                <div className="flex items-center justify-between pb-2 border-b border-slate-800">
                  <div>
                    <h3 className="text-xs font-bold text-white">GraphQL Schema Definition (SDL)</h3>
                    <p className="text-[11px] text-slate-400">Strictly typed queries, mutations and input types</p>
                  </div>
                  <button
                    onClick={() => downloadFile(apiSpec.graphQlSchema || '', 'schema.graphql', 'text/plain')}
                    className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold cursor-pointer border border-slate-700"
                  >
                    <Download className="w-3 h-3" />
                    <span>Download SDL</span>
                  </button>
                </div>

                <pre className="font-mono text-xs text-pink-300 p-4 bg-slate-900/80 rounded-xl border border-slate-800 overflow-x-auto leading-relaxed whitespace-pre">
                  {apiSpec.graphQlSchema || '# Auto-generating GraphQL SDL schema...'}
                </pre>

                {/* Interactive GraphQL Query Runner */}
                <div className="p-4 rounded-xl bg-slate-900/70 border border-slate-800 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-200 flex items-center gap-1.5">
                      <Braces className="w-3.5 h-3.5 text-purple-400" />
                      <span>GraphQL Query Runner</span>
                    </span>
                    <button
                      onClick={handleExecuteGraphQL}
                      disabled={isExecutingGql}
                      className="flex items-center gap-1.5 px-3 py-1 rounded-lg bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs cursor-pointer disabled:opacity-50"
                    >
                      {isExecutingGql ? <RotateCw className="w-3 h-3 animate-spin" /> : <Play className="w-3 h-3 fill-white" />}
                      <span>Execute Query</span>
                    </button>
                  </div>

                  <textarea
                    value={gqlQuery}
                    onChange={(e) => setGqlQuery(e.target.value)}
                    rows={6}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg p-3 font-mono text-xs text-emerald-300 outline-none focus:border-purple-500 leading-relaxed resize-none"
                  />

                  {gqlResult && (
                    <div className="space-y-1">
                      <div className="text-[10px] font-mono text-slate-400 uppercase">GraphQL Response</div>
                      <pre className="p-3 bg-slate-950 rounded-lg border border-slate-850 font-mono text-xs text-cyan-300 overflow-x-auto">
                        {JSON.stringify(gqlResult, null, 2)}
                      </pre>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* 4. Express.js Microservice Generator */}
            {activeTabCode === 'express' && (
              <div className="space-y-3">
                <div className="flex items-center justify-between bg-slate-900/60 p-2.5 rounded-xl border border-slate-800">
                  <span className="text-xs text-slate-300 font-semibold">
                    Complete runnable Express.js microservice with CORS & rate-limiting
                  </span>
                  <button
                    onClick={() => downloadFile(generateExpressServerCode(), 'server.ts', 'text/typescript')}
                    className="flex items-center gap-1 px-3 py-1 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold cursor-pointer shadow-sm"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>Download server.ts</span>
                  </button>
                </div>
                <pre className="font-mono text-xs text-cyan-300 p-4 bg-slate-900/80 rounded-xl border border-slate-800 overflow-x-auto leading-relaxed">
                  {generateExpressServerCode()}
                </pre>
              </div>
            )}

            {/* 5. TypeScript Types */}
            {activeTabCode === 'types' && (
              <pre className="font-mono text-xs text-purple-300 p-4 bg-slate-900/80 rounded-xl border border-slate-800 overflow-x-auto leading-relaxed">
                {apiSpec.typescriptTypes}
              </pre>
            )}

            {/* 6. cURL Snippet */}
            {activeTabCode === 'curl' && (
              <pre className="font-mono text-xs text-cyan-300 p-4 bg-slate-900/80 rounded-xl border border-slate-800 overflow-x-auto leading-relaxed">
                {getCurlCode()}
              </pre>
            )}

            {/* 7. Python SDK */}
            {activeTabCode === 'python' && (
              <pre className="font-mono text-xs text-emerald-300 p-4 bg-slate-900/80 rounded-xl border border-slate-800 overflow-x-auto leading-relaxed">
                {getPythonCode()}
              </pre>
            )}

            {/* 8. Webhooks & Events */}
            {activeTabCode === 'webhooks' && (
              <div className="space-y-4">
                <div className="p-4 rounded-xl bg-slate-900/70 border border-slate-800 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-white flex items-center gap-1.5">
                      <Radio className="w-3.5 h-3.5 text-purple-400" />
                      <span>Webhook Dispatcher Configuration</span>
                    </span>
                    <button
                      onClick={handleTriggerWebhook}
                      className="px-3 py-1 rounded-lg bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs cursor-pointer flex items-center gap-1.5"
                    >
                      <Play className="w-3 h-3 fill-white" />
                      <span>Dispatch Test Ping</span>
                    </button>
                  </div>

                  <div className="space-y-2 text-xs">
                    <div>
                      <label className="text-[11px] text-slate-400 font-medium">Target Webhook URL:</label>
                      <input
                        type="text"
                        value={webhookUrl}
                        onChange={(e) => setWebhookUrl(e.target.value)}
                        className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-1.5 text-xs text-slate-200 outline-none font-mono mt-1"
                      />
                    </div>
                    <div>
                      <label className="text-[11px] text-slate-400 font-medium">HMAC SHA-256 Signing Secret:</label>
                      <input
                        type="text"
                        value={webhookSecret}
                        onChange={(e) => setWebhookSecret(e.target.value)}
                        className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-1.5 text-xs text-slate-300 outline-none font-mono mt-1"
                      />
                    </div>
                  </div>
                </div>

                {/* Dispatched Webhook Event Logs */}
                <div className="space-y-2">
                  <span className="text-xs font-bold text-slate-300 uppercase tracking-wider text-[10px]">
                    Live Webhook Deliveries ({webhookLogs.length})
                  </span>
                  {webhookLogs.length === 0 ? (
                    <div className="p-6 text-center text-slate-500 text-xs italic bg-slate-900/40 rounded-xl border border-slate-850">
                      No webhook pings triggered yet. Click "Dispatch Test Ping" to send a simulated payload.
                    </div>
                  ) : (
                    <div className="space-y-2">
                      {webhookLogs.map((log) => (
                        <div key={log.id} className="p-3 rounded-xl bg-slate-900/80 border border-slate-800 space-y-1.5 font-mono text-[11px]">
                          <div className="flex items-center justify-between">
                            <span className="text-emerald-400 font-bold">200 OK &bull; {log.event}</span>
                            <span className="text-slate-500 text-[10px]">{log.timestamp.slice(11, 19)}</span>
                          </div>
                          <div className="text-slate-400 text-[10px] truncate">Sig: {log.signature}</div>
                          <pre className="text-cyan-300 text-[10px] bg-slate-950 p-2 rounded overflow-x-auto">
                            {JSON.stringify(log.payload, null, 2)}
                          </pre>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Right: Interactive API Client & Live Request Tester */}
        <div className="w-1/2 flex flex-col bg-slate-900/30">
          <div className="h-10 px-4 bg-slate-900/80 border-b border-slate-800 flex items-center justify-between text-xs select-none">
            <div className="flex items-center gap-2">
              <Send className="w-3.5 h-3.5 text-purple-400" />
              <span className="font-bold text-slate-200">Interactive API Client</span>
            </div>
            {testResponse && (
              <div className="flex items-center gap-2 font-mono text-[10px]">
                <span className="text-emerald-400 bg-emerald-950/80 px-2 py-0.5 rounded border border-emerald-800/40">
                  {testStatusCode} OK
                </span>
                <span className="text-slate-400">{testLatency} ms</span>
                <span className="text-purple-400 bg-purple-950/80 px-2 py-0.5 rounded border border-purple-800/40">
                  Cache: HIT
                </span>
              </div>
            )}
          </div>

          {/* Test Request Bar */}
          <div className="p-4 bg-slate-950 border-b border-slate-800 flex items-center gap-2">
            <span
              className={`px-2.5 py-1 rounded-lg font-mono text-xs font-black ${
                currentEndpoint.method === 'GET'
                  ? 'bg-emerald-950 text-emerald-400 border border-emerald-800/40'
                  : 'bg-blue-950 text-blue-400 border border-blue-800/40'
              }`}
            >
              {currentEndpoint.method}
            </span>
            <input
              type="text"
              readOnly
              value={effectiveRequestUrl}
              className="flex-1 bg-slate-900 border border-slate-800 rounded-lg px-3 py-1.5 font-mono text-xs text-slate-300 outline-none"
            />
            <button
              onClick={handleTestEndpoint}
              disabled={isTesting}
              className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-purple-600 hover:bg-purple-500 disabled:opacity-50 text-white font-bold text-xs transition-colors cursor-pointer shrink-0"
            >
              {isTesting ? <RotateCw className="w-3.5 h-3.5 animate-spin" /> : <Play className="w-3.5 h-3.5 fill-white" />}
              <span>Send</span>
            </button>
          </div>

          {/* Client Subtabs (Params, Headers, Body) */}
          <div className="h-9 px-4 bg-slate-900/50 border-b border-slate-850 flex items-center justify-between text-xs">
            <div className="flex items-center gap-2">
              <button
                onClick={() => setTestClientTab('params')}
                className={`px-2.5 py-1 rounded font-semibold cursor-pointer transition-colors ${
                  testClientTab === 'params' ? 'text-purple-300 font-bold border-b-2 border-purple-500' : 'text-slate-400 hover:text-white'
                }`}
              >
                Params ({queryParams.filter((p) => p.enabled).length})
              </button>
              <button
                onClick={() => setTestClientTab('headers')}
                className={`px-2.5 py-1 rounded font-semibold cursor-pointer transition-colors ${
                  testClientTab === 'headers' ? 'text-purple-300 font-bold border-b-2 border-purple-500' : 'text-slate-400 hover:text-white'
                }`}
              >
                Headers ({requestHeaders.filter((h) => h.enabled).length})
              </button>
              {currentEndpoint.method === 'POST' && (
                <button
                  onClick={() => setTestClientTab('body')}
                  className={`px-2.5 py-1 rounded font-semibold cursor-pointer transition-colors ${
                    testClientTab === 'body' ? 'text-purple-300 font-bold border-b-2 border-purple-500' : 'text-slate-400 hover:text-white'
                  }`}
                >
                  Body (JSON)
                </button>
              )}
            </div>

            {testClientTab === 'params' && (
              <button
                onClick={() => setQueryParams((prev) => [...prev, { key: '', value: '', enabled: true }])}
                className="text-[11px] text-purple-400 hover:text-purple-300 flex items-center gap-1 cursor-pointer"
              >
                <Plus className="w-3 h-3" />
                <span>Add Param</span>
              </button>
            )}
          </div>

          {/* Request Config View */}
          <div className="p-3 bg-slate-950/80 border-b border-slate-850 max-h-48 overflow-y-auto">
            {testClientTab === 'params' && (
              <div className="space-y-1.5">
                {queryParams.map((param, idx) => (
                  <div key={idx} className="flex items-center gap-2 text-xs">
                    <input
                      type="checkbox"
                      checked={param.enabled}
                      onChange={(e) => {
                        const copy = [...queryParams];
                        copy[idx].enabled = e.target.checked;
                        setQueryParams(copy);
                      }}
                      className="rounded accent-purple-600 cursor-pointer"
                    />
                    <input
                      type="text"
                      placeholder="Key"
                      value={param.key}
                      onChange={(e) => {
                        const copy = [...queryParams];
                        copy[idx].key = e.target.value;
                        setQueryParams(copy);
                      }}
                      className="w-1/3 bg-slate-900 border border-slate-800 rounded px-2 py-1 font-mono text-xs text-slate-200 outline-none"
                    />
                    <input
                      type="text"
                      placeholder="Value"
                      value={param.value}
                      onChange={(e) => {
                        const copy = [...queryParams];
                        copy[idx].value = e.target.value;
                        setQueryParams(copy);
                      }}
                      className="flex-1 bg-slate-900 border border-slate-800 rounded px-2 py-1 font-mono text-xs text-slate-200 outline-none"
                    />
                    <button
                      onClick={() => setQueryParams((prev) => prev.filter((_, i) => i !== idx))}
                      className="p-1 text-slate-500 hover:text-rose-400 cursor-pointer"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            )}

            {testClientTab === 'headers' && (
              <div className="space-y-1.5">
                {requestHeaders.map((header, idx) => (
                  <div key={idx} className="flex items-center gap-2 text-xs">
                    <input
                      type="checkbox"
                      checked={header.enabled}
                      onChange={(e) => {
                        const copy = [...requestHeaders];
                        copy[idx].enabled = e.target.checked;
                        setRequestHeaders(copy);
                      }}
                      className="rounded accent-purple-600 cursor-pointer"
                    />
                    <input
                      type="text"
                      value={header.key}
                      readOnly
                      className="w-1/3 bg-slate-900 border border-slate-800 rounded px-2 py-1 font-mono text-xs text-slate-400 outline-none"
                    />
                    <input
                      type="text"
                      value={header.value}
                      onChange={(e) => {
                        const copy = [...requestHeaders];
                        copy[idx].value = e.target.value;
                        setRequestHeaders(copy);
                      }}
                      className="flex-1 bg-slate-900 border border-slate-800 rounded px-2 py-1 font-mono text-xs text-slate-200 outline-none"
                    />
                  </div>
                ))}
              </div>
            )}

            {testClientTab === 'body' && (
              <textarea
                value={postRequestBody}
                onChange={(e) => setPostRequestBody(e.target.value)}
                rows={5}
                className="w-full bg-slate-900 border border-slate-800 rounded p-2.5 font-mono text-xs text-cyan-300 outline-none resize-none leading-relaxed"
              />
            )}
          </div>

          {/* JSON Response Viewport */}
          <div className="flex-1 p-4 overflow-y-auto font-mono text-xs bg-slate-950/60">
            {isTesting ? (
              <div className="py-16 text-center text-slate-500 flex flex-col items-center justify-center space-y-2">
                <RotateCw className="w-6 h-6 animate-spin text-purple-400" />
                <p>Executing live request & querying virtual API mock server...</p>
              </div>
            ) : testResponse ? (
              <div className="space-y-2">
                <div className="flex items-center justify-between text-[11px] text-slate-500 pb-1 border-b border-slate-850">
                  <div className="flex items-center gap-2">
                    <span>RESPONSE PAYLOAD (application/json)</span>
                    <span className="text-[10px] text-emerald-400 font-mono">Status: 200 OK</span>
                  </div>
                  <button
                    onClick={() => copyToClipboard(JSON.stringify(testResponse, null, 2), 'response')}
                    className="flex items-center gap-1 text-slate-400 hover:text-white cursor-pointer"
                  >
                    {copiedKey === 'response' ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                    <span>{copiedKey === 'response' ? 'Copied' : 'Copy JSON'}</span>
                  </button>
                </div>
                <pre className="text-emerald-300 leading-relaxed whitespace-pre-wrap">
                  {JSON.stringify(testResponse, null, 2)}
                </pre>
              </div>
            ) : (
              <div className="py-20 text-center text-slate-600 italic">
                Click &ldquo;Send&rdquo; above to execute a live test request and inspect the JSON payload.
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Add Custom Endpoint Modal */}
      {showAddEndpointModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="w-full max-w-lg bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <Plus className="w-4 h-4 text-purple-400" />
                <span>Define Custom Endpoint</span>
              </h3>
              <button
                onClick={() => setShowAddEndpointModal(false)}
                className="text-slate-400 hover:text-white text-xs cursor-pointer"
              >
                Cancel
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div className="flex items-center gap-2">
                <select
                  value={newEndpointData.method}
                  onChange={(e) => setNewEndpointData((prev) => ({ ...prev, method: e.target.value as any }))}
                  className="bg-slate-950 border border-slate-800 rounded-lg px-3 py-1.5 text-xs text-slate-200 outline-none font-bold"
                >
                  <option value="GET">GET</option>
                  <option value="POST">POST</option>
                </select>
                <input
                  type="text"
                  placeholder="/api/v1/custom-path"
                  value={newEndpointData.path}
                  onChange={(e) => setNewEndpointData((prev) => ({ ...prev, path: e.target.value }))}
                  className="flex-1 bg-slate-950 border border-slate-800 rounded-lg px-3 py-1.5 font-mono text-xs text-slate-200 outline-none"
                />
              </div>

              <div>
                <label className="text-[11px] text-slate-400">Endpoint Description:</label>
                <input
                  type="text"
                  value={newEndpointData.desc}
                  onChange={(e) => setNewEndpointData((prev) => ({ ...prev, desc: e.target.value }))}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-1.5 text-xs text-slate-200 outline-none mt-1"
                />
              </div>

              <div>
                <label className="text-[11px] text-slate-400">Query Parameters (comma-separated):</label>
                <input
                  type="text"
                  placeholder="limit=10, sort=asc"
                  value={newEndpointData.params}
                  onChange={(e) => setNewEndpointData((prev) => ({ ...prev, params: e.target.value }))}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-1.5 font-mono text-xs text-slate-200 outline-none mt-1"
                />
              </div>

              <div>
                <label className="text-[11px] text-slate-400">Sample JSON Response:</label>
                <textarea
                  value={newEndpointData.sampleResponse}
                  onChange={(e) => setNewEndpointData((prev) => ({ ...prev, sampleResponse: e.target.value }))}
                  rows={4}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 font-mono text-xs text-emerald-300 outline-none mt-1 resize-none"
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-800">
              <button
                onClick={() => setShowAddEndpointModal(false)}
                className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={handleAddCustomEndpoint}
                className="px-4 py-1.5 rounded-lg bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold cursor-pointer"
              >
                Add Endpoint
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
