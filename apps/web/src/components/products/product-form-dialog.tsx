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
import { Input } from "@/components/shadcn/input";
import { Label } from "@/components/shadcn/label";
import { createProduct, updateProduct } from "@/lib/actions/products";

interface ProductFormDialogProps {
	mode: "create" | "edit";
	product?: Product;
	open: boolean;
	onOpenChange: (open: boolean) => void;
}

export function ProductFormDialog({
	mode,
	product,
	open,
	onOpenChange,
}: ProductFormDialogProps) {
	const [error, setError] = useState<string | null>(null);
	const [loading, setLoading] = useState(false);

	async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
		e.preventDefault();
		setError(null);
		setLoading(true);

		const formData = new FormData(e.currentTarget);

		const result =
			mode === "edit" && product
				? await updateProduct(product.id, formData)
				: await createProduct(formData);

		if (result.error) {
			setError(result.error);
			setLoading(false);
			return;
		}

		setLoading(false);
		onOpenChange(false);
	}

	return (
		<Dialog open={open} onOpenChange={onOpenChange}>
			<DialogContent>
				<DialogHeader>
					<DialogTitle>
						{mode === "edit" ? "Edit Product" : "Add Product"}
					</DialogTitle>
					<DialogDescription>
						{mode === "edit"
							? "Update the product details."
							: "Add a new product to track."}
					</DialogDescription>
				</DialogHeader>
				<form onSubmit={handleSubmit} className="space-y-4">
					<div className="space-y-2">
						<Label htmlFor="name">Name</Label>
						<Input
							id="name"
							name="name"
							required
							defaultValue={product?.name ?? ""}
							placeholder="My Extension"
						/>
					</div>
					<div className="space-y-2">
						<Label htmlFor="key">Key</Label>
						<Input
							id="key"
							name="key"
							required
							defaultValue={product?.key ?? ""}
							placeholder="my-extension"
						/>
						<p className="text-xs text-muted-foreground">
							Lowercase alphanumeric with hyphens. Used as the SDK identifier.
						</p>
					</div>
					<div className="space-y-2">
						<Label htmlFor="platform">Platform</Label>
						<Input
							id="platform"
							name="platform"
							defaultValue={product?.platform ?? "chrome"}
							placeholder="chrome"
						/>
					</div>
					{error && <p className="text-sm text-destructive">{error}</p>}
					<DialogFooter>
						<Button
							type="button"
							variant="outline"
							onClick={() => onOpenChange(false)}
						>
							Cancel
						</Button>
						<Button type="submit" disabled={loading}>
							{loading
								? "Saving..."
								: mode === "edit"
									? "Save Changes"
									: "Add Product"}
						</Button>
					</DialogFooter>
				</form>
			</DialogContent>
		</Dialog>
	);
}
