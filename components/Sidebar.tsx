"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ArrowLeft, Check, ChevronDown, ListTree } from "lucide-react";
import { ModuleIcon } from "@/components/ModuleIcon";
import { Dialog, DialogDescription, DialogTitle, DialogTrigger, SheetContent } from "@/components/ui/dialog";
import { Progress } from "@/components/ui/progress";
import { localePath, type Dictionary } from "@/lib/i18n";
import { countCompleted, percent, useProgress } from "@/lib/progress";
import type { Locale } from "@/lib/types";
import { cn } from "@/lib/utils";

export interface SidebarCourse {
  slug: string;
  number: string;
  title: string;
  lessons: { slug: string; title: string; available: boolean }[];
}

interface SidebarProps {
  locale: Locale;
  module: { id: number; slug: string; icon: string; title: string };
  courses: SidebarCourse[];
  t: { nav: Dictionary["nav"]; course: Dictionary["course"] };
}

/** W3Schools-style left navigation: the courses of the current module, the current one unfolded. */
function SidebarNav({ locale, module, courses, t }: SidebarProps) {
  const pathname = usePathname();
  const progress = useProgress();
  const [, , , activeCourse, activeLesson] = pathname.split("/"); // /<locale>/courses/<course>/<lesson>
  const [openCourse, setOpenCourse] = React.useState<string | null>(activeCourse ?? null);
  const activeRef = React.useRef<HTMLAnchorElement>(null);

  React.useEffect(() => setOpenCourse(activeCourse ?? null), [activeCourse]);

  // bring the current lesson into view inside the scrollable sidebar
  React.useEffect(() => {
    activeRef.current?.scrollIntoView({ block: "nearest" });
  }, [pathname]);

  return (
    <nav aria-label={t.nav.courseMenu} className="p-3">
      <Link
        href={localePath(locale, "/courses")}
        className="flex min-h-9 items-center gap-1.5 rounded-md px-2 text-sm text-muted-foreground hover:bg-accent hover:text-accent-foreground"
      >
        <ArrowLeft className="size-4" aria-hidden="true" />
        {t.nav.allCourses}
      </Link>

      <Link
        href={localePath(locale, `/modules/${module.slug}`)}
        className="mt-2 flex items-center gap-2 rounded-md px-2 py-1.5 font-semibold hover:bg-accent"
      >
        <ModuleIcon name={module.icon} className="size-4 shrink-0 text-primary" />
        <span className="min-w-0">
          {t.course.module} {module.id} · {module.title}
        </span>
      </Link>

      <ul className="mt-2 space-y-0.5">
        {courses.map((course) => {
          const isActiveCourse = course.slug === activeCourse;
          const isOpen = openCourse === course.slug;
          const keys = course.lessons.map((l) => `${course.slug}/${l.slug}`);
          const done = countCompleted(progress, keys);
          const panelId = `sidebar-${course.slug}`;

          return (
            <li key={course.slug}>
              <div className={cn("flex items-stretch rounded-md", isActiveCourse && "bg-accent text-accent-foreground")}>
                <Link
                  href={localePath(locale, `/courses/${course.slug}`)}
                  aria-current={isActiveCourse && !activeLesson ? "page" : undefined}
                  className="flex min-h-10 min-w-0 flex-1 items-center gap-2 rounded-l-md px-2 py-1.5 text-sm font-medium hover:bg-accent"
                >
                  <span className="w-7 shrink-0 font-mono text-xs text-muted-foreground">{course.number}</span>
                  <span className="min-w-0 flex-1">{course.title}</span>
                  {done === keys.length && keys.length > 0 && <Check className="size-4 shrink-0 text-primary" aria-label={t.course.courseCompleted} />}
                </Link>
                <button
                  type="button"
                  onClick={() => setOpenCourse(isOpen ? null : course.slug)}
                  aria-expanded={isOpen}
                  aria-controls={panelId}
                  aria-label={`${course.title} - ${t.course.lessons}`}
                  className="flex w-9 shrink-0 items-center justify-center rounded-r-md hover:bg-accent"
                >
                  <ChevronDown className={cn("size-4 transition-transform", isOpen && "rotate-180")} aria-hidden="true" />
                </button>
              </div>

              {isOpen && (
                <div id={panelId}>
                  <div className="mx-2 mt-1.5 flex items-center gap-2 text-xs text-muted-foreground">
                    <Progress value={percent(done, keys.length)} className="h-1.5" aria-hidden="true" />
                    <span className="shrink-0 tabular-nums">
                      {done}/{keys.length}
                    </span>
                  </div>
                  <ol className="mb-2 ml-3 mt-1.5 border-l">
                    {course.lessons.map((lesson) => {
                      const isActive = isActiveCourse && lesson.slug === activeLesson;
                      const completed = !!progress.lessons[`${course.slug}/${lesson.slug}`];
                      const content = (
                        <>
                          <span
                            className={cn(
                              "flex size-4 shrink-0 items-center justify-center rounded-full border",
                              completed ? "border-primary bg-primary text-primary-foreground" : "border-input",
                            )}
                            aria-hidden="true"
                          >
                            {completed && <Check className="size-3" strokeWidth={3} />}
                          </span>
                          <span className="min-w-0 flex-1">{lesson.title}</span>
                          {completed && <span className="sr-only">({t.course.completed})</span>}
                        </>
                      );
                      return (
                        <li key={lesson.slug}>
                          {lesson.available ? (
                            <Link
                              ref={isActive ? activeRef : undefined}
                              href={localePath(locale, `/courses/${course.slug}/${lesson.slug}`)}
                              aria-current={isActive ? "page" : undefined}
                              className={cn(
                                "-ml-px flex min-h-9 items-center gap-2 border-l-2 border-transparent py-1.5 pl-3 pr-2 text-sm hover:bg-accent",
                                isActive ? "border-primary bg-primary/10 font-semibold text-primary" : "text-muted-foreground hover:text-foreground",
                              )}
                            >
                              {content}
                            </Link>
                          ) : (
                            <span className="flex min-h-9 items-center gap-2 py-1.5 pl-3 pr-2 text-sm text-muted-foreground/60" title={t.course.comingSoon}>
                              {content}
                            </span>
                          )}
                        </li>
                      );
                    })}
                  </ol>
                </div>
              )}
            </li>
          );
        })}
      </ul>
    </nav>
  );
}

export function Sidebar(props: SidebarProps) {
  const [open, setOpen] = React.useState(false);
  const pathname = usePathname();
  React.useEffect(() => setOpen(false), [pathname]);

  return (
    <>
      {/* desktop: sticky column */}
      <aside className="scrollbar-thin sticky top-[var(--header-height)] hidden h-[calc(100dvh-var(--header-height))] w-72 shrink-0 overflow-y-auto border-r lg:block xl:w-80">
        <SidebarNav {...props} />
      </aside>

      {/* mobile / tablet: a bar under the header opens the same navigation in a drawer */}
      <div className="sticky top-[var(--header-height)] z-30 border-b bg-background lg:hidden">
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <button type="button" className="flex h-11 w-full items-center gap-2 px-4 text-sm font-medium hover:bg-accent">
              <ListTree className="size-4 text-primary" aria-hidden="true" />
              {props.t.nav.courseMenu}
              <ChevronDown className="ml-auto size-4" aria-hidden="true" />
            </button>
          </DialogTrigger>
          <SheetContent closeLabel={props.t.nav.close} side="left">
            <div className="border-b px-4 py-3.5">
              <DialogTitle className="font-semibold">{props.t.nav.courseMenu}</DialogTitle>
              <DialogDescription className="sr-only">{props.module.title}</DialogDescription>
            </div>
            <div className="flex-1 overflow-y-auto">
              <SidebarNav {...props} />
            </div>
          </SheetContent>
        </Dialog>
      </div>
    </>
  );
}
