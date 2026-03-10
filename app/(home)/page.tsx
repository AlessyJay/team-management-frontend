"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { CreateProjectSheet } from "@/components/projects/create-project-sheet";
import {
  getAllProjects,
  getRecentlyViewed,
  recordProjectView,
} from "@/queries/project.query";
import { Projects } from "@/types/home.types";
import { CardSkeleton } from "@/components/home/card-skeleton";
import { Section } from "@/components/home/section-wrapper";
import { isUrgent } from "@/components/home/get-urgent";
import { isNewForMe } from "@/components/home/is-new";
import { ProjectCard } from "@/components/home/project-card";

// Home page
const Home = () => {
  const router = useRouter();

  const { data: projects = [], isLoading: loadingProjects } = useQuery<
    Projects[]
  >({
    queryKey: ["projects"],
    queryFn: getAllProjects,
  });

  const { data: recentlyViewed = [], isLoading: loadingRecent } = useQuery<
    Projects[]
  >({
    queryKey: ["projects", "recently-viewed"],
    queryFn: getRecentlyViewed,
  });

  const handleCardClick = (id: string) => {
    recordProjectView(id);
    router.push(`/projects/${id}`);
  };

  if (loadingProjects) {
    return (
      <div className="flex flex-col gap-8">
        <div className="flex flex-col gap-3">
          <Skeleton className="h-3 w-24" />
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 3 }).map((_, i) => (
              <CardSkeleton key={i} />
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (projects.length === 0) {
    return (
      <div className="flex min-h-0 flex-1 flex-col items-center justify-center">
        <Image
          src="/Dabie-start-transparent.png"
          alt="No projects yet"
          width={550}
          height={550}
          priority
          className="object-contain"
        />
        <h1 className="mb-6 text-base md:text-lg lg:text-2xl">
          There is no project created yet.
        </h1>
        <CreateProjectSheet
          trigger={
            <Button className="text-base md:text-lg">
              Create your first project
            </Button>
          }
        />
      </div>
    );
  }

  // Derived categories
  const urgentProjects = projects.filter(isUrgent);
  const newForMe = projects.filter(isNewForMe);
  const allAlpha = [...projects].sort((a, b) => a.name.localeCompare(b.name));
  const hasRecent = recentlyViewed.length > 0;

  return (
    <div className="flex flex-col gap-10">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-mono text-lg font-semibold tracking-tight text-white">
            Projects
          </h1>
          <p className="mt-0.5 font-mono text-xs text-zinc-500">
            {projects.length} project{projects.length !== 1 ? "s" : ""}
          </p>
        </div>
        <CreateProjectSheet
          trigger={
            <Button size="sm" variant="outline" className="font-mono text-xs">
              + New project
            </Button>
          }
        />
      </div>

      {/* Recently Viewed */}
      {!loadingRecent && hasRecent && (
        <Section
          title="Recently Viewed"
          subtitle={`${recentlyViewed.length} projects`}
        >
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {recentlyViewed.slice(0, 4).map((p) => (
              <ProjectCard
                key={p.id}
                item={p}
                compact
                onClick={handleCardClick}
              />
            ))}
          </div>
        </Section>
      )}

      {/* Urgent */}
      {urgentProjects.length > 0 && (
        <Section title="⚡ Urgent" subtitle="needs attention">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {urgentProjects.map((p) => (
              <ProjectCard key={p.id} item={p} onClick={handleCardClick} />
            ))}
          </div>
        </Section>
      )}

      {/* New for You */}
      {newForMe.length > 0 && (
        <Section title="New for You" subtitle="joined in the last 14 days">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {newForMe.map((p) => (
              <ProjectCard key={p.id} item={p} onClick={handleCardClick} />
            ))}
          </div>
        </Section>
      )}

      {/* All Projects A → Z */}
      <Section title="All Projects" subtitle="A → Z">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {allAlpha.map((p) => (
            <ProjectCard key={p.id} item={p} onClick={handleCardClick} />
          ))}
        </div>
      </Section>
    </div>
  );
};

export default Home;
