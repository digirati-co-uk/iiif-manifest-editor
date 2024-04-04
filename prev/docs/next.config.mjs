import remarkInlineLinks from 'remark-inline-links';
import remarkWikiLinks from 'remark-wiki-link';
import nextra from 'nextra';

const withNextra = nextra({
  theme: 'nextra-theme-docs',
  themeConfig: './theme.config.tsx',
  mdxOptions: {
    remarkPlugins: [
        remarkInlineLinks,
      [remarkWikiLinks, {
          // aliasDivider: '|',
          pageResolver: (name) => {
              if (name.includes('|')) {
                  const parts = name.split('|');
                  return parts.map(
                     part => part.replace(/ /g, '-')
                  ).reverse()
              }
              return [name.replace(/ /g, '-')];
          },
          hrefTemplate: (permalink) => `./${permalink}`,

      }]
    ]
  }
})

export default withNextra()
