// react-markdown v9+ ships ESM-only, which CRA's bundled Jest (CommonJS
// transform, node_modules untransformed by default) can't parse. Tests don't
// need real markdown rendering, just the message text to be on screen, so
// render children as plain text instead of pulling in the real ESM package.
import React from 'react';

const ReactMarkdown = ({ children }) => <>{children}</>;

export default ReactMarkdown;
