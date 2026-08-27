"use client";

import { useEffect, useState } from "react";
import styles from "./editorial.module.css";

export interface EditorialHeading {
  id: string;
  text: string;
}

function useActiveHeading(headings: EditorialHeading[]) {
  const [activeId, setActiveId] = useState(headings[0]?.id ?? "");

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((entry) => entry.isIntersecting)
          .sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top)[0];

        if (visible) setActiveId(visible.target.id);
      },
      { rootMargin: "-16% 0px -68% 0px", threshold: 0.05 }
    );

    headings.forEach(({ id }) => {
      const section = document.getElementById(id);
      if (section) observer.observe(section);
    });

    return () => observer.disconnect();
  }, [headings]);

  return activeId;
}

function HeadingLink({ heading, index, activeId, mobile = false }: { heading: EditorialHeading; index: number; activeId: string; mobile?: boolean }) {
  return (
    <a
      href={`#${heading.id}`}
      className={mobile ? styles.mobileTocLink : `${styles.tocLink} ${activeId === heading.id ? styles.tocLinkActive : ""}`}
      aria-current={activeId === heading.id ? "location" : undefined}
    >
      <span className={styles.tocIndex}>{String(index + 1).padStart(2, "0")}</span>
      <span>{heading.text}</span>
    </a>
  );
}

export function EditorialTableOfContents({ headings, mobile = false }: { headings: EditorialHeading[]; mobile?: boolean }) {
  const activeId = useActiveHeading(headings);

  if (mobile) {
    return (
      <details className={styles.mobileToc}>
        <summary>On this page</summary>
        <ul className={styles.mobileTocList}>
          {headings.map((heading, index) => (
            <li key={heading.id}>
              <HeadingLink heading={heading} index={index} activeId={activeId} mobile />
            </li>
          ))}
        </ul>
      </details>
    );
  }

  return (
    <nav className={styles.toc} aria-label="On this page">
      <div className={styles.tocLabel}>On this page</div>
      <ul className={styles.tocList}>
        {headings.map((heading, index) => (
          <li key={heading.id}>
            <HeadingLink heading={heading} index={index} activeId={activeId} />
          </li>
        ))}
      </ul>
    </nav>
  );
}

export function EditorialReadingProgress() {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const updateProgress = () => {
      const scrollable = document.documentElement.scrollHeight - window.innerHeight;
      setProgress(scrollable > 0 ? (window.scrollY / scrollable) * 100 : 0);
    };

    updateProgress();
    window.addEventListener("scroll", updateProgress, { passive: true });
    return () => window.removeEventListener("scroll", updateProgress);
  }, []);

  return (
    <div className={styles.progress} aria-hidden="true">
      <div className={styles.progressBar} style={{ width: `${progress}%` }} />
    </div>
  );
}
