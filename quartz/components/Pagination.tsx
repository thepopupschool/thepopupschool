import { QuartzComponent, QuartzComponentProps } from "./types"
import { resolveRelative } from "../util/path"
import { byDateAndAlphabetical } from "./PageList"

type Link = {
  type: 'link';
  label: string;
  href: string;
  isCurrent: boolean;
  attrs: Record<string, string | number | boolean | undefined>;
}
type PrevNextLinkConfig = undefined | boolean | string | Partial<{ link: string, label: string }>

function makeLink(
  href: string,
  label: string,
  currentPathname: string,
  attrs?: Record<string, string | number | boolean | undefined>
): Link {
  const isCurrent = encodeURI(href) === currentPathname
  return { type: 'link', label, href, isCurrent, attrs: attrs ?? {} };
}

function applyPrevNextLinkConfig(
  link: Link | undefined,
  paginationEnabled: boolean,
  config: PrevNextLinkConfig
): Link | undefined {

  // Explicitly remove the link.
  if (config === false) return undefined;
  // Use the generated link if any.
  else if (config === true) return link;
  // If a link exists, update its label if needed.
  else if (typeof config === 'string' && link) {
    return { ...link, label: config };
  } else if (typeof config === 'object') {
    if (link) {
      // If a link exists, update both its label and href if needed.
      return {
        ...link,
        label: config.label ?? link.label,
        href: config.link ?? link.href,
        // Explicitly remove sidebar link attributes for prev/next links.
        attrs: {},
      };
    } else if (config.link && config.label) {
      // If there is no link and the frontmatter contains both a URL and a label,
      // create a new link.
      return makeLink(config.link, config.label, '');
    }
  }
  // Otherwise, if the global config is enabled, return the generated link if any.
  return paginationEnabled ? link : undefined;



}

type Props = {
  limit?: number
} & QuartzComponentProps

export const Pagination: QuartzComponent = (props: Props) => {
  const { fileData, allFiles, cfg } = props

  let list = allFiles.sort(byDateAndAlphabetical(cfg)).reverse().map(file => {
    return makeLink(
      resolveRelative(fileData.slug!, file.slug!),
      file.frontmatter?.title ?? file.filePath?.slice(-1) ?? "no label",
      resolveRelative(fileData.slug!, fileData.slug!),
    )
  })

  const currentIndex = list.findIndex((entry) => entry.isCurrent);

  const prev = applyPrevNextLinkConfig(list[currentIndex - 1], true, fileData.frontmatter?.prev);
  const next = applyPrevNextLinkConfig(
    currentIndex > -1 ? list[currentIndex + 1] : undefined,
    true,
    fileData.frontmatter?.next
  );

  return <div class="pagination-links">
    { prev && (
      <a href={prev.href} rel="prev">
        <span>
          Previous
          <br />
          <span class="link-title">{prev.label}</span>
        </span>
      </a>
    )}
    { next && (
    <a href={next.href} rel="next">
      <span>
        Next
        <br />
        <span class="link-title">{next.label}</span>
      </span>
    </a>
    )}
  </div>
}

Pagination.css = `
.pagination-links {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(min(18rem, 100%), 1fr));
    gap: 1rem;
  }

.pagination-links a {
  display: flex;
  align-items: center;
  justify-content: flex-start;
  gap: 0.5rem;
  flex-basis: calc(50% - 0.5rem);
  flex-grow: 1;
  border: 1px solid var(--gray);
  border-radius: 0.5rem;
  padding: 1rem;
  text-decoration: none;
  color: var(--darkgray);
  box-shadow: var(--gray);
  overflow-wrap: anywhere;
}
.pagination-links [rel='next'] {
  justify-content: end;
  text-align: end;
  flex-direction: row-reverse;
}
.pagination-links a:hover {
  border-color: var(--gray);
}

.link-title {
  color: var(--dark);
  font-size: 1.5rem;
  font-weight: normal;
}

.pagination-links svg {
  flex-shrink: 0;
}
`
