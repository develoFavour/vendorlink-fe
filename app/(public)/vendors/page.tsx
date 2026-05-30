"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { vendorService, type PublicVendor } from "@/services/vendor.service";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Store, Search } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

export default function VendorsPage() {
	const [vendors, setVendors] = useState<PublicVendor[]>([]);
	const [loading, setLoading] = useState(true);
	const [search, setSearch] = useState("");
	const [category, setCategory] = useState("");
	const [page, setPage] = useState(1);
	const [totalPages, setTotalPages] = useState(1);

	const fetchVendors = async () => {
		try {
			setLoading(true);
			const data = await vendorService.getVendors({
				page,
				limit: 12,
				search,
				category,
			});
			setVendors(data.stores);
			setTotalPages(data.pagination.totalPages);
		} catch (error) {
			console.error("Failed to fetch vendors:", error);
		} finally {
			setLoading(false);
		}
	};

	useEffect(() => {
		fetchVendors();
	}, [page, category]);

	const handleSearch = (e: React.FormEvent) => {
		e.preventDefault();
		setPage(1);
		fetchVendors();
	};

	return (
		<div className="container mx-auto px-4 py-8 mt-20">
			<div className="mb-8 text-center">
				<h1 className="text-4xl font-bold mb-4">Our Vendors</h1>
				<p className="text-muted-foreground max-w-2xl mx-auto">
					Discover a wide variety of products from our trusted vendors. Support
					small businesses and find unique items.
				</p>
			</div>

			<div className="flex flex-col md:flex-row gap-4 mb-8 justify-between items-center">
				<form onSubmit={handleSearch} className="flex gap-2 w-full md:w-1/2">
					<Input
						placeholder="Search vendors..."
						value={search}
						onChange={(e) => setSearch(e.target.value)}
						className="w-full"
					/>
					<Button type="submit" className="bg-black">
						<Search className="h-4 w-4 mr-2" />
						Search
					</Button>
				</form>
				<div className="flex gap-2 w-full md:w-auto overflow-x-auto pb-2">
					{["", "fashion", "electronics", "groceries", "other"].map((cat) => (
						<Button
							key={cat}
							variant={category === cat ? "default" : "outline"}
							onClick={() => {
								setCategory(cat);
								setPage(1);
							}}
							className="capitalize whitespace-nowrap bg-black text-white"
						>
							{cat || "All Categories"}
						</Button>
					))}
				</div>
			</div>

			{loading ? (
				<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
					{[...Array(8)].map((_, i) => (
						<Card key={i} className="h-48">
							<CardHeader>
								<Skeleton className="h-6 w-2/3 mb-2" />
								<Skeleton className="h-4 w-1/3" />
							</CardHeader>
							<CardContent>
								<Skeleton className="h-16 w-full" />
							</CardContent>
						</Card>
					))}
				</div>
			) : vendors.length > 0 ? (
				<>
					<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
						{vendors.map((vendor) => (
							<Link href={`/vendors/${vendor.slug}`} key={vendor._id}>
								<Card className="h-full hover:shadow-lg transition-shadow cursor-pointer">
									<CardHeader>
										<CardTitle className="flex items-center gap-2">
											<Store className="h-5 w-5 text-black" />
											{vendor.storeName}
										</CardTitle>
										<CardDescription className="capitalize font-medium text-black">
											{vendor.category}
										</CardDescription>
									</CardHeader>
									<CardContent>
										<p className="text-sm text-muted-foreground line-clamp-3">
											{vendor.description ||
												"No description available for this vendor."}
										</p>
									</CardContent>
								</Card>
							</Link>
						))}
					</div>

					{totalPages > 1 && (
						<div className="flex justify-center items-center gap-4 mt-8">
							<Button
								variant="outline"
								disabled={page === 1}
								onClick={() => setPage((p) => p - 1)}
							>
								Previous
							</Button>
							<span className="text-sm">
								Page {page} of {totalPages}
							</span>
							<Button
								variant="outline"
								disabled={page === totalPages}
								onClick={() => setPage((p) => p + 1)}
							>
								Next
							</Button>
						</div>
					)}
				</>
			) : (
				<div className="text-center py-20">
					<Store className="h-16 w-16 mx-auto text-muted-foreground mb-4 opacity-20" />
					<h2 className="text-2xl font-semibold mb-2">No vendors found</h2>
					<p className="text-muted-foreground">
						Try adjusting your search or category filter.
					</p>
					<Button
						variant="link"
						onClick={() => {
							setSearch("");
							setCategory("");
							setPage(1);
						}}
						className="mt-4"
					>
						Clear Filters
					</Button>
				</div>
			)}
		</div>
	);
}
