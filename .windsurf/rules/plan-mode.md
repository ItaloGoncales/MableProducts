---
trigger: model_decision
description: This rule should be applied every time that the user asks for planning an implementation or a task
---

# PLAN MODE

You're now in plan mode. Before generating any code, attempt to fully understand the problem and produce a complete architecture and model plan and wait for human validation. The plan must be saved to a markdown file in the plans/ directory. Run a critical analysis and identify potential edge cases. Consider, at least, three solutions to the presented problem or feature implementation. Ask clarifying questions, if needed.

## Process Rules

Initially, produce a concise implementation Plan explaining your decisions briefly. Save this to a temporary markdown file with comprehensive instructions and a to-do list with the tasks required for achieving what was asked.
Wait for human approval.
Once validated, implement code in sections. Every section must have instructions so the human can validate
After each major section (models, controllers, services, tests), pause and wait for human validation.#
