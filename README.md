# claude-interpreter

## Brain Interpreter Setup

The brain-interpreter is a Next.js application that analyzes cognitive landscapes of topics using LLM transformation and Exa search.

### Prerequisites
- Node.js (v18 or higher)
- npm or yarn
- Anthropic API key
- Exa API key

### Setup Instructions

1. Navigate to the brain-interpreter directory:
```bash
cd brain-interpreter
```

2. Install dependencies:
```bash
npm install
```

3. Create a `.env.local` file with your API keys:
```bash
# Anthropic API Key for LLM query transformation
ANTHROPIC_API_KEY=your_anthropic_api_key_here

# Exa API Key for search functionality
EXA_API_KEY=your_exa_api_key_here

# Next.js URL (for internal API calls)
NEXTAUTH_URL=http://localhost:3000
```

4. Run the development server:
```bash
npm run dev
```

5. Open [http://localhost:3000](http://localhost:3000) in your browser.

### How it Works

1. User enters a topic in the chat interface
2. The topic is sent to Claude 3.5 Sonnet for query transformation
3. The transformed query is used to search for relevant articles via Exa
4. Results are analyzed and presented in a cognitive landscape format

---

## Cognitive Functions Reference

1. Working Memory

What it does: Holding and manipulating information temporarily
Text markers: "Let me keep track of...", "So far we have...", "Remembering that..."
Brain region: Dorsolateral Prefrontal Cortex

2. Semantic Retrieval

What it does: Accessing stored knowledge/facts
Text markers: "I know that...", "This means...", "The definition of..."
Brain region: Left Temporal Lobe

3. Logical Reasoning

What it does: Step-by-step deductive/inductive inference
Text markers: "Therefore...", "If...then...", "This implies...", "Because..."
Brain region: Left Prefrontal Cortex

4. Pattern Recognition

What it does: Identifying similarities and structures
Text markers: "This is similar to...", "I notice a pattern...", "This looks like..."
Brain region: Parietal Cortex

5. Analogical Reasoning

What it does: Drawing comparisons between different domains
Text markers: "This is like...", "By analogy...", "Similar to how..."
Brain region: Right Hemisphere + Angular Gyrus

6. Error Monitoring

What it does: Checking for mistakes and inconsistencies
Text markers: "Wait, that's wrong...", "Let me double-check...", "Actually..."
Brain region: Anterior Cingulate Cortex

7. Planning/Sequencing

What it does: Organizing steps and procedures
Text markers: "First...", "Next...", "My approach will be...", "Step by step..."
Brain region: Frontal Cortex

8. Evaluation/Judgment

What it does: Assessing quality, relevance, or correctness
Text markers: "This seems reasonable...", "The best option...", "This doesn't make sense..."
Brain region: Orbitofrontal Cortex

9. Creative Synthesis

What it does: Combining ideas in novel ways
Text markers: "What if...", "Perhaps...", "An alternative approach...", "Creatively speaking..."
Brain region: Right Hemisphere Networks

10. Attention Control

What it does: Focusing on relevant information
Text markers: "The key point is...", "Most importantly...", "Let me focus on..."
Brain region: Parietal + Frontal Networks