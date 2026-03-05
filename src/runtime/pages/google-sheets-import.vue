<script setup lang="ts">
import { ref } from 'vue'

const sheetsList = ref<{ id: string, label: string }[]>([
  { id: '1NKS0cTX6u5urtgQ3Q4Z2motiR2-9JmyPxcd05yVc1bc', label: 'Metzner' },
  { id: '1tGZCEoiikXfg3mOpfVWWTS1SSSsj18xv6Z3owrnnt4s', label: 'Example Sheet' },
])
</script>

<template>
  <UContainer>
    <GoogleSheetsImportSchemaGuide />
    <GoogleSheetsImportSource :google-sheets="sheetsList" />
  </UContainer>
</template>
