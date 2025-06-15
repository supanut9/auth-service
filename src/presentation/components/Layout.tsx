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
        rel='icon'
        href='/public/favicon.ico'
        type='image/x-icon'
      />
      <script src='https://code.iconify.design/iconify-icon/2.1.0/iconify-icon.min.js'></script>
    </head>

    <body>{children}</body>
  </html>
);

export default Layout;
