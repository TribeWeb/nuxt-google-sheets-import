<script setup lang="ts">
import { ref } from 'vue'
import type { TabsItem } from '@nuxt/ui'

const sheetsList = ref<{ id: string, label: string }[]>([
  { id: '1NKS0cTX6u5urtgQ3Q4Z2motiR2-9JmyPxcd05yVc1bc', label: 'Metzner' },
  { id: '1tGZCEoiikXfg3mOpfVWWTS1SSSsj18xv6Z3owrnnt4s', label: 'Example Sheet' },
])

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
