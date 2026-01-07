# EditProductModal - Remaining Manual Edits

## Quick Reference Guide

The EditProductModal needs the exact same UI changes as CreateProductModal. Below are the specific edits needed.

---

## Edit 1: Comment Out Images Section

**Location:** Around line 1133-1195

**Find:**
```javascript
{/* Images */}
<div className="mb-6 border border-gray-200 rounded-lg overflow-hidden">
  <button
    type="button"
    onClick={() => toggleSection('images')}
    ...
  </button>
  {openSections.images && (
    ...
  )}
</div>
```

**Replace with:**
```javascript
{/* Images - COMMENTED OUT - Now part of Condition Options */}
{/* <div className="mb-6 border border-gray-200 rounded-lg overflow-hidden">
  <button
    type="button"
    onClick={() => toggleSection('images')}
    ...
  </button>
  {openSections.images && (
    ...
  )}
</div> */}
```

---

## Edit 2: Comment Out Pricing Section

**Location:** Around line 1197-1296

**Find:**
```javascript
{/* Pricing */}
<div className="mb-6 border border-gray-200 rounded-lg overflow-hidden">
  <button
    type="button"
    onClick={() => toggleSection('pricing')}
    ...
  </button>
  {openSections.pricing && (
    ...
  )}
</div>
```

**Replace with:**
```javascript
{/* Pricing - COMMENTED OUT - Now part of Condition Options */}
{/* <div className="mb-6 border border-gray-200 rounded-lg overflow-hidden">
  <button
    type="button"
    onClick={() => toggleSection('pricing')}
    ...
  </button>
  {openSections.pricing && (
    ...
  )}
</div> */}
```

---

## Edit 3: Add Images and Pricing to Condition Options

**Location:** After the Stock field in each condition (around line 1744)

**Find the end of the Stock field:**
```javascript
<div>
  <label className="block text-sm font-medium text-gray-700 mb-1">
    Stock
  </label>
  <input
    type="number"
    placeholder="Available quantity"
    value={condition.stock || 0}
    onChange={e => {
      const newConditions = [...formData.conditionOptions];
      newConditions[index] = {
        ...condition,
        stock: parseInt(e.target.value) || 0,
      };
      setFormData((prev: any) => ({
        ...prev,
        conditionOptions: newConditions,
      }));
    }}
    min="0"
    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
  />
</div>
```

**Add immediately after the closing `</div>` of the grid (before the condition card closing div):**

Copy the **entire code block** from [CreateProductModal.tsx lines 2572-2766](frontend/src/components/partner/CreateProductModal.tsx#L2572-L2766)

This includes:
1. Images upload section with Cloudinary integration
2. Pricing section with MRP, Discounted Price, and auto-calculated Discount %

---

## Edit 4: Update "Add Condition Option" Button

**Location:** Around line 1755

**Find:**
```javascript
onClick={() =>
  setFormData((prev: any) => ({
    ...prev,
    conditionOptions: [
      ...prev.conditionOptions,
      { label: '', price: 0, ram: '', storage: '', color: '', stock: 0 },
    ],
  }))
}
```

**Replace with:**
```javascript
onClick={() =>
  setFormData((prev: any) => ({
    ...prev,
    conditionOptions: [
      ...prev.conditionOptions,
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
      },
    ],
  }))
}
```

---

## Alternative: Copy Entire Section

If you prefer a cleaner approach, you can:

1. Open [CreateProductModal.tsx](frontend/src/components/partner/CreateProductModal.tsx)
2. Find the "Condition Options" section (starts around line 2377)
3. Copy the entire section from `{/* Condition Options */}` to the closing `</div>` (ends around line 2801)
4. Replace the corresponding section in EditProductModal.tsx

This ensures 100% consistency between Create and Edit modals.

---

## Verification Checklist

After making edits, verify:

- [ ] Images section is commented out (should appear grayed out in editor)
- [ ] Pricing section is commented out (should appear grayed out in editor)
- [ ] Each condition option has image upload area
- [ ] Each condition option has pricing inputs (MRP, Discounted Price, Discount %)
- [ ] "Add Condition Option" button creates conditions with images and pricing fields
- [ ] No TypeScript errors in the file
- [ ] File saves successfully

---

## Testing After Edits

1. Start the dev server: `npm run dev` (in frontend directory)
2. Navigate to Partner dashboard
3. Click "Edit" on an existing product
4. Scroll to "Condition Options"
5. Verify:
   - Images section is not visible in the main form
   - Pricing section is not visible in the main form
   - Each condition has an image upload area
   - Each condition has pricing inputs
   - Can upload images for each condition
   - Can enter pricing for each condition
   - Discount % auto-calculates
6. Save the product
7. Verify data persists after save

---

## Need Help?

If you encounter any issues:

1. Check the console for errors
2. Compare your code with CreateProductModal.tsx
3. Ensure all imports are present (Camera, DollarSign icons, cloudinaryService, toast)
4. Verify the `index` variable is available in the scope
5. Check that `formData.conditionOptions` is properly structured

The changes should be straightforward since EditProductModal has the same structure as CreateProductModal.
