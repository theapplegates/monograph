// Test guard: a build must never resolve or load Sharp.
import { registerHooks } from "node:module";
registerHooks({
  resolve(specifier, context, nextResolve) {
    if (specifier === "sharp" || /(?:^|\/)sharp(?:\/|$)/.test(specifier)) {
      throw new Error(`Forbidden Sharp dependency: ${specifier}`);
    }
    return nextResolve(specifier, context);
  },
});
