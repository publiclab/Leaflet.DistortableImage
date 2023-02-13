import WebpackOptionHelper from "../WebpackOptionHelper";

describe("WebpackOptionHelper", () => {
  test("cache stays enabled in watch mode", () => {
    const options = { watch: true, cache: true };
    const helper = new WebpackOptionHelper();

    const result = helper.filterOptions(options);

    expect(result.cache).toBe(true);
  });

  test("cache is enabled in watch mode by default", () => {
    const options = { watch: true, cache: () => true };
    const helper = new WebpackOptionHelper();

    const result = helper.filterOptions(options);

    expect(result.cache).toBe(true);
  });

  test("cache is disabled in normal mode by default", () => {
    const options = { watch: false, cache: () => true };
    const helper = new WebpackOptionHelper();

    const result = helper.filterOptions(options);

    expect(result.cache).toBe(false);
  });

  test("cache is disabled in normal mode", () => {
    const options = { watch: false, cache: true };
    const helper = new WebpackOptionHelper();

    const result = helper.filterOptions(options);

    expect(result.cache).toBe(false);
  });

  test("watch options is part of webpack options", () => {
    const options = {
      watch: true,
      watchOptions: { aggregateTimeout: 300, poll: 1000 },
    };
    const helper = new WebpackOptionHelper();

    helper.getOptions = () => options;

    const result = helper.getWebpackOptions();

    expect(result).toEqual({
      watchOptions: { aggregateTimeout: 300, poll: 1000 },
    });
  });
});
