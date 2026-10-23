"use client";
import { useState, useEffect, type ReactNode } from "react";
export function BlogArchiveView({children, archive}: {children: ReactNode; archive: ReactNode}) {
  const [open,setOpen] = useState(false);
  useEffect(() => {
    const sync = () => setOpen(location.hash === "#all-blogs");
    sync();
    window.addEventListener("hashchange",sync);
    return () => window.removeEventListener("hashchange",sync);
  },[]);
  function toggle(value: boolean) {
    history.replaceState(null,"",location.pathname + location.search + (value ? "#all-blogs" : ""));
    setOpen(value);
    window.scrollTo(0,0);
  }
  return <>
    <div hidden={open} className="new-blog"><main className="new-blog-container">
      <header className="new-blog-heading"><h1>News &amp; Releases</h1><button onClick={() => toggle(true)}>Browse articles ↗</button></header>
      {children}
    </main></div>
    <div hidden={!open}><div className="bg-black px-6 pt-28 text-white"><button onClick={() => toggle(false)} className="border border-white/30 px-4 py-3">← Back to blog</button></div>{archive}</div>
  </>;
}
