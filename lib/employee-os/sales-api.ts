import { SalesAccessError } from "./sales-service";
export function salesError(error:unknown){if(error instanceof SalesAccessError)return Response.json({error:error.message},{status:error.status});console.error("[Employee Sales]",error);return Response.json({error:"Sales request could not be completed"},{status:500})}
