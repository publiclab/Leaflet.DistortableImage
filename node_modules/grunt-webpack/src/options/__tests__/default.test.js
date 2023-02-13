import { gruntOptions, mergeOptions } from "../default";

describe("default options", () => {
  describe("keepalive", () => {
    test("keepalive without watch", () => {
      expect(gruntOptions.keepalive({})).toBe(false);
    });

    test("keepalive with watch true", () => {
      expect(gruntOptions.keepalive({ watch: true })).toBe(true);
    });

    test("keepalive with watch false", () => {
      expect(gruntOptions.keepalive({ watch: false })).toBe(false);
    });

    test("keepalive without watch in array", () => {
      expect(gruntOptions.keepalive([{}])).toBe(false);
    });

    test("keepalive with watch true in array", () => {
      expect(gruntOptions.keepalive([{ watch: true }])).toBe(true);
    });

    test("keepalive with watch false in array", () => {
      expect(gruntOptions.keepalive([{ watch: false }])).toBe(false);
    });
  });

  describe("failOnError", () => {
    test("failOnError without watch", () => {
      expect(gruntOptions.failOnError({})).toBe(true);
    });

    test("failOnError with watch true", () => {
      expect(gruntOptions.failOnError({ watch: true })).toBe(false);
    });

    test("failOnError with watch false", () => {
      expect(gruntOptions.failOnError({ watch: false })).toBe(true);
    });

    test("failOnError without watch in array", () => {
      expect(gruntOptions.failOnError([{}])).toBe(true);
    });

    test("failOnError with watch true in array", () => {
      expect(gruntOptions.failOnError([{ watch: true }, {}])).toBe(false);
    });

    test("failOnError with watch false in array", () => {
      expect(gruntOptions.failOnError([{ watch: false }, {}, {}])).toBe(true);
    });
  });

  describe("mergeOptions", () => {
    test("all single objects", () => {
      expect(
        mergeOptions({ default: 1 }, { options: 1 }, { target: 1 }),
      ).toMatchSnapshot();
    });

    test("merges sub arrays", () => {
      expect(
        mergeOptions({ array: [1] }, { array: [2] }, { array: [3] }),
      ).toMatchSnapshot();
    });

    test("options as array", () => {
      expect(
        mergeOptions({ default: 1 }, [{ options1: 1 }, { options2: 1 }], {
          target: 1,
        }),
      ).toMatchSnapshot();
    });

    test("target as array", () => {
      expect(
        mergeOptions(
          { default: 1 },
          {
            options: 1,
          },
          [{ target1: 1 }, { target2: 1 }],
        ),
      ).toMatchSnapshot();
    });

    test("options and target as array", () => {
      expect(
        mergeOptions(
          { default: 1 },
          [{ options1: 1 }, { options2: 1 }],
          [{ target1: 1 }, { target2: 1 }],
        ),
      ).toMatchSnapshot();
    });

    test("fails on options and target as unequal array", () => {
      expect(() =>
        mergeOptions(
          { default: 1 },
          [{ options1: 1 }, { options2: 1 }, { options3: 1 }],
          [{ target1: 1 }, { target2: 1 }],
        ),
      ).toThrowError();
    });
  });
});
