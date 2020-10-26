import { gruntOptions } from "../default";

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
});
