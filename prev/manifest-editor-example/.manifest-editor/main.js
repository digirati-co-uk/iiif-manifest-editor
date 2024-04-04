export default {
  apps: [
    '../apps/**/index.ts*'
  ],
  presets: [
    '@manifest-editor/default-preset',
    ['@manifest-editor/range-navigation', { openPanel: 'range-properties' }],
  ],
  initialApp: { id: 'example-app' },
  addons: [
    ['@manifest-editor/rest-api-addon', { url: 'https://example.org/my-rest-service' }]
  ],
  config: {
    defaultLanguages: [
      "en",
      "cy",
      "none"
    ],
    previews: [
      {
        id: "mirador-3",
        type: "external-manifest-preview",
        label: "Mirador 3",
        config: {
          url: "https://tomcrane.github.io/scratch/mirador3/?iiif-content={manifestId}"
        }
      }
    ],
  },
}
