import React from "react";
import { theme } from "../../styles/theme";

interface ResizeHandleProps {
  /** Called with the horizontal pixel delta as the user drags. */
  onResize: (deltaX: number) => void;
  /** Which side this handle sits on, for cursor/visual orientation. */
  side?: "left" | "right";
}

/** A thin vertical drag handle for resizing a side panel. */
export function ResizeHandle({ onResize }: ResizeHandleProps) {
  const [active, setActive] = React.useState(false);

  React.useEffect(() => {
    if (!active) return;

    const handleMove = (e: MouseEvent) => {
      e.preventDefault();
      onResize(e.movementX);
    };
    const stop = () => setActive(false);

    document.body.style.cursor = "col-resize";
    document.body.style.userSelect = "none";
    window.addEventListener("mousemove", handleMove);
    window.addEventListener("mouseup", stop);

    return () => {
      document.body.style.cursor = "";
      document.body.style.userSelect = "";
      window.removeEventListener("mousemove", handleMove);
      window.removeEventListener("mouseup", stop);
    };
  }, [active, onResize]);

  return (
    <div
      onMouseDown={(e) => {
        e.preventDefault();
        setActive(true);
      }}
      role="separator"
      aria-orientation="vertical"
      style={{
        flexShrink: 0,
        width: "6px",
        cursor: "col-resize",
        background: active ? theme.colors.primary : "transparent",
        borderLeft: `1px solid ${theme.colors.border}`,
        transition: active ? "none" : "background 0.15s",
        zIndex: 1100,
      }}
      onMouseEnter={(e) => {
        if (!active) e.currentTarget.style.background = "rgba(41,0,135,0.25)";
      }}
      onMouseLeave={(e) => {
        if (!active) e.currentTarget.style.background = "transparent";
      }}
    />
  );
}
