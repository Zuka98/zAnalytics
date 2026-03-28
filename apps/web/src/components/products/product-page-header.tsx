"use client";

import { Plus } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/shadcn/button";
import { ProductFormDialog } from "./product-form-dialog";

export function ProductPageHeader() {
	const [open, setOpen] = useState(false);

	return (
		<div className="mb-6 flex items-center justify-between">
			<h1 className="text-2xl font-bold">Products</h1>
			<Button onClick={() => setOpen(true)}>
				<Plus className="mr-2 size-4" />
				Add Product
			</Button>
			<ProductFormDialog mode="create" open={open} onOpenChange={setOpen} />
		</div>
	);
}
