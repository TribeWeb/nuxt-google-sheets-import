<script setup lang="ts">
import { onMounted, ref, watch } from 'vue'
import { useGoogleSheetsImport } from '../composables/useGoogleSheetsImport'
import { toTsvRow } from '../utils/delimited'

interface Props {
  initialSchema?: string
}

const props = withDefaults(defineProps<Props>(), {
  initialSchema: '',
})

const { getSchemaColumns } = useGoogleSheetsImport()

const selectedSchema = ref('')
const availableSchemas = ref<string[]>([])
const columns = ref<string[]>([])
const collectionType = ref<'page' | 'data' | 'unknown'>('unknown')
const pageOverrideColumns = ref<string[]>([])
const status = ref<'idle' | 'pending' | 'success' | 'error'>('idle')
const error = ref('')
const copyFeedback = ref('')

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
  }
  catch (cause) {
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
  }
  catch (cause) {
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

async function copyText(text: string, successMessage: string) {
  if (!text) {
    return
  }

  try {
    await navigator.clipboard.writeText(text)
    copyFeedback.value = successMessage
  }
  catch {
    copyFeedback.value = 'Could not copy to clipboard.'
  }
}

async function copyColumns() {
  await copyText(columns.value.join('\n'), 'Column names copied to clipboard.')
}

async function copyColumnsTsv() {
  await copyText(toTsvRow(columns.value), 'Column names copied as a tab-separated row for Google Sheets.')
}

async function copyPageOverrideColumns() {
  await copyText(pageOverrideColumns.value.join('\n'), 'Page override column names copied to clipboard.')
}

async function copyPageOverrideColumnsTsv() {
  await copyText(toTsvRow(pageOverrideColumns.value), 'Page override column names copied as a tab-separated row for Google Sheets.')
}
</script>

<template>
  <div class="space-y-4 rounded-lg border border-gray-200 p-4 bg-white">
    <div class="rounded-md border border-gray-200 bg-gray-50 p-3">
      <p class="text-sm font-semibold text-gray-900">
        Schema column helper
      </p>
      <p class="text-sm text-gray-600">
        Choose a schema to see the expected Google Sheet column names.
      </p>
    </div>

    <div
      v-if="error"
      class="rounded-md border border-red-200 bg-red-50 p-3"
    >
      <p class="text-sm font-semibold text-red-900">
        Could not load schema information
      </p>
      <p class="text-sm text-red-700">
        {{ error }}
      </p>
    </div>

    <div class="space-y-1">
      <label
        for="schema-select"
        class="block text-sm font-medium text-gray-800"
      >
        Collection schema
      </label>
      <p class="text-xs text-gray-500">
        Pick the schema you want to import.
      </p>
      <select
        id="schema-select"
        v-model="selectedSchema"
        class="w-full max-w-sm rounded-md border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900"
        :disabled="status === 'pending' || !availableSchemas.length"
      >
        <option
          v-if="!availableSchemas.length"
          value=""
        >
          {{ status === 'pending' ? 'Loading schemas...' : 'No schemas found' }}
        </option>
        <option
          v-for="schema in availableSchemas"
          :key="schema"
          :value="schema"
        >
          {{ schema }}
        </option>
      </select>
    </div>

    <div
      v-if="status === 'success' && selectedSchema"
      class="rounded-md border border-gray-200 bg-gray-50 p-3"
    >
      <p class="text-sm font-semibold text-gray-900">
        Expected column names
      </p>
      <p class="text-sm text-gray-600">
        Use these exact headers in your Google Sheet for schema: {{ selectedSchema }}.
      </p>
    </div>

    <p
      v-if="copyFeedback"
      class="text-sm text-green-700"
      role="status"
    >
      {{ copyFeedback }}
    </p>

    <div
      v-if="columns.length"
      class="space-y-3"
    >
      <div class="flex flex-wrap gap-2">
        <button
          type="button"
          class="rounded-md border border-gray-300 bg-white px-3 py-2 text-sm text-gray-800 hover:bg-gray-50"
          @click="copyColumns"
        >
          Copy column names
        </button>
        <button
          type="button"
          class="rounded-md border border-gray-300 bg-white px-3 py-2 text-sm text-gray-800 hover:bg-gray-50"
          @click="copyColumnsTsv"
        >
          Copy as tab-separated row
        </button>
      </div>
      <pre class="rounded-md border border-gray-200 bg-gray-50 p-3 text-xs whitespace-pre-wrap text-gray-800">{{ columns.join('\n') }}</pre>

      <div
        v-if="collectionType === 'page' && pageOverrideColumns.length"
        class="rounded-md border border-gray-200 bg-gray-50 p-3"
      >
        <p class="text-sm font-semibold text-gray-900">
          Nuxt Content page overrides
        </p>
        <p class="text-sm text-gray-600">
          Optional built-in page fields Nuxt Content adds automatically for page collections.
        </p>
      </div>

      <div
        v-if="collectionType === 'page' && pageOverrideColumns.length"
        class="space-y-3"
      >
        <div class="flex flex-wrap gap-2">
          <button
            type="button"
            class="rounded-md border border-gray-300 bg-white px-3 py-2 text-sm text-gray-800 hover:bg-gray-50"
            @click="copyPageOverrideColumns"
          >
            Copy page override columns
          </button>
          <button
            type="button"
            class="rounded-md border border-gray-300 bg-white px-3 py-2 text-sm text-gray-800 hover:bg-gray-50"
            @click="copyPageOverrideColumnsTsv"
          >
            Copy overrides as tab-separated row
          </button>
        </div>
        <pre class="rounded-md border border-gray-200 bg-gray-50 p-3 text-xs whitespace-pre-wrap text-gray-800">{{ pageOverrideColumns.join('\n') }}</pre>
      </div>
    </div>
  </div>
</template>
