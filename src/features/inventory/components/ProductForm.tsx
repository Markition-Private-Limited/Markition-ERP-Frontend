import { FormEvent, useState } from 'react'
import { getApiErrorMessage } from '../../../shared/lib/axios'
import { FormField } from '../../../shared/components/FormField'
import { ReferenceSelect } from '../../../shared/components/ReferenceSelect'
import type { Product, TrackingType } from '../../../shared/types'
import { CategoryForm, useCategories } from '../../categories'
import { UnitForm, useUnits } from '../../units'
import { useCreateProduct } from '../hooks/useCreateProduct'

export function ProductForm({ onSuccess }: { onSuccess: (product: Product) => void }) {
  const [sku, setSku] = useState('')
  const [name, setName] = useState('')
  const [categoryId, setCategoryId] = useState('')
  const [trackingType, setTrackingType] = useState<TrackingType>('BULK')
  const [unitId, setUnitId] = useState('')
  const [stockQty, setStockQty] = useState('0')
  const [costPrice, setCostPrice] = useState('')
  const [sellingPrice, setSellingPrice] = useState('')
  const categories = useCategories()
  const units = useUnits()
  const mutation = useCreateProduct()

  function submit(event: FormEvent) {
    event.preventDefault()
    event.stopPropagation()
    mutation.mutate({
      sku,
      name,
      category_id: categoryId || undefined,
      tracking_type: trackingType,
      ...(trackingType === 'BULK' ? {
        base_unit_id: unitId || undefined,
        sell_unit_id: unitId || undefined,
        stock_qty: Number(stockQty),
      } : {}),
      cost_price: costPrice === '' ? 0 : Number(costPrice),
      selling_price: sellingPrice === '' ? 0 : Number(sellingPrice),
    }, { onSuccess })
  }

  return <form onSubmit={submit} className="erp-form form-wide">
    <FormField label="SKU"><input required value={sku} onChange={(event) => setSku(event.target.value)} /></FormField>
    <FormField label="Name"><input required value={name} onChange={(event) => setName(event.target.value)} /></FormField>
    <FormField label="Category"><ReferenceSelect value={categoryId} onChange={setCategoryId} createLabel="category" dialogTitle="Create category" renderCreateForm={(created) => <CategoryForm onSuccess={(category) => created(category.id)} />}>
      <option value="">No category</option>
      {categories.data?.map((category) => <option key={category.id} value={category.id}>{category.name}</option>)}
    </ReferenceSelect></FormField>
    <fieldset>
      <legend>How do you sell this product?</legend>
      <label><input type="radio" name="tracking-type" value="BULK" checked={trackingType === 'BULK'} onChange={() => setTrackingType('BULK')} /> Sold by quantity</label>
      <p>e.g. bottles, kg, boxes, bags — you track how many you have in stock</p>
      <label><input type="radio" name="tracking-type" value="SERIALIZED" checked={trackingType === 'SERIALIZED'} onChange={() => setTrackingType('SERIALIZED')} /> Sold as individual units</label>
      <p>e.g. cars, laptops, machines — each item has a unique identity (serial number, VIN)</p>
    </fieldset>
    {trackingType === 'BULK' ? <>
      <FormField label="Unit of measurement"><ReferenceSelect value={unitId} onChange={setUnitId} createLabel="unit" dialogTitle="Create unit" renderCreateForm={(created) => <UnitForm onSuccess={(unit) => created(unit.id)} />}>
        <option value="">e.g. Bottle, kg, Box</option>
        {units.data?.map((unit) => <option key={unit.id} value={unit.id}>{unit.name}</option>)}
      </ReferenceSelect></FormField>
      <FormField label="Current stock quantity"><input type="number" min="0" step="0.000001" value={stockQty} onChange={(event) => setStockQty(event.target.value)} /></FormField>
    </> : <p>After creating this product, go to the product detail page to add individual units with their serial numbers (e.g. VIN numbers for cars).</p>}
    <FormField label="Cost price"><input type="number" min="0" step="0.01" value={costPrice} onChange={(event) => setCostPrice(event.target.value)} /></FormField>
    <FormField label="Selling price"><input type="number" min="0" step="0.01" value={sellingPrice} onChange={(event) => setSellingPrice(event.target.value)} /></FormField>
    <button type="submit" disabled={mutation.isPending}>{mutation.isPending ? 'Saving...' : 'Add Product'}</button>
    {(categories.isError || units.isError || mutation.isError) && <p role="alert">{getApiErrorMessage(categories.error ?? units.error ?? mutation.error)}</p>}
  </form>
}
