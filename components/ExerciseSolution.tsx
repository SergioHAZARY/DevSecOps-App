"use client";

import * as React from "react";
import { ChevronDown, Eye, EyeOff } from "lucide-react";
import { Button } from "@/components/ui/button";

interface ExerciseSolutionProps {
  show: string;
  hide: string;
  children: React.ReactNode;
}

/** Reveals an exercise's solution on demand so the learner tries first. */
export function ExerciseSolution({ show, hide, children }: ExerciseSolutionProps) {
  const [open, setOpen] = React.useState(false);
  return (
    <div className="mt-4">
      <Button variant="outline" onClick={() => setOpen((v) => !v)} aria-expanded={open}>
        {open ? <EyeOff aria-hidden="true" /> : <Eye aria-hidden="true" />}
        {open ? hide : show}
        <ChevronDown className={open ? "rotate-180 transition-transform" : "transition-transform"} aria-hidden="true" />
      </Button>
      {open && <div className="mt-3">{children}</div>}
    </div>
  );
}
