import { main } from "./index-3";
import { startServer } from "./msw/nodeServer";

startServer().listen();

main();
