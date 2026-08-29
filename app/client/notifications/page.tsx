"use client";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type { MouseEvent } from "react";
type Notification = {
  id: string;
  type: string;
  label: string;
  title: string;
  message: string;
  targetUrl: string | null;
  actionLabel: string | null;
  createdAt: string;
  validUntil: string | null;
  readAt: string | null;
  status: "read" | "unread";
};

function formatDate(value: string | null, options: Intl.DateTimeFormatOptions) {
  if (!value) return "";
  const dateOnly = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value);
  const date = dateOnly
    ? new Date(Number(dateOnly[1]), Number(dateOnly[2]) - 1, Number(dateOnly[3]))
    : new Date(value);
  return Number.isNaN(date.getTime()) ? "" : date.toLocaleDateString("en-IN", options);
}

export default function ClientNotificationsPage() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const query = useQuery({
    queryKey: ["client", "notifications"],
    queryFn: async () => {
      const response = await fetch("/api/client/notifications", { cache: "no-store" });
      const body = await response.json();
      if (!response.ok) throw new Error(body.error || "Unable to load notifications.");
      return body as { notifications: Notification[] };
    },
  });
  const markRead = useMutation({
    mutationFn: async (notificationId: string) => {
      const response = await fetch(`/api/client/notifications/${encodeURIComponent(notificationId)}/read`, { method: "POST" });
      const body = await response.json();
      if (!response.ok) throw new Error(body.error || "Unable to mark notification as read.");
      return body as { readAt: string };
    },
    onSuccess: (result, notificationId) => {
      queryClient.setQueryData<{ notifications: Notification[] }>(["client", "notifications"], (current) => current ? {
        notifications: current.notifications.map((item) => item.id === notificationId ? { ...item, status: "read", readAt: result.readAt } : item),
      } : current);
    },
  });

  async function markNotificationRead(item: Notification) {
    if (item.status === "read") return;
    try {
      await markRead.mutateAsync(item.id);
    } catch {
      // The notification can still be opened if the read request fails.
    }
  }

  async function openNotification(event: MouseEvent<HTMLAnchorElement>, item: Notification) {
    if (item.status === "read" || !item.targetUrl) return;
    event.preventDefault();
    await markNotificationRead(item);
    router.push(item.targetUrl);
  }

  return <main className="mx-auto max-w-4xl p-6 md:p-10">
    <h1 className="text-3xl font-bold">Notifications</h1>
    <p className="mt-2 text-slate-600">Project, billing, approval, and support updates from GrowXLabs.</p>
    <div className="mt-8 space-y-3">
      {query.isPending ? <p>Loading notifications…</p> : query.error ? <p role="alert" className="text-red-700">{query.error.message}</p> : query.data.notifications.length ? query.data.notifications.map((item) => {
        const unread = item.status === "unread";
        const createdDate = formatDate(item.createdAt, { day: "2-digit", month: "2-digit", year: "numeric" });
        const validUntil = formatDate(item.validUntil, { day: "numeric", month: "long", year: "numeric" });
        const content = <article
          className={`relative rounded-xl border bg-white p-5 transition-colors ${unread ? "border-slate-300 shadow-sm" : "border-slate-200"}`}
          onClick={!item.targetUrl ? () => void markNotificationRead(item) : undefined}
          onKeyDown={!item.targetUrl ? (event) => { if (event.key === "Enter" || event.key === " ") void markNotificationRead(item); } : undefined}
          role={!item.targetUrl ? "button" : undefined}
          tabIndex={!item.targetUrl ? 0 : undefined}
        >
          {unread && <span aria-label="Unread" className="absolute left-0 top-6 h-2 w-2 -translate-x-1/2 rounded-full bg-blue-600" />}
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-xs font-bold uppercase tracking-wide text-slate-500">{item.label}</p>
              <h2 className="mt-1 font-semibold text-slate-950">{item.title}</h2>
            </div>
            {createdDate && <time dateTime={item.createdAt} className="shrink-0 text-xs text-slate-500">{createdDate}</time>}
          </div>
          <p className="mt-3 text-sm leading-6 text-slate-700">{item.message}</p>
          {validUntil && <p className="mt-3 text-sm font-medium text-slate-600">Valid until {validUntil}</p>}
          {item.actionLabel && <span className="mt-4 inline-flex items-center gap-1 text-sm font-semibold text-blue-700">{item.actionLabel}<span aria-hidden="true">→</span></span>}
        </article>;
        return item.targetUrl ? <Link key={item.id} href={item.targetUrl} onClick={(event) => void openNotification(event, item)} className="block rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2">{content}</Link> : <div key={item.id}>{content}</div>;
      }) : <div className="rounded-xl border border-dashed border-slate-300 p-8 text-center text-slate-500">No notifications yet.</div>}
    </div>
  </main>;
}
