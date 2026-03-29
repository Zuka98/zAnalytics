import { ProductPageHeader } from "@/components/products/product-page-header";
import { ProductTable } from "@/components/products/product-table";
import { getProducts } from "@/lib/actions/products";

export default async function ProductsPage() {
	const products = await getProducts();

	return (
		<div className="mx-auto max-w-4xl p-8">
			<ProductPageHeader />
			<ProductTable products={products} />
		</div>
	);
}
