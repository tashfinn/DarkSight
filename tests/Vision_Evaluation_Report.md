# AidUI Dataset (ContextDP) - Vision Evaluation Report

This report evaluates the performance of the **DP Sentinel (LLaVA Multimodal)** vision pipeline against the `501` deceptive interface screenshots from the AidUI dataset.

## Overall Performance

| Metric | Value |
| :--- | :--- |
| **Total Images Tested** | 501 |
| **Total Dark Patterns (Ground Truth)** | 258 |
| **Dark Patterns Caught (True Positives)** | 44 |
| **Overall Recall** | **17.05%** |

*Note: The vision pipeline operates purely on pixels using a zero-shot/few-shot prompt via LLaVA.*

## Performance by Ground Truth Category

| AidUI Category | Total Instances | Caught by LLaVA | Accuracy |
| :--- | :--- | :--- | :--- |
| ACTIVITY MESSAGE | 10 | 3 | 30.00% |
| COUNTDOWN TIMER | 28 | 9 | 32.14% |
| LIMITED TIME MESSAGE | 26 | 7 | 26.92% |
| LOW STOCK MESSAGE | 19 | 3 | 15.79% |
| HIGH DEMAND MESSAGE | 5 | 3 | 60.00% |
| DEFAULT CHOICE | 111 | 18 | 16.22% |
| ATTENTION DISTRACTION | 13 | 4 | 30.77% |
| NAGGING | 57 | 4 | 7.02% |
| DISGUISED ADS | 21 | 6 | 28.57% |
| GAMIFICATION | 11 | 0 | 0.00% |


> **Methodology Note:** The LLaVA model was tested using the exact prompt defined in `prompt.js`, assessing 21 distinct visual categories (50 Shades of DP Taxonomy). Since the AidUI dataset labels are slightly different (e.g., *ACTIVITY MESSAGE*, *DEFAULT CHOICE*), this report measures binary detection success (was a deceptive pattern flagged?) rather than perfect category string mapping.
