"use client";

import type { Product } from "@zanalytics/db";
import { MoreHorizontal, Pencil, Trash2 } from "lucide-react";
import { useState } from "react";
import { Badge } from "@/components/shadcn/badge";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuTrigger,
} from "@/components/shadcn/dropdown-menu";
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from "@/components/shadcn/table";
import { DeleteProductDialog } from "./delete-product-dialog";
import { ProductFormDialog } from "./product-form-dialog";

export function ProductTable({ products }: { products: Product[] }) {
	const [editProduct, setEditProduct] = useState<Product | null>(null);
	const [deleteProduct, setDeleteProduct] = useState<Product | null>(null);

	if (products.length === 0) {
		return (
			<p className="py-8 text-center text-sm text-muted-foreground">
				No products yet. Add one to get started.
			</p>
		);
	}

	return (
		<>
			<Table>
				<TableHeader>
					<TableRow>
						<TableHead>Name</TableHead>
						<TableHead>Key</TableHead>
						<TableHead>Platform</TableHead>
						<TableHead>Created</TableHead>
						<TableHead className="w-12" />
					</TableRow>
				</TableHeader>
				<TableBody>
					{products.map((product) => (
						<TableRow key={product.id}>
							<TableCell className="font-medium">{product.name}</TableCell>
							<TableCell>
								<code className="text-xs">{product.key}</code>
							</TableCell>
							<TableCell>
								<Badge variant="secondary">{product.platform}</Badge>
							</TableCell>
							<TableCell className="text-muted-foreground">
								{product.createdAt.toLocaleDateString()}
							</TableCell>
							<TableCell>
								<DropdownMenu>
									<DropdownMenuTrigger>
										<MoreHorizontal className="size-4" />
									</DropdownMenuTrigger>
									<DropdownMenuContent align="end">
										<DropdownMenuItem onClick={() => setEditProduct(product)}>
											<Pencil className="mr-2 size-4" />
											Edit
										</DropdownMenuItem>
										<DropdownMenuItem onClick={() => setDeleteProduct(product)}>
											<Trash2 className="mr-2 size-4" />
											Delete
										</DropdownMenuItem>
									</DropdownMenuContent>
								</DropdownMenu>
							</TableCell>
						</TableRow>
					))}
				</TableBody>
			</Table>

			<ProductFormDialog
				mode="edit"
				product={editProduct ?? undefined}
				open={!!editProduct}
				onOpenChange={(open) => !open && setEditProduct(null)}
			/>

			<DeleteProductDialog
				product={deleteProduct ?? undefined}
				open={!!deleteProduct}
				onOpenChange={(open) => !open && setDeleteProduct(null)}
			/>
		</>
	);
}
