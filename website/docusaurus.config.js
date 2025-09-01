import { themes as prismThemes } from "prism-react-renderer";

/** @type {import('@docusaurus/types').Config} */
const config = {
  title: "Piksel",
  tagline:
    "Piksel brings together satellite imagery and cloud computing technology to enable digital earth observation across the Indonesian region",
  favicon: "img/piksel-logo.ico",
  url: "https://staging.pik-sel.id",
  baseUrl: "/",
  organizationName: "piksel-ina",
  projectName: "piksel-documentation",
  trailingSlash: false,

  onBrokenLinks: "warn",
  onBrokenMarkdownLinks: "warn",

  i18n: {
    defaultLocale: "en",
    locales: ["en", "id"],
    localeConfigs: {
      id: {
        label: "Indonesia",
        direction: "ltr",
        htmlLang: "id-ID",
      },
      en: {
        label: "English",
        direction: "ltr",
        htmlLang: "en-US",
      },
    },
  },

  presets: [
    [
      "classic",
      /** @type {import('@docusaurus/preset-classic').Options} */
      ({
        docs: {
          sidebarPath: "./sidebars.js",
          editUrl: "https://github.com/piksel-ina/piksel-documentation",
        },
        blog: {
          showReadingTime: true,
          feedOptions: {
            type: ["rss", "atom"],
            xslt: true,
          },
          editUrl: "https://github.com/piksel-ina/piksel-documentation",
          onInlineTags: "warn",
          onInlineAuthors: "warn",
          onUntruncatedBlogPosts: "warn",
        },
        theme: {
          customCss: "./src/css/custom.css",
        },
      }),
    ],
  ],

  stylesheets: [
    {
      href: "https://fonts.googleapis.com/css2?family=Open+Sans:ital,wght@0,300..800;1,300..800&family=Oswald:wght@200..700&display=swap",
      type: "text/css",
    },
  ],

  headTags: [
    {
      tagName: "link",
      attributes: {
        rel: "preconnect",
        href: "https://fonts.googleapis.com",
      },
    },
    {
      tagName: "link",
      attributes: {
        rel: "preconnect",
        href: "https://fonts.gstatic.com",
        crossorigin: "anonymous",
      },
    },
  ],

  themeConfig:
    /** @type {import('@docusaurus/preset-classic').ThemeConfig} */
    ({
      image: "img/piksel-logo.svg",
      navbar: {
        title: "PIKSEL",
        logo: {
          alt: "Piksel Logo",
          src: "img/piksel-logo.svg",
        },
        items: [
          {
            type: "docSidebar",
            sidebarId: "tutorialSidebar",
            position: "left",
            label: "Documentation",
          },
          { to: "/blog", label: "Blog", position: "left" },
          {
            type: "localeDropdown",
            position: "right",
          },
        ],
      },
      footer: {
        style: "dark",
        links: [
          {
            title: "Services",
            items: [
              {
                label: "Piksel Map",
                to: "/map",
              },
              {
                label: "Piksel Sandbox",
                to: "/sandbox",
              },
              {
                label: "Piksel Data API",
                to: "/api",
              },
              {
                label: "Piksel Workflows",
                to: "/workflows",
              },
            ],
          },
          {
            title: "Use Cases",
            items: [
              {
                label: "Environment",
                to: "/environment",
              },
              {
                label: "Technology",
                to: "/technology",
              },
              {
                label: "Research",
                to: "/research",
              },
            ],
          },
          {
            title: "Resources",
            items: [
              {
                label: "Documentation",
                to: "/docs",
              },
              {
                label: "API Reference",
                to: "/docs/api",
              },
              {
                label: "Tutorials",
                to: "/docs/tutorials",
              },
              {
                label: "Blog",
                to: "/blog",
              },
              {
                label: "Github",
                href: "https://github.com/piksel-ina/piksel-documentation",
              },
            ],
          },
          {
            title: "Contact",
            items: [
              {
                label: "Email: piksel@big.go.id",
                href: "mailto:piksel@big.go.id",
              },
              {
                label: "Phone: 021-8752062",
                href: "tel:+62218752062",
              },
              {
                label: "BIG Indonesia",
                href: "https://www.big.go.id",
              },
            ],
          },
        ],
        copyright: `
    <div style="text-align: left; margin-top: 35px;">
      <div>Copyright © ${new Date().getFullYear()} Piksel Indonesia - Badan Informasi Geospasial (BIG)</div>
      <div style="font-size: 0.8em; margin-top: 8px; color: #888;">
        Jl. Raya Jakarta - Bogor KM. 46 Cibinong 16911, Indonesia<br/>
        Tel: 021-8752062 ext.3608/3611/3103
      </div>
    </div>
  `,
      },
      prism: {
        theme: prismThemes.github,
        darkTheme: prismThemes.dracula,
      },
    }),
};

export default config;
