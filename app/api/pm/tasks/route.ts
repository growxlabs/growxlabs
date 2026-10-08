import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase/admin";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const project_id = searchParams.get("project_id");

    if (project_id) {
      const { data: project } = await supabaseAdmin
        .from("projects")
        .select("description")
        .eq("id", project_id)
        .maybeSingle();

      if (project?.description) {
        try {
          const meta = JSON.parse(project.description);
          if (Array.isArray(meta.tasks)) {
            return NextResponse.json({ tasks: meta.tasks });
          }
        } catch {
          // not json
        }
      }
    }

    const { data: tasks, error } = await supabaseAdmin
      .from("tasks")
      .select("*")
      .order("created_at", { ascending: true });

    if (error) throw error;
    return NextResponse.json({ tasks: tasks || [] });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Failed to fetch tasks" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const body = await request.json();
    const projectId = searchParams.get("project_id") || body.project_id;

    if (projectId) {
      const { data: project } = await supabaseAdmin
        .from("projects")
        .select("description")
        .eq("id", projectId)
        .single();

      if (project) {
        let meta: any = {};
        try {
          meta = JSON.parse(project.description || "{}");
        } catch {
          meta = {};
        }

        const existingTasks = Array.isArray(meta.tasks) ? meta.tasks : [];
        const newTask = {
          id: body.id || `task-${Date.now()}`,
          key: body.key || `TRX-${String(existingTasks.length + 1).padStart(2, "0")}`,
          title: body.title,
          description: body.description || "",
          priority: body.priority || "MEDIUM",
          status: body.status || "TODO",
          story_points: Number(body.story_points) || 2,
          milestone: body.milestone || "Sprint Execution",
          created_at: new Date().toISOString()
        };

        const updatedTasks = [...existingTasks, newTask];
        meta.tasks = updatedTasks;

        await supabaseAdmin
          .from("projects")
          .update({ description: JSON.stringify(meta) })
          .eq("id", projectId);

        return NextResponse.json({ task: newTask }, { status: 201 });
      }
    }

    // Fallback to table insert if no project_id
    const { data: task, error } = await supabaseAdmin
      .from("tasks")
      .insert({
        title: body.title,
        description: body.description,
        priority: body.priority || "MEDIUM",
        status: body.status || "TODO",
        due_date: body.due_date
      })
      .select()
      .single();

    if (error) throw error;
    return NextResponse.json({ task }, { status: 201 });
  } catch (error: any) {
    console.error("POST /api/pm/tasks error:", error);
    return NextResponse.json({ error: error.message || "Failed to create task" }, { status: 400 });
  }
}

export async function PATCH(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");
    const projectId = searchParams.get("project_id");
    if (!id) throw new Error("Missing task ID");

    const updates = await request.json();

    // 1. Try updating inside projects metadata if project_id is provided or task lives in project
    if (projectId) {
      const { data: project } = await supabaseAdmin
        .from("projects")
        .select("description")
        .eq("id", projectId)
        .maybeSingle();

      if (project?.description) {
        try {
          const meta = JSON.parse(project.description);
          if (Array.isArray(meta.tasks)) {
            const taskIndex = meta.tasks.findIndex((t: any) => t.id === id);
            if (taskIndex !== -1) {
              meta.tasks[taskIndex] = { ...meta.tasks[taskIndex], ...updates };
              await supabaseAdmin
                .from("projects")
                .update({ description: JSON.stringify(meta) })
                .eq("id", projectId);

              return NextResponse.json({ task: meta.tasks[taskIndex] });
            }
          }
        } catch (e) {
          console.warn("Could not parse project metadata:", e);
        }
      }
    }

    // 2. Scan all projects if project_id was not explicitly specified
    const { data: allProjects } = await supabaseAdmin
      .from("projects")
      .select("id, description");

    for (const p of allProjects || []) {
      if (!p.description) continue;
      try {
        const meta = JSON.parse(p.description);
        if (Array.isArray(meta.tasks)) {
          const taskIndex = meta.tasks.findIndex((t: any) => t.id === id);
          if (taskIndex !== -1) {
            meta.tasks[taskIndex] = { ...meta.tasks[taskIndex], ...updates };
            await supabaseAdmin
              .from("projects")
              .update({ description: JSON.stringify(meta) })
              .eq("id", p.id);

            return NextResponse.json({ task: meta.tasks[taskIndex] });
          }
        }
      } catch {
        // continue
      }
    }

    // 3. Fallback to tasks table update
    const { data: task, error } = await supabaseAdmin
      .from("tasks")
      .update(updates)
      .eq("id", id)
      .select()
      .maybeSingle();

    if (error) throw error;
    return NextResponse.json({ task });
  } catch (error: any) {
    console.error("PATCH /api/pm/tasks error:", error);
    return NextResponse.json({ error: error.message || "Failed to update task" }, { status: 400 });
  }
}
