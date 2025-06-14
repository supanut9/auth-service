import { Children, Html } from '@kitajs/html';

interface LayoutProps {
  children: Children;
  title?: string;
}

const Layout = ({ children, title = 'My Elysia App' }: LayoutProps) => (
  <html>
    <head>
      <meta charset='UTF-8' />
      <meta
        name='viewport'
        content='width=device-width, initial-scale=1.0'
      />
      <title>{title}</title>
      <link
        href='/styles.css'
        rel='stylesheet'
      />

      <script src='https://unpkg.com/htmx.org@1.9.12'></script>
    </head>

    <body>{children}</body>
  </html>
);

export default Layout;
