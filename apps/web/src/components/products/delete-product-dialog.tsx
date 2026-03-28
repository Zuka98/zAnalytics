"use client";

import type { Product } from "@zanalytics/db";
import { useState } from "react";
import { Button } from "@/components/shadcn/button";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
} from "@/components/shadcn/dialog";
import { deleteProduct } from "@/lib/actions/products";

interface DeleteProductDialogProps {
	product?: Product;
	open: boolean;
	onOpenChange: (open: boolean) => void;
}

export function DeleteProductDialog({
	product,
	open,
	onOpenChange,
}: DeleteProductDialogProps) {
	const [loading, setLoading] = useState(false);

	async function handleDelete() {
		if (!product) return;
		setLoading(true);

		await deleteProduct(product.id);

		setLoading(false);
		onOpenChange(false);
	}

	return (
		<Dialog open={open} onOpenChange={onOpenChange}>
			<DialogContent>
				<DialogHeader>
					<DialogTitle>Delete Product</DialogTitle>
					<DialogDescription>
						Are you sure you want to delete <strong>{product?.name}</strong>?
						This action cannot be undone.
					</DialogDescription>
				</DialogHeader>
				<DialogFooter>
					<Button
						type="button"
						variant="outline"
						onClick={() => onOpenChange(false)}
					>
						Cancel
					</Button>
					<Button
						variant="destructive"
						onClick={handleDelete}
						disabled={loading}
					>
						{loading ? "Deleting..." : "Delete"}
					</Button>
				</DialogFooter>
			</DialogContent>
		</Dialog>
	);
}
