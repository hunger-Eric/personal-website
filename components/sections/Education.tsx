// components/sections/Education.tsx
import { education } from "../../config/education";
import { MapPin, Calendar } from "lucide-react";
import Image from "next/image";
import { getSiteCopy } from "@/config/contentCopy";
import { SectionHeader, Surface } from "@/components/system";

const copy = getSiteCopy("zh").education;

export function EducationSection() {
  if (!education.length) return null;

  return (
    <section id="education" className="py-16 scroll-mt-12 lg:py-24">
      <div className="mx-auto w-full max-w-6xl px-4">
        <SectionHeader eyebrow={copy.eyebrow} title={copy.title} />

        <div className="mt-8 space-y-4">
          {education.map((item) => {
            const cleanGpa = item.gpa ? item.gpa.split("/")[0].trim() : null;

            const courseworkText =
              item.coursework && item.coursework.length > 0
                ? item.coursework.join(", ")
                : "";

            const activitiesText =
              item.activities && item.activities.length > 0
                ? item.activities.join(", ")
                : "";

            const awardsText =
              item.awards && item.awards.length > 0
                ? item.awards.join(", ")
                : "";

            const hasStartOrEnd = Boolean(item.start || item.end);
            const hasImage = Boolean(item.imageUrl);

            return (
              <Surface
                as="article"
                key={item.id}
                tone="paper"
                className="group p-4 text-sm text-muted-foreground transition-transform transition-colors duration-200 hover:-translate-y-[1px] hover:border-accent sm:flex sm:gap-1 sm:text-base"
              >
                {hasImage && (
                  <div className="mb-3 flex justify-center sm:mb-0 sm:w-40 sm:flex-shrink-0 sm:block">
                    <Image
                      src={item.imageUrl as string}
                      alt={item.school}
                      width={160}
                      height={160}
                      className="h-16 w-16 rounded-control object-cover shadow-card transition-transform duration-300 ease-out group-hover:scale-105 sm:h-full sm:w-full"
                    />
                  </div>
                )}

                {hasImage && (
                  <div className="hidden sm:mx-1 sm:block sm:w-px sm:bg-border" />
                )}

                <div className="flex-1">
                  <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                    <div>
                      <h4 className="text-lg font-semibold text-foreground sm:text-xl">
                        {item.school}
                      </h4>
                      <p className="text-xs text-muted-foreground sm:text-sm">
                        {item.degree}
                        {item.major ? `, ${item.major}` : ""}
                        {item.minor ? `, ${copy.minorPrefix} ${item.minor}` : ""}
                        {cleanGpa && ` · ${copy.gpaLabel}: ${cleanGpa}`}
                      </p>
                    </div>

                    <div className="flex flex-col items-start gap-1 text-xs text-muted-foreground sm:items-end sm:text-sm">
                      {hasStartOrEnd && (
                        <div className="inline-flex items-center gap-1">
                          <Calendar className="h-3.5 w-3.5" />
                          <span>
                            {item.start &&
                              item.end &&
                              `${item.start} - ${item.end}`}
                            {item.start && !item.end && item.start}
                            {!item.start && item.end && item.end}
                            {item.expectedGraduation &&
                              ` · ${copy.expectedPrefix} ${item.expectedGraduation}`}
                          </span>
                        </div>
                      )}

                      {!hasStartOrEnd && item.expectedGraduation && (
                        <div className="inline-flex items-center gap-1">
                          <Calendar className="h-3.5 w-3.5" />
                          <span>
                            {copy.expectedGraduationLabel}: {item.expectedGraduation}
                          </span>
                        </div>
                      )}

                      {item.location && (
                        <div className="inline-flex items-center gap-1">
                          <MapPin className="h-3.5 w-3.5" />
                          <span>{item.location}</span>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="mt-4 space-y-2 text-xs text-muted-foreground sm:text-sm">
                    {awardsText && (
                      <p>
                        <span className="font-medium text-foreground">
                          {copy.awardsLabel}:
                        </span>{" "}
                        {awardsText}
                      </p>
                    )}

                    {activitiesText && (
                      <p>
                        <span className="font-medium text-foreground">
                          {copy.activitiesLabel}:
                        </span>{" "}
                        {activitiesText}
                      </p>
                    )}

                    {courseworkText && (
                      <p>
                        <span className="font-medium text-foreground">
                          {copy.courseworkLabel}:
                        </span>{" "}
                        {courseworkText}
                      </p>
                    )}
                  </div>
                </div>
              </Surface>
            );
          })}
        </div>
      </div>
    </section>
  );
}
