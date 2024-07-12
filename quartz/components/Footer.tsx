import { QuartzComponent, QuartzComponentConstructor, QuartzComponentProps } from "./types"
import style from "./styles/footer.scss"
import { Pagination } from './Pagination'
import { version } from "../../package.json"
import { i18n } from "../i18n"

interface Options {
  links: Record<string, string>
  pagination: boolean
}

const defaultOptions = {
  pagination: true,
}

export default ((userOpts?: Options) => {
  const opts = { ...userOpts, ...defaultOptions }
  const Footer: QuartzComponent = (props: QuartzComponentProps) => {
    const { displayClass, cfg } = props
    const year = new Date().getFullYear()
    const links = opts?.links ?? []
    return (
      <footer class={`${displayClass ?? ""}`}>
        {
          opts.pagination ? <Pagination {...props} /> : null
        }
        <div class="footer-inner">
          <hr />
          <p>
            Pop-Up School © {year}
          </p>
          <ul>
            {Object.entries(links).map(([text, link]) => (
              <li>
                <a href={link}>{text}</a>
              </li>
            ))}
          </ul>
        </div>
      </footer>
    )
  }

  Footer.css = style + Pagination.css
  return Footer
}) satisfies QuartzComponentConstructor
