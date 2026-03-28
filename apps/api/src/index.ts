import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { config } from "dotenv";

const __dirname = dirname(fileURLToPath(import.meta.url));
config({ path: resolve(__dirname, "../../../.env") });

import Fastify from "fastify";
import { productRoutes } from "./routes/products.js";
import { eventRoutes } from "./routes/events.js";

const app = Fastify({ logger: true });

app.register(productRoutes);
app.register(eventRoutes);

app.listen({ port: 3001, host: "0.0.0.0" }, (err) => {
	if (err) {
		app.log.error(err);
		process.exit(1);
	}
});
