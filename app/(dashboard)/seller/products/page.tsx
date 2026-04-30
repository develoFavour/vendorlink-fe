"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Archive, ChevronDown, CircleDollarSign, Filter, Grid2X2, List, Package, PackageCheck, Plus, Search } from "lucide-react";
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
  limit: 10,
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

export default function SellerProductsPage() {
  const [products, setProducts] = useState<SellerProduct[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [category, setCategory] = useState("All");
  const [status, setStatus] = useState("All");
  const [priceRange, setPriceRange] = useState("all");
  const [sort, setSort] = useState("default");
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState<ProductPagination>(DEFAULT_PAGINATION);
  const [updatingStatusId, setUpdatingStatusId] = useState<string | null>(null);

  useEffect(() => {
    const request = window.setTimeout(() => {
      const priceFilter = priceRanges[priceRange] || {};

      setIsLoading(true);
      setError("");

      productService
        .getProducts({
          search: searchTerm,
          category,
          status,
          sort,
          page,
          limit: 10,
          ...priceFilter,
        })
        .then((result) => {
          setProducts(result.products);
          setPagination(result.pagination);
        })
        .catch(() => {
          setProducts([]);
          setPagination(DEFAULT_PAGINATION);
          setError("Unable to load products. Please try again.");
        })
        .finally(() => setIsLoading(false));
    }, 250);

    return () => window.clearTimeout(request);
  }, [category, page, priceRange, searchTerm, sort, status]);

  const updateFilter = (setter: (value: string) => void) => (value: string) => {
    setter(value);
    setPage(1);
  };

  const toggleProductStatus = async (product: SellerProduct) => {
    const nextStatus = product.status === "Published" ? "Draft" : "Published";
    setUpdatingStatusId(product.id);

    try {
      await productService.updateProduct(product.id, { status: nextStatus });
      setProducts((currentProducts) =>
        currentProducts.map((currentProduct) =>
          currentProduct.id === product.id
            ? { ...currentProduct, status: nextStatus }
            : currentProduct
        )
      );
      toast.success(nextStatus === "Published" ? "Product is now active." : "Product moved to draft.");
    } catch {
      toast.error("Unable to update product status.");
    } finally {
      setUpdatingStatusId(null);
    }
  };

  const totalProducts = pagination.total;
  const activeProducts = products.filter((product) => product.status === "Published").length;
  const draftProducts = products.filter((product) => product.status === "Draft").length;
  const inventoryValue = products.reduce(
    (total, product) => total + product.price,
    0
  );

  const stats = [
    { label: "Products", value: totalProducts.toString(), detail: "Matched listings", icon: Package },
    { label: "Inventory Value", value: formatCurrency(inventoryValue), detail: "Current page", icon: CircleDollarSign },
    { label: "Active", value: activeProducts.toString(), detail: "Visible here", icon: PackageCheck },
    { label: "Draft", value: draftProducts.toString(), detail: "Hidden here", icon: Archive },
  ];

  return (
    <div className="space-y-5">
      <div className="flex flex-col gap-4 rounded-3xl bg-white p-4 shadow-sm">
        <div className="flex flex-col justify-between gap-4 xl:flex-row xl:items-center">
          <div className="flex min-w-0 flex-col gap-3 sm:flex-row sm:items-center">
            <div className="flex rounded-full bg-[#F3F3F1] p-1">
              <button className="flex h-9 w-9 items-center justify-center rounded-full bg-white text-[#171714] shadow-sm">
                <List className="h-4 w-4" />
              </button>
              <button className="flex h-9 w-9 items-center justify-center rounded-full text-[#8A8A86]">
                <Grid2X2 className="h-4 w-4" />
              </button>
            </div>
            <div className="flex h-11 w-full min-w-0 items-center gap-2 rounded-full bg-[#F3F3F1] px-4 text-[#8A8A86] sm:max-w-sm">
              <Search className="h-4 w-4" />
              <input
                value={searchTerm}
                onChange={(event) => {
                  setSearchTerm(event.target.value);
                  setPage(1);
                }}
                placeholder="Search..."
                className="w-full bg-transparent text-sm font-medium outline-none placeholder:text-[#8A8A86]"
              />
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <button className="flex h-11 w-full items-center justify-center gap-2 rounded-full bg-[#F3F3F1] px-4 text-sm font-semibold text-[#74746F] sm:w-auto">
              Show: <span className="text-[#171714]">{pagination.total} Products</span>
              <ChevronDown className="h-4 w-4" />
            </button>
            <div className="flex h-11 w-full items-center justify-center gap-2 rounded-full bg-[#F3F3F1] px-4 text-sm font-semibold text-[#74746F] sm:w-auto">
              Sort by:
              <select
                value={sort}
                onChange={(event) => updateFilter(setSort)(event.target.value)}
                className="appearance-none bg-transparent pr-5 text-sm font-bold text-[#171714] outline-none"
              >
                <option value="default">Default</option>
                <option value="oldest">Oldest</option>
                <option value="price_asc">Price: Low to High</option>
                <option value="price_desc">Price: High to Low</option>
                <option value="name_asc">Name: A to Z</option>
                <option value="name_desc">Name: Z to A</option>
                <option value="stock_desc">Stock: High to Low</option>
              </select>
              <ChevronDown className="h-4 w-4" />
            </div>
            <button className="flex h-11 flex-1 items-center justify-center gap-2 rounded-full border border-[#F25A1D]/40 bg-white px-4 text-sm font-bold text-[#E95516] sm:flex-none">
              <Filter className="h-4 w-4" />
              Filter
            </button>
            <Link href="/seller/products/new" className="flex h-11 flex-1 items-center justify-center gap-2 rounded-full bg-[#F25A1D] px-5 text-sm font-bold text-white shadow-sm transition-colors hover:bg-[#de4c12] sm:flex-none">
              <Plus className="h-4 w-4" />
              Add new product
            </Link>
          </div>
        </div>

        <div className="grid gap-3 md:grid-cols-4">
          {stats.map((stat) => {
            const Icon = stat.icon;
            return (
              <div key={stat.label} className="rounded-2xl bg-[#F8F8F7] p-4">
                <div className="mb-3 flex items-center justify-between">
                  <Icon className="h-4 w-4 text-[#E95516]" />
                  <span className="text-xs font-semibold text-[#8A8A86]">{stat.detail}</span>
                </div>
                <p className="text-xs font-semibold text-[#8A8A86]">{stat.label}</p>
                <p className="mt-1 text-2xl font-black tracking-tight text-[#171714]">{stat.value}</p>
              </div>
            );
          })}
        </div>
      </div>

      {error && !isLoading && (
        <div className="rounded-2xl border border-red-500/20 bg-red-500/[0.05] px-4 py-3 text-sm font-semibold text-red-600">
          {error}
        </div>
      )}

      <div className="grid gap-3 rounded-3xl bg-white p-4 shadow-sm xl:grid-cols-4">
        <div>
          <p className="mb-2 text-xs font-bold text-[#74746F]">Category</p>
          <select
            value={category}
            onChange={(event) => updateFilter(setCategory)(event.target.value)}
            className="h-11 w-full rounded-2xl border-0 bg-[#F3F3F1] px-4 text-sm font-semibold text-[#74746F] outline-none"
          >
            <option value="All">All Collection</option>
            <option value="Fashion">Fashion</option>
            <option value="Electronics">Electronics</option>
            <option value="Groceries">Groceries</option>
            <option value="Beauty">Beauty</option>
            <option value="Home">Home</option>
          </select>
        </div>
        <div>
          <p className="mb-2 text-xs font-bold text-[#74746F]">Price</p>
          <select
            value={priceRange}
            onChange={(event) => updateFilter(setPriceRange)(event.target.value)}
            className="h-11 w-full rounded-2xl border-0 bg-[#F3F3F1] px-4 text-sm font-semibold text-[#74746F] outline-none"
          >
            <option value="all">All Prices</option>
            <option value="0-5000">Under N5,000</option>
            <option value="5000-100000">N5,000 - N100,000</option>
            <option value="100000+">Above N100,000</option>
          </select>
        </div>
        <div>
          <p className="mb-2 text-xs font-bold text-[#74746F]">Status</p>
          <select
            value={status}
            onChange={(event) => updateFilter(setStatus)(event.target.value)}
            className="h-11 w-full rounded-2xl border border-[#F25A1D]/30 bg-[#FFEDE5] px-4 text-sm font-semibold text-[#E95516] outline-none"
          >
            <option value="All">All Status</option>
            <option value="Published">Active</option>
            <option value="Draft">Draft</option>
          </select>
        </div>
        <div>
          <p className="mb-2 text-xs font-bold text-[#74746F]">Store</p>
          <button className="flex h-11 w-full items-center justify-between rounded-2xl bg-[#F3F3F1] px-4 text-sm font-semibold text-[#74746F]">
            All Stores
            <ChevronDown className="h-4 w-4" />
          </button>
        </div>
      </div>

      <div className="overflow-hidden rounded-3xl bg-white shadow-sm">
        <div className="overflow-x-auto">
        <Table className="min-w-[860px] text-left">
          <TableHeader>
            <TableRow className="border-b border-black/[0.05] hover:bg-transparent">
              <TableHead className="w-12 px-5 py-5">
                <span className="block h-5 w-5 rounded-full border border-black/[0.08]" />
              </TableHead>
              <TableHead className="py-5 text-xs font-bold text-[#74746F]">Product info</TableHead>
              <TableHead className="py-5 text-xs font-bold text-[#74746F]">Price</TableHead>
              <TableHead className="py-5 text-xs font-bold text-[#74746F]">Stock</TableHead>
              <TableHead className="py-5 text-xs font-bold text-[#74746F]">Status</TableHead>
              <TableHead className="py-5 text-xs font-bold text-[#74746F]">Inventory</TableHead>
              <TableHead className="py-5 text-right text-xs font-bold text-[#74746F]">Active</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody className="text-sm font-semibold text-[#171714]">
            {!isLoading && products.length > 0 ? products.map((product, index) => {
              const soldCount = product.soldCount || 0;
              const totalInventory = soldCount + product.stock;
              const soldPercent = totalInventory > 0 ? Math.min((soldCount / totalInventory) * 100, 100) : 0;
              const isActive = product.status === "Published";

              return (
                <TableRow key={product.id} className="border-b border-black/[0.04] hover:bg-[#FAFAF9]">
                  <TableCell className="px-5 py-4">
                    <span className={`flex h-5 w-5 items-center justify-center rounded-full border ${
                      index === 2 ? "border-emerald-500 bg-emerald-500" : "border-black/[0.08]"
                    }`}>
                      {index === 2 && <span className="h-1.5 w-1.5 rounded-full bg-white" />}
                    </span>
                  </TableCell>
                  <TableCell className="py-4">
                    <div className="flex items-center gap-3">
                      <div
                        className="relative h-12 w-12 overflow-hidden rounded-xl bg-[#F3F3F1]"
                        style={{ backgroundColor: product.color }}
                      >
                        {product.image ? (
                          <Image src={product.image} alt={product.name} fill sizes="48px" className="object-contain p-1.5" />
                        ) : (
                          <div className="flex h-full w-full items-center justify-center text-[9px] font-black uppercase text-[#8A8A86]">
                            No image
                          </div>
                        )}
                      </div>
                      <div className="min-w-0">
                        <Link href={`/seller/products/${product.id}`} className="block max-w-[260px] truncate text-sm font-bold text-[#171714] hover:text-[#E95516]">
                          {product.name}
                        </Link>
                        <p className="mt-1 text-xs font-medium text-[#8A8A86]">ID : {product.sku}</p>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className="py-4 text-sm font-bold">{formatCurrency(product.price)}</TableCell>
                  <TableCell className="py-4 text-sm font-bold">{product.stock}</TableCell>
                  <TableCell className="py-4 text-sm font-bold">{product.status === "Published" ? "Active" : "No Active"}</TableCell>
                  <TableCell className="py-4">
                    <div className="flex items-center gap-3">
                      <div className="h-1.5 w-32 overflow-hidden rounded-full bg-[#EFEFEB]">
                        <div
                          className={`h-full rounded-full ${soldPercent > 60 ? "bg-emerald-500" : soldPercent > 30 ? "bg-amber-400" : "bg-[#E95516]"}`}
                          style={{ width: `${soldPercent}%` }}
                        />
                      </div>
                      <span className="text-xs font-medium text-[#8A8A86]">{soldCount}/{totalInventory}</span>
                    </div>
                  </TableCell>
                  <TableCell className="py-4 text-right">
                    <button
                      type="button"
                      onClick={() => toggleProductStatus(product)}
                      disabled={updatingStatusId === product.id}
                      className={`ml-auto flex h-6 w-11 items-center rounded-full p-0.5 transition-colors disabled:cursor-wait disabled:opacity-60 ${
                      isActive ? "bg-emerald-500" : "bg-[#E7E7E3]"
                    }`}
                      aria-label={isActive ? "Move product to draft" : "Publish product"}
                    >
                      <span className={`h-5 w-5 rounded-full bg-white shadow-sm transition-transform ${
                        isActive ? "translate-x-5" : "translate-x-0"
                      }`} />
                    </button>
                  </TableCell>
                </TableRow>
              );
            }) : isLoading ? (
              <TableRow className="hover:bg-transparent">
                <TableCell colSpan={7} className="px-6 py-12 text-center text-sm font-semibold text-[#8A8A86]">
                  Loading products...
                </TableCell>
              </TableRow>
            ) : (
              <TableRow className="hover:bg-transparent">
                <TableCell colSpan={7} className="px-6 py-16 text-center">
                  <div className="mx-auto max-w-sm">
                    <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-[#FFEDE5] text-[#E95516]">
                      <Package className="h-6 w-6" />
                    </div>
                    <h3 className="mt-5 text-lg font-black text-[#171714]">No products yet</h3>
                    <p className="mt-2 text-sm font-medium leading-6 text-[#8A8A86]">
                      Products that match your current search and filters will appear here.
                    </p>
                    <Link href="/seller/products/new" className="mt-5 inline-flex h-11 items-center gap-2 rounded-full bg-[#F25A1D] px-5 text-sm font-bold text-white shadow-sm transition-colors hover:bg-[#de4c12]">
                      <Plus className="h-4 w-4" />
                      Add first product
                    </Link>
                  </div>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
        </div>
      </div>

      {!isLoading && products.length > 0 && (
        <div className="flex flex-col items-center justify-between gap-3 rounded-3xl bg-white px-5 py-4 text-sm font-semibold text-[#74746F] shadow-sm md:flex-row">
          <span>
            Page {pagination.page} of {pagination.totalPages} - {pagination.total} total products
          </span>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setPage((current) => Math.max(current - 1, 1))}
              disabled={!pagination.hasPrevPage}
              className="h-10 rounded-full border border-black/[0.08] px-4 font-bold text-[#171714] disabled:cursor-not-allowed disabled:opacity-40"
            >
              Previous
            </button>
            <button
              onClick={() => setPage((current) => current + 1)}
              disabled={!pagination.hasNextPage}
              className="h-10 rounded-full bg-[#171714] px-4 font-bold text-white disabled:cursor-not-allowed disabled:opacity-40"
            >
              Next
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
