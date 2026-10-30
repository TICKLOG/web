import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { currentTeamUser } from "@/lib/team";
import { listTestBuilds, TEST_BUILDS_DIR } from "@/lib/test-builds";

// Downloads a test build; team members only.
export async function GET(
  _request: Request,
  { params }: RouteContext<"/team/test-build/[file]">,
) {
  if (!(await currentTeamUser()))
    return new Response("Not found", { status: 404 });
  const { file } = await params;
  // Only files from the listing, never a path from the request.
  if (!(await listTestBuilds()).includes(file))
    return new Response("Not found", { status: 404 });
  const data = await readFile(join(TEST_BUILDS_DIR, file));
  return new Response(data, {
    headers: {
      "Content-Type": "application/java-archive",
      "Content-Disposition": `attachment; filename="${file}"`,
      "Cache-Control": "private, no-store",
    },
  });
}
