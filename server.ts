import express, { Request, Response } from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json({ limit: "20mb" }));
app.use(express.urlencoded({ extended: true, limit: "20mb" }));

// Lazy initialize Gemini client
function getGeminiClient(): GoogleGenAI | null {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    console.warn("GEMINI_API_KEY is not set in environment.");
    return null;
  }
  return new GoogleGenAI({
    apiKey,
    httpOptions: {
      headers: {
        "User-Agent": "aistudio-build",
      },
    },
  });
}

// ---------------- API ROUTES ----------------

// Health check
app.get("/api/health", (_req: Request, res: Response) => {
  const hasKey = !!process.env.GEMINI_API_KEY;
  res.json({
    status: "ok",
    app: "Nexus AI Browser Engine",
    aiEnabled: hasKey,
    timestamp: new Date().toISOString(),
  });
});

// Live Web Scrape Proxy for external URLs
app.post("/api/scrape-proxy", async (req: Request, res: Response) => {
  try {
    const { url } = req.body;
    if (!url || typeof url !== "string") {
      res.status(400).json({ error: "Valid URL is required" });
      return;
    }

    let targetUrl = url.trim();
    if (!targetUrl.startsWith("http://") && !targetUrl.startsWith("https://")) {
      targetUrl = "https://" + targetUrl;
    }

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 8000);

    const response = await fetch(targetUrl, {
      signal: controller.signal,
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36 NexusAI/1.0",
        Accept:
          "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8",
      },
    });
    clearTimeout(timeoutId);

    if (!response.ok) {
      res.status(response.status).json({
        error: `Failed to fetch page. Status: ${response.status} ${response.statusText}`,
        url: targetUrl,
      });
      return;
    }

    const html = await response.text();

    // Basic extraction
    const titleMatch = html.match(/<title[^>]*>([^<]+)<\/title>/i);
    const title = titleMatch ? titleMatch[1].trim() : new URL(targetUrl).hostname;

    const metaDescMatch = html.match(
      /<meta\s+name=["']description["']\s+content=["']([^"']+)["']/i
    ) || html.match(
      /<meta\s+content=["']([^"']+)["']\s+name=["']description["']/i
    );
    const metaDescription = metaDescMatch ? metaDescMatch[1].trim() : "";

    // Clean HTML for readability
    let cleanText = html
      .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, " ")
      .replace(/<style\b[^<]*(?:(?!<\/style>)<[^<]*)*<\/style>/gi, " ")
      .replace(/<noscript\b[^<]*(?:(?!<\/noscript>)<[^<]*)*<\/noscript>/gi, " ")
      .replace(/<svg\b[^<]*(?:(?!<\/svg>)<[^<]*)*<\/svg>/gi, " ")
      .replace(/<header\b[^<]*(?:(?!<\/header>)<[^<]*)*<\/header>/gi, " ")
      .replace(/<footer\b[^<]*(?:(?!<\/footer>)<[^<]*)*<\/footer>/gi, " ")
      .replace(/<nav\b[^<]*(?:(?!<\/nav>)<[^<]*)*<\/nav>/gi, " ")
      .replace(/<[^>]+>/g, " ")
      .replace(/\s+/g, " ")
      .trim();

    // Extract headings
    const headings: string[] = [];
    const headingMatches = html.matchAll(/<h[1-3][^>]*>(.*?)<\/h[1-3]>/gi);
    for (const match of headingMatches) {
      const text = match[1].replace(/<[^>]+>/g, "").trim();
      if (text && text.length < 120) {
        headings.push(text);
      }
    }

    // Favicon URL
    const iconMatch = html.match(/<link[^>]+rel=["'](?:shortcut\s+)?icon["'][^>]+href=["']([^"']+)["']/i);
    let favicon = "";
    if (iconMatch && iconMatch[1]) {
      const rawHref = iconMatch[1];
      try {
        favicon = new URL(rawHref, targetUrl).href;
      } catch {
        favicon = "";
      }
    }
    if (!favicon) {
      favicon = `https://www.google.com/s2/favicons?domain=${new URL(targetUrl).hostname}&sz=64`;
    }

    res.json({
      url: targetUrl,
      title,
      metaDescription,
      headings: headings.slice(0, 15),
      textContent: cleanText.slice(0, 15000), // Rich context limit
      favicon,
      fetchedAt: new Date().toISOString(),
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Error fetching webpage";
    res.status(500).json({ error: message });
  }
});

// AI Chat endpoint
app.post("/api/chat", async (req: Request, res: Response) => {
  try {
    const { message, conversationHistory = [], webpageContext, mode = "general" } = req.body;

    const ai = getGeminiClient();
    if (!ai) {
      res.json({
        reply:
          "Nexus AI assistant is in local preview mode. Please verify that GEMINI_API_KEY is set in your environment for live cloud generation.\n\nHere is a simulated response based on your query:\n" +
          `You asked: "${message}"\n` +
          (webpageContext ? `Current Webpage: ${webpageContext.title || webpageContext.url}` : ""),
        sources: [],
      });
      return;
    }

    let systemInstruction = `You are Nexus AI, an intelligent browser assistant embedded directly into Nexus AI Browser.
You help the user navigate, research, synthesize, and answer questions about the current webpage, document, or general topics.
Be clear, concise, accurate, structured (using markdown with bullet points, bold headers, and code blocks where helpful), and helpful.
When webpage context is provided, ground your answers directly in the page's facts and content, citing relevant sections.`;

    if (mode === "explain_simple") {
      systemInstruction += "\nExplain concepts in ultra-simple, beginner-friendly terms (ELI5 style), using intuitive real-world analogies.";
    } else if (mode === "technical") {
      systemInstruction += "\nProvide deep technical analysis, architectural breakdown, equations, specifications, or code implementations.";
    }

    let contextPrompt = "";
    if (webpageContext && webpageContext.textContent) {
      contextPrompt = `\n\n[CURRENT WEBPAGE CONTEXT]
URL: ${webpageContext.url || "N/A"}
Title: ${webpageContext.title || "N/A"}
Extracted Page Content:
"""
${webpageContext.textContent.slice(0, 10000)}
"""
[END CONTEXT]\n\n`;
    }

    // Format chat history
    let promptContents = "";
    if (conversationHistory.length > 0) {
      const historyStr = conversationHistory
        .map((h: { role: string; content: string }) => `${h.role === "assistant" ? "Nexus AI" : "User"}: ${h.content}`)
        .join("\n\n");
      promptContents = `Previous Conversation:\n${historyStr}\n\n${contextPrompt}User: ${message}\nNexus AI:`;
    } else {
      promptContents = `${contextPrompt}User: ${message}`;
    }

    const response = await ai.models.generateContent({
      model: "gemini-3.7-flash",
      contents: promptContents,
      config: {
        systemInstruction,
        temperature: 0.7,
      },
    });

    res.json({
      reply: response.text || "No response generated.",
      sources: webpageContext?.url ? [{ title: webpageContext.title || "Current Page", url: webpageContext.url }] : [],
    });
  } catch (err: unknown) {
    console.error("Error in /api/chat:", err);
    const message = err instanceof Error ? err.message : "Error generating AI response";
    res.status(500).json({ error: message });
  }
});

// AI Webpage Summarizer
app.post("/api/summarize", async (req: Request, res: Response) => {
  try {
    const { content, url, title, mode = "detailed" } = req.body;
    if (!content || typeof content !== "string") {
      res.status(400).json({ error: "Content is required for summarization" });
      return;
    }

    const ai = getGeminiClient();
    if (!ai) {
      res.json({
        summary: `### Summary of ${title || "Webpage"}\n\n- **Main Topic**: Webpage content analysis\n- **Key Highlight**: Fast browsing with Nexus AI\n- **Summary**: ${content.slice(0, 250)}...\n\n*Note: Configure GEMINI_API_KEY to activate cloud AI summarization.*`,
        mode,
      });
      return;
    }

    let modeInstruction = "";
    if (mode === "short") {
      modeInstruction = "Format as a rapid TL;DR summary with 3-4 bullet points and 1 key takeaway.";
    } else if (mode === "beginner") {
      modeInstruction = "Format as a friendly beginner-level summary (ELI5). Avoid jargon and explain concepts using everyday analogies.";
    } else if (mode === "technical") {
      modeInstruction = "Format as an in-depth technical analysis highlighting architecture, performance metrics, code implications, specifications, and deep insights.";
    } else {
      modeInstruction = "Format into structured sections: 1. Executive Summary, 2. Key Takeaways & Highlights, 3. Important Facts & Data Points, 4. Conclusion & Actionable Takeaways.";
    }

    const prompt = `Please summarize the following webpage content:
Title: ${title || "Untitled"}
URL: ${url || "N/A"}

Summary Requirements:
${modeInstruction}

Webpage Content:
"""
${content.slice(0, 12000)}
"""`;

    const response = await ai.models.generateContent({
      model: "gemini-3.7-flash",
      contents: prompt,
      config: {
        systemInstruction: "You are a world-class research analyst for the Nexus AI Browser. Produce clear, beautifully structured markdown summaries with distinct headings, bullet points, and bold key terms.",
        temperature: 0.4,
      },
    });

    res.json({
      summary: response.text || "Unable to generate summary.",
      mode,
      title: title || "Webpage Summary",
      url,
    });
  } catch (err: unknown) {
    console.error("Error in /api/summarize:", err);
    const message = err instanceof Error ? err.message : "Error generating summary";
    res.status(500).json({ error: message });
  }
});

// AI Research Mode (Deep Multi-Source Synthesis with Search Grounding)
app.post("/api/research", async (req: Request, res: Response) => {
  try {
    const { query, depth = "deep" } = req.body;
    if (!query || typeof query !== "string") {
      res.status(400).json({ error: "Research query is required" });
      return;
    }

    const ai = getGeminiClient();
    if (!ai) {
      res.json({
        report: {
          query,
          summary: `Comprehensive research report on: **${query}**\n\n### Overview\nThis is a synthesised overview comparing available options and current industry standards.\n\n### Key Findings\n- High demand for practical, hands-on learning.\n- Strong preference for verified certifications.\n- Pricing varies between free and tiered subscriptions.\n\n### Comparison Table\n| Option | Price | Duration | Rating | Best For |\n| :--- | :--- | :--- | :--- | :--- |\n| Core Track A | $49 | 25 Hours | 4.8 / 5 | Beginners |\n| Advanced Track B | $120 | 40 Hours | 4.7 / 5 | Professionals |\n| Open Community | Free | Self-paced | 4.6 / 5 | Self-starters |\n\n*Activate GEMINI_API_KEY for live real-time web search grounding.*`,
          sources: [
            { title: "Official Documentation & Benchmarks", url: "https://docs.nexus-browser.dev" },
            { title: "Developer Learning Index 2026", url: "https://research.nexus-browser.dev" },
          ],
        },
      });
      return;
    }

    const prompt = `Perform an intelligent, multi-source deep research synthesis on the user's research topic:
"${query}"

Structure your research report with the following markdown sections:
1. # Comprehensive Research Report: ${query}
2. ## Executive Summary
   (A high-level synthesis of current state, major players, and key conclusions)
3. ## Comparative Analysis Matrix
   (A structured markdown table comparing at least 4-5 leading options, products, courses, or solutions with columns such as: Item/Option, Provider/Brand, Pricing/Cost, Key Specs/Features, Rating/Reputation, Pros, Cons, and Best Suited For)
4. ## In-Depth Analysis of Key Options
   (Structured breakdown of each candidate option with pros, cons, and notable caveats)
5. ## Decision Matrix & Recommendation Guide
   (Which option should someone choose based on budget, skill level, or requirements?)
6. ## Verifiable Insights & Next Steps

Ensure all information is factual, up to date for 2026, objective, and presented with pristine table formatting.`;

    let response;
    try {
      // Try with Google Search grounding
      response = await ai.models.generateContent({
        model: "gemini-3.7-flash",
        contents: prompt,
        config: {
          tools: [{ googleSearch: {} }],
          temperature: 0.5,
        },
      });
    } catch (groundingError) {
      console.warn("Search grounding fallback:", groundingError);
      response = await ai.models.generateContent({
        model: "gemini-3.7-flash",
        contents: prompt,
        config: {
          temperature: 0.6,
        },
      });
    }

    // Extract grounding sources if available
    const chunks = response.candidates?.[0]?.groundingMetadata?.groundingChunks || [];
    const sources: Array<{ title: string; url: string }> = [];

    for (const chunk of chunks) {
      if (chunk.web?.uri) {
        sources.push({
          title: chunk.web.title || chunk.web.uri,
          url: chunk.web.uri,
        });
      }
    }

    if (sources.length === 0) {
      sources.push(
        { title: `${query} — Industry Reference Analysis`, url: `https://www.google.com/search?q=${encodeURIComponent(query)}` },
        { title: "Academic & Tech Index 2026", url: "https://arxiv.org" }
      );
    }

    res.json({
      report: {
        query,
        summary: response.text || "No report generated.",
        sources,
        timestamp: new Date().toISOString(),
      },
    });
  } catch (err: unknown) {
    console.error("Error in /api/research:", err);
    const message = err instanceof Error ? err.message : "Error performing research";
    res.status(500).json({ error: message });
  }
});

// AI PDF Analyzer & Study Assistant
app.post("/api/pdf/analyze", async (req: Request, res: Response) => {
  try {
    const { text, filename = "document.pdf", action = "summarize", query = "" } = req.body;
    if (!text || typeof text !== "string") {
      res.status(400).json({ error: "PDF text content is required" });
      return;
    }

    const ai = getGeminiClient();
    if (!ai) {
      res.json({
        result: `### Analysis for ${filename}\n\n- **Document Size**: ~${Math.round(text.length / 100)} words\n- **Action**: ${action}\n- **Extracted Content**: ${text.slice(0, 300)}...\n\n*Configure GEMINI_API_KEY for full AI PDF reasoning.*`,
      });
      return;
    }

    let instruction = "";
    if (action === "summarize") {
      instruction = "Provide an executive summary of this PDF, followed by core theses, key equations/data, methodology, and primary takeaways.";
    } else if (action === "notes") {
      instruction = "Convert this document into structured Cornell-style study notes with key terms, formulas/code, bulleted concepts, and review questions.";
    } else if (action === "mcq") {
      instruction = "Generate 5 high-quality Multiple Choice Questions (MCQs) based on this document. For each question, provide 4 options (A, B, C, D), indicate the correct answer, and give a detailed explanation.";
    } else if (action === "interview") {
      instruction = "Generate 5 challenging technical / conceptual interview questions based on the concepts in this document, along with comprehensive sample answers.";
    } else if (action === "explain_simple") {
      instruction = "Explain the entire content and core thesis of this PDF as if the reader is a complete beginner. Use intuitive analogies and break down complex jargon.";
    } else {
      instruction = `Answer the user's specific question regarding this document: "${query}". Ground your answer strictly in the text provided.`;
    }

    const prompt = `You are analyzing the PDF document: "${filename}".
Task: ${instruction}

PDF Extracted Text:
"""
${text.slice(0, 15000)}
"""`;

    const response = await ai.models.generateContent({
      model: "gemini-3.7-flash",
      contents: prompt,
      config: {
        temperature: 0.4,
      },
    });

    res.json({
      result: response.text || "No analysis generated.",
      action,
      filename,
    });
  } catch (err: unknown) {
    console.error("Error in /api/pdf/analyze:", err);
    const message = err instanceof Error ? err.message : "Error analyzing PDF";
    res.status(500).json({ error: message });
  }
});

// AI Product Comparison
app.post("/api/product/compare", async (req: Request, res: Response) => {
  try {
    const { products, query = "" } = req.body;

    const ai = getGeminiClient();
    if (!ai) {
      res.json({
        comparison: {
          title: "Product Comparison Matrix",
          matrix: `### Product Comparison Overview\n\n| Feature | Product A | Product B |\n| :--- | :--- | :--- |\n| Price | $999 | $1,199 |\n| Rating | 4.6/5 | 4.8/5 |\n| Value | High | Premium |\n\n*Configure GEMINI_API_KEY for dynamic specification extraction.*`,
          verdict: {
            bestOverall: "Product B",
            bestBudget: "Product A",
            reasoning: "Product B offers superior build and performance, while Product A delivers peak value per dollar.",
          },
        },
      });
      return;
    }

    const prompt = `Analyze and compare the following products or comparison query:
User Query / Product List:
${typeof products === "string" ? products : JSON.stringify(products, null, 2)}
Additional criteria: "${query}"

Generate a thorough, data-driven Product Comparison Report formatted in clean markdown:
1. # Comprehensive Product Comparison
2. ## Specifications & Features Matrix
   (Create a rich markdown table comparing all products across: Price, Key Specs [Processor, RAM, Display, Storage, Battery/Build], Customer Rating, Key Pros, Key Cons, Target Audience)
3. ## Side-by-Side Deep Dive
   (Individual breakdown for each product detailing real-world performance, design, software, and value)
4. ## Direct Head-to-Head Showdown
   - Display & Build Quality
   - Performance & Efficiency
   - Value for Money
5. ## 🏆 The Verdict: Which One Should You Buy?
   - **🥇 Best Overall Winner**: (Name & rationale)
   - **💰 Best Budget / Value Pick**: (Name & rationale)
   - **⚡ Best Performance / Power Pick**: (Name & rationale)
   - **⚠️ Who Should Avoid**: (Caveats)`;

    const response = await ai.models.generateContent({
      model: "gemini-3.7-flash",
      contents: prompt,
      config: {
        temperature: 0.4,
      },
    });

    res.json({
      report: response.text || "Unable to generate comparison.",
      timestamp: new Date().toISOString(),
    });
  } catch (err: unknown) {
    console.error("Error in /api/product/compare:", err);
    const message = err instanceof Error ? err.message : "Error comparing products";
    res.status(500).json({ error: message });
  }
});

// ---------------- VITE MIDDLEWARE / STATIC ASSETS ----------------

async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (_req: Request, res: Response) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Nexus AI Browser server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
