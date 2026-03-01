<script setup lang="ts">
import type {} from '../types/nuxt-shims'
import { computed, onMounted, ref, watch } from 'vue'
import { useGoogleSheetsImport } from '../composables/useGoogleSheetsImport'

interface Props {
  initialSchema?: string
}

const props = withDefaults(defineProps<Props>(), {
  initialSchema: ''
})

const { getSchemaColumns } = useGoogleSheetsImport()
const toast = useToast()

const selectedSchema = ref('')
const availableSchemas = ref<string[]>([])
const columns = ref<string[]>([])
const collectionType = ref<'page' | 'data' | 'unknown'>('unknown')
const pageOverrideColumns = ref<string[]>([])
const status = ref<'idle' | 'pending' | 'success' | 'error'>('idle')
const error = ref('')

const schemaOptions = computed(() => availableSchemas.value.map(schema => ({
  label: schema,
  value: schema
})))

async function loadSchemas() {
  status.value = 'pending'
  error.value = ''

  try {
    const response = await getSchemaColumns()
    availableSchemas.value = response.schemas
    selectedSchema.value = props.initialSchema && response.schemas.includes(props.initialSchema)
      ? props.initialSchema
      : response.schemas[0] ?? ''
    status.value = 'success'
  } catch (cause) {
    status.value = 'error'
    error.value = cause instanceof Error ? cause.message : 'Could not load schema list.'
  }
}

async function loadColumns(schema: string) {
  if (!schema) {
    columns.value = []
    return
  }

  status.value = 'pending'
  error.value = ''

  try {
    const response = await getSchemaColumns(schema)
    columns.value = response.columns
    collectionType.value = response.collectionType
    pageOverrideColumns.value = response.pageOverrideColumns
    status.value = 'success'
  } catch (cause) {
    columns.value = []
    collectionType.value = 'unknown'
    pageOverrideColumns.value = []
    status.value = 'error'
    error.value = cause instanceof Error ? cause.message : 'Could not load schema columns.'
  }
}

watch(selectedSchema, async (schema) => {
  await loadColumns(schema)
})

onMounted(async () => {
  await loadSchemas()
  if (selectedSchema.value) {
    await loadColumns(selectedSchema.value)
  }
})

function copyColumns() {
  const content = columns.value.join('\n')
  if (!content) {
    return
  }

  navigator.clipboard.writeText(content)
  toast.add({
    title: 'Copied',
    description: 'Column names copied to clipboard.',
    color: 'success'
  })
}

function csvRow(values: string[]): string {
  return values
    .map((value) => {
      const escaped = value.replaceAll('"', '""')
      return `"${escaped}"`
    })
    .join(',')
}

function copyColumnsCsv() {
  const content = csvRow(columns.value)
  if (!content) {
    return
  }

  navigator.clipboard.writeText(content)
  toast.add({
    title: 'Copied',
    description: 'Column names copied as a CSV row.',
    color: 'success'
  })
}

function copyPageOverrideColumns() {
  const content = pageOverrideColumns.value.join('\n')
  if (!content) {
    return
  }

  navigator.clipboard.writeText(content)
  toast.add({
    title: 'Copied',
    description: 'Page override column names copied to clipboard.',
    color: 'success'
  })
}

function copyPageOverrideColumnsCsv() {
  const content = csvRow(pageOverrideColumns.value)
  if (!content) {
    return
  }

  navigator.clipboard.writeText(content)
  toast.add({
    title: 'Copied',
    description: 'Page override column names copied as a CSV row.',
    color: 'success'
  })
}
</script>

<template>
  <div class="space-y-4">
    <UAlert
      title="Schema column helper"
      description="Choose a schema to see the expected Google Sheet column names."
      color="neutral"
      variant="subtle"
    />

    <UAlert
      v-if="error"
      title="Could not load schema information"
      :description="error"
      color="error"
      variant="subtle"
    />

    <UFormField
      label="Collection schema"
      name="schema"
      description="Pick the schema you want to import."
    >
      <USelect
        v-model="selectedSchema"
        :items="schemaOptions"
        value-key="value"
        icon="i-heroicons-cube-20-solid"
        class="w-full max-w-sm"
        :loading="status === 'pending'"
      />
    </UFormField>

    <UAlert
      v-if="status === 'success' && selectedSchema"
      title="Expected column names"
      :description="`Use these exact headers in your Google Sheet for schema: ${selectedSchema}.`"
      color="neutral"
      variant="subtle"
    />

    <div
      v-if="columns.length"
      class="space-y-3"
    >
      <div class="flex flex-wrap gap-2">
        <UButton
          label="Copy column names"
          icon="i-heroicons-clipboard-document-20-solid"
          color="neutral"
          variant="subtle"
          @click="copyColumns"
        />
        <UButton
          label="Copy as CSV row"
          icon="i-heroicons-table-cells-20-solid"
          color="neutral"
          variant="subtle"
          @click="copyColumnsCsv"
        />
      </div>
      <pre class="text-xs whitespace-pre-wrap">{{ columns.join('\n') }}</pre>

      <UAlert
        v-if="collectionType === 'page' && pageOverrideColumns.length"
        title="Nuxt Content page overrides"
        description="Optional built-in page fields Nuxt Content adds automatically for page collections."
        color="neutral"
        variant="subtle"
      />

      <div
        v-if="collectionType === 'page' && pageOverrideColumns.length"
        class="space-y-3"
      >
        <div class="flex flex-wrap gap-2">
          <UButton
            label="Copy page override columns"
            icon="i-heroicons-clipboard-document-list-20-solid"
            color="neutral"
            variant="subtle"
            @click="copyPageOverrideColumns"
          />
          <UButton
            label="Copy overrides as CSV row"
            icon="i-heroicons-table-cells-20-solid"
            color="neutral"
            variant="subtle"
            @click="copyPageOverrideColumnsCsv"
          />
        </div>
        <pre class="text-xs whitespace-pre-wrap">{{ pageOverrideColumns.join('\n') }}</pre>
      </div>
    </div>
  </div>
</template>
