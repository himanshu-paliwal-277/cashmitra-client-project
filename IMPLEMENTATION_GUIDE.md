# Implementation Guide: Move Images and Pricing to Condition Options

## Summary
This guide documents the changes made to move product images and pricing fields from separate accordion sections into individual condition options. Each condition option now has its own set of images and pricing (MRP, discounted price, discount percentage).

## ✅ Completed Changes

### 1. Backend Schema (`backend/src/models/buyProduct.model.js`)

**Updated `conditionOptions` schema:**
```javascript
conditionOptions: [
  {
    label: String,
    price: Number,
    ram: String,
    storage: String,
    color: String,
    stock: { type: Number, default: 0 },
    images: [String],  // NEW: Array of image URLs for this condition
    pricing: {         // NEW: Pricing details for this condition
      mrp: Number,
      discountedPrice: Number,
      discountPercent: Number,
    },
  },
],
```

### 2. CreateProductModal (`frontend/src/components/partner/CreateProductModal.tsx`)

#### Changes Made:
1. **Commented out Images accordion** (lines ~1056-1118)
2. **Commented out Pricing accordion** (lines ~1120-1218)
3. **Updated initial conditionOptions state** to include:
   ```javascript
   {
     label: 'Excellent',
     price: 0,
     ram: '',
     storage: '',
     color: '',
     stock: 0,
     images: [],
     pricing: {
       mrp: '',
       discountedPrice: '',
       discountPercent: '',
     }
   }
   ```

4. **Added to each condition option UI:**
   - **Images Upload Section** with:
     - Drag-and-drop file input
     - Cloudinary upload integration
     - Image preview grid
     - Remove button for each image

   - **Pricing Section** with:
     - MRP input
     - Discounted Price input
     - Auto-calculated Discount % (read-only)
     - Auto-calculation logic that updates discount% when MRP or discounted price changes

### 3. EditProductModal (`frontend/src/components/partner/EditProductModal.tsx`)

#### Completed:
- ✅ Updated initial state conditionOptions
- ✅ Updated product load fallback

#### TODO - Apply same changes as CreateProductModal:

**Step 1: Comment out Images section** (around line 1133-1195)
Find and wrap in comments:
```javascript
{/* Images - COMMENTED OUT - Now part of Condition Options */}
{/* <div className="mb-6 border border-gray-200 rounded-lg overflow-hidden">
  ...entire Images section...
</div> */}
```

**Step 2: Comment out Pricing section** (around line 1197-1296)
Find and wrap in comments:
```javascript
{/* Pricing - COMMENTED OUT - Now part of Condition Options */}
{/* <div className="mb-6 border border-gray-200 rounded-lg overflow-hidden">
  ...entire Pricing section...
</div> */}
```

**Step 3: Add Images and Pricing to Condition Options**
After the Stock field in each condition option (around line 1744), add:

```javascript
{/* Product Images for this condition */}
<div className="mt-3 pt-3 border-t border-gray-300">
  <label className="block text-sm font-medium text-gray-700 mb-2">
    <Camera className="w-4 h-4 inline mr-1" />
    Product Images
  </label>
  <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center">
    <input
      type="file"
      multiple
      accept="image/*"
      onChange={async (e) => {
        const files = Array.from(e.target.files || []);
        if (!files.length) return;

        setLoading(true);
        try {
          const uploadPromises = files.map((file: any) =>
            cloudinaryService.uploadImage(file, {
              folder: 'partner-products',
              transformation: [
                { width: 800, height: 600, crop: 'fill' },
                { quality: 'auto' },
                { fetch_format: 'auto' },
              ],
            })
          );
          const uploadResults = await Promise.all(uploadPromises);

          const newImages = uploadResults
            .filter((result: any) => result.success && result.data?.url)
            .map((result: any) => result.data.url);

          if (newImages.length > 0) {
            const newConditions = [...formData.conditionOptions];
            newConditions[index] = {
              ...condition,
              images: [...(condition.images || []), ...newImages],
            };
            setFormData((prev: any) => ({
              ...prev,
              conditionOptions: newConditions,
            }));
            toast.success(`${newImages.length} image(s) uploaded successfully!`);
          } else {
            toast.error('No images were uploaded successfully');
          }

          e.target.value = '';
        } catch (error: any) {
          console.error('Error uploading images:', error);
          toast.error(error.message || 'Failed to upload images');
          e.target.value = '';
        } finally {
          setLoading(false);
        }
      }}
      className="hidden"
      id={`condition-image-upload-${index}`}
    />
    <label htmlFor={`condition-image-upload-${index}`} className="cursor-pointer">
      <Camera className="w-8 h-8 text-gray-400 mx-auto mb-2" />
      <p className="text-gray-600 text-sm mb-1">Click to upload images</p>
      <p className="text-xs text-gray-500">PNG, JPG up to 5MB each</p>
    </label>
  </div>
  {condition.images?.length > 0 && (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-2 mt-3">
      {condition.images.map((image: string, imgIndex: number) => (
        <div key={imgIndex} className="relative">
          <img
            src={image}
            alt={`${condition.label} ${imgIndex + 1}`}
            className="w-full h-24 object-cover rounded-lg border border-gray-200"
          />
          <button
            type="button"
            onClick={() => {
              const newConditions = [...formData.conditionOptions];
              newConditions[index] = {
                ...condition,
                images: condition.images.filter((_: any, i: number) => i !== imgIndex),
              };
              setFormData((prev: any) => ({
                ...prev,
                conditionOptions: newConditions,
              }));
            }}
            className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white rounded-full flex items-center justify-center hover:bg-red-600"
          >
            <X size={12} />
          </button>
        </div>
      ))}
    </div>
  )}
</div>

{/* Pricing for this condition */}
<div className="mt-3 pt-3 border-t border-gray-300">
  <label className="block text-sm font-medium text-gray-700 mb-2">
    <DollarSign className="w-4 h-4 inline mr-1" />
    Pricing Details
  </label>
  <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
    <div>
      <label className="block text-xs font-medium text-gray-600 mb-1">
        MRP (₹)
      </label>
      <input
        type="number"
        placeholder="99999"
        value={condition.pricing?.mrp || ''}
        onChange={e => {
          const newConditions = [...formData.conditionOptions];
          const mrp = e.target.value;
          const discountedPrice = condition.pricing?.discountedPrice || '';

          let discountPercent = '';
          if (mrp && discountedPrice && parseFloat(discountedPrice) < parseFloat(mrp)) {
            discountPercent = (((parseFloat(mrp) - parseFloat(discountedPrice)) / parseFloat(mrp)) * 100).toFixed(2);
          }

          newConditions[index] = {
            ...condition,
            pricing: {
              ...condition.pricing,
              mrp,
              discountPercent,
            },
          };
          setFormData((prev: any) => ({
            ...prev,
            conditionOptions: newConditions,
          }));
        }}
        step="0.01"
        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
      />
    </div>
    <div>
      <label className="block text-xs font-medium text-gray-600 mb-1">
        Discounted Price (₹)
      </label>
      <input
        type="number"
        placeholder="89999"
        value={condition.pricing?.discountedPrice || ''}
        onChange={e => {
          const newConditions = [...formData.conditionOptions];
          const discountedPrice = e.target.value;
          const mrp = condition.pricing?.mrp || '';

          let discountPercent = '';
          if (mrp && discountedPrice && parseFloat(discountedPrice) < parseFloat(mrp)) {
            discountPercent = (((parseFloat(mrp) - parseFloat(discountedPrice)) / parseFloat(mrp)) * 100).toFixed(2);
          }

          newConditions[index] = {
            ...condition,
            pricing: {
              ...condition.pricing,
              discountedPrice,
              discountPercent,
            },
          };
          setFormData((prev: any) => ({
            ...prev,
            conditionOptions: newConditions,
          }));
        }}
        step="0.01"
        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
      />
    </div>
    <div>
      <label className="block text-xs font-medium text-gray-600 mb-1">
        Discount % <span className="text-gray-400">(Auto)</span>
      </label>
      <input
        type="number"
        value={condition.pricing?.discountPercent || ''}
        placeholder="0"
        step="0.01"
        readOnly
        className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-50 text-gray-600 cursor-not-allowed"
      />
      {condition.pricing?.discountPercent && parseFloat(condition.pricing.discountPercent) > 0 && (
        <p className="text-green-600 text-xs mt-1">
          ✓ {condition.pricing.discountPercent}% off
        </p>
      )}
    </div>
  </div>
</div>
```

**Step 4: Update "Add Condition Option" button** (around line 1755)
Change from:
```javascript
{ label: '', price: 0, ram: '', storage: '', color: '', stock: 0 }
```

To:
```javascript
{
  label: '',
  price: 0,
  ram: '',
  storage: '',
  color: '',
  stock: 0,
  images: [],
  pricing: {
    mrp: '',
    discountedPrice: '',
    discountPercent: '',
  }
}
```

## 📋 Next Steps: ProductDetails.tsx

### Required Changes in `frontend/src/pages/customer/buy/ProductDetails.tsx`:

1. **Update image display to use condition-specific images:**
   - When a condition is selected, switch the main product images to `selectedCondition.images`
   - Fallback to product.images if condition has no images

2. **Update pricing display to use condition-specific pricing:**
   - Use `selectedCondition.pricing.mrp` and `selectedCondition.pricing.discountedPrice`
   - Display `selectedCondition.pricing.discountPercent`
   - Fallback to product.pricing if condition has no pricing

3. **Update condition button cards:**
   - Show thumbnail of first image from `condition.images` if available
   - Display pricing from `condition.pricing` if available
   - Show "No image" placeholder if no images

### Example Implementation:

```javascript
// Get current images based on selected condition
const currentImages = selectedCondition?.images?.length > 0
  ? selectedCondition.images
  : (product.images || []);

// Get current pricing based on selected condition
const currentPricing = selectedCondition?.pricing?.mrp
  ? selectedCondition.pricing
  : product.pricing;

const priceNow = currentPricing?.discountedPrice || selectedCondition?.price || product.pricing?.discountedPrice;
const mrp = currentPricing?.mrp || product.pricing?.mrp;
const discountPct = currentPricing?.discountPercent ||
  (mrp && priceNow < mrp ? Math.round(((mrp - priceNow) / mrp) * 100) : null);
```

## Testing Checklist

- [ ] Create new product with multiple conditions, each with different images and pricing
- [ ] Edit existing product and verify all fields load correctly
- [ ] Verify image upload works for each condition separately
- [ ] Verify discount percentage auto-calculates correctly
- [ ] Verify condition-specific images show in ProductDetails
- [ ] Verify condition-specific pricing shows in ProductDetails
- [ ] Verify selecting different conditions updates images and pricing
- [ ] Verify backend saves and retrieves all data correctly

## Files Modified

1. ✅ `backend/src/models/buyProduct.model.js`
2. ✅ `frontend/src/components/partner/CreateProductModal.tsx`
3. ⏸️ `frontend/src/components/partner/EditProductModal.tsx` (partial)
4. ⏳ `frontend/src/pages/customer/buy/ProductDetails.tsx` (pending)

