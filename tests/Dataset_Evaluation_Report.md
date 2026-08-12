# Mathur Dataset (11k Shopping Websites) - Evaluation Report

This report evaluates the performance of DarkSight's detection pipelines against the `1818` deceptive text instances from the Mathur et al. dataset.

## Overall Performance

| Pipeline | Total Tested | Dark Patterns Caught | Recall (True Positive Rate) |
| :--- | :--- | :--- | :--- |
| **Tier 1 (Fast Regex)** | 1818 | 444 | **24.42%** |
| **Tier 2 (Mistral LLM)** | 1818 | 1269 | **69.80%** |
| **DP Sentinel (Hybrid)** | 1818 | 1284 | **70.63%** |

*Note: The Hybrid pipeline succeeds if EITHER the Regex or LLM successfully flags the deceptive pattern.*

## Performance by Deceptive Category (Ground Truth)

| Category | Total Instances | Caught (Hybrid) | Accuracy |
| :--- | :--- | :--- | :--- |
| Social Proof | 325 | 192 | 59.08% |
| Misdirection | 270 | 76 | 28.15% |
| Urgency | 481 | 315 | 65.49% |
| Forced Action | 6 | 2 | 33.33% |
| Obstruction | 31 | 18 | 58.06% |
| Sneaking | 26 | 10 | 38.46% |
| Scarcity | 679 | 671 | 98.82% |


> **Methodology Note:** The Mistral LLM was tested using the exact Few-Shot In-Context Learning prompt defined in `prompt.js`, validating the integration of the Schaefer taxonomy on real-world data.
