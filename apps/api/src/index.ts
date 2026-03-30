import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { config } from "dotenv";

const __dirname = dirname(fileURLToPath(import.meta.url));
config({ path: resolve(__dirname, "../.env") });

const { default: Fastify } = await import("fastify");
const { eventRoutes } = await import("./routes/events.js");
const { feedbackRoutes } = await import("./routes/feedback.js");
const { productRoutes } = await import("./routes/products.js");

const app = Fastify({ logger: true });

app.register(productRoutes);
app.register(eventRoutes);
app.register(feedbackRoutes);

app.listen({ port: 3001, host: "0.0.0.0" }, (err) => {
	if (err) {
		app.log.error(err);
		process.exit(1);
	}
});
