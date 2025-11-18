declare module '*.svg' {
  import * as React from 'react';
  const ReactComponent: React.ComponentType<React.SVGProps<SVGSVGElement>>;
  export default ReactComponent;
}
