"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import {
  Archive,
  ArrowLeft,
  ArrowRight,
  Eye,
  Filter,
  Package,
  PackageCheck,
  Search,
  ShieldAlert,
  Trash2,
} from "lucide-react";
import { toast } from "sonner";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { formatCurrency, type SellerProduct } from "@/lib/seller-products";
import { productService, type ProductPagination, type ProductQueryParams } from "@/services/product.service";

const DEFAULT_PAGINATION: ProductPagination = {
  page: 1,
  limit: 12,
  total: 0,
  totalPages: 1,
  hasNextPage: false,
  hasPrevPage: false,
};

const priceRanges: Record<string, Pick<ProductQueryParams, "minPrice" | "maxPrice">> = {
  all: {},
  "0-5000": { minPrice: 0, maxPrice: 5000 },
  "5000-100000": { minPrice: 5000, maxPrice: 100000 },
  "100000+": { minPrice: 100000 },
};

export default function AdminProductsPage() {
  const [products, setProducts] = useState<SellerProduct[]>([]);
  const [pagination, setPagination] = useState<ProductPagination>(DEFAULT_PAGINATION);
  const [searchTerm, setSearchTerm] = useState("");
  const [category, setCategory] = useState("All");
  const [status, setStatus] = useState("All");
  const [priceRange, setPriceRange] = useState("all");
  const [sort, setSort] = useState("default");
  const [page, setPage] = useState(1);
  const [isLoading, setIsLoading] = useState(true);
  const [pendingProductId, setPendingProductId] = useState<string | null>(null);
  const [productToDelete, setProductToDelete] = useState<SellerProduct | null>(null);

  useEffect(() => {
    const request = window.setTimeout(() => {
      const priceFilter = priceRanges[priceRange] || {};
      setIsLoading(true);

      productService
        .getProducts({
          search: searchTerm,
          category,
          status,
          sort,
          page,
          limit: 12,
          ...priceFilter,
        })
        .then((result) => {
          setProducts(result.products);
          setPagination(result.pagination);
        })
        .catch(() => {
          setProducts([]);
          setPagination(DEFAULT_PAGINATION);
          toast.error("Unable to load marketplace products.");
        })
        .finally(() => setIsLoading(false));
    }, 250);

    return () => window.clearTimeout(request);
  }, [category, page, priceRange, searchTerm, sort, status]);

  const stats = useMemo(() => {
    const active = products.filter((product) => product.status === "Published").length;
    const draft = products.filter((product) => product.status === "Draft").length;
    const lowStock = products.filter((product) => product.stock <= 5).length;
    const inventoryValue = products.reduce((total, product) => total + product.price * product.stock, 0);

    return [
      { label: "Matched products", value: pagination.total.toString(), detail: "All vendors", icon: Package },
      { label: "Active here", value: active.toString(), detail: "Visible listings", icon: PackageCheck },
      { label: "Draft here", value: draft.toString(), detail: "Hidden listings", icon: Archive },
      { label: "Low stock", value: lowStock.toString(), detail: "Current page", icon: ShieldAlert },
      { label: "Inventory value", value: formatCurrency(inventoryValue), detail: "Current page", icon: Filter },
    ];
  }, [pagination.total, products]);

  const updateFilter = (setter: (value: string) => void) => (value: string) => {
    setter(value);
    setPage(1);
  };

  const toggleProductStatus = async (product: SellerProduct) => {
    const nextStatus = product.status === "Published" ? "Draft" : "Published";
    setPendingProductId(product.id);

    try {
      const updated = await productService.updateProduct(product.id, { status: nextStatus });
      setProducts((current) => current.map((item) => (item.id === product.id ? updated : item)));
      toast.success(nextStatus === "Published" ? "Product published." : "Product unpublished.");
    } catch {
      toast.error("Unable to update product status.");
    } finally {
      setPendingProductId(null);
    }
  };

  const deleteProduct = async (product: SellerProduct) => {
    setPendingProductId(product.id);

    try {
      await productService.deleteProduct(product.id);
      setProducts((current) => current.filter((item) => item.id !== product.id));
      setPagination((current) => ({ ...current, total: Math.max(current.total - 1, 0) }));
      setProductToDelete(null);
      toast.success("Product deleted.");
    } catch {
      toast.error("Unable to delete product.");
    } finally {
      setPendingProductId(null);
    }
  };

  return (
    <div className="space-y-5">
      <section className="rounded-[24px] bg-white p-4 shadow-sm sm:rounded-[30px] sm:p-6">
        <p className="text-[11px] font-black uppercase tracking-[0.24em] text-[#F25A1D]">Admin products</p>
        <div className="mt-3 flex flex-col justify-between gap-4 xl:flex-row xl:items-end">
          <div>
            <h1 className="text-2xl font-black tracking-tight text-[#171714] sm:text-3xl">Product moderation</h1>
            <p className="mt-1 max-w-2xl text-sm font-semibold leading-6 text-[#74746F]">
              Review every listing in the marketplace, unpublish unsafe products, and remove listings when moderation requires it.
            </p>
          </div>
          <div className="flex h-11 w-full max-w-sm items-center gap-2 rounded-2xl bg-[#F6F6F4] px-4 text-[#8A8A86]">
            <Search className="h-4 w-4" />
            <input
              value={searchTerm}
              onChange={(event) => {
                setSearchTerm(event.target.value);
                setPage(1);
              }}
              placeholder="Search products, SKU, tags..."
              className="w-full bg-transparent text-sm font-bold text-[#171714] outline-none placeholder:text-[#B7B7B2]"
            />
          </div>
        </div>
      </section>

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-5">
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <div key={stat.label} className="rounded-[22px] bg-white p-4 shadow-sm sm:rounded-[26px] sm:p-5">
              <Icon className="h-5 w-5 text-[#F25A1D]" />
              <p className="mt-4 text-xs font-black uppercase tracking-wider text-[#8A8A86]">{stat.label}</p>
              <p className="mt-2 text-2xl font-black text-[#171714]">{stat.value}</p>
              <p className="mt-1 text-xs font-bold text-[#74746F]">{stat.detail}</p>
            </div>
          );
        })}
      </section>

      <section className="grid gap-3 rounded-[30px] bg-white p-4 shadow-sm md:grid-cols-4">
        <select
          value={category}
          onChange={(event) => updateFilter(setCategory)(event.target.value)}
          className="h-11 rounded-2xl border border-black/[0.06] bg-[#F8F8F6] px-4 text-xs font-black text-[#74746F] outline-none"
        >
          <option value="All">All categories</option>
          <option value="Fashion">Fashion</option>
          <option value="Electronics">Electronics</option>
          <option value="Groceries">Groceries</option>
          <option value="Beauty">Beauty</option>
          <option value="Home">Home</option>
        </select>
        <select
          value={status}
          onChange={(event) => updateFilter(setStatus)(event.target.value)}
          className="h-11 rounded-2xl border border-black/[0.06] bg-[#F8F8F6] px-4 text-xs font-black text-[#74746F] outline-none"
        >
          <option value="All">All statuses</option>
          <option value="Published">Published</option>
          <option value="Draft">Draft</option>
        </select>
        <select
          value={priceRange}
          onChange={(event) => updateFilter(setPriceRange)(event.target.value)}
          className="h-11 rounded-2xl border border-black/[0.06] bg-[#F8F8F6] px-4 text-xs font-black text-[#74746F] outline-none"
        >
          <option value="all">All prices</option>
          <option value="0-5000">Under N5,000</option>
          <option value="5000-100000">N5,000 - N100,000</option>
          <option value="100000+">Above N100,000</option>
        </select>
        <select
          value={sort}
          onChange={(event) => updateFilter(setSort)(event.target.value)}
          className="h-11 rounded-2xl border border-black/[0.06] bg-[#F8F8F6] px-4 text-xs font-black text-[#74746F] outline-none"
        >
          <option value="default">Newest first</option>
          <option value="oldest">Oldest first</option>
          <option value="price_asc">Price low to high</option>
          <option value="price_desc">Price high to low</option>
          <option value="stock_asc">Stock low to high</option>
          <option value="stock_desc">Stock high to low</option>
        </select>
      </section>

      <section className="overflow-hidden rounded-[24px] bg-white shadow-sm sm:rounded-[30px]">
        <div className="overflow-x-auto">
        <Table className="min-w-[920px]">
          <TableHeader>
            <TableRow className="hover:bg-transparent">
              <TableHead className="px-5 py-5 text-xs font-black uppercase tracking-wider text-[#8A8A86]">Product</TableHead>
              <TableHead className="py-5 text-xs font-black uppercase tracking-wider text-[#8A8A86]">Catalog</TableHead>
              <TableHead className="py-5 text-xs font-black uppercase tracking-wider text-[#8A8A86]">Inventory</TableHead>
              <TableHead className="py-5 text-xs font-black uppercase tracking-wider text-[#8A8A86]">Rating</TableHead>
              <TableHead className="py-5 text-xs font-black uppercase tracking-wider text-[#8A8A86]">Status</TableHead>
              <TableHead className="pr-5 text-right text-xs font-black uppercase tracking-wider text-[#8A8A86]">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow className="hover:bg-transparent">
                <TableCell colSpan={6} className="px-6 py-12 text-center text-sm font-black text-[#8A8A86]">
                  Loading marketplace products...
                </TableCell>
              </TableRow>
            ) : products.length === 0 ? (
              <TableRow className="hover:bg-transparent">
                <TableCell colSpan={6} className="px-6 py-16 text-center">
                  <Package className="mx-auto h-10 w-10 text-[#F25A1D]" />
                  <h2 className="mt-4 text-2xl font-black text-[#171714]">No products found</h2>
                  <p className="mt-2 text-sm font-semibold text-[#74746F]">Adjust your moderation filters to find matching listings.</p>
                </TableCell>
              </TableRow>
            ) : (
              products.map((product) => {
                const totalInventory = product.stock + product.soldCount;
                const soldPercent = totalInventory > 0 ? Math.round((product.soldCount / totalInventory) * 100) : 0;
                const isPublished = product.status === "Published";
                const isPending = pendingProductId === product.id;

                return (
                  <TableRow key={product.id} className="hover:bg-[#FAFAF9]">
                    <TableCell className="px-5 py-4">
                      <div className="flex items-center gap-3">
                        <div className="relative h-14 w-14 overflow-hidden rounded-2xl bg-[#F6F6F4]">
                          {product.image ? (
                            <Image src={product.image} alt={product.name} fill sizes="56px" className="object-contain p-2" />
                          ) : null}
                        </div>
                        <div className="min-w-0">
                          <p className="max-w-[280px] truncate text-sm font-black text-[#171714]">{product.name}</p>
                          <p className="mt-1 text-xs font-bold text-[#8A8A86]">{product.brand || "VendorLink store"}</p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="py-4">
                      <p className="text-sm font-black text-[#171714]">{formatCurrency(product.price)}</p>
                      <p className="mt-1 text-xs font-bold text-[#8A8A86]">{product.category} - {product.sku || "No SKU"}</p>
                    </TableCell>
                    <TableCell className="py-4">
                      <div className="flex items-center gap-3">
                        <div className="h-1.5 w-24 overflow-hidden rounded-full bg-[#EFEFEB]">
                          <div
                            className={`h-full rounded-full ${soldPercent > 60 ? "bg-emerald-500" : soldPercent > 30 ? "bg-amber-400" : "bg-[#F25A1D]"}`}
                            style={{ width: `${soldPercent}%` }}
                          />
                        </div>
                        <span className="text-xs font-black text-[#74746F]">{product.soldCount}/{totalInventory}</span>
                      </div>
                      <p className="mt-2 text-xs font-bold text-[#8A8A86]">{product.stock} in stock</p>
                    </TableCell>
                    <TableCell className="py-4">
                      <p className="text-sm font-black text-[#171714]">{product.averageRating.toFixed(1)}</p>
                      <p className="mt-1 text-xs font-bold text-[#8A8A86]">{product.totalReviews} review{product.totalReviews === 1 ? "" : "s"}</p>
                    </TableCell>
                    <TableCell className="py-4">
                      <span className={`rounded-full px-3 py-1.5 text-[10px] font-black uppercase tracking-wider ${
                        isPublished ? "bg-emerald-50 text-emerald-700" : "bg-amber-50 text-amber-700"
                      }`}>
                        {product.status}
                      </span>
                    </TableCell>
                    <TableCell className="pr-5 text-right">
                      <div className="flex justify-end gap-2">
                        <Link
                          href={`/products/${product.id}`}
                          className="grid h-9 w-9 place-items-center rounded-2xl border border-black/[0.08] text-[#74746F] hover:bg-[#F6F6F4]"
                          aria-label="View public product"
                        >
                          <Eye className="h-4 w-4" />
                        </Link>
                        <button
                          type="button"
                          disabled={isPending}
                          onClick={() => toggleProductStatus(product)}
                          className={`h-9 rounded-2xl px-4 text-xs font-black disabled:opacity-50 ${
                            isPublished
                              ? "bg-[#FFEDE5] text-[#F25A1D]"
                              : "bg-[#171714] text-white"
                          }`}
                        >
                          {isPublished ? "Unpublish" : "Publish"}
                        </button>
                        <button
                          type="button"
                          disabled={isPending}
                          onClick={() => setProductToDelete(product)}
                          className="grid h-9 w-9 place-items-center rounded-2xl border border-red-100 text-red-600 hover:bg-red-50 disabled:opacity-50"
                          aria-label="Delete product"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>
        </div>

        {!isLoading && products.length > 0 ? (
          <div className="flex flex-col items-center justify-between gap-3 border-t border-black/[0.06] p-5 text-sm font-bold text-[#74746F] md:flex-row">
            <span>
              Page {pagination.page} of {pagination.totalPages} - {pagination.total} products
            </span>
            <div className="flex items-center gap-2">
              <button
                type="button"
                disabled={!pagination.hasPrevPage}
                onClick={() => setPage((current) => Math.max(current - 1, 1))}
                className="inline-flex h-10 items-center gap-2 rounded-2xl border border-black/[0.08] px-4 text-xs font-black disabled:opacity-40"
              >
                <ArrowLeft className="h-4 w-4" />
                Previous
              </button>
              <button
                type="button"
                disabled={!pagination.hasNextPage}
                onClick={() => setPage((current) => current + 1)}
                className="inline-flex h-10 items-center gap-2 rounded-2xl bg-[#171714] px-4 text-xs font-black text-white disabled:opacity-40"
              >
                Next
                <ArrowRight className="h-4 w-4" />
              </button>
            </div>
          </div>
        ) : null}
      </section>

      <Dialog open={Boolean(productToDelete)} onOpenChange={(open) => !open && setProductToDelete(null)}>
        <DialogContent className="rounded-[28px] bg-white p-6 sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-xl font-black tracking-tight text-[#171714]">
              Delete product?
            </DialogTitle>
            <DialogDescription className="text-sm font-semibold leading-6 text-[#74746F]">
              This permanently removes {productToDelete ? `"${productToDelete.name}"` : "this product"} from the marketplace. Unpublish is safer if you only need to hide it.
            </DialogDescription>
          </DialogHeader>

          <DialogFooter className="-mx-6 -mb-6 mt-2 border-t border-black/[0.06] bg-[#FAFAF9] p-4">
            <DialogClose className="h-11 rounded-2xl border border-black/[0.08] px-5 text-xs font-black text-[#74746F]">
              Cancel
            </DialogClose>
            <button
              type="button"
              disabled={!productToDelete || pendingProductId === productToDelete.id}
              onClick={() => productToDelete && deleteProduct(productToDelete)}
              className="h-11 rounded-2xl bg-red-600 px-5 text-xs font-black text-white disabled:opacity-50"
            >
              {productToDelete && pendingProductId === productToDelete.id ? "Deleting..." : "Delete product"}
            </button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
