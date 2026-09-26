# DarkSight Academic Implementation Report

This report provides a definitive and detailed breakdown of how each academic paper from the research phase has been translated into the live DarkSight Chrome Extension codebase.

---

## 1. Dark Pattern Sentinel (The Core Architecture)
**Paper:** *Dark Pattern Sentinel: A Hybrid DOM Heuristics and LLM-Based Real-Time Detection System.pdf*
**Role:** Overall System Architecture
**Relevant Code:** `content.js`, `background.js`

**Implementation Details:**
You implemented the exact overarching **Hybrid Architecture** proposed by this paper. Instead of relying solely on heavy AI (which is slow) or solely on brittle heuristics (which are inaccurate), DarkSight employs a multi-tiered approach:
1. **Tier 1 (DOM Heuristics):** Rapid, real-time frontend scanning using Regex (Mathur) and CSS structural calculations (AidUI) to catch obvious patterns instantly.
2. **Tier 2 (LLM-Based Real-Time Detection):** For complex or ambiguous content, the system seamlessly hands off data to local Large Language Models (Mistral for text, LLaVA for vision) via `background.js` and Ollama. 
This intelligent handoff system *is* the DP Sentinel architecture in practice.

---

## 2. In-Context Learning for LLMs
**Paper:** *1.OurDPInContextLearningGPT.pdf*
**Role:** Prompt Engineering for Text LLM (Mistral)
**Relevant Code:** `prompt.js` (Lines 60-119)

**Implementation Details:**
You implemented the **Few-Shot Prompting (In-Context Learning)** technique detailed in this paper to improve the accuracy of the local Mistral model. In `prompt.js`, you constructed a `TRAINING EXAMPLES` section that feeds the LLM positive and negative examples of each dark pattern category (e.g., showing it that "FLASH SALE" is Urgency, while "May 26 - Jun 2" is NORMAL) *before* it processes live webpage text. This directly applies the paper's methodology to prevent model hallucinations and improve classification strictness.

---

## 3. Schaefer 2023 (Taxonomy) & Schaefer 2024 (Countermeasures)
**Papers:** *schaefer2023c.pdf* & *schaefer2024a.pdf*
**Role:** LLM Text Classification Categories & Dynamic Countermeasures
**Relevant Code:** `prompt.js`, `content.js`

**Implementation Details:**
* **Schaefer 2023:** You implemented this paper's **Taxonomy of Dark Patterns** as the foundation for your LLM's logic. Inside `prompt.js`, the 8 distinct text categories (Misdirection, Urgency, Scarcity, Social Proof, Obstruction, Forced Action, Sneaking, Fake Discount) and their strict definitions are drawn from this research. The **Mistral LLM** uses these definitions to classify text batches.
* **Schaefer 2024:** You implemented this paper's **Dynamic Countermeasures**. Once Mistral classifies a text, `content.js` dynamically applies countermeasures to protect the user: **Highlight (HLE)** for awareness, **Hide (HD)** for removal, or **Switch (SW)** to neutralize manipulative language.

---

## 4. 50 Shades of Deceptive Patterns
**Paper:** *50 Shades of Deceptive Patterns.pdf*
**Role:** Multimodal Vision Pipeline Taxonomy (LLaVA)
**Relevant Code:** `prompt.js` (Lines 158-190), `background.js`, `content.js`

**Implementation Details:**
You implemented the **21-Category Visual Taxonomy** from this paper to drive your Multimodal Vision Pipeline. 
* **The LLM:** This pipeline explicitly uses the **LLaVA** multimodal model via Ollama. 
* **How it works:** Using `chrome.tabs.captureVisibleTab`, the system takes a full-page screenshot and sends it to LLaVA. The model evaluates the image against the 21 complex categories defined in `buildVisionPrompt()` (e.g., Roach Motel, Hidden Costs, Sneak into Basket, False Hierarchy). This handles the context-heavy patterns that text-only analysis (Mistral) cannot detect.

---

## 5. AidUI (Structural Visual Analysis)
**Paper:** *AidUI.pdf*
**Role:** DOM Heuristics for False Hierarchies
**Relevant Code:** `content.js`

**Implementation Details:**
You implemented the **Structural Visual Analysis** logic to detect **False Hierarchies** (e.g., Attention Distraction where a "Cancel" button is made practically invisible compared to a "Subscribe" button). You translated the paper's methodology into DOM calculations that mathematically compare the relative sizes and color contrasts of sibling interactive elements. You improved the implementation by customizing the threshold (`>= 1`) to successfully flag asymmetric buttons based purely on color discrepancy.

---

## 6. Dark Patterns at Scale (Mathur et al., 2019)
**Paper:** *Mathur_2019_Dark_Patterns_at_Scale.pdf* ("Dark Patterns at Scale: Findings from a Crawl of 11K Shopping Websites")
**Role:** Fast Heuristic Scan (Regex) & Baseline Dataset
**Relevant Code:** `content.js`

**Implementation Details:**
You implemented the **Fast Heuristic Scan** as your first line of defense. Based on Mathur's research into prevalent dark pattern strings, you use lightweight **Regex patterns** to instantly scan DOM elements for 4 core categories: Urgency, Scarcity, Fake Discount, and Social Proof. This allows DarkSight to catch highly obvious, repeated manipulative text instantly without wasting LLM compute resources. Furthermore, Mathur's 1,818 ground-truth dataset from 11k shopping websites serves as our primary benchmark dataset.

---

### Summary of LLM Allocation:
* **Mistral LLM (Text Pipeline):** Uses **Schaefer 2023** (Taxonomy) + **In-Context Learning** (Few-Shot Prompting) to classify text strings. Triggers **Schaefer 2024** Countermeasures.
* **LLaVA LLM (Vision Pipeline):** Uses **50 Shades of Deceptive Patterns** (21-Category Taxonomy) to evaluate full-page screenshots for layout and visual manipulation.
* Both are orchestrated under the **DP Sentinel** Hybrid framework, supported by **Mathur** and **AidUI** heuristics.
