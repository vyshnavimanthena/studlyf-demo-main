import time

# List of existing tools from previous implementation
EXISTING_TOOLS = [
    {
        "name": "ChatGPT",
        "description": "AI conversational assistant for writing, coding and research",
        "logo": "https://upload.wikimedia.org/wikipedia/commons/0/04/ChatGPT_logo.svg",
        "category": "Productivity",
        "url": "https://chat.openai.com"
    },
    {
        "name": "Midjourney",
        "description": "AI tool for generating stunning images from text prompts",
        "logo": "https://upload.wikimedia.org/wikipedia/commons/e/e6/Midjourney_Emblem.png",
        "category": "Design",
        "url": "https://midjourney.com"
    },
    {
        "name": "GitHub Copilot",
        "description": "Your AI pair programmer, helps you write code faster with less work",
        "logo": "https://vectorseek.com/wp-content/uploads/2023/08/Github-Copilot-Logo-Vector.svg-.png",
        "category": "Coding",
        "url": "https://github.com/features/copilot"
    },
    {
        "name": "Jasper",
        "description": "AI content generator for marketing, social media, and more",
        "logo": "https://images.seeklogo.com/logo-png/59/1/jasper-logo-png_seeklogo-593159.png",
        "category": "Writing",
        "url": "https://jasper.ai"
    },
    {
        "name": "Notion AI",
        "description": "Integrated AI assistant within Notion for writing and summarizing",
        "logo": "https://upload.wikimedia.org/wikipedia/commons/4/45/Notion_app_logo.png",
        "category": "Productivity",
        "url": "https://notion.so"
    },
    {
        "name": "Perplexity AI",
        "description": "AI-powered search engine that provides direct answers with citations",
        "logo": "https://images.seeklogo.com/logo-png/61/3/perplexity-ai-icon-black-logo-png_seeklogo-611679.png",
        "category": "Research",
        "url": "https://perplexity.ai"
    },
    {
        "name": "Grammarly",
        "description": "AI writing assistant that helps with grammar, tone, and clarity",
        "logo": "https://latestlogo.com/wp-content/uploads/2024/02/grammarly-icon.png",
        "category": "Writing",
        "url": "https://grammarly.com"
    },
    {
        "name": "Zapier Central",
        "description": "AI-powered automation platform to connect your apps and workflows",
        "logo": "https://th.bing.com/th/id/OIP.GaXGEQxybMCkOqjieJr2VQHaHa?o=7rm=3&rs=1&pid=ImgDetMain&o=7&rm=3",
        "category": "Automation",
        "url": "https://zapier.com"
    },
    {
        "name": "Cursor",
        "description": "The AI Code Editor built for pair programming with an AI",
        "logo": "https://tse1.mm.bing.net/th/id/OIP.QpMKJ9xBA1Q-k5eGk_u2vwHaHa?rs=1&pid=ImgDetMain&o=7&rm=3",
        "category": "Coding",
        "url": "https://cursor.sh"
    },
    {
        "name": "Leonardo.ai",
        "description": "Generative AI platform for creators to design production quality assets",
        "logo": "https://tse4.mm.bing.net/th/id/OIP.g8i8-dc_mxjt-uKrGP4hogHaHl?rs=1&pid=ImgDetMain&o=7&rm=3",
        "category": "Design",
        "url": "https://leonardo.ai"
    }
]

def get_logo(domain):
    # Using Google's S2 favicon service (Size: 128px) - Faster than Icon Horse
    return f"https://www.google.com/s2/favicons?sz=128&domain={domain}"

# List of new tools added manually with logos detected via Icon Horse
NEW_TOOLS = [
    {
        "name": "Stripo",
        "description": "Design responsive emails faster, collaborate instantly, use modular templates, and export effortlessly to any ESP with Stripo.",
        "logo": get_logo("stripo.email"),
        "category": "Email Marketing Software",
        "url": "https://stripo.email"
    },
    {
        "name": "RepoClip",
        "description": "AI-powered tool that turns any GitHub repository into a professional promotional video with narration, visuals, and music \u2014 in under 5 minutes.",
        "logo": get_logo("repoclip.com"),
        "category": "Product Demo Automation",
        "url": "https://repoclip.com"
    },
    {
        "name": "Scalify.ai",
        "description": "Scalify.ai is the world's first website ordering platform, where you can order your own website in under 10 minutes.",
        "logo": get_logo("scalify.ai"),
        "category": "Website Builder Software",
        "url": "https://scalify.ai"
    },
    {
        "name": "Flowstep",
        "description": "Flowstep is an AI design assistant. It generates UI designs from text prompts. Users can copy their designs into Figma or export clean code.",
        "logo": get_logo("flowstep.ai"),
        "category": "UI/UX Designing Software",
        "url": "https://flowstep.ai"
    },
    {
        "name": "LLMboost",
        "description": "LLMBoost helps SEO and SEM agencies track and improve how AI tools like Gemini, ChatGPT, Perplexity recommend their clients, turning AI insights into GEO action",
        "logo": get_logo("llmboost.io"),
        "category": "SEO Software",
        "url": "https://llmboost.io"
    },
    {
        "name": "Blink",
        "description": "Blink is a messaging platform for private and group communication, offering text messaging, file sharing, and an organised, easy-to-use interface.",
        "logo": get_logo("joinblink.com"),
        "category": "Team Communication Software",
        "url": "https://joinblink.com"
    },
    {
        "name": "Wellows",
        "description": "Wellows helps brands track citations, sentiment, and visibility across AI search engines like ChatGPT, Gemini, and Perplexity.",
        "logo": get_logo("wellows.com"),
        "category": "Content Automation Software",
        "url": "https://wellows.com"
    },
    {
        "name": "Clym",
        "description": "Clym is an all-in-one digital compliance solution that simplifies data privacy, accessibility, and governance with easy-to-manage tools.",
        "logo": get_logo("clym.io"),
        "category": "Governance, Risk and Compliance Software",
        "url": "https://clym.io"
    },
    {
        "name": "Ace.me",
        "description": "Your new website, email address & cloud storage. Simple. Fast. Secure.",
        "logo": get_logo("ace.me"),
        "category": "Website Builder Software",
        "url": "https://ace.me"
    },
    {
        "name": "PDF Candy Desktop",
        "description": "Powerful and easy to use software with full-featured PDF editor. Convert, split, merge, protect, crop, rotate, compress & much more.",
        "logo": get_logo("pdfcandy.com"),
        "category": "Productivity Tools",
        "url": "https://pdfcandy.com"
    },
    {
        "name": "Sliptree",
        "description": "Create and send professional, branded invoices in minutes. Sliptree keeps invoicing simple, fast, and flexible for freelancers and small businesses.",
        "logo": get_logo("sliptree.com"),
        "category": "Billing and Invoicing Software",
        "url": "https://sliptree.com"
    },
    {
        "name": "Crypto5.app",
        "description": "AI crypto research assistant for real\u2011time data, news, on\u2011chain, tokenomics, and risk\u2014actionable insights in 2 minutes.",
        "logo": get_logo("crypto5.app"),
        "category": "AI Crypto Research",
        "url": "https://crypto5.app"
    },
    {
        "name": "Notiondesk",
        "description": "Turn your Notion pages into a branded help center with SEO, analytics, and AI-powered search.",
        "logo": get_logo("notiondesk.com"),
        "category": "Customer Service Software",
        "url": "https://notiondesk.com"
    },
    {
        "name": "Valifi.ai",
        "description": "Instant idea validation, live competitor insights, and deep market analysis. Valifi.ai is everything you need to generate the perfect AI build prompt.",
        "logo": get_logo("valifi.ai"),
        "category": "Startup Launch Tools",
        "url": "https://valifi.ai"
    },
    {
        "name": "goHeather AI Contract Review",
        "description": "Lawyer-trained AI that reviews contracts, generates redlines, and applies custom playbooks - fast and inexpensive.",
        "logo": get_logo("goheather.io"),
        "category": "Legal",
        "url": "https://goheather.io"
    },
    {
        "name": "MCP Showcase",
        "description": "Gain real-time insights into how prospects use your MCP servers to refine features and improve your product in days, not weeks.",
        "logo": get_logo("mcpshowcase.io"),
        "category": "Development and DevOps",
        "url": "https://mcpshowcase.io"
    },
    {
        "name": "Motif",
        "description": "Motif is your personal wealth manager for on-chain finance. Agent-powered and working for you \u2013 See for yourself.",
        "logo": get_logo("motif.fi"),
        "category": "Cryptocurrency Wallets Software",
        "url": "https://motif.fi"
    },
    {
        "name": "TalentSprout",
        "description": "AI voice interviews that screen, score, and rank candidates automatically\u2014saving hours on hiring.",
        "logo": get_logo("talentsprout.io"),
        "category": "Hiring and HRMS",
        "url": "https://talentsprout.io"
    },
    {
        "name": "Proposal Pilot",
        "description": "Generate complete, accurate RFP responses in minutes using your company\u2019s past proposals. Built for speed, compliance, and GovCon growth.",
        "logo": get_logo("proposalpilot.ai"),
        "category": "Sales",
        "url": "https://proposalpilot.ai"
    },
    {
        "name": "Botpool",
        "description": "Botpool is a freelance marketplace built specifically for AI professionals.",
        "logo": get_logo("botpool.xyz"),
        "category": "Development and DevOps",
        "url": "https://botpool.xyz"
    },
    {
        "name": "AI Newsletter Generator",
        "description": "Effortlessly grow your business with AI-powered newsletters. Automate content creation, leverage media monitoring, and deliver engaging newsletters.",
        "logo": get_logo("newslettergenerator.ai"),
        "category": "Email Marketing Software",
        "url": "https://newslettergenerator.ai"
    },
    {
        "name": "Convoso",
        "description": "The dialer built for closers, with AI-powered tools to supercharge your outbound sales.",
        "logo": get_logo("convoso.com"),
        "category": "Lead Generation Software",
        "url": "https://convoso.com"
    },
    {
        "name": "Forage Mail",
        "description": "Invisible AI that filters distractions, identifies important messages & cleans your inbox. Replace email clutter with elegant daily summaries\u2014right in Gmail.",
        "logo": get_logo("foragemail.com"),
        "category": "Productivity Tools",
        "url": "https://foragemail.com"
    },
    {
        "name": "Secta Labs",
        "description": "Get hundreds of realistic headshots in minutes\u2014Secta Labs offers instant style customization, pro-grade editing, and a complete portrait studio experience.",
        "logo": get_logo("secta.ai"),
        "category": "Photo Editing Software",
        "url": "https://secta.ai"
    },
    {
        "name": "Clerk",
        "description": "Clerk is a comprehensive user authentication and management platform designed for modern web and mobile applications.",
        "logo": get_logo("clerk.com"),
        "category": "Development and DevOps",
        "url": "https://clerk.com"
    },
    {
        "name": "Persimi",
        "description": "Persimi is a research simulator that lets users conduct realistic interviews with AI personas \u2014 for insight, empathy, and clarity.",
        "logo": get_logo("persimi.com"),
        "category": "Market Research Software",
        "url": "https://persimi.com"
    },
    {
        "name": "Refiner",
        "description": "Gather customer insights with perfectly-timed web & mobile in-product microsurveys. Get higher response rates and actionable feedback.",
        "logo": get_logo("refiner.io"),
        "category": "Survey and Feedback Software",
        "url": "https://refiner.io"
    },
    {
        "name": "Skycloak",
        "description": "Simplify identity management with Skycloak's managed Keycloak hosting, secure and scalable IAM solutions.",
        "logo": get_logo("skycloak.io"),
        "category": "Development and DevOps",
        "url": "https://skycloak.io"
    },
    {
        "name": "Undetectable AI",
        "description": "Undetectable AI offers the #1 rated AI detector and humanization tool to check and transform AI-written content into undetectable human-like text.",
        "logo": get_logo("undetectable.ai"),
        "category": "Content Marketing Software",
        "url": "https://undetectable.ai"
    },
    {
        "name": "MemeGen AI",
        "description": "A tool to transform your photos into funny GIF memes.",
        "logo": get_logo("memegen.ai"),
        "category": "Social Tools",
        "url": "https://memegen.ai"
    },
    {
        "name": "ReadPartner",
        "description": "An AI assistant for automated news digests and quick summaries of websites, videos and documents. Works as a browser extension and an online portal.",
        "logo": get_logo("readpartner.com"),
        "category": "Productivity Tools",
        "url": "https://readpartner.com"
    },
    {
        "name": "BoloSign",
        "description": "Unlimited signatures, templates, forms, and team members. One fixed price. No extra charges, ever.",
        "logo": get_logo("bolosign.com"),
        "category": "Digital Signature Software",
        "url": "https://bolosign.com"
    },
    {
        "name": "Solvely",
        "description": "Your Best AI Study Companion. Solvely offers AI tools designed to support students in enhancing their writing and learning efficiency.",
        "logo": get_logo("solvelyapp.com"),
        "category": "Learning",
        "url": "https://solvelyapp.com"
    },
    {
        "name": "Datagram",
        "description": "A great tool with an API and mobile app to easily distribute beautiful data.",
        "logo": get_logo("datagram.io"),
        "category": "Dashboard Software",
        "url": "https://datagram.io"
    },
    {
        "name": "Helpfull",
        "description": "A free AI business name generator that helps you instantly create catchy business names that resonate with your audience.",
        "logo": get_logo("helpfull.com"),
        "category": "Domain Name Tools",
        "url": "https://helpfull.com"
    },
    {
        "name": "getimg.ai",
        "description": "getimg.ai offers AI-powered tools to easily create, edit, and transform images with text commands. Perfect for all your creative needs.",
        "logo": get_logo("getimg.ai"),
        "category": "Design",
        "url": "https://getimg.ai"
    },
    {
        "name": "SummarAIze",
        "description": "SummarAIze repurposes long-form audio and video content into blogs, social posts, newsletters, clips, and more with AI.",
        "logo": get_logo("summaraize.com"),
        "category": "Content Automation Software",
        "url": "https://summaraize.com"
    },
    {
        "name": "Entrepreneur DNA Assessment",
        "description": "Unlock your full potential with Founder Institute's Entrepreneur DNA test. See how you stack up against 180,000+ entrepreneurs worldwide.",
        "logo": get_logo("fi.co"),
        "category": "Startup Launch Tools",
        "url": "https://fi.co"
    },
    {
        "name": "Atlas HXM",
        "description": "Atlas HXM is the largest Direct Employer of Record (EOR) technology platform.",
        "logo": get_logo("atlashxm.com"),
        "category": "Payroll Software",
        "url": "https://atlashxm.com"
    },
    {
        "name": "Notion For Startups",
        "description": "Build your company and team with Notion. Centralise all your knowledge, communicate more efficiently, and manage any type of project, no matter the team size.",
        "logo": get_logo("notion.so"),
        "category": "Collaboration Tools",
        "url": "https://notion.so"
    },
    {
        "name": "Qonqur",
        "description": "Apple Vision-like hand-gestures meets ChatGPT with no need for a headset. Explore and present ideas using gesture controls with Qonqur's virtual hands.",
        "logo": get_logo("qonqur.com"),
        "category": "Learning",
        "url": "https://qonqur.com"
    },
    {
        "name": "Superblocks",
        "description": "Superblocks is a low-code platform for developers to rapidly build custom enterprise-grade internal applications.",
        "logo": get_logo("superblocks.com"),
        "category": "Low Code Development Tools",
        "url": "https://superblocks.com"
    },
    {
        "name": "Outverse",
        "description": "Outverse is the self-serve support platform for modern SaaS startups. Support your customers at scale with help docs, customer forums and AI assistance.",
        "logo": get_logo("outverse.com"),
        "category": "Customer Service Software",
        "url": "https://outverse.com"
    },
    {
        "name": "Syncly",
        "description": "Syncly is an Y Combinator-backed AI Feedback Analysis Tool, surfacing real customer pains by analyzing customer chat, calls, reviews and surveys.",
        "logo": get_logo("syncly.app"),
        "category": "Analytics",
        "url": "https://syncly.app"
    },
    {
        "name": "Aikido Security",
        "description": "Aikido is an all-in-one application security solution for cloud-native companies. They help you get your web app secured in no time.",
        "logo": get_logo("aikido.dev"),
        "category": "Website Security Software",
        "url": "https://aikido.dev"
    },
    {
        "name": "UI Bakery",
        "description": "UI Bakery is a low-code platform to build internal web apps & tools.",
        "logo": get_logo("uibakery.io"),
        "category": "Low Code Development Tools",
        "url": "https://uibakery.io"
    },
    {
        "name": "davinci",
        "description": "davinci is the most performant and secure AI patent drafting tool that helps draft better patents in half of the time.",
        "logo": get_logo("davinci.ai"),
        "category": "Patents Drafting and Analysis Software",
        "url": "https://davinci.ai"
    },
    {
        "name": "DJ.Studio",
        "description": "DJ.Studio is a timeline-based DAW for DJs to make DJ mixes on your laptop in one third of the time. Order playlists, tune transitions and export your DJ mix.",
        "logo": get_logo("dj.studio"),
        "category": "Productivity Tools",
        "url": "https://dj.studio"
    },
    {
        "name": "ChaosSearch",
        "description": "ChaosSearch seamlessly transforms cloud storage into a live analytical database, delivering actionable insights at scale through Search+SQL+GenAI analytics.",
        "logo": get_logo("chaossearch.io"),
        "category": "Database Software",
        "url": "https://chaossearch.io"
    },
    {
        "name": "Testiny",
        "description": "Testiny is a cloud-based test management solution for manual and automated test cases with test runs, plans, issue-tracker integrations and more.",
        "logo": get_logo("testiny.io"),
        "category": "Test Management Tools",
        "url": "https://testiny.io"
    },
    {
        "name": "HelpWire",
        "description": "HelpWire is a simple service for instant remote support. Control remote computers to fix IT issues fast, anytime, and anywhere.",
        "logo": get_logo("helpwire.app"),
        "category": "Remote Desktop Access Software",
        "url": "https://helpwire.app"
    },
    {
        "name": "SpiffWorkflow",
        "description": "SpiffWorkflow is a tool for business process automation. It has a Python3 library for executing business workflows using BPMN.",
        "logo": get_logo("spiffworkflow.org"),
        "category": "Workflow Management Software",
        "url": "https://spiffworkflow.org"
    },
    {
        "name": "UTMStack",
        "description": "A log management and threat prevention tool that merges SIEM and XDR technologies into a unified platform, surpassing the boundaries of traditional systems.",
        "logo": get_logo("utmstack.com"),
        "category": "Development and DevOps",
        "url": "https://utmstack.com"
    },
    {
        "name": "Walnut",
        "description": "A no-code platform for SaaS companies to build and deliver personalized interactive demos throughout the sales funnel to improve buyer experience and conversion",
        "logo": get_logo("walnut.io"),
        "category": "Product Demo Automation",
        "url": "https://walnut.io"
    },
    {
        "name": "Saleo",
        "description": "A demo experience platform that brings your product to life in its native environment.",
        "logo": get_logo("saleo.io"),
        "category": "Product Demo Automation",
        "url": "https://saleo.io"
    },
    {
        "name": "Storylane",
        "description": "A no-code platform to create and automate guided demo experiences for your website.",
        "logo": get_logo("storylane.io"),
        "category": "Product Demo Automation",
        "url": "https://storylane.io"
    },
    {
        "name": "Consensus",
        "description": "Consensus is a SaaS platform that creates video demos to accelerate sales.",
        "logo": get_logo("goconsensus.com"),
        "category": "Product Demo Automation",
        "url": "https://goconsensus.com"
    },
    {
        "name": "Navattic",
        "description": "A tool to create interactive website demos and empower product marketing teams to increase website conversions.",
        "logo": get_logo("navattic.com"),
        "category": "Product Demo Automation",
        "url": "https://navattic.com"
    },
    {
        "name": "Reprise",
        "description": "A platform for sales and marketing teams to create product demos.",
        "logo": get_logo("reprise.com"),
        "category": "Product Demo Automation",
        "url": "https://reprise.com"
    },
    {
        "name": "Demostack",
        "description": "Demostack is a no-code platform that helps you create product replicas and demos that showcase your product in the best light.",
        "logo": get_logo("demostack.com"),
        "category": "Product Demo Automation",
        "url": "https://demostack.com"
    },
    {
        "name": "All In One Accessibility Pro",
        "description": "Get quick WCAG 2.1 website accessibility remediation with All in One Accessibility. Install the tool in 2 minutes.",
        "logo": get_logo("skynettechnologies.com"),
        "category": "Customer Service Software",
        "url": "https://skynettechnologies.com"
    },
    {
        "name": "Agora",
        "description": "Agora is a real estate investment platform helping investors, GPs and LPs track high-quality investment opportunities and maintain investor relations.",
        "logo": get_logo("agora-realestate.com"),
        "category": "Real Estate Investor Software",
        "url": "https://agora-realestate.com"
    },
    {
        "name": "Cash Flow Portal",
        "description": "Cash Flow Portal is a real-estate syndication software for managing your investor network and raising capital faster.",
        "logo": get_logo("cashflowportal.com"),
        "category": "Real Estate Investor Software",
        "url": "https://cashflowportal.com"
    },
    {
        "name": "SponsorCloud",
        "description": "SponsorCloud serves investment firms and deal sponsors to adopt digital transformation, grow their businesses, and better serve their investors.",
        "logo": get_logo("sponsorcloud.io"),
        "category": "Real Estate Investor Software",
        "url": "https://sponsorcloud.io"
    }
]

# All tools combined
ALL_TOOLS = EXISTING_TOOLS + NEW_TOOLS

def fetch_ai_tools():
    """Returns the static list of AI tools. Scraping has been removed as per user request."""
    return ALL_TOOLS
