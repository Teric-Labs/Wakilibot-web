// Also ESM-only (see react-markdown.js mock) - never actually invoked since
// the ReactMarkdown mock ignores the remarkPlugins prop, but the real import
// would still fail to parse unless it's mocked too.
export default function remarkGfm() {}
