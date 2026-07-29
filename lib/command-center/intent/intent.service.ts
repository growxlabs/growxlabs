import { IntentClassification } from "./intent.types";
import { IntentClassifier } from "./intent-classifier";
import { CommandCenterContext } from "../context/command-center-context";

export class IntentService {
  static resolveIntent(message: string, _context: CommandCenterContext): IntentClassification {
    return IntentClassifier.classify(message);
  }
}
