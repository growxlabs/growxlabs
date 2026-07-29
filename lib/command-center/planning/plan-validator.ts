import {ExecutionPlanSchema} from "./plan.schemas.ts";
import {PlanningError} from "./planning-errors.ts";
import type {ExecutionPlan,TrustedPlanningContext} from "./plan.types.ts";
import {PLANNER_POLICY} from "./planner-policy.ts";
const externalDestination=/\b(?:https?:\/\/|postgres(?:ql)?:\/\/|file:\/\/|ssh:\/\/)/i;
const destructive=/\b(delete|destroy|drop|truncate|purge|wipe|reset)\b/i;
export function validatePlan(candidate:unknown,context:TrustedPlanningContext):ExecutionPlan{
 const parsed=ExecutionPlanSchema.safeParse(candidate);if(!parsed.success)throw new PlanningError("MALFORMED_PLAN","Planner returned an invalid execution plan",{issues:parsed.error.issues.map(issue=>({path:issue.path.join("."),message:issue.message}))});
 const plan=parsed.data;if(plan.requestId!==context.requestId||plan.conversationId!==context.conversationId||plan.organisationId!==context.organisationId||plan.workspaceId!==context.workspaceId||plan.userId!==context.userId||plan.agentId!==context.agentId)throw new PlanningError("SCOPE_MISMATCH","Plan attempted to override trusted identity or scope");
 if(plan.capabilityId!==context.capabilityId||!context.allowedCapabilityIds.includes(plan.capabilityId))throw new PlanningError("UNKNOWN_CAPABILITY","Plan capability is not authorised");
 if(plan.skillId&&(!context.allowedSkillIds.includes(plan.skillId)||plan.skillId!==context.skillId))throw new PlanningError("UNKNOWN_SKILL","Plan skill is not authorised");
 const ids=new Set<string>();for(const step of plan.steps){if(ids.has(step.id))throw new PlanningError("DUPLICATE_STEP_ID",`Duplicate step ID: ${step.id}`);ids.add(step.id)}
 for(const step of plan.steps){
  if(step.type==="tool"&&!step.toolId)throw new PlanningError("UNKNOWN_TOOL",`Tool step ${step.id} has no toolId`);
  if(step.toolId&&!context.allowedToolIds.includes(step.toolId))throw new PlanningError("UNKNOWN_TOOL",`Tool is not allowlisted: ${step.toolId}`);
  if(step.requiredPermissions.some(permission=>!context.permissions.includes(permission)))throw new PlanningError("PERMISSION_ESCALATION",`Step ${step.id} requires unavailable permissions`);
  for(const dependency of step.dependsOn)if(!ids.has(dependency)||dependency===step.id)throw new PlanningError("INVALID_DEPENDENCY",`Invalid dependency ${dependency} on step ${step.id}`);
  if(JSON.stringify(step.input).length>PLANNER_POLICY.maxSerializedInputBytes)throw new PlanningError("INPUT_TOO_LARGE",`Input for ${step.id} exceeds policy`);
  if(step.expectedOutputSchema&&JSON.stringify(step.expectedOutputSchema).length>PLANNER_POLICY.maxSerializedOutputSchemaBytes)throw new PlanningError("OUTPUT_SCHEMA_TOO_LARGE",`Output schema for ${step.id} exceeds policy`);
  const serialized=JSON.stringify(step.input);if(externalDestination.test(serialized))throw new PlanningError("UNSUPPORTED_DESTINATION",`Step ${step.id} contains an unsupported destination`);
  if(destructive.test(`${step.name} ${step.description}`)&&!context.explicitlyRequestedDestructive)throw new PlanningError("DESTRUCTIVE_ACTION_NOT_REQUESTED",`Destructive step ${step.id} was not explicitly requested`);
  if(step.metadata?.approvalRequired===true&&!context.approvedActionIds.includes(step.id))throw new PlanningError("APPROVAL_REQUIRED",`Step ${step.id} requires approval`);
 }
 const visiting=new Set<string>(),visited=new Set<string>(),byId=new Map(plan.steps.map(step=>[step.id,step]));
 const visit=(id:string)=>{if(visiting.has(id))throw new PlanningError("CYCLIC_DEPENDENCY","Plan contains a dependency cycle");if(visited.has(id))return;visiting.add(id);for(const dependency of byId.get(id)?.dependsOn||[])visit(dependency);visiting.delete(id);visited.add(id)};for(const id of ids)visit(id);
 return{...plan,status:"validated"};
}
