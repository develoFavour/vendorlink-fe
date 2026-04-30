"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ImagePlus, Plus, Save, X } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { SellerProduct } from "@/lib/seller-products";
import { productService } from "@/services/product.service";
import { handleApiError } from "@/utils/response";

type ProductFormProps = {
  mode: "create" | "edit";
  product?: SellerProduct;
};

const categories = ["Fashion", "Electronics", "Groceries", "Other"];
const inputClass =
  "h-12 rounded-xl border-black/[0.06] bg-transparent text-[12px] font-semibold placeholder:text-[#111]/25 focus-visible:ring-[#C4553A]/20";
const textAreaClass =
  "w-full resize-none rounded-xl border border-black/[0.06] bg-transparent p-3 text-[12px] font-semibold text-[#111] placeholder:text-[#111]/25 outline-none focus:border-[#C4553A]";

const splitSpec = (value?: string) =>
  value
    ? value.split(",").map((item) => item.trim()).filter(Boolean)
    : [];

type FieldErrors = Record<string, string>;

type ChipInputProps = {
  label: string;
  placeholder: string;
  value: string;
  items: string[];
  onValueChange: (value: string) => void;
  onItemsChange: (items: string[]) => void;
};

function ChipInput({ label, placeholder, value, items, onValueChange, onItemsChange }: ChipInputProps) {
  const addItem = () => {
    const nextValue = value.trim();
    if (!nextValue || items.some((item) => item.toLowerCase() === nextValue.toLowerCase())) return;
    onItemsChange([...items, nextValue]);
    onValueChange("");
  };

  return (
    <div>
      <Label className="mb-2 block text-[12px] font-bold text-[#111]/70">
        {label}
      </Label>
      <div className="flex gap-2">
        <Input
          value={value}
          onChange={(event) => onValueChange(event.target.value)}
          onKeyDown={(event) => {
            if (event.key === "Enter") {
              event.preventDefault();
              addItem();
            }
          }}
          placeholder={placeholder}
          className={inputClass}
        />
        <button
          type="button"
          onClick={addItem}
          className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-[#111] text-white transition-colors hover:bg-[#C4553A]"
          aria-label={`Add ${label}`}
        >
          <Plus className="h-4 w-4" />
        </button>
      </div>
      {items.length > 0 && (
        <div className="mt-3 flex flex-wrap gap-2">
          {items.map((item) => (
            <button
              key={item}
              type="button"
              onClick={() => onItemsChange(items.filter((current) => current !== item))}
              className="inline-flex items-center gap-2 rounded-full border border-[#C4553A]/15 bg-[#C4553A]/[0.06] px-3 py-2 text-[10px] font-black uppercase tracking-wider text-[#C4553A]"
            >
              {item}
              <X className="h-3 w-3" />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

export function ProductForm({ mode, product }: ProductFormProps) {
  const router = useRouter();
  const [status, setStatus] = useState<SellerProduct["status"]>(product?.status ?? "Draft");
  const [sizes, setSizes] = useState<string[]>(product?.sizes ?? []);
  const [tags, setTags] = useState<string[]>(product?.tags ?? []);
  const [materials, setMaterials] = useState<string[]>(splitSpec(product?.specifications.material));
  const [careInstructions, setCareInstructions] = useState<string[]>(splitSpec(product?.specifications.care));
  const [variantInput, setVariantInput] = useState("");
  const [tagInput, setTagInput] = useState("");
  const [materialInput, setMaterialInput] = useState("");
  const [careInput, setCareInput] = useState("");
  const [discountEnabled, setDiscountEnabled] = useState(Boolean(product?.compareAtPrice || product?.discountPercent));
  const [mainImageName, setMainImageName] = useState("");
  const [galleryFileNames, setGalleryFileNames] = useState<string[]>([]);
  const [isSaving, setIsSaving] = useState(false);
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});

  const isEdit = mode === "edit";

  return (
    <form
      noValidate
      onSubmit={async (event) => {
        event.preventDefault();
        setFieldErrors({});

        const form = event.currentTarget;
        const formData = new FormData(form);
        const get = (key: string) => String(formData.get(key) || "");
        const mainImage = formData.get("imageFile");
        const galleryFiles = formData.getAll("galleryFiles");
        const price = Number(get("price"));
        const compareAtPrice = discountEnabled && get("compareAtPrice") ? Number(get("compareAtPrice")) : undefined;
        const discountPercent = discountEnabled && get("discountPercent") ? Number(get("discountPercent")) : undefined;
        const stock = Number(get("stock"));
        const errors: FieldErrors = {};

        if (!get("name").trim()) errors.name = "Product name is required.";
        if (!get("description").trim()) errors.description = "Product details are required.";
        if (!get("category").trim()) errors.category = "Category is required.";
        if (!Number.isFinite(price) || price <= 0) errors.price = "Enter a valid selling price.";
        if (discountEnabled && (compareAtPrice === undefined || !Number.isFinite(compareAtPrice) || compareAtPrice <= price)) {
          errors.compareAtPrice = "Old price should be higher than the selling price.";
        }
        if (discountPercent !== undefined && (!Number.isFinite(discountPercent) || discountPercent < 0 || discountPercent > 100)) {
          errors.discountPercent = "Discount must be between 0 and 100.";
        }
        if (!Number.isInteger(stock) || stock < 0) errors.stock = "Stock must be zero or more.";
        if (!(mainImage instanceof File && mainImage.size > 0) && !product?.image) {
          errors.imageFile = "A product image is required.";
        }

        if (Object.keys(errors).length > 0) {
          setFieldErrors(errors);
          toast.error("Please fix the highlighted fields.");
          return;
        }

        setIsSaving(true);

        const payload = new FormData();
        const append = (key: string, value: string | number | undefined) => {
          if (value === undefined || value === "") return;
          payload.append(key, String(value));
        };

        append("name", get("name"));
        append("brand", get("brand"));
        append("shortDescription", get("shortDescription"));
        append("description", get("description"));
        append("price", price);
        append("compareAtPrice", discountEnabled ? compareAtPrice : undefined);
        append("discountPercent", discountEnabled ? discountPercent : undefined);
        append("stock", stock);
        append("category", get("category"));
        append("status", status);
        append("image", product?.image);
        append("gallery", get("gallery") || product?.gallery.join(", "));
        append("color", get("color") || product?.color || "#F3F3F1");
        append("sku", get("sku"));
        append("weight", get("weight"));
        append("deliveryNote", get("deliveryNote"));
        sizes.forEach((size) => payload.append("sizes", size));
        tags.forEach((tag) => payload.append("tags", tag));
        append(
          "specifications",
          JSON.stringify({
            material: materials.join(", "),
            care: careInstructions.join(", "),
            packageDimensions: get("specifications.packageDimensions"),
            dateFirstAvailable: get("specifications.dateFirstAvailable"),
          })
        );
        append("stylingIdeas", JSON.stringify(product?.stylingIdeas || []));

        if (mainImage instanceof File && mainImage.size > 0) {
          payload.append("imageFile", mainImage);
        }

        galleryFiles.forEach((file) => {
          if (file instanceof File && file.size > 0) {
            payload.append("galleryFiles", file);
          }
        });

        try {
          if (isEdit && product) {
            await productService.updateProduct(product.id, payload);
          } else {
            await productService.createProduct(payload);
          }

          toast.success(isEdit ? "Product updated successfully." : "Product created successfully.");
          router.push("/seller/products");
          router.refresh();
        } catch (err) {
          toast.error(handleApiError(err));
        } finally {
          setIsSaving(false);
        }
      }}
      className="grid gap-6 xl:grid-cols-[1fr_360px]"
    >
      <div className="space-y-6">
        <section className="rounded-3xl border border-black/[0.04] bg-white p-6 shadow-sm">
          <div className="mb-6">
            <h3 className="text-[13px] font-black uppercase tracking-wider text-[#111]">
              Product Information
            </h3>
            <p className="mt-1 text-[11px] font-semibold text-[#111]/45">
              Basic storefront details customers will see.
            </p>
          </div>

          <div className="grid gap-5 md:grid-cols-2">
            <div className="md:col-span-2">
              <Label htmlFor="name" className="mb-2 block text-[12px] font-bold text-[#111]/70">
                Product Name
              </Label>
              <Input
                id="name"
                name="name"
                defaultValue={product?.name}
                placeholder="e.g. Handwoven Cotton Ankara Tunic"
                className={`${inputClass} ${
                  fieldErrors.name ? "border-red-500/50" : "border-black/[0.06]"
                }`}
              />
              {fieldErrors.name && <p className="mt-2 text-[11px] font-bold text-red-600">{fieldErrors.name}</p>}
            </div>

            <div>
              <Label htmlFor="brand" className="mb-2 block text-[12px] font-bold text-[#111]/70">
                Brand / Store Label
              </Label>
              <Input
                id="brand"
                name="brand"
                defaultValue={product?.brand}
                placeholder="e.g. Lagos Couture"
                className={inputClass}
              />
            </div>

            <div>
              <Label htmlFor="category" className="mb-2 block text-[12px] font-bold text-[#111]/70">
                Category
              </Label>
              <select
                id="category"
                name="category"
                defaultValue={product?.category ?? "Fashion"}
                className={`h-12 w-full rounded-xl border bg-transparent px-3 text-[12px] font-semibold text-[#111] outline-none focus:border-[#C4553A] ${
                  fieldErrors.category ? "border-red-500/50" : "border-black/[0.06]"
                }`}
              >
                {categories.map((category) => (
                  <option key={category} value={category}>
                    {category}
                  </option>
                ))}
              </select>
              {fieldErrors.category && <p className="mt-2 text-[11px] font-bold text-red-600">{fieldErrors.category}</p>}
            </div>

            <div>
              <Label htmlFor="sku" className="mb-2 block text-[12px] font-bold text-[#111]/70">
                SKU
              </Label>
              <Input
                id="sku"
                name="sku"
                defaultValue={product?.sku}
                placeholder="VL-FASH-205"
                className={inputClass}
              />
            </div>

            <div className="md:col-span-2">
              <Label htmlFor="shortDescription" className="mb-2 block text-[12px] font-bold text-[#111]/70">
                Short Buyer Summary
              </Label>
              <Input
                id="shortDescription"
                name="shortDescription"
                defaultValue={product?.shortDescription}
                placeholder="One-line summary shown near the product title."
                className={inputClass}
              />
            </div>

            <div className="md:col-span-2">
              <Label htmlFor="description" className="mb-2 block text-[12px] font-bold text-[#111]/70">
                Full Product Details
              </Label>
              <textarea
                id="description"
                name="description"
                defaultValue={product?.description}
                placeholder="Describe product materials, use cases, size, color, and care information."
                rows={5}
                className={`${textAreaClass} ${
                  fieldErrors.description ? "border-red-500/50" : "border-black/[0.06]"
                }`}
              />
              {fieldErrors.description && <p className="mt-2 text-[11px] font-bold text-red-600">{fieldErrors.description}</p>}
            </div>
          </div>
        </section>

        <section className="rounded-3xl border border-black/[0.04] bg-white p-6 shadow-sm">
          <div className="mb-6">
            <h3 className="text-[13px] font-black uppercase tracking-wider text-[#111]">
              Pricing and Inventory
            </h3>
            <p className="mt-1 text-[11px] font-semibold text-[#111]/45">
              Keep stock levels and local delivery information accurate.
            </p>
          </div>

          <div className="grid gap-5 md:grid-cols-3">
            <div>
              <Label htmlFor="price" className="mb-2 block text-[12px] font-bold text-[#111]/70">
                Price (₦)
              </Label>
              <Input
                id="price"
                name="price"
                type="number"
                defaultValue={product?.price}
                placeholder="14500"
                className={`${inputClass} ${
                  fieldErrors.price ? "border-red-500/50" : "border-black/[0.06]"
                }`}
              />
              {fieldErrors.price && <p className="mt-2 text-[11px] font-bold text-red-600">{fieldErrors.price}</p>}
            </div>

            <div className="md:col-span-3">
              <button
                type="button"
                onClick={() => setDiscountEnabled((current) => !current)}
                className={`flex w-full items-center justify-between rounded-2xl border px-4 py-4 text-left transition-colors ${
                  discountEnabled
                    ? "border-[#C4553A]/25 bg-[#C4553A]/[0.06]"
                    : "border-black/[0.06] bg-[#FAF9F5]/50"
                }`}
              >
                <span>
                  <span className="block text-[12px] font-black uppercase tracking-wider text-[#111]">Discount Sale</span>
                  <span className="mt-1 block text-[11px] font-semibold text-[#111]/40">Enable only when this product is currently on sale.</span>
                </span>
                <span className={`flex h-6 w-11 items-center rounded-full p-0.5 transition-colors ${
                  discountEnabled ? "bg-[#C4553A]" : "bg-black/10"
                }`}>
                  <span className={`h-5 w-5 rounded-full bg-white shadow-sm transition-transform ${
                    discountEnabled ? "translate-x-5" : "translate-x-0"
                  }`} />
                </span>
              </button>
            </div>

            {discountEnabled && (
              <>
            <div>
              <Label htmlFor="compareAtPrice" className="mb-2 block text-[12px] font-bold text-[#111]/70">
                Old Price (NGN)
              </Label>
              <Input
                id="compareAtPrice"
                name="compareAtPrice"
                type="number"
                defaultValue={product?.compareAtPrice}
                placeholder="Previous selling price"
                className={`${inputClass} ${
                  fieldErrors.compareAtPrice ? "border-red-500/50" : "border-black/[0.06]"
                }`}
              />
              {fieldErrors.compareAtPrice && <p className="mt-2 text-[11px] font-bold text-red-600">{fieldErrors.compareAtPrice}</p>}
            </div>

            <div>
              <Label htmlFor="discountPercent" className="mb-2 block text-[12px] font-bold text-[#111]/70">
                Discount %
              </Label>
              <Input
                id="discountPercent"
                name="discountPercent"
                type="number"
                defaultValue={product?.discountPercent}
                placeholder="25"
                className={`${inputClass} ${
                  fieldErrors.discountPercent ? "border-red-500/50" : "border-black/[0.06]"
                }`}
              />
              {fieldErrors.discountPercent && <p className="mt-2 text-[11px] font-bold text-red-600">{fieldErrors.discountPercent}</p>}
            </div>
              </>
            )}

            <div>
              <Label htmlFor="stock" className="mb-2 block text-[12px] font-bold text-[#111]/70">
                Stock
              </Label>
              <Input
                id="stock"
                name="stock"
                type="number"
                defaultValue={product?.stock}
                placeholder="15"
                className={`${inputClass} ${
                  fieldErrors.stock ? "border-red-500/50" : "border-black/[0.06]"
                }`}
              />
              {fieldErrors.stock && <p className="mt-2 text-[11px] font-bold text-red-600">{fieldErrors.stock}</p>}
            </div>

            <div>
              <Label htmlFor="weight" className="mb-2 block text-[12px] font-bold text-[#111]/70">
                Weight
              </Label>
              <Input
                id="weight"
                name="weight"
                defaultValue={product?.weight}
                placeholder="0.8kg"
                className={inputClass}
              />
            </div>

            <div className="md:col-span-3">
              <Label htmlFor="deliveryNote" className="mb-2 block text-[12px] font-bold text-[#111]/70">
                Delivery Note
              </Label>
              <Input
                id="deliveryNote"
                name="deliveryNote"
                defaultValue={product?.deliveryNote}
                placeholder="e.g. Same-day pickup available within Lagos mainland."
                className={inputClass}
              />
            </div>
          </div>
        </section>

        <section className="rounded-3xl border border-black/[0.04] bg-white p-6 shadow-sm">
          <div className="mb-6">
            <h3 className="text-[13px] font-black uppercase tracking-wider text-[#111]">
              Buyer Options
            </h3>
            <p className="mt-1 text-[11px] font-semibold text-[#111]/45">
              Options and keywords used on the public product details page.
            </p>
          </div>

          <div className="grid gap-5 md:grid-cols-2">
            <ChipInput
              label="Sizes / Variants"
              placeholder="Type a variant and press Enter"
              value={variantInput}
              items={sizes}
              onValueChange={setVariantInput}
              onItemsChange={setSizes}
            />

            <ChipInput
              label="Search Tags"
              placeholder="Type a tag and press Enter"
              value={tagInput}
              items={tags}
              onValueChange={setTagInput}
              onItemsChange={setTags}
            />
          </div>
        </section>

        <section className="rounded-3xl border border-black/[0.04] bg-white p-6 shadow-sm">
          <div className="mb-6">
            <h3 className="text-[13px] font-black uppercase tracking-wider text-[#111]">
              Specifications
            </h3>
            <p className="mt-1 text-[11px] font-semibold text-[#111]/45">
              Structured details for the public product information table.
            </p>
          </div>

          <div className="grid gap-5 md:grid-cols-2">
            <ChipInput
              label="Materials"
              placeholder="Type a material and press Enter"
              value={materialInput}
              items={materials}
              onValueChange={setMaterialInput}
              onItemsChange={setMaterials}
            />
            <ChipInput
              label="Care Instructions"
              placeholder="Type an instruction and press Enter"
              value={careInput}
              items={careInstructions}
              onValueChange={setCareInput}
              onItemsChange={setCareInstructions}
            />
            <div>
              <Label htmlFor="packageDimensions" className="mb-2 block text-[12px] font-bold text-[#111]/70">
                Package Dimensions
              </Label>
              <Input
                id="packageDimensions"
                name="specifications.packageDimensions"
                defaultValue={product?.specifications.packageDimensions}
                placeholder="27.3 x 24.8 x 4.9 cm; 180 g"
                className={inputClass}
              />
            </div>
            <div>
              <Label htmlFor="dateFirstAvailable" className="mb-2 block text-[12px] font-bold text-[#111]/70">
                Date First Available
              </Label>
              <Input
                id="dateFirstAvailable"
                name="specifications.dateFirstAvailable"
                defaultValue={product?.specifications.dateFirstAvailable}
                placeholder="August 06, 2026"
                className={inputClass}
              />
            </div>
          </div>
        </section>
      </div>

      <aside className="space-y-6">
        <section className="rounded-3xl border border-black/[0.04] bg-white p-6 shadow-sm">
          <h3 className="text-[13px] font-black uppercase tracking-wider text-[#111]">Product Gallery</h3>
          <label htmlFor="imageFile" className={`mt-5 flex min-h-56 cursor-pointer flex-col items-center justify-center rounded-2xl border-2 border-dashed bg-[#FAF9F5]/40 p-6 text-center transition-colors hover:bg-[#FAF9F5] ${
            fieldErrors.imageFile ? "border-red-500/50" : "border-black/[0.06]"
          }`}>
            <ImagePlus className="h-8 w-8 text-[#111]/30" />
            <p className="mt-3 text-[11px] font-bold text-[#111]/45">Upload main product image</p>
            <p className="mt-1 text-[9px] font-semibold text-[#111]/25">PNG, JPG up to 5MB each</p>
          </label>
          {product?.image && (
            <p className="mt-3 truncate text-[10px] font-bold text-[#111]/35">Current image: {product.image}</p>
          )}
          {fieldErrors.imageFile && <p className="mt-2 text-[11px] font-bold text-red-600">{fieldErrors.imageFile}</p>}
          <Input
            id="imageFile"
            name="imageFile"
            type="file"
            accept="image/*"
            onChange={(event) => setMainImageName(event.target.files?.[0]?.name || "")}
            className="sr-only"
          />
          <label
            htmlFor="imageFile"
            className="mt-4 flex h-12 cursor-pointer items-center justify-center rounded-xl border border-black/[0.06] text-[11px] font-black uppercase tracking-wider text-[#111]/55 transition-colors hover:border-[#C4553A]/30 hover:text-[#C4553A]"
          >
            {mainImageName || "Choose main image"}
          </label>
          {product?.image && (
            <input type="hidden" name="image" value={product.image} />
          )}
          <Input
            id="galleryFiles"
            name="galleryFiles"
            type="file"
            accept="image/*"
            multiple
            onChange={(event) => setGalleryFileNames(Array.from(event.target.files || []).map((file) => file.name))}
            className="sr-only"
          />
          <label
            htmlFor="galleryFiles"
            className="mt-3 flex min-h-12 cursor-pointer items-center justify-center rounded-xl border border-black/[0.06] px-3 py-3 text-center text-[11px] font-black uppercase tracking-wider text-[#111]/55 transition-colors hover:border-[#C4553A]/30 hover:text-[#C4553A]"
          >
            {galleryFileNames.length > 0 ? `${galleryFileNames.length} gallery image${galleryFileNames.length > 1 ? "s" : ""} selected` : "Choose gallery images"}
          </label>
          {product?.gallery.length ? (
            <input type="hidden" name="gallery" value={product.gallery.join(", ")} />
          ) : null}
          <Input
            name="color"
            defaultValue={product?.color}
            placeholder="#F3F3F1"
            className={`mt-4 ${inputClass}`}
          />
        </section>

        <section className="rounded-3xl border border-black/[0.04] bg-white p-6 shadow-sm">
          <h3 className="text-[13px] font-black uppercase tracking-wider text-[#111]">Publishing</h3>
          <div className="mt-5 grid grid-cols-2 gap-2">
            {(["Draft", "Published"] as const).map((option) => (
              <button
                key={option}
                type="button"
                onClick={() => setStatus(option)}
                className={`rounded-full border px-4 py-3 text-[10px] font-black uppercase tracking-wider transition-colors ${
                  status === option
                    ? "border-[#C4553A]/20 bg-[#C4553A]/[0.06] text-[#C4553A]"
                    : "border-black/[0.06] text-[#111]/40 hover:text-[#111]"
                }`}
              >
                {option}
              </button>
            ))}
          </div>
          <input type="hidden" name="status" value={status} />

          <div className="mt-6 flex flex-col gap-2">
            <Button disabled={isSaving} className="h-12 rounded-full bg-[#111] text-[11px] font-bold uppercase tracking-wider text-white hover:bg-[#C4553A]">
              <Save className="mr-2 h-4 w-4" />
              {isSaving ? "Saving..." : isEdit ? "Save Changes" : "Create Product"}
            </Button>
            <Link
              href="/seller/products"
              className="rounded-full border border-black/[0.06] px-4 py-3 text-center text-[11px] font-bold uppercase tracking-wider text-[#111]/50 transition-colors hover:bg-black/[0.02] hover:text-[#111]"
            >
              Cancel
            </Link>
          </div>
        </section>
      </aside>
    </form>
  );
}
