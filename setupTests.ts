import { startServer } from "./msw/nodeServer";
import { shadowConsole } from "./testUtils";

const server = startServer();
let unshadowConsole = () => {};

beforeAll(() => {
  unshadowConsole = shadowConsole("log");
  server.listen();
});

afterAll(() => {
  server.close();
  unshadowConsole();
});
