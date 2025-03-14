import { PageLayout, SharedLayout } from "./quartz/cfg"
import * as Component from "./quartz/components"

function truncate(str: string, n: number) {
  return str.length > n ? str.slice(0, n - 1) + ".." : str
}

const explorerConfig: Parameters<typeof Component.Explorer>[0] = {
  folderClickBehavior: "link",
  sortFn: (a, b) => {
    const aDate = a.file?.dates?.created ?? a.dates?.created
    const bDate = b.file?.dates?.created ?? b.dates?.created
    if (aDate && bDate) {
      return aDate?.getTime() - bDate?.getTime()
    }
    return 0
  },
  filterFn: (node) => {
    if (node.file?.slug?.startsWith("tags")) {
      //return ["community-video"].includes(node.name)
    }
    return true
  },
  mapFn: (node) => {
    if (node.file) {
      //node.displayName = truncate(node.displayName, 25)
    }
  },
}

// components shared across all pages
export const sharedPageComponents: SharedLayout = {
  head: Component.Head(),
  header: [],
  afterBody: [
    Component.Pagination({}),
    Component.Comments({
      provider: 'giscus',
      options: {
        // from data-repo
        repo: 'thepopupschool/thepopupschool',
        // from data-repo-id
        repoId: 'R_kgDONPdMVg',
        // from data-category
        category: 'Courses',
        // from data-category-id
        categoryId: 'DIC_kwDONPdMVs4CkRnl',
        mapping: "pathname",
        strict: true,
        reactionsEnabled: false,
        // themeUrl: "https://thepopupschool.org/static/giscus",
        themeUrl: "https://giscus.app/themes",
        lightTheme: "light",
        darkTheme: "dark",
      }
    }),
  ],
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
    Component.Graph(),
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
