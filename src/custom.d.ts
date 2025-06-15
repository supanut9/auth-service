declare namespace JSX {
  interface IntrinsicElements {
    'iconify-icon': {
      icon: string;
      width?: string | number;
      height?: string | number;
      style?: string;
      // You can add any other supported attributes here
      [key: string]: any;
    };
  }
}
