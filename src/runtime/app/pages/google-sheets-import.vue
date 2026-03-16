<script setup lang="ts">
import { ref } from 'vue'
import type { TabsItem } from '@nuxt/ui'
import { useRuntimeConfig } from '#imports'

const config = useRuntimeConfig()
const sheetsList = (config.public.googleSheetsImport?.googleSheets ?? []) as { id: string, label: string }[]

const items = ref<TabsItem[]>([
  {
    label: 'Setup Google Sheet',
    icon: 'i-lucide-layout-dashboard',
    slot: 'sheet' as const,
  },
  {
    label: 'Import data',
    icon: 'i-lucide-upload',
    slot: 'import' as const,
  },
  {
    label: 'Export data',
    icon: 'i-lucide-download',
    slot: 'export' as const,
  },
])
</script>

<template>
  <UContainer class="max-w-36">
    <UTabs
      :items="items"
      variant="link"
      color="neutral"
      class="w-full"
    >
      <template #sheet>
        <GoogleSheetsImportSchemaGuide :initial-schema="'Example Sheet'" />
      </template>
      <template #import>
        <GoogleSheetsImportSource :google-sheets="sheetsList" />
      </template>
      <template #export>
        <GoogleSheetsImportExport />
      </template>
    </UTabs>
  </UContainer>
</template>
