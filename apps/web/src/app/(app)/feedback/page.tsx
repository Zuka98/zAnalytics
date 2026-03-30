import { Suspense } from "react";
import { FeedbackControls } from "@/components/dashboard/feedback-controls";
import { FeedbackTable } from "@/components/dashboard/feedback-table";
import { getAllFeedback, getFeedbackProducts } from "@/lib/queries/feedback";

const PAGE_SIZES = [10, 25, 50] as const;

function parseSearchParams(sp: Record<string, string | undefined>) {
	const type = sp.fbType ?? null;
	const status = sp.fbStatus ?? null;
	const productId = sp.fbProduct ?? null;
	const pageSize = PAGE_SIZES.includes(
		Number(sp.fbPageSize) as (typeof PAGE_SIZES)[number],
	)
		? Number(sp.fbPageSize)
		: 25;
	const page = Math.max(1, Number(sp.fbPage) || 1);
	return { type, status, productId, pageSize, page };
}

export default async function FeedbackPage({
	searchParams,
}: {
	searchParams: Promise<Record<string, string | undefined>>;
}) {
	const sp = await searchParams;
	const { type, status, productId, pageSize, page } = parseSearchParams(sp);

	const [{ rows, total }, feedbackProducts] = await Promise.all([
		getAllFeedback({
			productId,
			type,
			status,
			limit: pageSize,
			offset: (page - 1) * pageSize,
		}),
		getFeedbackProducts(),
	]);

	return (
		<div className="mx-auto max-w-5xl p-8">
			<h1 className="mb-6 text-2xl font-semibold tracking-tight">Feedback</h1>

			<Suspense>
				<FeedbackControls
					currentType={type}
					currentStatus={status}
					currentPageSize={pageSize}
					currentPage={page}
					totalFeedback={total}
					products={feedbackProducts}
					currentProductId={productId}
				/>
			</Suspense>

			<div className="mt-4">
				<FeedbackTable rows={rows} showProduct />
			</div>
		</div>
	);
}
