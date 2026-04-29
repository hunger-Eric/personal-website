// components/mdx/MdxRenderer.tsx
// Server component that compiles MDX with syntax highlighting + custom components.
import { MDXRemote } from "next-mdx-remote/rsc";
import remarkGfm from "remark-gfm";
import rehypePrettyCode from "rehype-pretty-code";
import rehypeSanitize from "rehype-sanitize";
import rehypeSlug from "rehype-slug";

import { mdxComponents } from "./MdxComponents";

const PROSE_CLASSES = [
  "prose prose-invert prose-lg max-w-none",
  "prose-headings:font-semibold prose-headings:tracking-tight",
  "prose-h2:mt-10 prose-h2:text-2xl",
  "prose-h3:mt-8 prose-h3:text-xl",
  "prose-p:text-muted-foreground prose-p:leading-relaxed",
  "prose-a:text-accent prose-a:no-underline hover:prose-a:underline",
  // inline code
  "prose-code:rounded prose-code:bg-white/10 prose-code:px-1.5 prose-code:py-0.5",
  "prose-code:font-normal prose-code:before:content-none prose-code:after:content-none",
  // pre/code blocks (rehype-pretty-code adds its own background)
  "prose-pre:rounded-xl prose-pre:border prose-pre:border-white/10 prose-pre:bg-[#0d1117] prose-pre:p-0",
  "prose-img:rounded-xl prose-img:border prose-img:border-white/10",
  "prose-blockquote:border-l-accent prose-blockquote:text-muted-foreground",
  "prose-strong:text-foreground",
  "prose-ul:text-muted-foreground prose-ol:text-muted-foreground",
  "prose-li:marker:text-muted-foreground",
  // pretty code line decorations
  "[&_pre]:overflow-x-auto [&_pre>code]:block [&_pre>code]:p-4 [&_pre>code]:font-mono [&_pre>code]:text-[14px] [&_pre>code]:leading-6",
  "[&_code[data-line-numbers]>[data-line]]:relative [&_code[data-line-numbers]>[data-line]]:pl-8",
  "[&_code[data-line-numbers]>[data-line]]:before:absolute [&_code[data-line-numbers]>[data-line]]:before:left-0 [&_code[data-line-numbers]>[data-line]]:before:w-6 [&_code[data-line-numbers]>[data-line]]:before:text-right [&_code[data-line-numbers]>[data-line]]:before:text-muted-foreground/60 [&_code[data-line-numbers]>[data-line]]:before:content-[counter(line)]",
  "[&_code[data-line-numbers]]:[counter-reset:line]",
  "[&_code[data-line-numbers]>[data-line]]:[counter-increment:line]",
].join(" ");

const prettyCodeOptions = {
  // GitHub Dark mirrors the prose-pre bg of #0d1117
  theme: "github-dark-default",
  keepBackground: false,
  defaultLang: "plaintext",
} as const;

export async function MdxRenderer({ source }: { source: string }) {
  return (
    <div className={PROSE_CLASSES}>
      <MDXRemote
        source={source}
        components={mdxComponents}
        options={{
          parseFrontmatter: false,
          mdxOptions: {
            remarkPlugins: [remarkGfm],
            // Order matters: sanitize runs FIRST so any raw HTML embedded in
            // an article is cleaned, but rehype-slug and rehype-pretty-code
            // add their (trusted) attributes AFTERWARDS so syntax-highlighting
            // styles and heading IDs aren't stripped. JSX components from MDX
            // are not part of the HAST tree sanitize sees.
            rehypePlugins: [
              rehypeSanitize,
              rehypeSlug,
              [rehypePrettyCode, prettyCodeOptions],
            ],
          },
        }}
      />
    </div>
  );
}
