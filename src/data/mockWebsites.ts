export interface MockWebsite {
  url: string;
  domain: string;
  title: string;
  favicon: string;
  category: 'article' | 'courses' | 'products' | 'docs' | 'wiki';
  description: string;
  content: {
    heroImage?: string;
    author?: string;
    publishedDate?: string;
    sections: Array<{
      heading?: string;
      subheading?: string;
      body: string;
      code?: string;
      table?: {
        headers: string[];
        rows: string[][];
      };
      callout?: string;
      list?: string[];
    }>;
  };
  extractedText: string;
}

export const SAMPLE_WEBSITES: Record<string, MockWebsite> = {
  'https://www.google.com': {
    url: 'https://www.google.com',
    domain: 'google.com',
    title: 'Google Search',
    favicon: 'https://www.google.com/s2/favicons?domain=google.com&sz=64',
    category: 'docs',
    description: "Search the world's information, including webpages, images, videos and more with Google.",
    extractedText: `Google Web Search & AI Overview
Search the world's information with Aksh AI Browser.
Google Search is fully integrated with deep grounding, real-time query acceleration, and multi-source synthesis.

Key Capabilities:
- Instant search suggestions and fast web crawling
- AI Deep Research integration via Aksh Research Engine
- Distraction-free clean reader view for articles and papers
- Cross-tab document comparison and Cornell note taking`,
    content: {
      author: 'Google Search',
      publishedDate: '2026',
      sections: [
        {
          heading: 'Aksh AI Web Search Hub',
          body: 'Google Search is integrated with the Aksh omnibox. You can type any keyword directly into the search bar, toggle AI mode for autonomous multi-source synthesis, or navigate directly to any web destination.',
          list: [
            'Deep Research Autonomous Synthesis (Zap icon)',
            'Interactive Concept Mindmapping (Network icon)',
            'Native PDF Document Cognition (FileText icon)',
            'Side-by-Side Product Comparison (Scale icon)',
          ],
        },
      ],
    },
  },
  'https://www.google.com/': {
    url: 'https://www.google.com/',
    domain: 'google.com',
    title: 'Google Search',
    favicon: 'https://www.google.com/s2/favicons?domain=google.com&sz=64',
    category: 'docs',
    description: "Search the world's information, including webpages, images, videos and more with Google.",
    extractedText: `Google Web Search & AI Overview
Search the world's information with Aksh AI Browser.`,
    content: {
      author: 'Google Search',
      publishedDate: '2026',
      sections: [
        {
          heading: 'Aksh AI Web Search Hub',
          body: 'Google Search is integrated with the Aksh omnibox. You can type any keyword directly into the search bar.',
        },
      ],
    },
  },
  'https://learn.python.org/courses/2026-guide': {
    url: 'https://learn.python.org/courses/2026-guide',
    domain: 'learn.python.org',
    title: 'Top 5 Python Developer Courses for Beginners & Career Changers (2026)',
    favicon: 'https://www.google.com/s2/favicons?domain=python.org&sz=64',
    category: 'courses',
    description: 'Comprehensive analysis and breakdown of the highest-rated Python programming courses in 2026, comparing pricing, duration, curriculum, and hands-on projects.',
    extractedText: `Top 5 Python Developer Courses for Beginners (2026 Guide)
Published: January 2026 | Updated: August 2026
Author: Prof. Alistair Vance, Senior Software Architect

Learning Python in 2026 is faster and more project-focused than ever. With Python 3.13 providing sub-interpreter scaling and enhanced typing, beginners need courses that teach real-world automation, data science, web development, and LLM agent integration.

Here is the verified comparison of the top 5 Python courses:

1. Complete Python Bootcamp (2026 Edition)
- Provider: TechEd Pro
- Instructor: Jose Portilla & Team
- Price: $19.99 (or ₹999)
- Duration: 22 Hours of On-Demand Video
- Rating: 4.8 / 5.0 (142,000+ reviews)
- Key Topics: Python syntax, OOP, Web Scraping with BeautifulSoup, FastAPI basics, SQLite.
- Pros: Extremely gentle learning curve, 100+ coding exercises, lifetime access.
- Cons: Light on advanced data structures and AI embeddings.

2. 100 Days of Code: The Complete Python Pro Bootcamp
- Provider: AppBrewery
- Instructor: Dr. Angela Yu
- Price: $29.99 (or ₹1,499)
- Duration: 60 Hours + 100 Real-World Projects
- Rating: 4.9 / 5.0 (220,000+ reviews)
- Key Topics: Automation scripts, Tkinter desktop GUIs, Selenium, Flask/Django web apps, REST APIs, Data Science with Pandas.
- Pros: Unmatched portfolio projects, builds daily coding habits, deep practical coverage.
- Cons: Time-intensive; requires 1-2 hours daily commitment.

3. Python for Everybody Specialization
- Provider: University of Michigan / Coursera
- Instructor: Dr. Charles Severance (Dr. Chuck)
- Price: Free to Audit / $49/mo with Certificate
- Duration: 3-4 Months (3 hrs/week)
- Rating: 4.8 / 5.0 (95,000+ reviews)
- Key Topics: Core variables, network programming, databases, web scraping, JSON processing.
- Pros: World-class university pedagogy, accessible to absolute non-programmers.
- Cons: Slower pace for experienced developers.

4. CS50's Introduction to Programming with Python (CS50P)
- Provider: Harvard University / edX
- Instructor: Prof. David J. Malan
- Price: 100% Free (Optional $149 verified certificate)
- Duration: 10 Weeks (Self-paced, ~5 hrs/week)
- Rating: 4.95 / 5.0 (80,000+ reviews)
- Key Topics: Functions, conditionals, loops, exceptions, libraries, unit testing with pytest, file I/O, regular expressions, OOP.
- Pros: Rigorous automated testing grading system, exceptional production quality, completely free.
- Cons: Challenging problem sets that may intimidate total beginners.

5. Zero To Mastery: Complete Python Developer
- Provider: ZTM Academy / Andrei Neagoie
- Price: $39/mo or $299/yr
- Duration: 32 Hours
- Rating: 4.7 / 5.0 (45,000+ reviews)
- Key Topics: Modern Python 3, functional programming, machine learning basics, script automation.
- Pros: Active Discord community, updated annually.
- Cons: Subscription model can become costly if delayed.`,
    content: {
      heroImage: 'https://images.unsplash.com/photo-1526379095098-d400fd0bf935?w=1200&auto=format&fit=crop&q=80',
      author: 'Prof. Alistair Vance',
      publishedDate: 'August 2026',
      sections: [
        {
          heading: 'Executive Summary: Choosing the Right Python Course in 2026',
          body: 'Whether your ambition is to build AI agents, automate manual spreadsheets, build web APIs, or break into software engineering, Python remains the undisputed top choice. Below is our benchmarked review of the top 5 courses.',
        },
        {
          heading: 'Comprehensive Comparison Table',
          body: 'Benchmarking the leading courses by pricing, practical duration, student satisfaction rating, and target profile.',
          table: {
            headers: ['Course Title', 'Provider', 'Price', 'Duration', 'Rating', 'Best For'],
            rows: [
              ['100 Days of Code', 'AppBrewery', '$29.99 (₹1,499)', '60 Hours (100 Projects)', '4.9 ★', 'Portfolio Builders & Career Switchers'],
              ['CS50P Python', 'Harvard edX', '100% Free', '10 Weeks (~35 hrs)', '4.95 ★', 'Computer Science Rigor & Testing'],
              ['Complete Python Bootcamp', 'TechEd Pro', '$19.99 (₹999)', '22 Hours', '4.8 ★', 'Quick Weekend Onboarding'],
              ['Python for Everybody', 'Coursera (U Mich)', 'Free Audit / $49/mo', '3 Months (3 hrs/wk)', '4.8 ★', 'Absolute Non-Technical Beginners'],
              ['Complete Python Developer', 'ZTM Academy', '$39/month', '32 Hours', '4.7 ★', 'Community & Modern AI Integrations'],
            ],
          },
        },
        {
          heading: 'Key Curriculum Topics You Must Master',
          body: 'To become hireable or effectively automate workflows in 2026, ensure your course covers the following core competencies:',
          list: [
            'Python 3.12+ Syntax, Type Hinting, and Pattern Matching',
            'Robust Object-Oriented Programming (OOP) and Modular Code Design',
            'Unit Testing using pytest and Test-Driven Development (TDD)',
            'Modern Asynchronous Programming (asyncio) and REST API Development with FastAPI',
            'Web Scraping & DOM Traversal using BeautifulSoup4 and Playwright',
            'Interfacing with LLM APIs, Vector Stores, and Prompt Chains',
          ],
        },
      ],
    },
  },

  'https://tech-radar.io/laptops/flagship-comparison-2026': {
    url: 'https://tech-radar.io/laptops/flagship-comparison-2026',
    domain: 'tech-radar.io',
    title: 'Ultimate 2026 Laptop Comparison: MacBook Pro M3 vs Dell XPS 15 vs ThinkPad X1 Carbon',
    favicon: 'https://www.google.com/s2/favicons?domain=apple.com&sz=64',
    category: 'products',
    description: 'Direct side-by-side benchmark comparison between Apple MacBook Pro M3, Dell XPS 15 9530, and Lenovo ThinkPad X1 Carbon Gen 12 for developers, creators, and professionals.',
    extractedText: `Flagship Laptop Showdown (2026 Edition)
Tested by TechRadar Labs

We tested three of the most sought-after professional laptops for software engineering, content creation, and executive productivity.

Product 1: Apple MacBook Pro 14" (M3 Pro)
- Price: $1,999 (₹1,99,900)
- Processor: Apple M3 Pro (12-core CPU, 18-core GPU)
- RAM: 18GB Unified Memory (Configurable to 36GB)
- Storage: 512GB PCIe 4.0 NVMe SSD
- Display: 14.2" Liquid Retina XDR (3024x1964, 120Hz ProMotion, 1600 nits peak HDR)
- Battery Life: 17 Hours 45 Minutes (Real-world web & coding test)
- Weight: 3.5 lbs (1.6 kg)
- Rating: 4.8 / 5.0
- Pros: Class-leading battery endurance, silent fan curve under load, phenomenal color accuracy, best-in-class trackpad.
- Cons: Expensive memory upgrades, no native dual external monitor support without lid closed on base models.

Product 2: Dell XPS 15 (9530 OLED Edition)
- Price: $1,849 (₹1,74,900)
- Processor: Intel Core i7-13700H (14-Core, up to 5.0 GHz) + NVIDIA RTX 4060 (8GB VRAM)
- RAM: 32GB DDR5 4800MHz (User Upgradable)
- Storage: 1TB NVMe M.2 SSD (Dual M.2 slots)
- Display: 15.6" 3.5K OLED Touchscreen (3456x2160, 400 nits, 100% DCI-P3)
- Battery Life: 7 Hours 20 Minutes
- Weight: 4.2 lbs (1.92 kg)
- Rating: 4.5 / 5.0
- Pros: Stunning deep-black OLED touchscreen, dedicated RTX 4060 GPU for local AI models and 3D rendering, upgradable RAM & dual SSDs.
- Cons: Fans spin noticeably loud during heavy compiles, mediocre 720p webcam, shorter battery life.

Product 3: Lenovo ThinkPad X1 Carbon Gen 12
- Price: $1,699 (₹1,59,900)
- Processor: Intel Core Ultra 7 155H (Intel Meteor Lake with integrated NPU)
- RAM: 32GB LPDDR5x
- Storage: 1TB PCIe Gen4 SSD
- Display: 14.0" 2.8K OLED (2880x1800, 120Hz, Anti-Glare, 400 nits)
- Battery Life: 11 Hours 15 Minutes
- Weight: 2.42 lbs (1.09 kg) - Ultra Lightweight Carbon Fiber
- Rating: 4.7 / 5.0
- Pros: Legendary ergonomic keyboard, featherweight 1.09kg chassis, dedicated on-device AI NPU, military-spec durability (MIL-STD 810H).
- Cons: Integrated Intel Arc graphics not suited for heavy 3D gaming or local LLM fine-tuning.

VERDICT SUMMARY:
- Best Overall for Developers: Apple MacBook Pro 14" M3 Pro (Unbeatable efficiency, thermals, and battery).
- Best for Creators & AI Practitioners: Dell XPS 15 (Dedicated RTX 4060 GPU + stunning 3.5K OLED).
- Best for Business Travelers & Typing Enthusiasts: Lenovo ThinkPad X1 Carbon Gen 12 (Featherweight, rugged, top keyboard).`,
    content: {
      heroImage: 'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=1200&auto=format&fit=crop&q=80',
      author: 'TechRadar Hardware Lab',
      publishedDate: '2026 Benchmark Series',
      sections: [
        {
          heading: 'Direct Specification & Feature Comparison Matrix',
          body: 'Detailed comparison of hardware metrics recorded in our testing laboratory:',
          table: {
            headers: ['Feature', 'MacBook Pro 14" (M3 Pro)', 'Dell XPS 15 (RTX 4060)', 'ThinkPad X1 Carbon Gen 12'],
            rows: [
              ['Price', '$1,999', '$1,849', '$1,699'],
              ['Processor', 'Apple M3 Pro (12-core)', 'Intel Core i7-13700H', 'Intel Core Ultra 7 155H (NPU)'],
              ['RAM', '18GB Unified', '32GB DDR5 (Upgradable)', '32GB LPDDR5x'],
              ['Storage', '512GB SSD', '1TB Dual NVMe M.2', '1TB PCIe Gen4 SSD'],
              ['Display', '14.2" 120Hz Mini-LED (1600 nits)', '15.6" 3.5K OLED Touch', '14" 2.8K 120Hz OLED (Anti-Glare)'],
              ['Battery Life', '17.8 Hours (Benchmark Champ)', '7.3 Hours', '11.2 Hours'],
              ['Weight', '3.5 lbs (1.60 kg)', '4.2 lbs (1.92 kg)', '2.42 lbs (1.09 kg) [Feather]'],
              ['GPU Power', '18-Core GPU (Metal 3)', 'NVIDIA RTX 4060 (8GB)', 'Intel Arc Graphics + NPU'],
              ['Rating', '4.8 / 5.0 ★', '4.5 / 5.0 ★', '4.7 / 5.0 ★'],
            ],
          },
        },
      ],
    },
  },

  'https://en.wikipedia.org/wiki/Artificial_intelligence': {
    url: 'https://en.wikipedia.org/wiki/Artificial_intelligence',
    domain: 'en.wikipedia.org',
    title: 'Artificial Intelligence — Wikipedia, the free encyclopedia',
    favicon: 'https://www.google.com/s2/favicons?domain=wikipedia.org&sz=64',
    category: 'wiki',
    description: 'Artificial intelligence is the intelligence of machines or software, as opposed to the intelligence of living beings, primarily of humans.',
    extractedText: `Artificial Intelligence (Wikipedia)
From Wikipedia, the free encyclopedia

Artificial intelligence (AI) is the intelligence of machines or software, as opposed to the intelligence of living beings, primarily of humans. It is a field of study in computer science that develops and studies intelligent machines. Such machines may be called AIs.

AI technology is widely used throughout industry, government, and science. Some high-profile applications include:
- Advanced web search engines (e.g., Google Search)
- Recommendation systems (used by YouTube, Amazon, and Netflix)
- Understanding human speech (such as Siri and Alexa)
- Self-driving cars (e.g., Waymo)
- Generative or creative tools (ChatGPT, Gemini, Claude, and AI art generators)
- Automated decision-making and strategic game-playing (e.g., AlphaGo and AlphaFold)

History and Milestones:
The field of AI research was founded at a workshop at Dartmouth College in 1956. The attendees became the leaders of AI research for decades. They and their students wrote programs that were astonishing to most people: computers were learning checkers strategies, solving word problems in algebra, proving logical theorems and speaking English.

By the mid-1960s, research in the US was heavily funded by the Department of Defense and laboratories had been established around the world.

Modern Era: Deep Learning and Foundation Models (2012–Present):
In the early 2010s, deep learning using deep neural networks began to dominate all competitive benchmarks. Hardware acceleration via GPUs and Tensor Processing Units (TPUs) enabled training models with hundreds of billions of parameters.

In 2017, the Transformer architecture introduced by Vaswani et al. ("Attention Is All You Need") revolutionized Natural Language Processing, leading directly to the current era of Large Language Models (LLMs) and Multimodal AI Agents capable of reasoning, coding, and continuous tool use.`,
    content: {
      heroImage: 'https://images.unsplash.com/photo-1620712943543-bcc4688e7485?w=1200&auto=format&fit=crop&q=80',
      author: 'Wikipedia Contributors',
      publishedDate: 'Last edited August 2026',
      sections: [
        {
          heading: 'Overview and Definitions',
          body: 'Artificial intelligence (AI) is the intelligence of machines or software, as opposed to the intelligence of living beings, primarily of humans. It is a field of study in computer science that develops and studies intelligent machines.',
        },
        {
          heading: 'Key Modern Subfields',
          body: 'The breadth of AI research encompasses diverse disciplines:',
          list: [
            'Machine Learning: Algorithms that learn from data without explicit procedural programming.',
            'Deep Learning: Multi-layered artificial neural networks mimicking biological perceptron pathways.',
            'Natural Language Processing (NLP): Semantic parsing, token embeddings, sequence transduction, and LLMs.',
            'Computer Vision: Image classification, object localization, 3D neural radiance fields (NeRF), and diffusion models.',
            'Autonomous Agents: Systems executing multi-step goals via tool invocation and contextual reasoning.',
          ],
        },
      ],
    },
  },

  'https://theverge.com/tech/2026/future-of-ai-agents-browser-revolution': {
    url: 'https://theverge.com/tech/2026/future-of-ai-agents-browser-revolution',
    domain: 'theverge.com',
    title: 'The AI Browser Revolution: How Intelligent Browsers Are Replacing Traditional Search',
    favicon: 'https://www.google.com/s2/favicons?domain=theverge.com&sz=64',
    category: 'article',
    description: 'Why the web browser has evolved from a passive HTML renderer into an active AI co-pilot capable of synthesizing knowledge, analyzing PDFs, and executing research workflows.',
    extractedText: `The AI Browser Revolution: How Intelligent Browsers Are Replacing Traditional Search
By Nilay Patel | Tech & Future Editor

For thirty years, the web browser was fundamentally a passive viewport. You typed a URL, the rendering engine compiled the HTML, CSS, and JavaScript, and you read the pixels. If you needed to compare four products or synthesize research from twenty academic tabs, your brain bore 100% of the cognitive overhead.

In 2026, that paradigm is permanently broken.

Enter Aksh AI and the next generation of Chromium-based intelligent browsers. Instead of merely displaying DOM trees, the modern browser incorporates context-aware AI assistants that operate directly alongside your tabs.

The Four Pillars of the AI Browser:
1. In-Situ Page Intelligence: The ability to ask direct questions about any open webpage—summarizing lengthy terms of service, distilling complex research, or converting technical tutorials into step-by-step guides.
2. Cross-Tab Research Mode: Entering a high-level query like "Best cloud certifications in 2026" causes the browser to autonomously fetch relevant sources, cross-examine facts, strip sponsored fluff, and generate a verified markdown decision matrix.
3. Native PDF & Document Cognition: Opening PDFs directly in the browser with full extraction, equation explanation, and instant quiz generation.
4. Privacy-Preserving Contextual Grounding: Performing AI reasoning with context isolation so your personal session cookies and credentials are never leaked.

As browser engines continue to evolve, the distinction between "searching the web" and "synthesizing the web" is evaporating.`,
    content: {
      heroImage: 'https://images.unsplash.com/photo-1550751827-4bd374c3f58b?w=1200&auto=format&fit=crop&q=80',
      author: 'Nilay Patel',
      publishedDate: 'August 2026',
      sections: [
        {
          heading: 'From Passive Viewer to Active Research Co-Pilot',
          body: 'Web browsers have transitioned from simple document renderers into cognitive workspaces. The average professional keeps 30+ tabs open at any given moment, creating severe information fragmentation.',
        },
        {
          heading: 'Why Research Mode Changes Everything',
          body: 'Instead of clicking 10 blue search links and manually copying specifications into spreadsheets, AI browser research agents execute the collection and synthesis automatically.',
        },
      ],
    },
  },
};

export const SAMPLE_PDFS = [
  {
    id: 'transformer-paper',
    title: 'Attention Is All You Need (Vaswani et al.)',
    filename: 'transformer_architecture_2017.pdf',
    pageCount: 15,
    description: 'The seminal 2017 research paper introducing the Transformer neural network architecture and multi-head self-attention mechanism.',
    text: `ATTENTION IS ALL YOU NEED
Ashish Vaswani, Noam Shazeer, Niki Parmar, Jakob Uszkoreit, Llion Jones, Aidan N. Gomez, Lukasz Kaiser, Illia Polosukhin
Google Brain & Google Research

ABSTRACT
The dominant sequence transduction models are based on complex recurrent or convolutional neural networks in an encoder-decoder configuration. The best performing models also connect the encoder and decoder through an attention mechanism. We propose a new simple network architecture, the Transformer, based solely on attention mechanisms, dispensing with recurrence and convolutions entirely. Experiments on two machine translation tasks show these models to be superior in quality while being more parallelizable and requiring significantly less time to train. Our model achieves 28.4 BLEU on the WMT 2014 English-to-German translation task, improving over the existing best results, including ensembles by over 2 BLEU. On the WMT 2014 English-to-French translation task, our model establishes a new single-model state-of-the-art BLEU score of 41.8 after training for 3.5 days on eight GPUs.

1. INTRODUCTION
Recurrent neural networks (RNNs), long short-term memory (LSTM) and gated recurrent neural networks have been firmly established as state of the art approaches in sequence modeling. Recurrent models inherently factor computation along the symbol positions of the input and output sequences. Aligning the positions to steps in computation time, they generate a sequence of hidden states h_t, as a function of the previous hidden state h_{t-1} and the input for position t. This inherently sequential nature precludes parallelization within training examples, which becomes critical at longer sequence lengths.

Attention mechanisms have become an integral part of compelling sequence modeling and transduction models in various tasks, allowing modeling of dependencies without regard to their distance in the input or output sequences. In all but a few cases, however, such attention mechanisms are used in conjunction with a recurrent network.

In this work we propose the Transformer, a model architecture eschewing recurrence and instead relying entirely on an attention mechanism to draw global dependencies between input and output.

2. MODEL ARCHITECTURE
The Transformer follows an overall encoder-decoder structure using stacked self-attention and point-wise, fully connected layers.

2.1 Scaled Dot-Product Attention:
We compute the attention function on a set of queries simultaneously, packed together into a matrix Q. The keys and values are also packed into matrices K and V. We compute the matrix of outputs as:
Attention(Q, K, V) = softmax(Q * K^T / sqrt(d_k)) * V

Where d_k is the dimension of the keys. We divide by sqrt(d_k) to counteract the effect of dot products growing large in magnitude for large values of d_k, which pushes the softmax function into regions that have extremely small gradients.

2.2 Multi-Head Attention:
Instead of performing a single attention function with d_model-dimensional keys, values and queries, we found it beneficial to linearly project the queries, keys and values h times with different, learned linear projections to d_k, d_k and d_v dimensions, respectively.
MultiHead(Q, K, V) = Concat(head_1, ..., head_h) * W^O
where head_i = Attention(Q * W_i^Q, K * W_i^K, V * W_i^V)

This allows the model to jointly attend to information from different representation subspaces at different positions.`,
  },
  {
    id: 'quantum-computing-primer',
    title: 'Introduction to Quantum Information and Quantum Circuits',
    filename: 'quantum_computing_primer_2026.pdf',
    pageCount: 12,
    description: 'Fundamental principles of qubits, superposition, entanglement, Hadamard gates, and Shor/Grover quantum algorithms.',
    text: `A PRACTICAL INTRODUCTION TO QUANTUM COMPUTING
Dr. Evelyn Reed, Center for Quantum Nanoscience

1. THE QUANTUM BIT (QUBIT)
Unlike a classical binary bit which can exist solely in state 0 or state 1, a quantum bit (qubit) can exist in a superposition of both states simultaneously:
|psi> = alpha |0> + beta |1>
Where alpha and beta are complex probability amplitudes satisfying the normalization constraint |alpha|^2 + |beta|^2 = 1.
When measured, the qubit collapses to state |0> with probability |alpha|^2, and to state |1> with probability |beta|^2.

2. QUANTUM GATES & REVERSIBLE COMPUTATION
Quantum logic gates are represented by unitary matrices (U * U^\dagger = I).
- The Pauli-X Gate (Quantum NOT): Inverts amplitudes.
- The Hadamard Gate (H): Creates an equal superposition from basis states:
  H|0> = (|0> + |1>) / sqrt(2)
  H|1> = (|0> - |1>) / sqrt(2)
- Controlled-NOT (CNOT): A two-qubit gate that flips the target qubit if and only if the control qubit is |1>, creating maximal quantum entanglement (Bell States).

3. QUANTUM ENTANGLEMENT & BELL STATES
Entanglement represents a non-local correlation between qubits where measuring one instantaneously determines the state of the other:
|Phi^+> = (|00> + |11>) / sqrt(2)

4. QUANTUM ADVANTAGE IN 2026
Key quantum algorithms demonstrating computational speedup:
- Shor's Algorithm: Factors large integers in polynomial time O((log N)^3), threatening classical RSA cryptography.
- Grover's Algorithm: Searches unsorted databases of size N in O(sqrt(N)) queries (quadratic speedup).
- Quantum Approximate Optimization Algorithm (QAOA): Solves combinatorial NP-hard optimization problems on noisy intermediate-scale quantum (NISQ) devices.`,
  },
];

export const SPEED_DIAL_SHORTCUTS = [
  { id: 'app-search', title: 'Search', url: 'https://www.google.com', icon: 'Search', color: 'bg-blue-600' },
  { id: 'app-research', title: 'Deep Research', url: 'aksh://research', icon: 'Zap', color: 'bg-amber-600' },
  { id: 'app-mindmap', title: 'Mindmap', url: 'aksh://mindmap', icon: 'Network', color: 'bg-indigo-600' },
  { id: 'app-pdf', title: 'PDF Reader', url: 'aksh://pdf', icon: 'FileText', color: 'bg-rose-600' },
  { id: 'app-compare', title: 'Comparison', url: 'aksh://comparison', icon: 'Scale', color: 'bg-pink-600' },
  { id: 'app-notes', title: 'AI Notes', url: 'aksh://notes', icon: 'StickyNote', color: 'bg-emerald-600' },
  { id: 'app-bookmarks', title: 'Bookmarks', url: 'aksh://bookmarks', icon: 'Bookmark', color: 'bg-cyan-600' },
  { id: 'app-history', title: 'History', url: 'aksh://history', icon: 'History', color: 'bg-purple-600' },
  { id: 'app-downloads', title: 'Downloads', url: 'aksh://downloads', icon: 'Download', color: 'bg-teal-600' },
  { id: 'app-devtools', title: 'DevTools', url: 'aksh://devtools', icon: 'Code', color: 'bg-slate-800' },
  { id: 'app-settings', title: 'Settings', url: 'aksh://settings', icon: 'Settings', color: 'bg-slate-700' },
  { id: 'site-python', title: 'Python Guide', url: 'https://learn.python.org/courses/2026-guide', icon: 'Laptop', color: 'bg-blue-700' },
];

export const INITIAL_BOOKMARKS: any[] = [];

export const INITIAL_NOTES: any[] = [];

export const INITIAL_DOWNLOADS: any[] = [];

