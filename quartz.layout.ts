import { PageLayout, SharedLayout } from "./quartz/cfg"
import * as Component from "./quartz/components"

function truncate(str: string, n: number) {
  return str.length > n ? str.slice(0, n - 1) + ".." : str
}

const explorerConfig: Parameters<typeof Component.Explorer>[0] = {
  folderClickBehavior: "collapse",
  sortFn: (a, b) => {
    if (Number(a.file?.frontmatter?.order) < Number(b.file?.frontmatter?.order)) {
      return -1
    } else {
      return 0
    }
  },
  mapFn: (node) => {
    if (node.file) {
      node.displayName = truncate(node.displayName, 25)
    }
  },
}

// components shared across all pages
export const sharedPageComponents: SharedLayout = {
  head: Component.Head(),
  header: [],
  footer: Component.Footer({
    links: {
      Substack: "https://bonnittaroy.substack.com/",
    },
  }),
}

// components for pages that display a single page (e.g. a single note)
export const defaultContentPageLayout: PageLayout = {
  beforeBody: [
    Component.Breadcrumbs(),
    Component.ArticleTitle(),
    Component.ContentMeta(),
    Component.TagList(),
  ],
  left: [
    Component.PageTitle(),
    Component.MobileOnly(Component.Spacer()),
    Component.Search(),
    Component.Darkmode(),
    Component.DesktopOnly(Component.Explorer(explorerConfig)),
  ],
  right: [
    // Component.Graph(),
    Component.DesktopOnly(Component.TableOfContents()),
    Component.Backlinks(),
  ],
}

// components for pages that display lists of pages  (e.g. tags or folders)
export const defaultListPageLayout: PageLayout = {
  beforeBody: [Component.Breadcrumbs(), Component.ArticleTitle(), Component.ContentMeta()],
  left: [
    Component.PageTitle(),
    Component.MobileOnly(Component.Spacer()),
    Component.Search(),
    Component.Darkmode(),
    Component.DesktopOnly(Component.Explorer(explorerConfig)),
  ],
  right: [],
}
