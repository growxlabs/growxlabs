import { IntentClassification } from "./intent.types";
import { INTENT_RULES } from "./intent-rules";

export class IntentClassifier {
  private static VERSION = "2.0.0";

  static classify(message: string): IntentClassification {
    const trimmed = message.trim();
    if (!trimmed) {
      return {
        type: "CLARIFICATION_REQUIRED",
        confidence: 1.0,
        source: "rule",
        requiresClarification: true,
        explanation: "Message text is empty",
        entities: {},
        classifierVersion: this.VERSION
      };
    }

    // Layer 1: Deterministic Rule Matching
    for (const rule of INTENT_RULES) {
      for (const pattern of rule.patterns) {
        if (pattern.test(trimmed)) {
          return {
            type: rule.intentType,
            confidence: rule.minConfidence,
            source: "rule",
            department: rule.department,
            action: rule.action,
            resource: rule.resource,
            entities: { matchedPattern: pattern.source },
            requiresClarification: false,
            explanation: `Matched deterministic rule for ${rule.intentType}`,
            classifierVersion: this.VERSION
          };
        }
      }
    }

    // Layer 2: General Chat / Information Lookup Heuristics
    if (trimmed.endsWith("?") || trimmed.length < 20) {
      return {
        type: "GENERAL_CHAT",
        confidence: 0.8,
        source: "fallback",
        department: "Executive",
        entities: {},
        requiresClarification: false,
        explanation: "Classified as general inquiry",
        classifierVersion: this.VERSION
      };
    }

    // Layer 3: High-Confidence Fallback
    return {
      type: "GENERAL_CHAT",
      confidence: 0.7,
      source: "fallback",
      department: "Executive",
      entities: {},
      requiresClarification: false,
      explanation: "Default routing to General Chat",
      classifierVersion: this.VERSION
    };
  }
}
