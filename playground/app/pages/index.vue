<script setup lang="ts">
import type { ButtonProps } from '@nuxt/ui'

const links = ref<ButtonProps[]>([
  {
    label: 'Get started',
    color: 'neutral',
    to: '/google-sheets-import',
    variant: 'solid',
    trailingIcon: 'i-lucide-arrow-right',
  },
  {
    label: 'GitHub',
    color: 'neutral',
    variant: 'subtle',
    trailingIcon: 'i-lucide-github',
    to: 'https://github.com/TribeWeb/nuxt-google-sheets-import',
  },
])
</script>

<template>
  <UContainer class="py-10">
    <UPageCTA
      title="@TribeWeb/nuxt-google-sheets-import"
      description="Schema-driven Google Sheets importer for Nuxt Content."
      :links="links"
    />
  </UContainer>
</template>
