const SUPPORTED_ENGINES = new Set(["google", "bing", "baidu", "sogou"]);

export function parseSearchUpdateArguments(argv) {
  const urls = [];
  const engines = [];
  let submit = false;

  for (let index = 0; index < argv.length; index += 1) {
    const argument = argv[index];
    if (argument === "--url" && argv[index + 1]) {
      urls.push(argv[index + 1]);
      index += 1;
    } else if (argument === "--engine" && argv[index + 1]) {
      const engine = argv[index + 1].toLowerCase();
      if (!SUPPORTED_ENGINES.has(engine)) {
        throw new Error(`Unsupported search engine: ${argv[index + 1]}`);
      }
      engines.push(engine);
      index += 1;
    } else if (argument === "--submit") {
      submit = true;
    } else {
      throw new Error(`Unknown or incomplete argument: ${argument}`);
    }
  }

  return {
    submit,
    engines: [...new Set(engines)],
    urls: [...new Set(urls)],
  };
}
