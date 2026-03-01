<script setup lang="ts">
import { z } from 'zod'

interface Props {
  googleSheets: { id: string, label: string }[]
}

const { googleSheets } = defineProps<Props>()
const toast = useToast()

const googleSheetSchema = z.object({
  spreadsheetId: z.string().length(44),
  sheetTitle: z.string(),
  range: z.string(),
  schema: z.string()
})

const {
  source,
  sourceStatus,
  sourceError,
  sheetTitles,
  upperCaseRange,
  selectedSheetPreview,
  canLoadValues,
  sourceQuery
} = useGoogleSheetsImportWorkflow()

watch(sourceStatus, (value) => {
  if (value === 'success') {
    toast.add({ title: 'Success', description: 'Google Sheet titles retrieved.', color: 'success' })
  }
})

watch(sourceError, (value) => {
  if (value) {
    toast.add({
      title: 'Error',
      description: value,
      color: 'error'
    })
  }
})
</script>

<template>
  <div class="space-y-4">
    <UAlert
      title="Step 1: Select source sheet"
      description="Choose a spreadsheet and tab, then confirm range and schema key before loading rows."
      color="neutral"
      variant="subtle"
    />

    <UAlert
      v-if="sourceError"
      title="Could not load sheet tabs"
      :description="sourceError"
      color="error"
      variant="subtle"
    />

    <UForm
      :state="source"
      :schema="googleSheetSchema"
      class="space-y-4"
    >
      <UFormField
        label="Spreadsheet"
        name="spreadsheetId"
        description="Select one configured Google Sheet source."
      >
        <USelect
          v-model="source.spreadsheetId"
          :items="googleSheets"
          value-key="id"
          label="Spreadsheet"
          icon="i-heroicons-document-chart-bar-20-solid"
          class="w-full max-w-sm"
          :loading="sourceStatus === 'pending'"
        />
      </UFormField>

      <UFormField
        v-if="sheetTitles.length"
        label="Sheet tab"
        name="sheetTitle"
        description="Tabs are fetched from the selected spreadsheet."
      >
        <USelect
          v-model="source.sheetTitle"
          :items="sheetTitles"
          value-key="label"
          label="Sheet tab"
          icon="i-heroicons-table-cells-20-solid"
          class="w-full max-w-sm"
        />
      </UFormField>

      <UFormField
        v-if="source.sheetTitle"
        label="Range"
        name="range"
        :description="selectedSheetPreview ? `Default detected range: ${selectedSheetPreview.range}` : 'Enter Google Sheets A1 range (e.g. A:Z).'"
      >
        <UInput
          v-model="upperCaseRange"
          label="Range"
          icon="i-heroicons-arrows-right-left-20-solid"
          class="w-full max-w-sm"
        />
      </UFormField>

      <UFormField
        v-if="source.range"
        label="Schema key"
        name="schema"
        description="Must match a key in your exported `schemas` map."
      >
        <UInput
          v-model="source.schema"
          label="Schema key"
          icon="i-heroicons-cube-20-solid"
          class="w-full max-w-sm"
        />
      </UFormField>
    </UForm>

    <GoogleSheetsImportExecute
      v-if="canLoadValues && sourceQuery"
      :query="sourceQuery"
    />
  </div>
</template>
