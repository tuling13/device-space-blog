import BlogTheme from '@sugarat/theme'
import './style.css'

export default {
  ...BlogTheme,
  enhanceApp(ctx) {
    BlogTheme?.enhanceApp?.(ctx)
  },
}
