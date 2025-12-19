The vite dev server serving the user's Chef-generated app responds to both
HTTP and HMR WebSocket traffic.

We proxy this traffic for previews so that different domains can be used
to simulate different users, since different domains -> different cookies.

I couldn't get WebContainers to accept connections on different ports for
HTTP and WebSockets (although Vite is easy to configure to do this) so
we also need to proxy WebSocket traffic.

The Node.js in WebContainers does not support reading from stdin.
WebContainer.writeFile() seems incapable of writing to /tmp/foo
so it's ideal to use `node -e 'the(proxy); code()'` or
`echo 'the(proxy); code() > /tmp/proxy.cjs'`.

Writing a very short proxy that works with WebSockets should be easy
(TODO) but I couldn't get it to work. So we bundle up a simple proxy server
built with node-http-proxy aka http-proxy.

## Error Handling

The proxy implements robust error handling to prevent 502 Bad Gateway errors:

- Checks if the response object is writable before attempting to write to it
- Verifies headers haven't been sent before trying to send error response
- Wraps all response operations in try-catch blocks to prevent crashes
- Provides informative error messages for debugging
- Handles edge cases where headers are already sent but response is still writable

When errors occur (e.g., target server not responding, connection issues), the proxy
returns a 502 status with a descriptive error message instead of crashing or leaving
connections hanging.
