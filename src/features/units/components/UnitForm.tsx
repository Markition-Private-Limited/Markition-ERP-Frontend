import { FormEvent, useState } from 'react'
import { FormField } from '../../../shared/components/FormField'
import { ReferenceSelect } from '../../../shared/components/ReferenceSelect'
import { getApiErrorMessage } from '../../../shared/lib/axios'
import type { Unit } from '../api/units.api'
import { useCreateUnit } from '../hooks/useCreateUnit'
import { useUnits } from '../hooks/useUnits'

export function UnitForm({ onSuccess }: { onSuccess?: (unit: Unit) => void }) {
  const [name, setName] = useState('')
  const [code, setCode] = useState('')
  const [baseUnitId, setBaseUnitId] = useState('')
  const [conversionFactor, setConversionFactor] = useState('1')
  const units = useUnits()
  const mutation = useCreateUnit()

  function submit(event: FormEvent) {
    event.preventDefault()
    event.stopPropagation()
    mutation.mutate({
      name,
      code,
      ...(baseUnitId && { base_unit_id: baseUnitId, conversion_factor: Number(conversionFactor) }),
    }, { onSuccess })
  }

  return <form onSubmit={submit} className="erp-form form-narrow inline-create-form">
    <FormField label="Name"><input required value={name} onChange={(event) => setName(event.target.value)} /></FormField>
    <FormField label="Code"><input required value={code} onChange={(event) => setCode(event.target.value)} /></FormField>
    <FormField label="Base Unit"><ReferenceSelect value={baseUnitId} onChange={setBaseUnitId} createLabel="unit" dialogTitle="Create unit" renderCreateForm={(created) => <UnitForm onSuccess={(unit) => created(unit.id)} />}>
      <option value="">No base unit</option>
      {units.data?.map((unit) => <option key={unit.id} value={unit.id}>{unit.name}</option>)}
    </ReferenceSelect></FormField>
    {baseUnitId && <FormField label="Conversion Factor"><input required type="number" min="0.000001" step="0.000001" value={conversionFactor} onChange={(event) => setConversionFactor(event.target.value)} /></FormField>}
    <button type="submit" disabled={mutation.isPending}>{mutation.isPending ? 'Saving...' : 'Save Unit'}</button>
    {(units.isError || mutation.isError) && <p role="alert">{getApiErrorMessage(units.error ?? mutation.error)}</p>}
  </form>
}
