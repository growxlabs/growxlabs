import type { ReactNode } from "react";

interface EditorialImageFrameProps {
  children: ReactNode;
  className?: string;
}

export function EditorialImageFrame({ children, className = "" }: EditorialImageFrameProps) {
  return (
    <div className={`blog-editorial-image-frame ${className}`.trim()}>
      {children}
    </div>
  );
}
