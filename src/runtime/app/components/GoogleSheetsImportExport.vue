<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { queryCollection, useAsyncData, useToast } from '#imports'
import { useGoogleSheetsImport } from '../composables/useGoogleSheetsImport'
import { copyTextWithSuccessToast } from '../utils/clipboard'
import { toCsvRow, toTsvRow } from '../utils/delimited'
import { flattenRecordToStringMap } from '../utils/pathMapping'

const toast = useToast()
const { getSchemaColumns } = useGoogleSheetsImport()
const queryCollectionAny = queryCollection as unknown as (collection: string) => { all: () => Promise<unknown[]> }

function queryCollectionRows(collection: string): Promise<Record<string, unknown>[]> {
  const query = queryCollectionAny(collection)
  return query.all() as Promise<Record<string, unknown>[]>
}

const selectedSchema = ref('')

const {
  data: rowsData,
  pending,
  error: loadError,
  status,
  execute,
  clear,
} = useAsyncData<Record<string, unknown>[]>(
  async () => {
    if (!selectedSchema.value) {
      return []
    }

    return await queryCollectionRows(selectedSchema.value)
  },
  {
    immediate: false,
    default: () => [],
  },
)

const {
  data: schemaNames,
  error: schemaNamesError,
} = useAsyncData<string[]>(
  'google-sheets-import-export-schemas',
  async () => {
    const response = await getSchemaColumns()
    return response.schemas ?? []
  },
  {
    default: () => [],
  },
)

const rows = computed(() => rowsData.value ?? [])
const error = computed(() => loadError.value?.message ?? schemaNamesError.value?.message ?? '')

watch(selectedSchema, () => {
  clear()
})

const schemaOptions = computed(() => (schemaNames.value ?? [])
  .sort((left, right) => left.localeCompare(right))
  .map(schema => ({ label: schema, value: schema })))

const headers = computed(() => {
  const all = new Set<string>()
  for (const row of rows.value) {
    flattenRecordToStringMap(row).forEach((_, key) => all.add(key))
  }
  return Array.from(all).sort((left, right) => left.localeCompare(right))
})

const csvText = computed(() => {
  if (!headers.value.length) {
    return ''
  }

  const lines: string[] = []
  lines.push(toCsvRow(headers.value))

  for (const row of rows.value) {
    const flat = flattenRecordToStringMap(row)
    const values = headers.value.map(header => flat.get(header) ?? '')
    lines.push(toCsvRow(values))
  }

  return `${lines.join('\n')}\n`
})

const tsvText = computed(() => {
  if (!headers.value.length) {
    return ''
  }

  const lines: string[] = []
  lines.push(toTsvRow(headers.value))

  for (const row of rows.value) {
    const flat = flattenRecordToStringMap(row)
    const values = headers.value.map(header => flat.get(header) ?? '')
    lines.push(toTsvRow(values))
  }

  return `${lines.join('\n')}\n`
})

const previewText = computed(() => {
  if (!csvText.value) {
    return ''
  }

  return csvText.value.split('\n').slice(0, 11).join('\n')
})

async function loadRecords() {
  if (!selectedSchema.value) {
    return
  }

  await execute()

  if (status.value === 'success') {
    toast.add({
      title: 'Export ready',
      description: `Loaded ${rows.value.length} row(s) from collection ${selectedSchema.value}.`,
      color: 'success',
    })
  }
}

async function copyCsv() {
  await copyTextWithSuccessToast({
    text: tsvText.value,
    toast,
    description: 'Tab-separated rows copied for Google Sheets paste.',
    title: 'Copied',
  })
}

function downloadCsv() {
  if (!csvText.value) {
    return
  }

  const blob = new Blob([csvText.value], { type: 'text/csv;charset=utf-8' })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = `${selectedSchema.value || 'export'}.csv`
  link.click()
  URL.revokeObjectURL(url)
}
</script>

<template>
  <div class="space-y-4">
    <UAlert
      title="Export Existing Content"
      description="Load records from a Nuxt Content collection and export them as CSV for Google Sheets."
      color="neutral"
      variant="subtle"
    />

    <UAlert
      v-if="error"
      title="Could not load collection"
      :description="error"
      color="error"
      variant="subtle"
    />

    <UFormField
      label="Collection schema"
      name="schema"
      description="Pick the schema/collection to export."
    >
      <USelect
        v-model="selectedSchema"
        :items="schemaOptions"
        value-key="value"
        class="w-full max-w-sm"
        icon="i-heroicons-cube-20-solid"
      />
    </UFormField>

    <div class="flex flex-wrap gap-2">
      <UButton
        label="Load records"
        icon="i-heroicons-arrow-down-tray-20-solid"
        :disabled="!selectedSchema"
        :loading="pending"
        @click="loadRecords"
      />
      <UButton
        label="Copy for Google Sheets"
        icon="i-heroicons-clipboard-document-20-solid"
        color="neutral"
        variant="subtle"
        :disabled="!tsvText"
        @click="copyCsv"
      />
      <UButton
        label="Download .csv"
        icon="i-heroicons-document-arrow-down-20-solid"
        color="neutral"
        variant="subtle"
        :disabled="!csvText"
        @click="downloadCsv"
      />
    </div>

    <UAlert
      v-if="status === 'success'"
      title="Export prepared ok"
      :description="`${rows.length} row(s), ${headers.length} column(s).`"
      color="success"
      variant="subtle"
    />

    <UCollapsible
      v-if="previewText"
      class="flex flex-col gap-2 w-full"
    >
      <UButton
        label="Preview CSV (first 10 rows)"
        color="neutral"
        variant="subtle"
        trailing-icon="i-lucide-chevron-down"
        block
      />

      <template #content>
        <pre class="text-xs whitespace-pre-wrap">{{ previewText }}</pre>
      </template>
    </UCollapsible>
  </div>
</template>
