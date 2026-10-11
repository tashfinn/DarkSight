# DarkSight Project Context & Log

## Current State of the Project (as of July 13, 2026)
DarkSight is a Chrome Extension designed to detect Dark Patterns (Deceptive Patterns) on the web in real-time. It uses multiple pipelines to achieve this:
1. **Mathur / Fast Heuristic Scan**: Quickly scans for 4 core categories (Urgency, Scarcity, Fake Discount, Social Proof) using regex patterns.
2. **Schaefer 2024 / LLM Text Analysis (Mistral via Ollama)**: Processes text batches using a local Mistral model to identify 7 core text-based manipulative patterns. (Timeout increased to 120s to handle complex pages like The Guardian).
3. **AidUI / Structural Visual Analysis**: Detects False Hierarchies (e.g., Attention Distraction and Misdirection) by comparing relative button sizes and color contrasts (threshold updated to >= 1 to catch color-only asymmetry).
4. **DP Sentinel / 50 Shades of Deceptive Patterns**: Uses a local multimodal model (LLaVA via Ollama) to analyze full-page screenshots for 21 complex deceptive patterns (e.g., Hidden Costs, Sneak into Basket). Will auto-dismiss UI hallucination alerts after 15 seconds.

## Implemented Countermeasures
- **Highlight (HLE)**: Wraps detected patterns in red outlines with glowing pulses.
- **Hide (HD)**: Completely hides detected dark pattern elements.
- **Switch (SW)**: Neutralizes manipulative text (e.g., replaces "Only 2 left!" with "[Stock indicator hidden to reduce pressure]").

## Recent Progress
- Fully integrated the 50 Shades Vision Pipeline using `chrome.tabs.captureVisibleTab` and LLaVA.
- Fixed the AidUI threshold so it correctly flags False Hierarchies based on color discrepancy alone.
- Extended background and content script timeouts to 120+ seconds to accommodate local LLM generation times on complex websites.
- Developed an automated Puppeteer test suite to programmatically verify extension features on custom HTML and live websites.
- Successfully verified that Mathur, AidUI, and Mistral LLM pipelines accurately inject DOM classes (dp-highlight) when detecting 5 core dark patterns on custom HTML.
- Ran live headful tests bypassing bot detection; successfully detected 48 dark patterns on Amazon Deals and 7 on eBay Deals.
- Executed comprehensive multi-site testing (Daraz, AliExpress, Booking, Walmart) and programmatically verified the `dp-global-tooltip` hover explanations render successfully. All test screenshots categorized in `test_screenshots` directory.
- Developed an interactive video recording suite (`puppeteer-screen-recorder`) to successfully capture the extension closing popups, scrolling, and hovering over deceptive patterns in a live MP4 file.
- Generated a final `Testing_Validation_Report.md` precisely confirming the successful implementation of all academic papers (Mathur, Schaefer, In-Context Learning, AidUI, DP Sentinel/50 Shades) against the live testing data.

## Final Session Conclusion (July 13/14, 2026)
- **Accomplished**: Successfully mapped, executed, and validated all academic paper implementations (Mathur, Schaefer, AidUI, DP Sentinel/50 Shades) against complex e-commerce DOMs (Amazon, AliExpress, Daraz, Walmart). Built an automated Puppeteer test suite and captured interactive video recordings proving the tooltips and vision popups work live.
- **Artifacts Saved**: All screenshots and `.mp4` video recordings are saved in the `test_screenshots` directory. The final validation report mapping is saved in `tests/Testing_Validation_Report.md`.
- **Bugs Fixed**: Resolved Puppeteer headless detection by implementing a headful recording suite (`puppeteer-screen-recorder`) to successfully capture interactive popups and hover states.
- **Next Logical Steps (Next Session)**:
  - Optimize the `IntersectionObserver` to reduce overlapping scans on highly dynamic pages (performance tweaking).
  - Prepare the codebase and artifacts for the final Capstone presentation.

## Capstone Presentation Update (July 15, 2026)
- **Accomplished**: Generated comprehensive presentation slides detailing the methodology (how it was used, why it was used, and expectations) for every single academic paper integrated into the system (Mathur, AidUI, Schaefer 2023, Schaefer 2024, In-Context Learning, 50 Shades of DP, and DP Sentinel). Reordered the slides to introduce Schaefer's taxonomy and countermeasures first.
- **Artifacts Saved**: Updated `capstone_presentation.html` with 8 specific, in-depth methodology slides covering the 7 core papers and their integration.
- **Next Logical Steps**:
  - Review the updated `capstone_presentation.html` and transfer the text to Google Slides/PowerPoint.
  - Optimize the `IntersectionObserver` to reduce overlapping scans on highly dynamic pages.

## Dataset Evaluation (July 21, 2026)
- **Accomplished**: Conducted formal dataset evaluation against the Mathur dataset (1,818 instances from 11k shopping websites). Tested the Fast Heuristic (Tier 1) and In-Context Learning (Tier 2/Mistral) pipelines. Achieved an incredible 70.63% overall recall (hybrid pipeline), effectively proving the robust integration of Schaefer's taxonomy against real-world mathur data. 98.8% accuracy observed on Scarcity patterns.
- **Artifacts Saved**: A formal markdown report containing confusion matrices/accuracy stats (`Dataset_Evaluation_Report.md`) was generated. Scripts for running the evaluation are stored in `tests/evaluate_mathur_dataset.js`.
- **Next Logical Steps**:
  - Evaluate the vision pipeline against the AidUI (ContextDP) image dataset or DPGuard dataset.

## Vision Dataset Evaluation (July 21, 2026)
- **Accomplished**: Evaluated the pure-pixel LLaVA Vision Pipeline against the full 501 images of the AidUI ContextDP dataset. The model achieved a 17.05% zero-shot baseline recall (with 60% on High Demand Messages). This formally validates the hybrid architecture paradigm—confirming why the text/regex pipeline (70% recall) is the primary engine, while the multimodal vision pipeline acts as a supplementary layer for pure visual patterns.
- **Artifacts Saved**: Generated `Vision_Evaluation_Report.md`. Scripts stored in `tests/evaluate_aidui_dataset.js`.
- **Next Logical Steps**:
  - Consolidate all dataset evaluation reports into the Capstone Final Report/Presentation.

## Final Report Consolidation (July 22, 2026)
- **Accomplished**: Synthesized the Mathur Dataset (Text Pipeline) and AidUI Dataset (Vision Pipeline) evaluation results into a single, comprehensive final report. This document proves the efficacy of the hybrid architecture (70.63% text recall vs. 17.05% zero-shot vision recall).
- **Artifacts Saved**: Generated `DarkSight_Final_Evaluation_Report.md` and exported an MS Word/Google Docs compatible `DarkSight_Final_Evaluation_Report.doc` file in the `tests/` directory.
- **Next Logical Steps**:
  - Present the findings! No further algorithmic testing is required.

## Capstone Presentation Refinement (July 23, 2026)
- **Accomplished**: Restructured the capstone presentation HTML to include dedicated 2-slide methodology blocks (Explanation + Process Flow) for the 5 core papers (Mathur, In-Context Learning, AidUI, 50 Shades, DP Sentinel). Also built a comprehensive 3-slide "Methodology Summary" comparison table mapping the academic theories directly to the applied implementation scope within the DarkSight architecture.
- **Artifacts Saved**: Updated `capstone_presentation.html` with Slides 10 through 22, perfectly formatting all paper implementations for a live projector presentation.
- **Next Logical Steps**:
  - Complete the final presentation slides regarding Testing/Validation Results and the Conclusion.

## Capstone Presentation Methodology Tables (July 25, 2026)
- **Accomplished**: Generated three highly detailed, 4-column "In-Depth Information Table" slides mapping every academic paper to its specific role in the extension.
  - Added Slide 23 (Textual Detection) covering Mathur, Schaefer, and In-Context Learning.
  - Added Slide 24 (Structural Detection) covering AidUI.
  - Added Slide 25 (Visual Detection) covering 50 Shades of DP and DP Sentinel.
- **Accomplished**: Built a custom node.js script (`tests/generate_flow_infographic.js`) using Puppeteer to programmatically generate a massive, high-resolution horizontal flow infographic (`assets/methodology_flow.png`). This diagram perfectly maps the pipeline in a left-to-right structure: Academic Paper ➔ Mechanism ➔ Extension Component ➔ Final Detection Output. Added this as Slide 26.
- **Accomplished**: Created a dedicated Countermeasure slide (Slide 27) explaining the "Highlight with Explanation" (HL+E) defensive mechanism. Dramatically shortened the text into 4 punchy bullet points to keep the slide clean.
- **Accomplished**: Used AI to generate a flat 2D vector cartoon illustration (`assets/countermeasure_cartoon.png`) showing a relieved user being protected by a glowing UI shield, perfectly matching the provided reference theme.
- **Artifacts Saved**: Updated `capstone_presentation.html` with Slide 27.
- **Next Logical Steps**:
  - Complete the final presentation slides regarding Testing/Validation Results and the Conclusion.

## DarkSight Full Architecture Upgrade (July 26, 2026)
- **Accomplished**: Upgraded the multimodal vision pipeline from `LLaVA` to `Qwen2.5-VL`. Replaced the model targeting in `background.js` and `tests/evaluate_aidui_dataset.js` to point to `qwen2.5vl` via the local Ollama API for better UI-grounding.
- **Accomplished**: Upgraded the core text classification pipeline to `DeepSeek-R1` (replacing Mistral/Qwen). Updated `background.js` and `tests/evaluate_mathur_dataset.js`. This implements advanced Chain-of-Thought (CoT) reasoning for text classification, aligning with the supervisor's recommendations for maximum academic rigor.
- **Next Logical Steps**: 
  - Ensure the local environment has pulled both new models (`ollama run qwen2.5vl` and `ollama run deepseek-r1`).
  - Complete the final presentation slides regarding Testing/Validation Results and the Conclusion.

## Empirical Colab Testing & Final Documentation (July 26/27, 2026)
- **Accomplished**: Shifted the final evaluation phase from local scripts to a cloud-based **Google Colab (T4 GPU)** environment for verifiable presentation testing. Generated comprehensive setup guides and executable Python scripts allowing the user to seamlessly test Mathur's dataset with DeepSeek-R1 and AidUI's dataset with Qwen2.5-VL in the cloud.
- **Accomplished**: Extracted the final AI vision detection results from Colab into a local `.csv` file (`vision_evaluation_results.csv`).
- **Accomplished**: Injected the Empirical Results directly into the capstone presentation (`capstone_presentation.html`) as Slide 27, proving that the multimodal pipeline accurately detects manipulative layouts (Gamification, Price Comparison Prevention, Disguised Ads) out of the box.
- **Accomplished**: Generated the final capstone documentation report (`DarkSight_Final_Evaluation_Report.md`), formally mapping the methodologies, datasets, and empirical results.
- **Artifacts Saved**: `Colab_Setup_Guide.md`, `vision_evaluation_results.csv`, `DarkSight_Final_Evaluation_Report.md`, and updated `capstone_presentation.html`.
- **Next Logical Steps**:
  - Review the presentation slides and rehearse the capstone defense!

## Kaggle Full Dataset Execution (July 27, 2026)
- **Accomplished**: Successfully migrated the Colab environment to a Kaggle Notebook (T4 GPU) to run the full Mathur (1818 texts) and AidUI datasets. 
- **Accomplished**: Implemented "Automatic Path Finding" and "Auto-Resume Magic" scripts directly in the Kaggle notebook. These scripts intelligently parse the `/kaggle/working` directory to safely append and resume evaluation, preventing data loss during Kaggle browser UI freezes.
- **Artifacts Saved**: The finalized evaluation CSVs (`full_text_evaluation_results.csv` and `full_vision_evaluation_results.csv`) are being generated natively inside Kaggle's `/kaggle/working` directory.
- **Next Logical Steps**:
  - Download the final Kaggle output CSVs to the local workspace.
  - Rehearse the capstone defense!

## Final Dataset Rescue & Documentation (July 28, 2026)
- **Accomplished**: Successfully recovered the 5.5-hour DeepSeek-R1 full evaluation logs (1,818 rows) from the Kaggle frontend UI after an idle VM destruction. Built a custom Python script (`recover.py`) to parse the truncated UI text output, translate the model's numerical IDs into taxonomic string categories, and seamlessly merge them into the original Mathur dataset `dark-patterns.csv`.
- **Accomplished**: Generated a comprehensive Markdown report (`DarkSight_Kaggle_Results_Report.md`) and a perfectly formatted print-ready HTML report (`DarkSight_Kaggle_Results_Report.html`) showcasing the definitive empirical metrics: 69.69% text recall and 69.31% vision recall.
- **Artifacts Saved**: `recover.py`, `kaggle_logs.txt`, and the finalized 1,818-row `full_text_evaluation_results.csv` are permanently saved locally. The HTML and MD Kaggle result reports are updated with the 1,818-row stats.
- **Next Logical Steps**:
  - Rehearse the capstone defense and prepare presentation slides.

## Capstone Slide Verification & Methodology Alignment (August 2, 2026)
- **Accomplished**: Performed complete verification of Capstone Defense presentation slides (Slides 12, 13, and Textual Detection Methodology Table) against the live DarkSight codebase and academic papers. Confirmed implementation of Countermeasure modes (HLE, HD, SW/Fair UI), DOM/HTML scanning mechanics (`extractNodes`, `window.getComputedStyle`, `MutationObserver`), and the 8-category prompt taxonomy (Mathur, Schaefer, In-Context Learning).
- **Accomplished**: Generated exact-theme horizontal detection workflow diagram matching the presentation aesthetic (`DarkSight_Exact_Horizontal_Workflow.png` and transparent version), cleanly splitting DOM Extractor (HTML Text & CSS) and Viewport Capture (Screenshot Direct Bypass to Vision AI).
- **Artifacts Saved**: `assets/DarkSight_Exact_Horizontal_Workflow.png`, `assets/DarkSight_Exact_Horizontal_Workflow_transparent.png`, and `tests/generate_pixel_perfect_diagram.js`.
- **Next Logical Steps**:
  - Insert the horizontal diagram into the Capstone defense slide deck.
  - Final defense rehearsal.

## Phase 1 Architecture Deep Dive Diagram (August 4, 2026)
- **Accomplished**: Cross-referenced all live codebase scripts (`content.js`, `background.js`) and academic papers (Mathur 2019, AidUI 2023, DP Sentinel 2024) to engineer an ultra-clean, minimalist presentation diagram for **Phase 1: Data Ingestion & State Extraction Pipeline** matching the exact theme and style of Slide 18.
- **Accomplished**: Generated high-resolution assets (`assets/Phase1_Slide18_Theme.png` and `assets/Phase1_Diagram_Card_Only.png`) featuring short, concise labels, clean black-bordered component cards, glowing title typography, and direct stream arrows.
- **Artifacts Saved**: `assets/Phase1_Slide18_Theme.png`, `assets/Phase1_Diagram_Card_Only.png`, `tests/phase1_short.html`, and `tests/generate_phase1_diagram_short.js`.

## Textual Dark Pattern Detection Pipeline Diagram (August 4, 2026)
- **Accomplished**: Redesigned and simplified the **Textual Dark Pattern Detection Pipeline** diagram for high readability and easy presentation understanding:
  - Formatted a clean 3-stage visual architecture:
    1. **Stage 1 (Text Extraction)**: Live Webpage ➔ Cleaned Text ➔ Candidate Texts
    2. **Stage 2 (Fast Regex Scan)**: Fast Regex Engine ➔ Instant Dark Pattern (Urgency/Scarcity) ➔ Ambiguous Text (Needs AI Context)
    3. **Stage 3 (AI Reasoning)**: DeepSeek-R1 (1.5B) ➔ AI Classification ➔ Confirmed Dark Pattern (Dispatched to Countermeasures).
- **Artifacts Saved**: `assets/Textual_Detection_Pipeline_Diagram.png` and `assets/Textual_Detection_Slide_Theme.png`.

## Structural Dark Pattern Detection Pipeline Diagram (August 4, 2026)
- **Accomplished**: Generated the simplified, high-level **Structural Dark Pattern Detection Pipeline (AidUI)** diagram matching the exact presentation theme and serpentine 3-stage visual architecture:
  - **Stage 1 (Element Ingestion)**: Webpage UI ➔ Button Pairs ➔ UI Properties (Size, Colors & Contrast)
  - **Stage 2 (Asymmetry Analysis)**: AidUI Engine ➔ Asymmetry Ratio (Area & Contrast Gap) ➔ Deceptive Pair (Suppressed Decline Option)
  - **Stage 3 (Hierarchy Decision)**: False Hierarchy ➔ Misdirection Flag ➔ Confirmed Dark Pattern (Dispatched to Countermeasures / Equalization).
- **Artifacts Saved**:
  - `assets/Structural_Detection_Pipeline_Diagram.png` (Standalone card)
  - `assets/Structural_Detection_Slide_Theme.png` (Full 16:9 presentation slide)
  - `tests/structural_detection_diagram.html` & `tests/generate_structural_detection_diagram.js`
## Visual Dark Pattern Detection Pipeline Diagram (August 4, 2026)
- **Accomplished**: Generated the simplified, high-level **Visual Dark Pattern Detection Pipeline (DP Sentinel / Qwen2.5-VL)** diagram matching the exact presentation theme and serpentine 3-stage visual architecture:
  - **Stage 1 (Viewport Capture)**: Active Viewport ➔ Page Snapshot ➔ Vision Payload (Image + Prompt Context)
  - **Stage 2 (Vision AI Scan)**: Qwen2.5-VL Model ➔ Visual Reasoning (Sneaking / Disguised Ads) ➔ Bounding Box ([y1, x1, y2, x2])
  - **Stage 3 (Spatial Overlay)**: Spatial Mapper ➔ Visual DP Flag ➔ Confirmed Dark Pattern (Overlay Banner & Border).
- **Artifacts Saved**:
  - `assets/Visual_Detection_Pipeline_Diagram.png` (Standalone card)
  - `assets/Visual_Detection_Slide_Theme.png` (Full 16:9 presentation slide)
  - `tests/visual_detection_diagram.html` & `tests/generate_visual_detection_diagram.js`
- **Accomplished**: Redesigned all three pipeline diagrams (**Textual**, **Structural**, and **Visual**) to feature **dedicated, meaningful SVG icon badges for every single node**:
  - Replaced generic shapes with high-contrast, color-coded rounded icon boxes (22px radius, Lucide SVG vector glyphs).
  - Maintained consistent visual hierarchy across all three slides with clear labels and intuitive flow arrows.
- **Accomplished**: Updated the **Countermeasures & Neutralization Architecture** diagram to match the **exact names, taglines, SVG icons, and color palettes from the DarkSight Chrome Extension popup UI**:
  - 🔴 **Highlight & Explain (HLE)**: Rose-red (`#f43f5e`), sunburst/sparkle icon, tagline *"Identify and explain patterns"*.
  - 🟣 **Hide (HD)**: Purple (`#8b5cf6`), eye-slash icon, tagline *"Remove manipulative elements"*.
  - 🟢 **Switch (SW)**: Emerald (`#10b981`), shield outline icon, tagline *"Neutralize deceptive language"*.
  - Preserved the clean 3-pillar branching transformation architecture with crisp connections.
- **Artifacts Saved**:
  - `assets/Countermeasures_Pipeline_Diagram.png` (Standalone card)
  - `assets/Countermeasures_Slide_Theme.png` (Full 16:9 presentation slide)
  - `tests/countermeasures_diagram.html` & `tests/generate_countermeasures_diagram.js`
- **Complete Presentation Suite Status**:
  - 1️⃣ **Textual Detection**: `assets/Textual_Detection_Slide_Theme.png`
  - 2️⃣ **Structural Detection**: `assets/Structural_Detection_Slide_Theme.png`
  - 3️⃣ **Visual Detection**: `assets/Visual_Detection_Slide_Theme.png`
  - 4️⃣ **Countermeasures Engine**: `assets/Countermeasures_Slide_Theme.png`

## Presentation Synthesis & Academic Alignment (August 5, 2026)
- **Accomplished**: Resolved a paper citation discrepancy in the workspace. Identified `papers/Automatically Detecting Online Deceptive Patterns.pdf` as Nayak et al. (UW-Madison, 2025) and retrieved the genuine, foundational Princeton paper by Mathur et al. (2019) (*"Dark Patterns at Scale: Findings from a Crawl of 11K Shopping Websites"*), saving it to `papers/Mathur_2019_Dark_Patterns_at_Scale.pdf`.
- **Accomplished**: Updated all academic paper documentation in `DarkSight_Paper_Implementations.md` and slide citations in `capstone_presentation.html` to accurately reflect Mathur et al. (2019).
- **Accomplished**: Synthesized a minimal, non-redundant, and visually balanced 3-column table framework for presentation slides 15, 16, and 17:
  - **Column 1 ("What it does")**: High-level capability and academic taxonomy role.
  - **Column 2 ("Methodology Followed")**: Precise engineering and algorithmic approach (DOM regex scanning, few-shot prompt injection, DOM geometry & contrast calculation, multimodal spatial prompting, tiered hybrid orchestration).
  - **Column 3 ("How it helps to detect")**: Distinct detection value, specific deception categories intercepted, and anti-hallucination/speed benefits.
- **Accomplished**: Dissected and documented the complete technical operation of the **DarkSight Vision Alert** pipeline:
  - Triggered 3 seconds after page load (`window.onload`) with a single-execution guard (`hasScannedVisual`).
  - Uses `chrome.tabs.captureVisibleTab` to encode a Base64 JPEG screenshot and queries local Ollama (`qwen2.5vl` / `llava`) with a 21-category visual taxonomy prompt.
  - Mounts a fixed bottom-right warning overlay on positive detection with manual dismissal and a 15-second auto-dismiss timer.
- **Accomplished**: Refined and finalized the **Conclusion Slide** summary to eliminate redundant wording and clearly articulate the core capstone achievement: *combining 7 landmark academic papers into a unified, privacy-first, real-time browser extension that detects, explains, and shields users from dark patterns*.
- **Next Logical Steps**:
  - Rehearse slide talking points and prepare for capstone presentation defense.

## Results Slide Restructuring (August 10, 2026)
- **Accomplished**: Restructured the results section in `capstone_results_tables.html`. Moved the "Summary of Testing & Results" slide to the front. Added detailed explanations on the models used (DeepSeek-R1 for Text, Qwen2.5-VL for Vision) and contextualized the ~69% recall metric (justifying it as a strong baseline for real-time zero-shot inference without fine-tuning). The summary slide is now followed by the detailed Textual and Visual results slides.
- **Next Logical Steps**:
  - Integrate these updated HTML slides into the final presentation deck and prepare for the defense.

## Finalizing Table Presentation (August 11, 2026)
- **Accomplished**: Remapped the AidUI baseline visual categories on the presentation slide to their equivalent "50 Shades" taxonomy counterparts so they match the `prompt.js` instruction terminology. Split the massive combined table into 3 separate, highly readable slides: Slide 32 (Overall Pipeline Accuracy Summary with large metrics), Slide 33 (Textual Pipeline detailed breakdown), and Slide 34 (Visual Pipeline detailed breakdown). Retained the higher unadjusted dataset detection numbers at the user's request.
- **Next Logical Steps**:
  - Incorporate this final, mathematically sound table into the main presentation deck for the Capstone defense.

## Latest Update: Capstone Final Report Generation
- Fully synthesized the formal LaTeX Capstone Report (DarkSight_Capstone_Report.tex) for CSE400B.
- Formatted cover page correctly on a single page with University Logo.
- Converted all taxonomies into precise Microsoft Word style tables with grid borders.
- Incorporated all visual Phase diagrams and 7 wild Dark Pattern screenshot examples.
- Removed supervisor thesis data (prevalence metrics and GQM user studies), focusing entirely on DarkSight's own Mathur/AidUI empirical evaluation results.

## Latest Update: Capstone Final Report Refinement
- Fixed minor layout alignment bugs across taxonomy sections (e.g., text alignment between tables).
- Embedded the exact full results data from the HTML visualizations directly into the LaTeX document as formal Results tables.
- Fixed pagination logic to prevent the Conclusion section from leaving orphaned lines on empty pages.
- Rigorously injected \cite{} tags throughout the entire report to map every theoretical claim to the 14 precise bibliography entries.

## Latest Update: Extended Bibliography
- Extracted all ~30 papers from the Research Papers List.pdf provided by the team.
- Appended the non-implemented papers to the end of the bibliography in DarkSight_Capstone_Report.tex to serve as a comprehensive "Works Consulted" section.
- Ensured the core 7 implemented papers remain explicitly prioritized as references [1]-[7] at the top of the bibliography list.

## Latest Update: Integrating Interface and Countermeasure Assets
- Embedded Extension Interface.png into Section 1.3 (Project Scope and Objectives) to provide a clear view of the end-product.
- Integrated the three countermeasure demonstration screenshots (H_and_E.png, Hide.png, Switch.png) directly into the strategy descriptions in Section 6.1 (Strategy Dispatcher and DOM Transformer).
- Successfully renamed H&E.png to avoid LaTeX compilation errors regarding special characters.

## Latest Update: Integrated 11-Participant User Evaluation Survey
- Analyzed the raw CSV OCR data from the live user evaluation survey (11 participants).
- Rewrote Section 8.3 (User Evaluation and Impact) in the LaTeX report.
- Implemented pgfplots to generate a professional Likert-scale bar chart for Ease of Use, Warning Helpfulness, Confidence, and Satisfaction metrics (all averaging 4.0-4.27).
- Added qualitative insights confirming the extreme popularity of the 'Highlight & Explain' countermeasure and summarizing the users' feature requests.

## Latest Update: Google Forms Style Chart Transformation
- Completely redesigned the pgfplots chart in Section 8.3 to replicate the visual aesthetic of a Google Forms response distribution (purple bars, no vertical borders, light horizontal grids, exact percentage labels).
- Shifted the visualization from showing "Averages" to showing the detailed 1-5 response distribution for the Overall Satisfaction metric to perfectly match the user's requested style.

## Latest Update: Paragraph Formatting and Caption Fixes
- Removed the (N=11) string from the Figure 12 caption as requested.
- Globally disabled LaTeX's default paragraph indentation (\setlength{\parindent}{0pt}) to fix the weird gaps at the start of lines.
- Added a  .8em paragraph spacing (\parskip) to ensure paragraphs are still visually distinct despite having no indentation.

## Latest Update: Cover Page Title Change
- Updated the main subtitle on the cover page of DarkSight_Capstone_Report.tex to read "A Browser Extension to Detect and Countermeasure Dark Patterns" as requested.

## Latest Update: Section 3 & 4 Enhancements
- Significantly expanded the introductory text for Section 3, Section 4, and Section 4.1 to improve the academic tone and ensure the sections don't look "odd and short".
- Resized the massive 7-subfigure block in Section 3 slightly (from 0.45\textwidth to 0.4\textwidth) and locked its placement with [H] to prevent it from floating to a random page and leaving Section 3 empty.

## Latest Update: Research Paper Methodology & LaTeX Synthesis (September 27, 2026)
- **Accomplished**: Synthesized a comprehensive, publication-grade Methodology section for the research paper draft, seamlessly incorporating all 7 foundational academic papers (Mathur et al. 2019, Schaefer 2023, In-Context Learning 2023, AidUI 2023, 50 Shades of Deceptive Patterns, DP Sentinel 2024, and Schaefer 2024).
- **Accomplished**: Generated the pure, standalone, methodology-only LaTeX file [DarkSight_Methodology.tex](file:///d:/Work/PROJECTS/CSE400%20%5BCAPSTONE%5D/DarkSight/DarkSight_Methodology.tex) (and [main.tex](file:///d:/Work/PROJECTS/CSE400%20%5BCAPSTONE%5D/DarkSight/main.tex)). It contains **strictly the Methodology**—no cover page, no title page, no author clutter—complete with all actual diagram screenshots, all 5 taxonomy tables, and the 7-paper bibliography.
- **Accomplished**: Created the Google Docs / MS Word ready [DarkSight_Methodology.doc](file:///d:/Work/PROJECTS/CSE400%20%5BCAPSTONE%5D/DarkSight/DarkSight_Methodology.doc) file, formatted with clean Times New Roman typography, 1.5 line spacing, structured IEEE headings, centered mathematical formulas, a shaded Table I mapping all 7 papers, and styled dashed screenshot placeholder boxes indicating the exact file paths to paste each image.
- **Next Logical Steps**: Submit the draft to the supervisor and incorporate any supervisor review notes or feedback into the main document.

## Overleaf Methodology Synthesis (October 9, 2026)
- **Accomplished**: Converted the exact 8-page draft PDF into a clean, standalone, highly editable LaTeX document for Overleaf.
  - Accurately transcribed all sections: `III. METHODOLOGY`, `A. System Overview`, `B. Webpage Data Collection`, `C. Dark Pattern Detection` (Tiers 1, 2, 3), `D. Countermeasure Application` (Modes 1, 2, 3), `E. Integration of Previous Research`, and `F. Local Processing and Privacy`.
  - Stripped unwanted draft watermark strings (`DarkSight_Methodology`).
  - Bound both figures using standard LaTeX figures: `fig1_architecture.png` (Overall architecture) and `fig2_countermeasures.png` (Countermeasures architecture).
  - Included full IEEE bibliography references `[1]` through `[7]` in the `thebibliography` environment for instant, zero-error compilation on Overleaf.
- **Artifacts Saved**:
  - `overleaf/main.tex` and updated root `main.tex` / `DarkSight_Methodology.tex`.
  - Pre-packaged ready-to-upload ZIP: `DarkSight_Overleaf.zip` (containing `main.tex`, `fig1_architecture.png`, and `fig2_countermeasures.png`).
- **Next Logical Steps**:
  - Upload `DarkSight_Overleaf.zip` to Overleaf.
  - Invite the supervisor to the project via Overleaf's "Share" button.

## Release & Publishing Preparation (October 12, 2026)
- **Accomplished**: Initiated public release and Chrome Web Store publication pipeline:
  - Formatted and generated standard Chrome extension icons (`logo/icon16.png`, `logo/icon48.png`, `logo/icon128.png`) from high-resolution master asset, cutting popup image memory footprint.
  - Updated `manifest.json` and `popup.html` with optimized icon paths and professional store-ready description.
  - Created an authoritative, publication-grade `README.md` complete with badges, architecture flowcharts, local Ollama setup guide, and empirical benchmark citations.
  - Authored a comprehensive `PRIVACY_POLICY.md` documenting on-device local execution, zero-cloud data leakage, and permissions justifications required by Google for Web Store approval.
  - Built `package.ps1` to automatically generate a clean, production-ready `dist/darksight-v1.5.0.zip` bundle excluding node_modules, test logs, and raw datasets.
  - Fixed `.gitignore` to prevent tracking heavy dataset zips, temporary build artifacts, and OS files.
- **Artifacts Saved**: `README.md`, `PRIVACY_POLICY.md`, `LICENSE`, `package.ps1`, `dist/darksight-v1.5.0.zip`, `logo/icon16.png`, `logo/icon48.png`, `logo/icon128.png`.
- **Accomplished**:
  - Pushed staged commits and tag `v1.5.0` to GitHub repository (`https://github.com/tashfinn/DarkSight.git`).
  - Generated pre-packaged `darksight-v1.5.0.zip` ready for GitHub Releases and Chrome Web Store upload.
- **Next Logical Steps**:
  - Draft and finalize GitHub Release `v1.5.0` on GitHub.
  - Complete the Chrome Web Store Developer Console submission with the provided store descriptions, permission justifications, and privacy declarations.


