export function WorkspaceState({ state }: { state: string }) {
  const content: Record<string, [string,string]> = {
    unavailable:["Workspace unavailable","Your account is not linked to an employee workspace. Contact People Operations if you believe this is an error."],
    pending:["Your workspace is being prepared","Your employee account is set up. Access will become available when provisioning is complete."],
    provisioning:["Your workspace is being prepared","We are finishing the secure setup of your workspace."],
    suspended:["Workspace access suspended","Your GrowXLabs workspace access is currently suspended. Contact People Operations for assistance."],
    failed:["Workspace temporarily unavailable","We could not finish preparing your workspace. Please contact support."],
    invalid:["Workspace unavailable","Your employee record could not be verified."],
  }; const [title,description]=content[state]||content.invalid;
  return <main className="grid min-h-screen place-items-center bg-slate-50 px-6"><section className="max-w-lg text-center"><p className="text-sm font-semibold text-blue-700">GrowXLabs Employee OS</p><h1 className="mt-3 text-2xl font-semibold tracking-tight text-slate-950">{title}</h1><p className="mt-3 text-sm leading-6 text-slate-600">{description}</p></section></main>;
}
