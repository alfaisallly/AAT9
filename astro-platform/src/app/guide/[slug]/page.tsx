import Link from "next/link";
import { ChevronRight } from "lucide-react";
import PageHeader from "@/components/PageHeader";
import { getChapterBySlug, GUIDE_CHAPTERS } from "@/data/guide-content";
import { notFound } from "next/navigation";

export function generateStaticParams() {
  return GUIDE_CHAPTERS.map((c) => ({ slug: c.slug }));
}

export default function GuideChapterPage({
  params,
}: {
  params: { slug: string };
}) {
  const chapter = getChapterBySlug(params.slug);
  if (!chapter) notFound();

  const prev = GUIDE_CHAPTERS.find((c) => c.id === chapter.id - 1);
  const next = GUIDE_CHAPTERS.find((c) => c.id === chapter.id + 1);

  return (
    <div className="max-w-3xl">
      <PageHeader title={chapter.title} description={chapter.subtitle} />

      <div className="space-y-6">
        {chapter.sections.map((section, i) => (
          <div key={i} className="card">
            <h2 className="mb-3 text-lg font-semibold text-indigo-300">
              {section.title}
            </h2>
            <div className="space-y-2 whitespace-pre-line text-sm leading-7 text-[var(--foreground)]">
              {section.content.split("\n\n").map((para, j) => (
                <p key={j}>
                  {para.split("**").map((part, k) =>
                    k % 2 === 1 ? (
                      <strong key={k} className="text-white">
                        {part}
                      </strong>
                    ) : (
                      part
                    )
                  )}
                </p>
              ))}
            </div>
          </div>
        ))}
      </div>

      <div className="mt-8 flex justify-between gap-4">
        {prev ? (
          <Link href={`/guide/${prev.slug}`} className="btn-secondary flex items-center gap-2">
            <ChevronRight size={16} />
            {prev.title.replace(/^الفصل.*?— /, "")}
          </Link>
        ) : (
          <span />
        )}
        {next && (
          <Link href={`/guide/${next.slug}`} className="btn-primary flex items-center gap-2">
            {next.title.replace(/^الفصل.*?— /, "")}
            <ChevronRight size={16} className="rotate-180" />
          </Link>
        )}
      </div>
    </div>
  );
}
