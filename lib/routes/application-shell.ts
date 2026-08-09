export function isEmployeeWorkspaceRoute(pathname: string | null | undefined) {
  const path = (pathname || "").toLowerCase();
  return path === "/workspace" || path.startsWith("/workspace/");
}
