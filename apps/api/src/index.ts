import { existsSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { config } from "dotenv";

const __dirname = dirname(fileURLToPath(import.meta.url));
const envPath = resolve(__dirname, "../.env");
if (existsSync(envPath)) config({ path: envPath });

const { default: Fastify } = await import("fastify");
const { default: rateLimit } = await import("@fastify/rate-limit");
const { eventRoutes } = await import("./routes/events.js");
const { feedbackRoutes } = await import("./routes/feedback.js");
const { productRoutes } = await import("./routes/products.js");

const app = Fastify({
	logger: true,
	trustProxy: true,
});

await app.register(rateLimit, {
	global: false,
});

app.get("/health", async () => {
	const mem = process.memoryUsage();
	return {
		status: "ok",
		uptime: process.uptime(),
		memory: {
			rss: Math.round(mem.rss / 1024 / 1024),
			heapUsed: Math.round(mem.heapUsed / 1024 / 1024),
			heapTotal: Math.round(mem.heapTotal / 1024 / 1024),
		},
	};
});

app.register(productRoutes);
app.register(eventRoutes);
app.register(feedbackRoutes);

const port = Number(process.env.PORT) || 3001;

app.listen({ port, host: "0.0.0.0" }, (err) => {
	if (err) {
		app.log.error(err);
		process.exit(1);
	}
});
