<script setup lang="ts">
import type { GoogleSheetsImportQuery } from '../composables/useGoogleSheetsImportWorkflow'

interface Props {
  query: GoogleSheetsImportQuery
}

const props = defineProps<Props>()
const toast = useToast()

const outputFormatOptions = [
  { label: 'Markdown frontmatter (.md)', value: 'frontmatter' },
  { label: 'JSON (.json)', value: 'json' },
  { label: 'YAML (.yml)', value: 'yaml' }
]

const overwriteModeOptions = [
  { label: 'Overwrite existing files', value: 'overwrite' },
  { label: 'Skip files that already exist', value: 'skip' },
  { label: 'Overwrite frontmatter only (.md only)', value: 'overwrite-frontmatter' }
]

const {
  status,
  writeStatus,
  importError,
  writeError,
  writeSummary,
  values,
  validationErrors,
  logs,
  writeFile,
  selectedCollectionType,
  selectedCollectionTypeStatus,
  resolvedDestinationPath,
  columnList,
  productsLength,
  logsLength,
  canWrite,
  previewRows,
  shownValidationErrors,
  loadValues,
  writeValues
} = useGoogleSheetsImportWorkflow({
  query: computed(() => props.query)
})

async function execute() {
  await loadValues(props.query)
  if (validationErrors.value.length) {
    toast.add({
      title: 'Validation warnings',
      description: `${validationErrors.value.length} row(s) failed schema validation.`,
      color: 'warning'
    })
  }

  if (status.value === 'success' && !validationErrors.value.length) {
    toast.add({
      title: 'Import complete',
      description: `${values.value.length} valid row(s) loaded.`,
      color: 'success'
    })
  }

  if (importError.value) {
    toast.add({
      title: 'Import failed',
      description: importError.value,
      color: 'error'
    })
  }
}

async function start() {
  await writeValues()

  if (writeStatus.value === 'success') {
    toast.add({
      title: 'Files written',
      description: `${writeSummary.value.written} written, ${writeSummary.value.overwritten} overwritten, ${writeSummary.value.skipped} skipped.`,
      color: 'success'
    })
  }

  if (writeError.value) {
    toast.add({
      title: 'Write failed',
      description: writeError.value,
      color: 'error'
    })
  }
}
</script>

<template>
  <div class="space-y-4">
    <UAlert
      title="Step 2: Validate rows and write files"
      description="Load rows from Google Sheets, choose filename columns, then write frontmatter files."
      color="neutral"
      variant="subtle"
    />

    <UButton
      label="Load rows"
      icon="i-heroicons-document-arrow-down-20-solid"
      :loading="status === 'pending'"
      @click.prevent="execute()"
    />

    <UAlert
      v-if="importError"
      title="Import error"
      :description="importError"
      color="error"
      variant="subtle"
    />

    <UAlert
      v-if="status === 'success' && values.length"
      title="Rows loaded"
      :description="`${values.length} valid row(s) ready to write.`"
      color="success"
      variant="subtle"
    />

    <UAlert
      v-if="values?.length"
      title="Destination preview"
      :description="selectedCollectionTypeStatus === 'pending'
        ? 'Resolving collection type...'
        : `Collection type: ${selectedCollectionType}. Files will be written to: ${resolvedDestinationPath}`"
      :color="selectedCollectionType === 'unknown' ? 'warning' : 'neutral'"
      variant="subtle"
    />

    <UForm
      :state="writeFile"
      class="space-y-4"
    >
      <UFormField
        v-if="values?.length"
        label="Destination folder"
        name="folder"
        description="Written to content/{folder} for page collections, or content/data/{folder} for data collections."
      >
        <UInput
          v-model="writeFile.folder"
          label="Folder"
          icon="i-heroicons-folder-20-solid"
          class="w-full max-w-sm"
        />
      </UFormField>
      <UFormField
        v-if="values?.length"
        label="Choose column to use as filename stem (without extension)"
        name="slug"
      >
        <USelect
          v-model="writeFile.slug"
          :items="columnList"
          label="Column to use as filename stem (without extension)"
          icon="i-heroicons-document-chart-bar-20-solid"
          class="w-full max-w-sm"
        />
      </UFormField>
      <UFormField
        v-if="values?.length"
        label="Choose column to use as numerical ordering filename prefix"
        name="order"
      >
        <USelect
          v-model="writeFile.order"
          :items="columnList"
          label="Column to use as numerical ordering filename prefix"
          icon="i-heroicons-document-chart-bar-20-solid"
          class="w-full max-w-sm"
        />
      </UFormField>
      <UFormField
        v-if="values?.length"
        label="Output file format"
        name="outputFormat"
      >
        <USelect
          v-model="writeFile.outputFormat"
          :items="outputFormatOptions"
          value-key="value"
          label="Output file format"
          icon="i-heroicons-document-20-solid"
          class="w-full max-w-sm"
        />
      </UFormField>
      <UFormField
        v-if="values?.length"
        label="If file already exists"
        name="overwriteMode"
        description="For .md files, frontmatter-only mode retains existing markdown body content."
      >
        <USelect
          v-model="writeFile.overwriteMode"
          :items="overwriteModeOptions"
          value-key="value"
          label="If file already exists"
          icon="i-heroicons-arrow-path-20-solid"
          class="w-full max-w-sm"
        />
      </UFormField>
      <UFormField>
        <UButton
          v-if="values?.length"
          label="Write data to files"
          icon="i-heroicons-document-plus-20-solid"
          :loading="writeStatus === 'pending'"
          :disabled="!canWrite"
          @click.prevent="start()"
        />
      </UFormField>
    </UForm>

    <UAlert
      v-if="writeError"
      title="Write error"
      :description="writeError"
      color="error"
      variant="subtle"
    />

    <UAlert
      v-if="writeStatus === 'success' && logs.length"
      title="Write complete"
      :description="`${writeSummary.written} written, ${writeSummary.overwritten} overwritten, ${writeSummary.skipped} skipped.`"
      color="success"
      variant="subtle"
    />

    <UProgress
      class="mt-2"
      :model-value="logsLength"
      :max="productsLength"
      status
      :get-value-label="((value: number | null | undefined, max: number) => value != null ? `${value} of ${max}` : undefined)"
    />

    <UCollapsible
      v-if="validationErrors.length"
      class="flex flex-col gap-2 w-full"
    >
      <UButton
        :label="`Validation issues (${validationErrors.length})`"
        color="warning"
        variant="subtle"
        trailing-icon="i-lucide-chevron-down"
        block
      />

      <template #content>
        <pre class="text-xs whitespace-pre-wrap">{{ shownValidationErrors }}</pre>
      </template>
    </UCollapsible>

    <UCollapsible
      v-if="previewRows.length"
      class="flex flex-col gap-2 w-full"
    >
      <UButton
        :label="`Preview first ${previewRows.length} row(s)`"
        color="neutral"
        variant="subtle"
        trailing-icon="i-lucide-chevron-down"
        block
      />

      <template #content>
        <pre class="text-xs whitespace-pre-wrap">{{ previewRows }}</pre>
      </template>
    </UCollapsible>

    <UCollapsible
      v-if="logs.length"
      class="flex flex-col gap-2 w-full"
    >
      <UButton
        :label="`Writing progress (${logs.length})`"
        color="neutral"
        variant="subtle"
        trailing-icon="i-lucide-chevron-down"
        block
      />

      <template #content>
        <pre class="text-xs whitespace-pre-wrap">{{ logs }}</pre>
      </template>
    </UCollapsible>
  </div>
</template>
