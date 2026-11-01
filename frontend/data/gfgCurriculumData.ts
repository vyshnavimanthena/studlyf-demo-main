export interface QuizQuestion {
  question: string;
  options: string[];
  correct: number;
  explanation: string;
}

export interface CurriculumTopic {
  title: string;
  type: 'text' | 'practice_quiz' | 'graded_quiz';
  content?: string;
  practice?: QuizQuestion[];
  graded?: QuizQuestion[];
}

export interface CurriculumChapter {
  title: string;
  description: string;
  duration: string;
  topics: CurriculumTopic[];
}

export const GFG_CURRICULUM_DATA: CurriculumChapter[] = [
  {
    title: 'AI Foundations',
    description: 'Understand the core principles behind generative AI, large language models, and modern AI systems.',
    duration: '90 mins',
    topics: [
      {
        title: '1.1 Introduction to Generative AI',
        type: 'text',
        content: `### 1.1 Introduction to Generative AI

Generative Artificial Intelligence (GenAI) is a subset of machine learning that focuses on creating new content, including text, images, code, and audio, based on the patterns it has learned from training data. Unlike traditional AI systems that analyze data or make predictions, generative AI **generates brand new, highly realistic outputs**.

#### Core Architectural Evolution
The transition from classical neural networks to modern Generative AI is marked by three major milestones:
1. **Recurrent Neural Networks (RNNs):** Processed sequence data sequentially, which was slow and struggled with long-term dependencies.
2. **Long Short-Term Memory (LSTM):** Introduced gate mechanisms to maintain gradients over longer sequences.
3. **The Transformer Architecture (2017):** Introduced **Self-Attention Mechanisms**, allowing parallel processing of text tokens and capturing deep context.

<div class="my-6 rounded-xl overflow-hidden shadow-lg border border-gray-200">
  <img src="https://images.unsplash.com/photo-1677442136019-21780ecad995?w=800&q=80" alt="Artificial Neural Network Representation" style="width: 100%; height: auto; display: block;" />
  <div class="p-3 bg-gray-50 text-xs text-gray-500 text-center font-medium border-t border-gray-200">
    Figure 1: High-dimensional vector space mapping in generative model layers.
  </div>
</div>

#### Key Concepts to Know
* **Foundational Models:** Large-scale models trained on massive, broad datasets (e.g., GPT-4, Claude 3.5, Llama 3) that can be adapted to a wide range of downstream tasks.
* **Tokens:** The basic units of text processed by language models. A token can be a word, part of a word, or even a single character.
* **Parameters:** The learned weights and biases within the neural network that determine how input tokens are transformed into output tokens.

#### Code Example: Initializing a Simple Tokenization Workflow
Below is a conceptual Python example demonstrating how raw text is broken down into structured token sequences before model processing:

\`\`\`python
# Conceptual Tokenization Pipeline in Python
def simple_tokenize(text: str) -> list[str]:
    # Splitting by word boundaries and punctuation
    import re
    tokens = re.findall(r"\\w+|[^\\w\\s]", text, re.UNICODE)
    return [token.lower() for token in tokens]

sample_text = "Generative AI is changing the software engineering landscape!"
tokens = simple_tokenize(sample_text)
print(f"Original Text length: {len(sample_text)} characters")
print(f"Tokenized Sequence: {tokens}")
print(f"Total Tokens: {len(tokens)}")
\`\`\`

#### External & Internal Resources
* Learn more about vector spaces in [Vector Space Embedding Guide](/learn/courses/ai-foundations/1.2)
* Explore the original research on [Attention Is All You Need (arXiv)](https://arxiv.org/abs/1706.03762)
* Visit the [Hugging Face Transformers Documentation](https://huggingface.co/docs/transformers) for practical code models.`
      },
      {
        title: '1.2 Large Language Model Architectures',
        type: 'text',
        content: `### 1.2 Large Language Model Architectures

Large Language Models (LLMs) are deep learning models designed to understand and generate human language. At the absolute core of modern LLMs lies the **Transformer decoder-only or encoder-decoder architecture**. 

#### The Self-Attention Mechanism
Self-attention allows a model to weigh the importance of different words in a sentence relative to a specific target word, regardless of their distance. This solves the long-term context retention bottleneck.

Mathematically, attention is calculated using Queries ($Q$), Keys ($K$), and Values ($V$):

$$\\text{Attention}(Q, K, V) = \\text{softmax}\\left(\\frac{QK^T}{\\sqrt{d_k}}\\right)V$$

#### Comparison of LLM Architectures

| Architecture Type | Description | Primary Use Cases | Popular Models |
| :--- | :--- | :--- | :--- |
| **Encoder-Only** | Understands text, outputs dense vectors. | Sentiment analysis, classification. | BERT, RoBERTa |
| **Decoder-Only** | Predicts the next token autoregressively. | Creative writing, general chatbot, code gen. | GPT-4, Llama 3, Mistral |
| **Encoder-Decoder** | Transforms input sequence into new sequence. | Translation, summarization, text extraction. | T5, BART |

<div class="my-6 rounded-xl overflow-hidden shadow-lg border border-gray-200">
  <img src="https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?w=800&q=80" alt="Data Flow Representation" style="width: 100%; height: auto; display: block;" />
  <div class="p-3 bg-gray-50 text-xs text-gray-500 text-center font-medium border-t border-gray-200">
    Figure 2: Multi-headed attention mechanism routing within LLM block layers.
  </div>
</div>

#### Code Example: Autoregressive Next-Token Prediction
Here is a simplified code example showing how decoder-only models select the next token using soft probabilities:

\`\`\`python
import numpy as np

def predict_next_token(logits: np.ndarray, temperature: float = 1.0) -> int:
    # Apply Temperature scaling to control creativity
    scaled_logits = logits / max(temperature, 1e-5)
    
    # Compute Softmax probabilities
    exp_logits = np.exp(scaled_logits - np.max(scaled_logits)) # Stable softmax
    probs = exp_logits / np.sum(exp_logits)
    
    # Sample from the probability distribution
    return int(np.random.choice(len(probs), p=probs))

# Mock logits for 5 vocabulary tokens
mock_logits = np.array([2.5, 0.1, 4.2, -1.0, 1.5])
next_token = predict_next_token(mock_logits, temperature=0.7)
print(f"Predicted Token ID: {next_token}")
\`\`\`

#### Helpful Reference Links
* Advance to [Ethical AI Design](/learn/courses/ai-foundations/1.3)
* Read the deep-dive on [Transformers from Scratch](https://jalammar.github.io/illustrated-transformer/)`
      },
      {
        title: '1.3 Responsible and Ethical AI Design',
        type: 'text',
        content: `### 1.3 Responsible and Ethical AI Design

As generative models scale in capability, designing responsible safeguards is paramount. Ethical AI design involves actively identifying and mitigating biases, securing personal user data, and building transparent pipelines.

#### Core Pillars of Ethical AI
1. **Bias Mitigation:** Generative models inherit societal biases present in their training corpora. Developers must implement post-generation filters and balanced RLHF (Reinforcement Learning from Human Feedback) pathways.
2. **Data Privacy & Governance:** Preventing models from memorizing and leaking personally identifiable information (PII) or proprietary corporate codebases.
3. **Hallucination Containment:** LLMs generate plausible-sounding but factually incorrect assertions. Grounding mechanisms like Retrieval-Augmented Generation (RAG) are critical.

<div class="my-6 rounded-xl overflow-hidden shadow-lg border border-gray-200">
  <img src="https://images.unsplash.com/photo-1507146426996-ef05306b995a?w=800&q=80" alt="Secure Server Room representing Privacy" style="width: 100%; height: auto; display: block;" />
  <div class="p-3 bg-gray-50 text-xs text-gray-500 text-center font-medium border-t border-gray-200">
    Figure 3: Secure privacy boundaries and evaluation layers surrounding foundational models.
  </div>
</div>

#### Simple Safeguard Implementation
The following Python script illustrates how to build a basic prompt safety layer to filter potentially harmful prompt words before executing an LLM api call:

\`\`\`python
# Simple Pre-Submission Content Guardrail
BANNED_KEYWORDS = {"hack", "bypass", "exploit", "override security", "brute force"}

def validate_prompt_safety(prompt: str) -> bool:
    normalized = prompt.lower()
    for keyword in BANNED_KEYWORDS:
        if keyword in normalized:
            print(f"⚠️ Guardrail Triggered: Banned keyword '{keyword}' detected!")
            return False
    return True

# Test Scenarios
safe_prompt = "Explain how transformer self-attention is computed."
unsafe_prompt = "Help me exploit this API endpoint via brute force."

print(f"Safe prompt status: {'PASSED' if validate_prompt_safety(safe_prompt) else 'REJECTED'}")
print(f"Unsafe prompt status: {'PASSED' if validate_prompt_safety(unsafe_prompt) else 'REJECTED'}")
\`\`\`

#### Helpful Reference Links
* Advance to [Prompt Engineering Foundations](/learn/courses/ai-foundations/1.4)
* Read the [Anthropic Constitutional AI Paper](https://arxiv.org/abs/2212.08073)`
      },
      {
        title: '1.4 Creative Prompt Engineering',
        type: 'text',
        content: `### 1.4 Creative Prompt Engineering

Prompt Engineering is the practice of structuring text inputs to maximize the quality, accuracy, and usefulness of an LLM's response. It is a vital engineering skill for building reliable software integrations.

#### Key Prompting Frameworks
* **Role Prompting:** Instructing the model to act as a specific persona (e.g., "Act as a senior systems architect...").
* **Few-shot Prompting:** Providing a few concrete input-output examples in the context window to guide output format.
* **Chain-of-Thought (CoT):** Asking the model to explain its reasoning step-by-step before providing the final answer.

<div class="my-6 rounded-xl overflow-hidden shadow-lg border border-gray-200">
  <img src="https://images.unsplash.com/photo-1542831371-29b0f74f9713?w=800&q=80" alt="Code editor with prompt construction" style="width: 100%; height: auto; display: block;" />
  <div class="p-3 bg-gray-50 text-xs text-gray-500 text-center font-medium border-t border-gray-200">
    Figure 4: Structured system instruction template pipeline layout.
  </div>
</div>

#### Code Example: Structuring a Zero-Shot Prompt Template
Below is a code template showing how developers construct clean API prompt blocks in production:

\`\`\`python
# Production Prompt Template Class
class PromptTemplate:
    def __init__(self, system_role: str, user_instruction: str):
        self.system_role = system_role
        self.user_instruction = user_instruction
        
    def compile(self, **variables) -> list[dict]:
        formatted_user = self.user_instruction.format(**variables)
        return [
            {"role": "system", "content": self.system_role},
            {"role": "user", "content": formatted_user}
        ]

# Initialization
system = "You are a professional compiler assistant. Output clean, executable JSON only."
instruction = "Analyze code block: {code}\\nExtract all defined function names."

template = PromptTemplate(system, instruction)
payload = template.compile(code="def process_data(): pass\\ndef export_results(): pass")
print("Compiled API Payload:")
for msg in payload:
    print(f"[{msg['role'].upper()}]: {msg['content']}")
\`\`\`

#### Helpful Reference Links
* Explore [Practice Checkpoint](/learn/courses/ai-foundations/1.5)
* Review the [OpenAI Prompt Engineering Best Practices Guide](https://platform.openai.com/docs/guides/prompt-engineering)`
      },
      {
        title: '1.5 Practice Checkpoint: Concepts Review',
        type: 'practice_quiz',
        practice: [
          {
            question: "Which of the following architectures introduced the self-attention mechanism that enables parallel token processing?",
            options: ["Recurrent Neural Networks (RNN)", "Transformer Architecture", "Multilayer Perceptron (MLP)", "Convolutional Neural Networks (CNN)"],
            correct: 1,
            explanation: "Transformers introduced self-attention, which calculates relationships between all tokens in parallel, replacing sequential recurrence."
          },
          {
            question: "What parameter temperature setting would generate the most deterministic, predictable text outputs?",
            options: ["1.5", "1.0", "0.7", "0.1"],
            correct: 3,
            explanation: "Lower temperatures (approaching 0) yield highly deterministic, peak probability next-token predictions, minimizing creative randomness."
          }
        ]
      },
      {
        title: '1.6 Chapter Assessment: AI Foundations',
        type: 'graded_quiz',
        graded: [
          {
            question: "What is the primary role of Queries (Q) and Keys (K) in the Multi-Head Attention layer calculation?",
            options: [
              "To compress text down to small binary representations.",
              "To compute attention scores via dot-product matrix multiplication.",
              "To mask and filter out abusive words.",
              "To act as database parameters for SQL caching."
            ],
            correct: 1,
            explanation: "Q and K are multiplied via dot-product (Q @ K^T) to produce raw scores, which are scaled and softmaxed to weight the Value (V) tensors."
          },
          {
            question: "Which mechanism is highly effective at reducing factual hallucinations in production LLMs by grounding answers in external files?",
            options: [
              "Standard Zero-shot Prompting",
              "Reinforcement Learning from Human Feedback (RLHF)",
              "Retrieval-Augmented Generation (RAG)",
              "Decreasing Model Context Length"
            ],
            correct: 2,
            explanation: "RAG fetches relevant document segments and passes them in-context to ground the LLM predictions in verifiable database facts."
          }
        ]
      }
    ]
  },
  {
    title: 'Prompt Mastery',
    description: 'Build high-quality prompts that unlock reliable, creative AI outputs for engineering and product use cases.',
    duration: '75 mins',
    topics: [
      {
        title: '2.1 Structured Prompting and Instructions',
        type: 'text',
        content: `### 2.1 Structured Prompting and Instructions

Structured prompting is the methodology of organizing prompts into clear, syntactic regions (using tags like HTML or markdown headers) so that LLMs can cleanly distinguish instructions, system guidelines, data blocks, and output schemas.

#### Benefits of Syntax Demarcation
- **Prompt Injection Defense:** Prevents raw user inputs from being interpreted as instructions by wrapping them in distinct structural blocks.
- **Improved Parseability:** Ensures the model adheres strictly to schemas (such as producing valid JSON outputs).
- **Context Clarity:** Helps the attention mechanism isolate input text parameters from logic templates.

<div class="my-6 rounded-xl overflow-hidden shadow-lg border border-gray-200">
  <img src="https://images.unsplash.com/photo-1461749280684-dccba630e2f6?w=800&q=80" alt="HTML syntax code layout" style="width: 100%; height: auto; display: block;" />
  <div class="p-3 bg-gray-50 text-xs text-gray-500 text-center font-medium border-t border-gray-200">
    Figure 5: Structured syntax delimiters isolating user values from system prompts.
  </div>
</div>

#### XML-Style Prompt Architecture
The following code snippet displays a Python class constructing clean XML-delimited prompts for robust model consumption:

\`\`\`python
def build_xml_prompt(raw_document: str, instruction: str) -> str:
    return f"""
<system>
You are an expert summaries agent. Extract only factual items from the document.
Do NOT extrapolate.
</system>

<document_context>
{raw_document}
</document_context>

<instruction>
{instruction}
</instruction>

Output:
"""

doc = "Studlyf portal is a premium platform for learning. It serves over 4,000 students globally."
inst = "Extract the student enrollment count."
print(build_xml_prompt(doc, inst))
\`\`\`

#### Helpful Reference Links
* Advance to [Zero-shot vs Few-shot Learning](/learn/courses/ai-foundations/2.2)
* Read the [Microsoft Guidance Prompting Framework](https://github.com/guidance-project/guidance)`
      },
      {
        title: '2.2 Zero-shot vs Few-shot In-Context Learning',
        type: 'text',
        content: `### 2.2 Zero-shot vs Few-shot In-Context Learning

In-Context Learning (ICL) refers to the LLM's ability to adapt to a task directly through prompts, without updating any weights. The primary methods are Zero-shot and Few-shot prompting.

#### Choosing the Right Strategy
1. **Zero-Shot Prompting:** You provide a direct instruction and expect a correct output instantly. Works best with mature models (e.g. GPT-4) on straightforward tasks.
2. **Few-Shot Prompting:** You provide 1 to 5 input-output exemplars inside the prompt. Highly effective for teaching complex formatting, reasoning patterns, or custom logic to smaller models.

<div class="my-6 rounded-xl overflow-hidden shadow-lg border border-gray-200">
  <img src="https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=800&q=80" alt="Exemplars mapping representation" style="width: 100%; height: auto; display: block;" />
  <div class="p-3 bg-gray-50 text-xs text-gray-500 text-center font-medium border-t border-gray-200">
    Figure 6: Demonstration of few-shot example patterns priming the model context.
  </div>
</div>

#### Code Implementation: Dynamic Few-Shot Context Priming
Here is how you dynamically feed dynamic matching few-shot examples into your system prompts:

\`\`\`python
FEW_SHOT_EXAMPLES = [
    {"input": "Text: I loved the course! Sentiment: POSITIVE"},
    {"input": "Text: The server had bad response times. Sentiment: NEGATIVE"},
    {"input": "Text: The tutorial was okay, nothing special. Sentiment: NEUTRAL"}
]

def analyze_sentiment(new_text: str) -> str:
    # Prime prompt with examples
    prompt_lines = ["You are a text sentiment classifier. Study these examples:"]
    for ex in FEW_SHOT_EXAMPLES:
        prompt_lines.append(ex["input"])
    
    # Append target
    prompt_lines.append(f"Text: {new_text} Sentiment:")
    return "\\n".join(prompt_lines)

print(analyze_sentiment("I absolutely had a blast building the project!"))
\`\`\`

#### Helpful Reference Links
* Advance to [Tool-Aware Prompts](/learn/courses/ai-foundations/2.3)
* Review [Hugging Face In-Context Learning Guides](https://huggingface.co/blog/few-shot-learning-gpt-neo)`
      },
      {
        title: '2.3 Tool-Aware Prompts and API Call Routing',
        type: 'text',
        content: `### 2.3 Tool-Aware Prompts and API Call Routing

Modern agentic pipelines rely on LLMs calling external tools (databases, math engines, web scrapers). Tool-aware prompting instructs the model to produce formatted JSON outputs mapping to API functions.

#### The Tool Loop Cycle
1. **Model Reason:** LLM analyzes the user prompt and determines an external function is needed.
2. **Tool Selection:** LLM outputs a structured JSON representing the tool name and arguments.
3. **Execution:** The application interceptor executes the local function using those arguments.
4. **Final Synthesize:** The function result is passed back to the LLM to write a comprehensive reply.

<div class="my-6 rounded-xl overflow-hidden shadow-lg border border-gray-200">
  <img src="https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=800&q=80" alt="Code showing tool definitions" style="width: 100%; height: auto; display: block;" />
  <div class="p-3 bg-gray-50 text-xs text-gray-500 text-center font-medium border-t border-gray-200">
    Figure 7: Data loop mapping between LLM tokens and external API responses.
  </div>
</div>

#### Code Example: Mock Tool-Call Router
The following code simulates a robust tool-routing system parsing the model's structural requests:

\`\`\`python
import json

def calculate_hike(salary: float, hike_percent: float) -> str:
    new_salary = salary * (1 + hike_percent / 100)
    return f"New Salary calculated: \${new_salary:.2f}"

def route_tool_call(model_json_output: str) -> str:
    try:
        call_details = json.loads(model_json_output)
        tool_name = call_details.get("tool")
        arguments = call_details.get("arguments", {})
        
        if tool_name == "calculate_hike":
            return calculate_hike(**arguments)
        else:
            return "❌ Error: Requested tool not found."
    except Exception as e:
        return f"Error parsing tool arguments: {e}"

# Simulated LLM output
llm_json = '{"tool": "calculate_hike", "arguments": {"salary": 85000, "hike_percent": 15}}'
print("Routing tool output...")
print(route_tool_call(llm_json))
\`\`\`

#### Helpful Reference Links
* Advance to [Prompt Testing](/learn/courses/ai-foundations/2.4)
* Learn about [LangChain Tool Integrations](https://python.langchain.com/docs/concepts/tools)`
      },
      {
        title: '2.4 Prompt Testing, Versioning, and Robustness',
        type: 'text',
        content: `### 2.4 Prompt Testing, Versioning, and Robustness

Prompt engineering is an iterative process. Minor token updates can drastically affect LLM output. Systematically testing and versioning prompt strings is essential to preserve backend robustness.

#### Evaluation Techniques
- **A/B Prompt Testing:** Running two different prompt template strings on identical test inputs to evaluate output success rates.
- **Output Assertions:** Writing Python unit tests that verify generated strings contain required sub-words (e.g. valid JSON parsing, schema alignment).
- **Semver Versioning:** Tagging prompts as versioned code releases (\`v1.0.0\`, \`v1.1.0\`) inside source control.

<div class="my-6 rounded-xl overflow-hidden shadow-lg border border-gray-200">
  <img src="https://images.unsplash.com/photo-1504868584819-f8e8b4b6d7e3?w=800&q=80" alt="A/B testing dashboard graphic" style="width: 100%; height: auto; display: block;" />
  <div class="p-3 bg-gray-50 text-xs text-gray-500 text-center font-medium border-t border-gray-200">
    Figure 8: Prompt latency, cost, and reliability monitoring dashboard metric layout.
  </div>
</div>

#### Simple Prompt Unit Test
The following mock test asserts that a prompt successfully forces the model to produce valid JSON containing a specific expected key:

\`\`\`python
def assert_valid_json_schema(model_response: str) -> bool:
    import json
    try:
        parsed = json.loads(model_response)
        # Assert key presence
        assert "response_code" in parsed, "Missing expected key 'response_code'"
        print("✅ Unit Test Passed: Response matches schema specifications.")
        return True
    except AssertionError as ae:
        print(f"❌ Test Failed: {ae}")
        return False
    except Exception as e:
        print(f"❌ Test Failed (Invalid JSON syntax): {e}")
        return False

# Tests
assert_valid_json_schema('{"response_code": 200, "message": "Success"}')
assert_valid_json_schema('{"status": "ok", "message": "Success"}') # Fails key check
\`\`\`

#### Helpful Reference Links
* Explore [Practice Checkpoint](/learn/courses/ai-foundations/2.5)
* Discover the [Prompt Flow Framework by Microsoft](https://github.com/microsoft/promptflow)`
      },
      {
        title: '2.5 Practice Checkpoint: Prompt Design',
        type: 'practice_quiz',
        practice: [
          {
            question: "Why are XML or Markdown tags highly recommended when building complex prompt architectures for production applications?",
            options: [
              "They compile prompt files into raw binary bytes.",
              "They help the model's attention layers cleanly isolate instructions from user variables.",
              "They decrease the cost of tokenizing text.",
              "They render the prompt inside standard web browsers."
            ],
            correct: 1,
            explanation: "Demarcators act as structural boundaries, preventing the model from confusing user-submitted data with operational instructions."
          },
          {
            question: "Which prompting strategy is best suited for forcing a smaller model to format its outputs in clean, strict JSON schemas?",
            options: ["Zero-shot prompting", "Few-shot prompting with multiple JSON examples", "Decreasing model context size", "Increasing prompt temperature"],
            correct: 1,
            explanation: "Providing concrete input-output examples (few-shot prompting) is the most reliable way to teach syntactic formatting constraints to language models."
          }
        ]
      },
      {
        title: '2.6 Chapter Assessment: Prompt Mastery',
        type: 'graded_quiz',
        graded: [
          {
            question: "In agentic tool-calling workflows, what is the exact function of the LLM itself?",
            options: [
              "To compile and run external system script binaries directly.",
              "To generate structured argument calls (like JSON) requesting that external apps execute the tool.",
              "To act as a high-capacity SQL database server.",
              "To build graphical interface buttons dynamically."
            ],
            correct: 1,
            explanation: "LLMs do not run the tools; instead, they output structured text commands (schema arguments) requesting the wrapper app execute the tool."
          },
          {
            question: "What does A/B testing of prompt templates specifically measure in production setups?",
            options: [
              "Which model consumes the most disk storage space.",
              "The cost, latency, and assertion success rates of different prompt variants.",
              "How fast the user can type their prompt string.",
              "The monitor screen resolution of the administrator."
            ],
            correct: 1,
            explanation: "A/B prompt testing systematically benchmarks response variations to find which template optimizes speed, token economy, and output accuracy."
          }
        ]
      }
    ]
  },
  {
    title: 'AI Product Workflows',
    description: 'Learn how to design AI-driven products, set success metrics, and integrate AI into real user journeys.',
    duration: '85 mins',
    topics: [
      {
        title: '3.1 AI Product Discovery and Feasibility Analysis',
        type: 'text',
        content: `### 3.1 AI Product Discovery and Feasibility Analysis

Before writing a single prompt, product leaders must conduct technical feasibility reviews. Not all software bottlenecks require an LLM, and separating complex rule engines from actual generative opportunities is a key skill.

#### Core Feasibility Criteria
- **Task Latency tolerance:** LLM calls take seconds. Does your user journey tolerate generative load times?
- **Factual Margin of Error:** Is 95% accuracy acceptable (e.g. email draft writing) or is 100% precision necessary (e.g. accounting, medical dosage calculation)?
- **Unit Economics:** Foundational model APIs charge per token. Product architects must calculate input/output token counts to assert business profitability.

<div class="my-6 rounded-xl overflow-hidden shadow-lg border border-gray-200">
  <img src="https://images.unsplash.com/photo-1531403009284-440f080d1e12?w=800&q=80" alt="Product planning wireframes" style="width: 100%; height: auto; display: block;" />
  <div class="p-3 bg-gray-50 text-xs text-gray-500 text-center font-medium border-t border-gray-200">
    Figure 9: Flow diagram mapping user input variables to AI pipeline decision layers.
  </div>
</div>

#### Feasibility Matrix Utility
Below is a simple mock analysis script scoring whether a specific proposed product feature is a viable candidate for LLM integration:

\`\`\`python
# AI Feasibility Scoring Function
def assess_ai_fit(accuracy_req: str, latency_tol_sec: float, token_cost_limit: float) -> bool:
    score = 0
    # 1. Accuracy Check
    if accuracy_req == "high_safety_critical":
        score -= 2 # AI Hallucinations represent high risks
    else:
        score += 2
        
    # 2. Latency Tolerance
    if latency_tol_sec >= 3.0:
        score += 2
    else:
        score -= 1
        
    # 3. Unit Economics
    if token_cost_limit >= 0.05:
        score += 2
    else:
        score -= 2
        
    print(f"Computed AI Fit Score: {score}/6")
    return score >= 2

# Analyze customer support auto-draft feature
print(f"Feasibility fit: {assess_ai_fit('moderated_flexible', 5.0, 0.08)}")
\`\`\`

#### Helpful Reference Links
* Advance to [AI Feature Scoping](/learn/courses/ai-foundations/3.2)
* Review the [Google People + AI Guidebook](https://pair.withgoogle.com/guidebook/)`
      },
      {
        title: '3.2 AI Feature Scoping and Prompt Orchestration',
        type: 'text',
        content: `### 3.2 AI Feature Scoping and Prompt Orchestration

Building advanced generative features requires complex prompt orchestration pipelines. Instead of firing a single long prompt, applications segment tasks into multiple chained prompts (e.g. Plan -> Search -> Format).

#### Orchestration Pipelines
1. **Input Classification:** Analyzing the user's intent to route the query to a specialized model.
2. **Retrieval-Augmented Priming (RAG):** Injecting document data from vector databases.
3. **Execution & Parsing:** Forcing structured JSON models and validating the syntax before UI rendering.

<div class="my-6 rounded-xl overflow-hidden shadow-lg border border-gray-200">
  <img src="https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=800&q=80" alt="Data flow visualization" style="width: 100%; height: auto; display: block;" />
  <div class="p-3 bg-gray-50 text-xs text-gray-500 text-center font-medium border-t border-gray-200">
    Figure 10: Multi-stage prompt chain isolating logical processing modules.
  </div>
</div>

#### Simple Orchestration Chain Simulation
The following script demonstrates chaining two distinct prompts to summarize and translate text safely:

\`\`\`python
# Orchestration Prompt Chain
def extract_facts(raw_text: str) -> str:
    # Simulated summarization stage
    return f"Summary Facts: {raw_text[:40]}..."

def translate_to_spanish(extracted_facts: str) -> str:
    # Simulated translation stage
    return f"Spanish translation of ({extracted_facts}) -> Hecho completado."

def run_ai_orchestration(user_doc: str) -> str:
    print("Executing Step 1: Fact Extraction...")
    facts = extract_facts(user_doc)
    
    print("Executing Step 2: Translation...")
    final_output = translate_to_spanish(facts)
    return final_output

raw_input = "Studlyf serves over 4,000 learners with premium web components."
print("Final Chained Output:")
print(run_ai_orchestration(raw_input))
\`\`\`

#### Helpful Reference Links
* Advance to [Designing Intuitive GenAI UX](/learn/courses/ai-foundations/3.3)
* Study [LangChain Prompt Chaining](https://python.langchain.com/docs/tutorials/chaining)`
      },
      {
        title: '3.3 Designing Intuitive User Experiences for GenAI',
        type: 'text',
        content: `### 3.3 Designing Intuitive User Experiences for GenAI

User Experience (UX) design for Generative AI differs from traditional software. Because LLM outputs are unpredictable and introduce latency, the UI must set realistic expectations and manage load times gracefully.

#### Core UX Guidelines
- **Graceful Latency Management:** Implement streaming text generation (Server-Sent Events) or interactive step-by-step loaders instead of a static blank loading spinner.
- **Uncertainty Indicators:** Give users options to edit/regenerate text, and include helpful disclosures indicating AI outputs can contain factual discrepancies.
- **Structured Inputs:** Use drop-down lists and structured sliders to anchor user prompts, preventing blank-canvas analysis paralysis.

<div class="my-6 rounded-xl overflow-hidden shadow-lg border border-gray-200">
  <img src="https://images.unsplash.com/photo-1586717791821-3f44a563fa4c?w=800&q=80" alt="UI Wireframes design" style="width: 100%; height: auto; display: block;" />
  <div class="p-3 bg-gray-50 text-xs text-gray-500 text-center font-medium border-t border-gray-200">
    Figure 11: streaming text feedback indicator and rating UI component models.
  </div>
</div>

#### Simple Server-Sent Event Text Stream Simulator
The code block below models how the client-side UI processes incremental text streams to create an engaging experience:

\`\`\`python
import time

def simulate_streaming_text(model_response: list[str]):
    print("Starting Stream: ", end="", flush=True)
    for word in model_response:
        # Yield word segment
        print(word + " ", end="", flush=True)
        time.sleep(0.15) # Simulating network segment delay
    print("\\n[Stream Finished]")

sample_response = ["Deploying", "AI", "models", "with", "clean", "CSS", "guarantees", "maximum", "impact."]
simulate_streaming_text(sample_response)
\`\`\`

#### Helpful Reference Links
* Advance to [LLM Validation Frameworks](/learn/courses/ai-foundations/3.4)
* Learn about [Server-Sent Events (SSE) web API](https://developer.mozilla.org/en-US/docs/Web/API/Server-sent_events/Using_server-sent_events)`
      },
      {
        title: '3.4 LLM Validation, Metrics, and Evaluation Frameworks',
        type: 'text',
        content: `### 3.4 LLM Validation, Metrics, and Evaluation Frameworks

Quantifying generative AI performance is a major challenge. How do we test that a model change didn't break our product's quality? We build systematic validation frameworks using specialized metrics.

#### Key Evaluation Metrics
* **ROUGE (Recall-Oriented Understudy for Gisting Evaluation):** Measures n-gram overlap between model summaries and ideal human references.
* **BLEU (Bilingual Evaluation Understudy):** Primarily evaluates language translation precision.
* **LLM-as-a-Judge:** Using a highly intelligent model (e.g. GPT-4) to grade output quality (coherence, tone, accuracy) against a structured rubric.

<div class="my-6 rounded-xl overflow-hidden shadow-lg border border-gray-200">
  <img src="https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?w=800&q=80" alt="Data evaluation sheet graphics" style="width: 100%; height: auto; display: block;" />
  <div class="p-3 bg-gray-50 text-xs text-gray-500 text-center font-medium border-t border-gray-200">
    Figure 12: LLM performance evaluation dashboards displaying ROUGE, BLEU, and cost indicators.
  </div>
</div>

#### Simple LLM-as-a-Judge Scoring Script
The following Python script illustrates how developers programmatically score generated text against an ideal reference using custom grading logic:

\`\`\`python
# Basic String Overlap Evaluation Metric
def compute_jaccard_similarity(generated: str, reference: str) -> float:
    gen_tokens = set(generated.lower().split())
    ref_tokens = set(reference.lower().split())
    
    intersection = gen_tokens.intersection(ref_tokens)
    union = gen_tokens.union(ref_tokens)
    
    score = len(intersection) / len(union) if union else 0.0
    return round(score, 3)

generated_text = "transformers compute attention weights in parallel to parse deep contextual patterns"
ideal_reference = "transformers compute attention in parallel layers to model context patterns"

score = compute_jaccard_similarity(generated_text, ideal_reference)
print(f"Jaccard Similarity Quality Score: {score * 100}%")
\`\`\`

#### Helpful Reference Links
* Explore [Practice Checkpoint](/learn/courses/ai-foundations/3.5)
* Read the [Ragas Framework Documentation](https://docs.ragas.io/en/stable/) for advanced RAG evaluation`
      },
      {
        title: '3.5 Practice Checkpoint: Product Metrics',
        type: 'practice_quiz',
        practice: [
          {
            question: "Which of the following product parameters is the most critical block to evaluate before choosing a costly multi-model prompt chain?",
            options: [
              "The monitor screen size of the front-end developer.",
              "The latency tolerance of the user journey and unit economics.",
              "The color palette of the application's navbar.",
              "The number of commits in the git repository."
            ],
            correct: 1,
            explanation: "Chained model prompts increase network latency and token costs significantly, making them infeasible for high-speed, low-cost operations."
          },
          {
            question: "Why is streaming text generation (using Server-Sent Events) highly recommended when designing LLM user interfaces?",
            options: [
              "It completely eliminates the cost of model API tokens.",
              "It keeps the user engaged by showing incremental output progress, significantly reducing perceived latency.",
              "It blocks the user from canceling their prompt request.",
              "It compresses the web page's HTML load times."
            ],
            correct: 1,
            explanation: "Streaming outputs immediately as they are computed satisfies the user's attention, masking the actual time required to complete the full generation."
          }
        ]
      },
      {
        title: '3.6 Chapter Assessment: Product Workflows',
        type: 'graded_quiz',
        graded: [
          {
            question: "What does the ROUGE metric specifically evaluate in natural language processing systems?",
            options: [
              "The security vulnerability score of Python APIs.",
              "The similarity (n-gram overlap) between a generated summary and a reference summary.",
              "The database indexing speed of MongoDB.",
              "The network bandwidth cost of CSS assets."
            ],
            correct: 1,
            explanation: "ROUGE measures how many key phrases overlap between model-generated outputs and gold-standard human reference texts."
          },
          {
            question: "In the 'LLM-as-a-Judge' paradigm, how is generative output quality systematically validated?",
            options: [
              "By asking users to manually rate every single prompt.",
              "By programmatically prompting a highly capable model to grade outputs against a structured rubric.",
              "By letting the model audit its own source code.",
              "By compiling the code down to raw binary blocks."
            ],
            correct: 1,
            explanation: "LLM-as-a-Judge utilizes advanced reasoning models (like GPT-4) to evaluate complex output traits (tone, factual alignment) programmatically."
          }
        ]
      }
    ]
  },
  {
    title: 'Hands-On AI Projects',
    description: 'Apply your skills through guided project work that demonstrates engineering rigor and practical AI deployment.',
    duration: '120 mins',
    topics: [
      {
        title: '4.1 Project Planning, Model Choice, and Token Costs',
        type: 'text',
        content: `### 4.1 Project Planning, Model Choice, and Token Costs

A successful AI project begins with a clear system architecture and budget. You must evaluate whether to use a high-capacity model (slower, expensive, high accuracy) or a lightweight local model (fast, cheap, moderate accuracy).

#### Choosing Between API Models and Local Models

| Parameter | Closed-Source APIs (e.g. OpenAI, Anthropic) | Open-Source Local Models (e.g. Llama-3, Mistral) |
| :--- | :--- | :--- |
| **Hosting Cost** | Pay-as-you-go per token consumed. | Fixed server infrastructure hosting costs. |
| **Data Privacy** | Sensitive inputs sent to third-party servers. | 100% data containment within local networks. |
| **Control** | No access to model weights or hidden layers. | Ability to fine-tune, export, and merge weights. |

<div class="my-6 rounded-xl overflow-hidden shadow-lg border border-gray-200">
  <img src="https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=800&q=80" alt="Global server grid mapping" style="width: 100%; height: auto; display: block;" />
  <div class="p-3 bg-gray-50 text-xs text-gray-500 text-center font-medium border-t border-gray-200">
    Figure 13: Architectural breakdown separating client UI, orchestration server, and LLM endpoints.
  </div>
</div>

#### Simple Token Budget Estimator
This script calculates monthly API costs based on user volumes, prompt sizes, and specific token pricing models:

\`\`\`python
# Simple API Token Cost Calculator
def estimate_monthly_cost(users: int, queries_per_day: int, avg_prompt_tokens: int, avg_output_tokens: int) -> float:
    # GPT-4o prices per 1M tokens (Conceptual rates)
    INPUT_COST_1M = 5.00
    OUTPUT_COST_1M = 15.00
    
    daily_queries = users * queries_per_day
    monthly_queries = daily_queries * 30
    
    monthly_input_tokens = monthly_queries * avg_prompt_tokens
    monthly_output_tokens = monthly_queries * avg_output_tokens
    
    input_cost = (monthly_input_tokens / 1000000) * INPUT_COST_1M
    output_cost = (monthly_output_tokens / 1000000) * OUTPUT_COST_1M
    
    total = input_cost + output_cost
    return round(total, 2)

print(f"Estimated Monthly cost for 1,000 active users: \${estimate_monthly_cost(1000, 5, 800, 300)}")
\`\`\`

#### Helpful Reference Links
* Advance to [Data Prep and RAG](/learn/courses/ai-foundations/4.2)
* Compare [Ollama Local Models Hosting](https://ollama.com/)`
      },
      {
        title: '4.2 Data Preparation, Vector Embeddings, and RAG',
        type: 'text',
        content: `### 4.2 Data Preparation, Vector Embeddings, and RAG

Retrieval-Augmented Generation (RAG) is the gold standard for grounding LLMs in custom facts. It operates by converting raw text documents into dense numerical vectors (embeddings) and storing them in vector databases.

#### The RAG Pipeline
1. **Document Chunking:** Splitting raw files into overlapping text blocks (e.g. 500 characters with 50-character overlap).
2. **Embedding Generation:** Passing chunks through an embedding model to yield high-dimensional vector representations.
3. **Similarity Search:** Calculating cosine similarity between the user query vector and the document vectors.
4. **LLM Synthesis:** Injecting the best document context into the final prompt for the LLM to summarize.

<div class="my-6 rounded-xl overflow-hidden shadow-lg border border-gray-200">
  <img src="https://images.unsplash.com/photo-1544383835-bda2bc66a55d?w=800&q=80" alt="Visual representation of Vector Database layers" style="width: 100%; height: auto; display: block;" />
  <div class="p-3 bg-gray-50 text-xs text-gray-500 text-center font-medium border-t border-gray-200">
    Figure 14: Flow diagram mapping document vectors to mathematical similarity coordinates.
  </div>
</div>

#### Simple Cosine Similarity Calculator
This python block demonstrates how semantic similarity is calculated between vectors:

\`\`\`python
import numpy as np

def cosine_similarity(v1: np.ndarray, v2: np.ndarray) -> float:
    dot_product = np.dot(v1, v2)
    norm_v1 = np.linalg.norm(v1)
    norm_v2 = np.linalg.norm(v2)
    
    if norm_v1 == 0 or norm_v2 == 0:
        return 0.0
    return float(dot_product / (norm_v1 * norm_v2))

# Mock 3-dimensional embeddings representing:
vector_query = np.array([0.9, 0.1, 0.0]) # "Generative model development"
vector_doc1  = np.array([0.85, 0.15, 0.05]) # "AI model pipeline creation" (Highly similar)
vector_doc2  = np.array([0.02, 0.98, 0.10]) # "Baking standard chocolate cakes" (Dissimilar)

print(f"Similarity Query <-> Doc 1: {cosine_similarity(vector_query, vector_doc1):.3f}")
print(f"Similarity Query <-> Doc 2: {cosine_similarity(vector_query, vector_doc2):.3f}")
\`\`\`

#### Helpful Reference Links
* Advance to [Model Integration and Guardrails](/learn/courses/ai-foundations/4.3)
* Review the [Pinecone Vector DB Foundations](https://www.pinecone.io/learn/vector-database/)`
      },
      {
        title: '4.3 Model Integration, Guardrails, and API Keys',
        type: 'text',
        content: `### 4.3 Model Integration, Guardrails, and API Keys

Integrating generative systems into a production application requires secure credentials management and strict input/output guardrail layers. Leaving API keys exposed or trustingly passing unchecked LLM outputs into core databases is a major security vulnerability.

#### Secure API Key Practices
- **Environment Containment:** Never hardcode keys in client-side files. Load them as server environment variables (using dotenv or vaults).
- **Backend Proxying:** Force all AI requests to pass through a secured backend API router that validates the user session before calling model APIs.
- **Rate Limiting:** Protect model routes from brute-force token exhaustion attacks using rate limiters.

<div class="my-6 rounded-xl overflow-hidden shadow-lg border border-gray-200">
  <img src="https://images.unsplash.com/photo-1563986768609-322da13575f3?w=800&q=80" alt="Cybersecurity Lock representation" style="width: 100%; height: auto; display: block;" />
  <div class="p-3 bg-gray-50 text-xs text-gray-500 text-center font-medium border-t border-gray-200">
    Figure 15: Guardrail middleware layers validating API requests and content safety.
  </div>
</div>

#### Simple Server-Side Model Call Wrapper
Here is a secure Python backend endpoint pattern wrapping model requests safely:

\`\`\`python
import os

def call_model_api_safely(prompt: str) -> str:
    # 1. Access keys from secure environment
    API_KEY = os.getenv("LLM_SECRET_API_KEY", "fallback_mock_key")
    if not API_KEY or API_KEY == "fallback_mock_key":
        return "❌ Server configuration error: API Credentials missing."
        
    # 2. Pre-output validation
    if len(prompt) > 2000:
        return "❌ Request blocked: Prompt exceeds context limits."
        
    # 3. Simulate API call
    return f"Response derived using key ending in ...{API_KEY[-4:]}"

# Set key
os.environ["LLM_SECRET_API_KEY"] = "sk-prod-983hf892y398hf29h32f"
print(call_model_api_safely("What is Retrieval-Augmented Generation?"))
\`\`\`

#### Helpful Reference Links
* Advance to [Deploying and Monitoring AI Workloads](/learn/courses/ai-foundations/4.4)
* Learn about [OWASP Top 10 for LLMs security](https://owasp.org/www-project-top-10-for-large-language-model-applications/)`
      },
      {
        title: '4.4 Deploying and Monitoring AI Workloads Securely',
        type: 'text',
        content: `### 4.4 Deploying and Monitoring AI Workloads Securely

Once built, AI features must be deployed at scale. Developers need real-time monitoring tools to track token usage costs, inference latencies, model errors, and output quality shifts over time.

#### Monitoring Metrics to Log
- **Time to First Token (TTFT):** The time elapsed between sending the request and receiving the first generated token. Highly affects user satisfaction.
- **Inference Latency:** Total duration to complete the API response.
- **Token Count Logs:** Storing input and output token counts per user to audit costs.
- **Semantic Drift:** Tracking if user questions are changing over time, indicating a need to update vector data.

<div class="my-6 rounded-xl overflow-hidden shadow-lg border border-gray-200">
  <img src="https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=800&q=80" alt="Server health metrics panel" style="width: 100%; height: auto; display: block;" />
  <div class="p-3 bg-gray-50 text-xs text-gray-500 text-center font-medium border-t border-gray-200">
    Figure 16: System monitoring dashboard logging latencies, costs, and token capacities.
  </div>
</div>

#### Simple Inference Logging Utility
This Python class implements a basic wrapper that records key performance metrics for every model request:

\`\`\`python
import time

class AILogger:
    def __init__(self):
        self.logs = []
        
    def log_inference(self, prompt: str, ttft: float, total_duration: float, tokens: int):
        log_entry = {
            "prompt_preview": prompt[:30] + "...",
            "ttft_ms": round(ttft * 1000, 2),
            "total_sec": round(total_duration, 2),
            "tokens_consumed": tokens,
            "cost_usd": round(tokens * 0.000015, 6) # Mock rate
        }
        self.logs.append(log_entry)
        print(f"Logged Inference: {log_entry}")

logger = AILogger()
# Simulate log
logger.log_inference("Build RAG search index", 0.250, 1.85, 450)
\`\`\`

#### Helpful Reference Links
* Explore [Practice Checkpoint](/learn/courses/ai-foundations/4.5)
* Review the [LangSmith Observability Framework](https://www.langchain.com/langsmith)`
      },
      {
        title: '4.5 Practice Checkpoint: Project Design',
        type: 'practice_quiz',
        practice: [
          {
            question: "When planning a generative AI feature, which caching strategy is highly effective at reducing recurring token costs for repetitive questions?",
            options: [
              "Caching raw HTML styles in the browser.",
              "Implementing a Semantic Prompt Cache (e.g. GPTCache) to store matching prompt-response vectors.",
              "Enforcing a strict context limit of 10 words.",
              "Re-indexing the vector database every 5 minutes."
            ],
            correct: 1,
            explanation: "Semantic prompt caches match new queries with previously answered similar questions, serving cached answers immediately to save costs and time."
          },
          {
            question: "Why should API keys never be embedded directly into client-side code files (such as React components)?",
            options: [
              "It increases the time required to build the frontend application.",
              "Anyone loading the web page can inspect the source bundle, steal the keys, and exhaust your API limits.",
              "Web browsers cannot compile API key characters.",
              "It prevents the styling from loading correctly."
            ],
            correct: 1,
            explanation: "Client-side code is fully public. Keys must always reside securely on the backend server, accessed only via secure proxy requests."
          }
        ]
      },
      {
        title: '4.6 Chapter Assessment: Projects',
        type: 'graded_quiz',
        graded: [
          {
            question: "What does the Time to First Token (TTFT) metric directly represent in real-time streaming interfaces?",
            options: [
              "The total network bandwidth cost of the API request.",
              "The duration between sending the prompt and receiving the very first word segment.",
              "How fast the user can click their next step button.",
              "The size of the vector database index."
            ],
            correct: 1,
            explanation: "TTFT is a vital speed metric measuring how fast the LLM starts giving visual feedback to the user, strongly impacting user experience."
          },
          {
            question: "In Retrieval-Augmented Generation (RAG) workflows, what mathematical calculation yields the best context vectors from similarity indexes?",
            options: [
              "Linear regression slopes.",
              "Cosine similarity between the query vector and the document database vectors.",
              "The sum of all characters in the text blocks.",
              "Standard deviation of the server's CPU load."
            ],
            correct: 1,
            explanation: "Cosine similarity measures the angle between high-dimensional embedding vectors, locating documents that share deep semantic context with the query."
          }
        ]
      }
    ]
  },
  {
    title: 'Job-ready Portfolio',
    description: 'Package your latest AI work into a polished portfolio ready for recruiters and technical interviews.',
    duration: '60 mins',
    topics: [
      {
        title: '5.1 ATS-Optimized Resume and GitHub Presentation',
        type: 'text',
        content: `### 5.1 ATS-Optimized Resume and GitHub Presentation

An outstanding codebase is only valuable if recruiters can discover it. You must structure your resume and repository layouts to pass Applicant Tracking Systems (ATS) and make a stellar impact on hiring managers.

#### ATS Formatting Fundamentals
- **Text-Readable Layouts:** Avoid complex multi-column grid layouts, graphic charts, or images in resumes. Use clean, single-column formats that ATS parsers can read.
- **Keyword Alignment:** Focus on real engineering vocabulary (e.g. Vector Database, RAG, Latency optimization, Token budget containment).
- **Quantifiable Accomplishments:** Frame bullet points using the **Google XYZ Formula** (e.g. "Accomplished [X] as measured by [Y], by doing [Z]").

<div class="my-6 rounded-xl overflow-hidden shadow-lg border border-gray-200">
  <img src="https://images.unsplash.com/photo-1586281380349-632531db7ed4?w=800&q=80" alt="Polished business portfolio layout" style="width: 100%; height: auto; display: block;" />
  <div class="p-3 bg-gray-50 text-xs text-gray-500 text-center font-medium border-t border-gray-200">
    Figure 17: Structured resume layouts optimizing technical keyword densities.
  </div>
</div>

#### The Google XYZ Formula Implementation
Review how simple descriptions are restructured to yield professional, high-impact bullet points:

\`\`\`python
# Simple description
simple_point = "I integrated RAG to make search work better."

# Restructured Google XYZ Formula point
xyz_point = "Optimized query response accuracy [X] by 35% [Y] through the integration of a custom-chunked Pinecone vector RAG search pipeline [Z]."

print("Original Bullet:")
print(f"- {simple_point}")
print("\\nRestructured High-Impact Bullet:")
print(f"- {xyz_point}")
\`\`\`

#### Helpful Reference Links
* Advance to [Technical Storytelling](/learn/courses/ai-foundations/5.2)
* Check the [GitHub README Best Practices Guide](https://github.com/othneildrew/Best-README-Template)`
      },
      {
        title: '5.2 Technical Storytelling and Demo Presentation',
        type: 'text',
        content: `### 5.2 Technical Storytelling and Demo Presentation

Hiring managers spend minutes evaluating portfolios. To secure opportunities, you must master the art of technical storytelling—presenting your project's challenges, trade-offs, and architecture concisely.

#### The CAR (Challenge, Action, Result) Storytelling Framework
1. **Challenge:** Describe the system bottleneck or business problem (e.g., "API costs were skyrocketing, and model latency was exceeding 5 seconds.").
2. **Action:** Explain your technical decisions and implementation details (e.g., "I designed a custom semantic prompt cache and segmented the monolithic prompt into a two-stage chain.").
3. **Result:** Highlight the measurable improvements (e.g., "This reduced token costs by 40% and improved response speed by 2.2 seconds.").

<div class="my-6 rounded-xl overflow-hidden shadow-lg border border-gray-200">
  <img src="https://images.unsplash.com/photo-1557804506-669a67965ba0?w=800&q=80" alt="Tech project demo deck presentation" style="width: 100%; height: auto; display: block;" />
  <div class="p-3 bg-gray-50 text-xs text-gray-500 text-center font-medium border-t border-gray-200">
    Figure 18: Structural layout for technical presentations.
  </div>
</div>

#### Simple CAR Narrative Builder
The code below outputs a beautifully formatted storytelling outline for your technical presentation:

\`\`\`python
class NarrativeBuilder:
    def __init__(self, challenge: str, action: str, result: str):
        self.c = challenge
        self.a = action
        self.r = result
        
    def build_narrative(self) -> str:
        return f"""
🌟 PROJECT STORYTELLING OUTLINE
--------------------------------------------------
[CHALLENGE]: {self.c}
[ACTION LOG]: {self.a}
[OUTCOME RESULT]: {self.r}
--------------------------------------------------
"""

story = NarrativeBuilder(
    challenge="Model latency was exceeding user thresholds (4.5s average).",
    action="Implemented Server-Sent Events streaming UI and a semantic Redis prompt cache.",
    result="TTFT dropped to 180ms and recurring API token costs were reduced by 30%."
)
print(story.build_narrative())
\`\`\`

#### Helpful Reference Links
* Advance to [Technical System Design Interviews](/learn/courses/ai-foundations/5.3)
* Read the [Star Framework for Technical Interviews](https://en.wikipedia.org/wiki/Situation,_task,_action,_result)`
      },
      {
        title: '5.3 Technical System Design Interviews for LLMs',
        type: 'text',
        content: `### 5.3 Technical System Design Interviews for LLMs

System design interviews for AI systems evaluate your architectural depth. You will be asked to design scalable pipelines, handle model fallback rules, and optimize token rates for thousands of users.

#### Key System Architectures to Master
- **Model Fallbacks:** Automatically routing prompts to a secondary API endpoint (e.g. switching to Claude if OpenAI rate limits are exceeded).
- **Vector Index Sharding:** Organizing database vector namespaces to optimize query speeds.
- **Context Window Management:** Pruning chat history using sliding-window summaries to prevent token overflows.

<div class="my-6 rounded-xl overflow-hidden shadow-lg border border-gray-200">
  <img src="https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?w=800&q=80" alt="System architecture design diagram on whiteboard" style="width: 100%; height: auto; display: block;" />
  <div class="p-3 bg-gray-50 text-xs text-gray-500 text-center font-medium border-t border-gray-200">
    Figure 19: High-availability architecture with model fallback routes and prompt caches.
  </div>
</div>

#### Simple Fallback Route Router
Here is a conceptual implementation of an API router that automatically switches to a secondary LLM provider if the primary provider fails:

\`\`\`python
import random

def primary_model_call() -> str:
    # Simulate API connection status (15% rate failure rate)
    if random.random() < 0.15:
        raise Exception("503: Model Rate Limit Exceeded")
    return "✅ Success: Response from Primary model provider!"

def fallback_model_call() -> str:
    return "✅ Success: Routed safely to Secondary backup provider!"

def execute_high_availability_request() -> str:
    try:
        # Attempt primary
        return primary_model_call()
    except Exception as e:
        print(f"⚠️ Primary provider failed ({e}). Routing to fallback...")
        return fallback_model_call()

# Run Simulation
for i in range(3):
    print(execute_high_availability_request())
\`\`\`

#### Helpful Reference Links
* Advance to [LinkedIn Positioning](/learn/courses/ai-foundations/5.4)
* Explore [Scale AI System Design Patterns](https://scale.com/blog/llm-architecture-patterns)`
      },
      {
        title: '5.4 LinkedIn Positioning and Community Networking',
        type: 'text',
        content: `### 5.4 LinkedIn Positioning and Community Networking

Beyond technical competence, professional visibility is a multiplier for career growth. Building a clean digital presence and sharing your technical build logs on LinkedIn is highly effective for catching the eyes of hiring leaders.

#### High-Impact Digital Profile Checklist
- **Clear Value-Proposition Headline:** Avoid generic headlines (e.g. "Student at griet"). Use outcomes-focused taglines (e.g. "Full-Stack Engineer | Building GenAI product architectures & high-performance APIs").
- **Visual Featured Section:** Feature links to your deployed portfolios, highly-rated repositories, or certification credentials.
- **Write Public Build Logs:** Post short, technical summaries of the trade-offs you encountered while building projects (e.g., "Why I chose cosine similarity over euclidean distance for my search engine").

<div class="my-6 rounded-xl overflow-hidden shadow-lg border border-gray-200">
  <img src="https://images.unsplash.com/photo-1557804506-669a67965ba0?w=800&q=80" alt="LinkedIn interface representation" style="width: 100%; height: auto; display: block;" />
  <div class="p-3 bg-gray-50 text-xs text-gray-500 text-center font-medium border-t border-gray-200">
    Figure 20: Polished profile portfolio featuring deployed live project links.
  </div>
</div>

#### Mock Build Log Post Outline
Below is a structured template for writing engaging, technical social posts that highlight your engineering decisions:

\`\`\`python
def build_linkedin_post_template(project_name: str, tech_stack: str, metrics: str) -> str:
    return f"""
🚀 I just deployed {project_name}!

We engineered the application using {tech_stack}.
By introducing a custom prompt orchestration loop, we managed to:
? {metrics}

Check out the working repo and build logs below!
? GitHub Link: https://github.com/example/ai-portal
"""

print(build_linkedin_post_template(
    project_name="Studlyf Learning Engine",
    tech_stack="React, Tailwind, FastAPI, and MongoDB",
    metrics="Boost render speeds by 40% and secure linear topic progression."
))
\`\`\`

#### Helpful Reference Links
* Explore [Practice Checkpoint](/learn/courses/ai-foundations/5.5)
* Read the [LinkedIn Developer Community Blog](https://developer.linkedin.com/blog)`
      },
      {
        title: '5.5 Practice Checkpoint: Portfolio Prep',
        type: 'practice_quiz',
        practice: [
          {
            question: "Which formula is highly recommended by technical recruiters to structure resume achievements for maximum impact?",
            options: [
              "The standard ABC (Always Be Closing) method.",
              "The Google XYZ Formula: Accomplished [X], as measured by [Y], by doing [Z].",
              "Adding as many technical keywords as possible without context.",
              "Writing long paragraphs describing daily operations."
            ],
            correct: 1,
            explanation: "The Google XYZ Formula forces you to quantify your accomplishments, showing hiring managers exactly what you built and how it affected the business."
          },
          {
            question: "In technical storytelling, what does the 'Action' step in the CAR framework represent?",
            options: [
              "Describing the high level business problems.",
              "Detailing the specific engineering decisions, trade-offs, and tools you chose to solve the bottleneck.",
              "Asking the interviewer for salary ranges.",
              "Sharing your demo screen."
            ],
            correct: 1,
            explanation: "The 'Action' segment is where you showcase your technical depth by explaining the architectural decisions you made to resolve the challenge."
          }
        ]
      },
      {
        title: '5.6 Chapter Assessment: Portfolios',
        type: 'graded_quiz',
        graded: [
          {
            question: "Why are closed-source model fallback configurations essential when designing enterprise-level system architectures?",
            options: [
              "They decrease local server hosting fees.",
              "They automatically reroute prompt requests to an alternative provider if the primary API suffers a service outage, maintaining 100% uptime.",
              "They block users from writing custom prompts.",
              "They format outputs into strict binary streams."
            ],
            correct: 1,
            explanation: "Fallbacks ensure high availability. If the primary LLM api endpoint goes offline, requests are automatically redirected to backup providers."
          },
          {
            question: "Which of the following headlines would be the most effective for an aspiring software engineer on LinkedIn?",
            options: [
              "Student at GRIET.",
              "Software Engineer | Building high-performance GenAI architectures & robust web APIs.",
              "Looking for software engineering jobs.",
              "I love programming in Python and JavaScript."
            ],
            correct: 1,
            explanation: "An outcome-focused headline clearly defines your engineering domain, value proposition, and specific focus area, catching the eyes of hiring leads."
          }
        ]
      }
    ]
  }
];
