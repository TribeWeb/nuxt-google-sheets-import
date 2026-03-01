const baseUrl = process.env.SMOKE_BASE_URL || 'http://localhost:3000'

async function run() {
  const valuesResponse = await fetch(`${baseUrl}/api/google-sheets-import/values-smoke`, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ schema: 'machinesSmoke' })
  })

  if (!valuesResponse.ok) {
    throw new Error(`values-smoke failed (${valuesResponse.status})`)
  }

  const valuesPayload = await valuesResponse.json()

  if (!Array.isArray(valuesPayload.records) || !valuesPayload.records.length) {
    throw new Error('values-smoke returned no records')
  }

  const runs = [
    { outputFormat: 'frontmatter', folder: 'smoke-frontmatter', extension: '.md' },
    { outputFormat: 'json', folder: 'smoke-json', extension: '.json' },
    { outputFormat: 'yaml', folder: 'smoke-yaml', extension: '.yml' }
  ]

  console.log('[smoke] values records:', valuesPayload.records.length)

  for (const runConfig of runs) {
    const writeResponse = await fetch(`${baseUrl}/api/google-sheets-import/write`, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({
        records: valuesPayload.records,
        schema: 'machinesSmoke',
        folder: runConfig.folder,
        slugKey: 'modelId',
        orderKey: 'pageOrder',
        outputFormat: runConfig.outputFormat,
        overwriteMode: 'overwrite'
      })
    })

    if (!writeResponse.ok) {
      throw new Error(`${runConfig.outputFormat} write failed (${writeResponse.status})`)
    }

    const writePayload = await writeResponse.json()
    const expectedCount = valuesPayload.records.length
    if (writePayload.count !== expectedCount) {
      throw new Error(`${runConfig.outputFormat} write count mismatch: expected ${expectedCount}, got ${writePayload.count}`)
    }

    const wrongExtension = (writePayload.logs || []).find(logPath => !String(logPath).endsWith(runConfig.extension))
    if (wrongExtension) {
      throw new Error(`${runConfig.outputFormat} produced unexpected extension in ${wrongExtension}`)
    }

    console.log(`[smoke] ${runConfig.outputFormat} summary:`, writePayload.summary)
    console.log(`[smoke] ${runConfig.outputFormat} first log:`, writePayload.logs?.[0])
  }
}

run().catch((error) => {
  console.error('[smoke] failed:', error.message)
  process.exit(1)
})
