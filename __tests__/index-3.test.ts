import { main } from "../index-3";

describe("index-3", () => {
  test("should run without throwing", async () => {
    await expect(main()).resolves.toBeTruthy();
  });
  test("should return the correct data", async () => {
    expect(await main()).toMatchInlineSnapshot(`
Object {
  "_tag": "Right",
  "right": Object {
    "gists": Array [
      "desc-3",
      "desc-4",
      "desc-3",
      "desc-4",
    ],
    "repos": Array [
      "full-name-1",
      "full-name-2",
      "full-name-1",
      "full-name-2",
    ],
  },
}
`);
  });
});
