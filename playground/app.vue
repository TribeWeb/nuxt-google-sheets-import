<!-- <script setup lang="ts">
const sheetsList = ref<{ id: string, label: string }[]>([
  { id: '1NKS0cTX6u5urtgQ3Q4Z2motiR2-9JmyPxcd05yVc1bc', label: 'Metzner' },
  { id: '1tGZCEoiikXfg3mOpfVWWTS1SSSsj18xv6Z3owrnnt4s', label: 'Example Sheet' },
])

const { data: page } = await useAsyncData('page', () => {
  return queryCollection('exampleSchema').all()
})
</script>

<template>
  <UApp class="p-6">
    <UContainer>
      <UAccordion :items="[{ label: 'code' }]">
        <template #content>
          <pre>{{ page }}</pre>
        </template>
      </UAccordion>

      <GoogleSheetsImportSchemaGuide />
      <GoogleSheetsImportSource :google-sheets="sheetsList" />
    </UContainer>
  </UApp>
</template> -->

<template>
  <UApp class="p-6">
    <NuxtPage />
  </UApp>
</template>
