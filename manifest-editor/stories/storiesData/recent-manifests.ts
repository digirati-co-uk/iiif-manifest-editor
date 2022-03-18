export const recentManifests = [
  {
    "@context": "http://iiif.io/api/presentation/3/context.json",
    id: "https://iiif.wellcomecollection.org/presentation/b32253345",
    type: "Manifest",
    label: {
      en: [
        "Article, \"The Non Diseases Diagnosed by 'Health Check' Units\" with annotated notes",
      ],
    },
    thumbnail: [
      {
        id: "https://iiif.wellcomecollection.org/thumbs/b32253345_0001.jp2/full/66,100/0/default.jpg",
        type: "Image",
        width: 66,
        height: 100,
        service: [
          {
            "@id":
              "https://iiif.wellcomecollection.org/thumbs/b32253345_0001.jp2",
            "@type": "ImageService2",
            profile: "http://iiif.io/api/image/2/level0.json",
            width: 133,
            height: 200,
            sizes: [
              {
                width: 66,
                height: 100,
              },
              {
                width: 133,
                height: 200,
              },
            ],
          },
        ],
      },
    ],
    homepage: [
      {
        id: "https://wellcomecollection.org/works/htf3kn6s",
        type: "Text",
        label: {
          en: [
            "Article, \"The Non Diseases Diagnosed by 'Health Check' Units\" with annotated notes",
          ],
        },
        format: "text/html",
        language: ["en"],
      },
    ],
    metadata: [
      {
        label: {
          en: ["Reference"],
        },
        value: {
          none: ["PP/MHP/B.1/6"],
        },
      },
      {
        label: {
          en: ["Publication/creation"],
        },
        value: {
          none: ["Mid to late 20th Century"],
        },
      },
      {
        label: {
          en: ["Physical description"],
        },
        value: {
          en: ["1 file"],
        },
      },
      {
        label: {
          en: ["Attribution and usage"],
        },
        value: {
          en: [
            "Wellcome Collection",
            'Works in this archive created by Maurice Pappworth are available under a <a href="https://creativecommons.org/licenses/by/4.0/">CC-BY</a> licence. Please be aware that works in this archive created by other organisations and individuals are not covered under this licence, and you should obtain any necessary permissions before copying or adapting any such works.',
          ],
        },
      },
    ],
    provider: [
      {
        id: "https://wellcomecollection.org",
        type: "Agent",
        label: {
          en: [
            "Wellcome Collection",
            "183 Euston Road",
            "London NW1 2BE UK",
            "T +44 (0)20 7611 8722",
            "E library@wellcomecollection.org",
            "https://wellcomecollection.org",
          ],
        },
        homepage: [
          {
            id: "https://wellcomecollection.org/works",
            type: "Text",
            label: {
              en: ["Explore our collections"],
            },
            format: "text/html",
          },
        ],
        logo: [
          {
            id: "https://iiif.wellcomecollection.org/logos/wellcome-collection-black.png",
            type: "Image",
            format: "image/png",
          },
        ],
      },
    ],
    rendering: [
      {
        id: "https://iiif.wellcomecollection.org/pdf/b32253345",
        type: "Text",
        label: {
          en: ["View as PDF"],
        },
        format: "application/pdf",
      },
    ],
    seeAlso: [
      {
        id: "https://api.wellcomecollection.org/catalogue/v2/works/htf3kn6s",
        type: "Dataset",
        profile: "https://api.wellcomecollection.org/catalogue/v2/context.json",
        label: {
          en: ["Wellcome Collection Catalogue API"],
        },
        format: "application/json",
      },
    ],
    services: [
      {
        id: "https://iiif.wellcomecollection.org/presentation/b32253345#tracking",
        type: "Text",
        profile: "http://universalviewer.io/tracking-extensions-profile",
        label: {
          en: [
            "Format: Archive, Institution: n/a, Identifier: b32253345, Digicode: n/a, Collection code: PP/MHP/B.1/6",
          ],
        },
      },
      {
        id: "https://iiif.wellcomecollection.org/presentation/b32253345#timestamp",
        type: "Text",
        profile:
          "https://github.com/wellcomecollection/iiif-builder/build-timestamp",
        label: {
          none: ["2022-01-12T15:25:40.2118148Z"],
        },
      },
      {
        "@id": "https://iiif.wellcomecollection.org/auth/clickthrough",
        "@type": "AuthCookieService1",
        profile: "http://iiif.io/api/auth/1/clickthrough",
        label: "Content advisory",
        description:
          '<p>This digitised material is free to access, but contains information or visuals that may:</p><ul><li>include personal details of living individuals</li><li>be upsetting or distressing</li><li>be explicit or graphic</li><li>include objects and images of objects decontextualised in a way that is offensive to the originating culture.</li></ul>By viewing this material, we ask that you use the content lawfully, ethically and responsibly under the conditions set out in our <a href="https://wellcomecollection.cdn.prismic.io/wellcomecollection/d4817da5-c71a-4151-81c4-83e39ad4f5b3_Wellcome+Collection_Access+Policy_Aug+2020.pdf">Access Policy</a>.',
        service: [
          {
            "@id": "https://iiif.wellcomecollection.org/auth/token",
            "@type": "AuthTokenService1",
            profile: "http://iiif.io/api/auth/1/token",
          },
          {
            "@id":
              "https://iiif.wellcomecollection.org/auth/clickthrough/logout",
            "@type": "AuthLogoutService1",
            profile: "http://iiif.io/api/auth/1/logout",
            label: "Log out of Wellcome Collection",
          },
        ],
        confirmLabel: "Accept Terms and Open",
        header: "Content advisory",
        failureHeader: "Terms not accepted",
        failureDescription: "You must accept the terms to view the content.",
      },
      {
        id: "https://iiif.wellcomecollection.org/presentation/b32253345#accesscontrolhints",
        type: "Text",
        profile: "http://wellcomelibrary.org/ld/iiif-ext/access-control-hints",
        label: {
          en: ["clickthrough"],
        },
      },
    ],
    items: [
      {
        id: "https://iiif.wellcomecollection.org/presentation/b32253345/canvases/b32253345_0001.jp2",
        type: "Canvas",
        label: {
          none: ["-"],
        },
        width: 3231,
        height: 4869,
        thumbnail: [
          {
            id: "https://iiif.wellcomecollection.org/thumbs/b32253345_0001.jp2/full/66,100/0/default.jpg",
            type: "Image",
            width: 66,
            height: 100,
            service: [
              {
                "@id":
                  "https://iiif.wellcomecollection.org/thumbs/b32253345_0001.jp2",
                "@type": "ImageService2",
                profile: "http://iiif.io/api/image/2/level0.json",
                width: 133,
                height: 200,
                sizes: [
                  {
                    width: 66,
                    height: 100,
                  },
                  {
                    width: 133,
                    height: 200,
                  },
                ],
              },
            ],
          },
        ],
        items: [
          {
            id: "https://iiif.wellcomecollection.org/presentation/b32253345/canvases/b32253345_0001.jp2/painting",
            type: "AnnotationPage",
            items: [
              {
                id: "https://iiif.wellcomecollection.org/presentation/b32253345/canvases/b32253345_0001.jp2/painting/anno",
                type: "Annotation",
                motivation: "painting",
                body: {
                  id: "https://iiif.wellcomecollection.org/image/b32253345_0001.jp2/full/133,200/0/default.jpg",
                  type: "Image",
                  width: 133,
                  height: 200,
                  format: "image/jpeg",
                  service: [
                    {
                      "@id":
                        "https://iiif.wellcomecollection.org/image/b32253345_0001.jp2",
                      "@type": "ImageService2",
                      profile: "http://iiif.io/api/image/2/level1.json",
                      width: 3231,
                      height: 4869,
                      service: {
                        "@id":
                          "https://iiif.wellcomecollection.org/auth/clickthrough",
                        "@type": "AuthCookieService1",
                      },
                    },
                  ],
                },
                target:
                  "https://iiif.wellcomecollection.org/presentation/b32253345/canvases/b32253345_0001.jp2",
              },
            ],
          },
        ],
      },
      {
        id: "https://iiif.wellcomecollection.org/presentation/b32253345/canvases/b32253345_0002.jp2",
        type: "Canvas",
        label: {
          none: ["-"],
        },
        width: 3077,
        height: 4869,
        thumbnail: [
          {
            id: "https://iiif.wellcomecollection.org/thumbs/b32253345_0002.jp2/full/63,100/0/default.jpg",
            type: "Image",
            width: 63,
            height: 100,
            service: [
              {
                "@id":
                  "https://iiif.wellcomecollection.org/thumbs/b32253345_0002.jp2",
                "@type": "ImageService2",
                profile: "http://iiif.io/api/image/2/level0.json",
                width: 126,
                height: 200,
                sizes: [
                  {
                    width: 63,
                    height: 100,
                  },
                  {
                    width: 126,
                    height: 200,
                  },
                ],
              },
            ],
          },
        ],
        items: [
          {
            id: "https://iiif.wellcomecollection.org/presentation/b32253345/canvases/b32253345_0002.jp2/painting",
            type: "AnnotationPage",
            items: [
              {
                id: "https://iiif.wellcomecollection.org/presentation/b32253345/canvases/b32253345_0002.jp2/painting/anno",
                type: "Annotation",
                motivation: "painting",
                body: {
                  id: "https://iiif.wellcomecollection.org/image/b32253345_0002.jp2/full/126,200/0/default.jpg",
                  type: "Image",
                  width: 126,
                  height: 200,
                  format: "image/jpeg",
                  service: [
                    {
                      "@id":
                        "https://iiif.wellcomecollection.org/image/b32253345_0002.jp2",
                      "@type": "ImageService2",
                      profile: "http://iiif.io/api/image/2/level1.json",
                      width: 3077,
                      height: 4869,
                      service: {
                        "@id":
                          "https://iiif.wellcomecollection.org/auth/clickthrough",
                        "@type": "AuthCookieService1",
                      },
                    },
                  ],
                },
                target:
                  "https://iiif.wellcomecollection.org/presentation/b32253345/canvases/b32253345_0002.jp2",
              },
            ],
          },
        ],
      },
      {
        id: "https://iiif.wellcomecollection.org/presentation/b32253345/canvases/b32253345_0003.jp2",
        type: "Canvas",
        label: {
          none: ["-"],
        },
        width: 3077,
        height: 4869,
        thumbnail: [
          {
            id: "https://iiif.wellcomecollection.org/thumbs/b32253345_0003.jp2/full/63,100/0/default.jpg",
            type: "Image",
            width: 63,
            height: 100,
            service: [
              {
                "@id":
                  "https://iiif.wellcomecollection.org/thumbs/b32253345_0003.jp2",
                "@type": "ImageService2",
                profile: "http://iiif.io/api/image/2/level0.json",
                width: 126,
                height: 200,
                sizes: [
                  {
                    width: 63,
                    height: 100,
                  },
                  {
                    width: 126,
                    height: 200,
                  },
                ],
              },
            ],
          },
        ],
        items: [
          {
            id: "https://iiif.wellcomecollection.org/presentation/b32253345/canvases/b32253345_0003.jp2/painting",
            type: "AnnotationPage",
            items: [
              {
                id: "https://iiif.wellcomecollection.org/presentation/b32253345/canvases/b32253345_0003.jp2/painting/anno",
                type: "Annotation",
                motivation: "painting",
                body: {
                  id: "https://iiif.wellcomecollection.org/image/b32253345_0003.jp2/full/126,200/0/default.jpg",
                  type: "Image",
                  width: 126,
                  height: 200,
                  format: "image/jpeg",
                  service: [
                    {
                      "@id":
                        "https://iiif.wellcomecollection.org/image/b32253345_0003.jp2",
                      "@type": "ImageService2",
                      profile: "http://iiif.io/api/image/2/level1.json",
                      width: 3077,
                      height: 4869,
                      service: {
                        "@id":
                          "https://iiif.wellcomecollection.org/auth/clickthrough",
                        "@type": "AuthCookieService1",
                      },
                    },
                  ],
                },
                target:
                  "https://iiif.wellcomecollection.org/presentation/b32253345/canvases/b32253345_0003.jp2",
              },
            ],
          },
        ],
      },
      {
        id: "https://iiif.wellcomecollection.org/presentation/b32253345/canvases/b32253345_0004.jp2",
        type: "Canvas",
        label: {
          none: ["-"],
        },
        width: 3240,
        height: 4869,
        thumbnail: [
          {
            id: "https://iiif.wellcomecollection.org/thumbs/b32253345_0004.jp2/full/67,100/0/default.jpg",
            type: "Image",
            width: 67,
            height: 100,
            service: [
              {
                "@id":
                  "https://iiif.wellcomecollection.org/thumbs/b32253345_0004.jp2",
                "@type": "ImageService2",
                profile: "http://iiif.io/api/image/2/level0.json",
                width: 133,
                height: 200,
                sizes: [
                  {
                    width: 67,
                    height: 100,
                  },
                  {
                    width: 133,
                    height: 200,
                  },
                ],
              },
            ],
          },
        ],
        items: [
          {
            id: "https://iiif.wellcomecollection.org/presentation/b32253345/canvases/b32253345_0004.jp2/painting",
            type: "AnnotationPage",
            items: [
              {
                id: "https://iiif.wellcomecollection.org/presentation/b32253345/canvases/b32253345_0004.jp2/painting/anno",
                type: "Annotation",
                motivation: "painting",
                body: {
                  id: "https://iiif.wellcomecollection.org/image/b32253345_0004.jp2/full/133,200/0/default.jpg",
                  type: "Image",
                  width: 133,
                  height: 200,
                  format: "image/jpeg",
                  service: [
                    {
                      "@id":
                        "https://iiif.wellcomecollection.org/image/b32253345_0004.jp2",
                      "@type": "ImageService2",
                      profile: "http://iiif.io/api/image/2/level1.json",
                      width: 3240,
                      height: 4869,
                      service: {
                        "@id":
                          "https://iiif.wellcomecollection.org/auth/clickthrough",
                        "@type": "AuthCookieService1",
                      },
                    },
                  ],
                },
                target:
                  "https://iiif.wellcomecollection.org/presentation/b32253345/canvases/b32253345_0004.jp2",
              },
            ],
          },
        ],
      },
      {
        id: "https://iiif.wellcomecollection.org/presentation/b32253345/canvases/b32253345_0005.jp2",
        type: "Canvas",
        label: {
          none: ["-"],
        },
        width: 3891,
        height: 5467,
        thumbnail: [
          {
            id: "https://iiif.wellcomecollection.org/thumbs/b32253345_0005.jp2/full/71,100/0/default.jpg",
            type: "Image",
            width: 71,
            height: 100,
            service: [
              {
                "@id":
                  "https://iiif.wellcomecollection.org/thumbs/b32253345_0005.jp2",
                "@type": "ImageService2",
                profile: "http://iiif.io/api/image/2/level0.json",
                width: 142,
                height: 200,
                sizes: [
                  {
                    width: 71,
                    height: 100,
                  },
                  {
                    width: 142,
                    height: 200,
                  },
                ],
              },
            ],
          },
        ],
        items: [
          {
            id: "https://iiif.wellcomecollection.org/presentation/b32253345/canvases/b32253345_0005.jp2/painting",
            type: "AnnotationPage",
            items: [
              {
                id: "https://iiif.wellcomecollection.org/presentation/b32253345/canvases/b32253345_0005.jp2/painting/anno",
                type: "Annotation",
                motivation: "painting",
                body: {
                  id: "https://iiif.wellcomecollection.org/image/b32253345_0005.jp2/full/142,200/0/default.jpg",
                  type: "Image",
                  width: 142,
                  height: 200,
                  format: "image/jpeg",
                  service: [
                    {
                      "@id":
                        "https://iiif.wellcomecollection.org/image/b32253345_0005.jp2",
                      "@type": "ImageService2",
                      profile: "http://iiif.io/api/image/2/level1.json",
                      width: 3891,
                      height: 5467,
                      service: {
                        "@id":
                          "https://iiif.wellcomecollection.org/auth/clickthrough",
                        "@type": "AuthCookieService1",
                      },
                    },
                  ],
                },
                target:
                  "https://iiif.wellcomecollection.org/presentation/b32253345/canvases/b32253345_0005.jp2",
              },
            ],
          },
        ],
      },
      {
        id: "https://iiif.wellcomecollection.org/presentation/b32253345/canvases/b32253345_0006.jp2",
        type: "Canvas",
        label: {
          none: ["-"],
        },
        width: 3928,
        height: 5467,
        thumbnail: [
          {
            id: "https://iiif.wellcomecollection.org/thumbs/b32253345_0006.jp2/full/72,100/0/default.jpg",
            type: "Image",
            width: 72,
            height: 100,
            service: [
              {
                "@id":
                  "https://iiif.wellcomecollection.org/thumbs/b32253345_0006.jp2",
                "@type": "ImageService2",
                profile: "http://iiif.io/api/image/2/level0.json",
                width: 144,
                height: 200,
                sizes: [
                  {
                    width: 72,
                    height: 100,
                  },
                  {
                    width: 144,
                    height: 200,
                  },
                ],
              },
            ],
          },
        ],
        items: [
          {
            id: "https://iiif.wellcomecollection.org/presentation/b32253345/canvases/b32253345_0006.jp2/painting",
            type: "AnnotationPage",
            items: [
              {
                id: "https://iiif.wellcomecollection.org/presentation/b32253345/canvases/b32253345_0006.jp2/painting/anno",
                type: "Annotation",
                motivation: "painting",
                body: {
                  id: "https://iiif.wellcomecollection.org/image/b32253345_0006.jp2/full/144,200/0/default.jpg",
                  type: "Image",
                  width: 144,
                  height: 200,
                  format: "image/jpeg",
                  service: [
                    {
                      "@id":
                        "https://iiif.wellcomecollection.org/image/b32253345_0006.jp2",
                      "@type": "ImageService2",
                      profile: "http://iiif.io/api/image/2/level1.json",
                      width: 3928,
                      height: 5467,
                      service: {
                        "@id":
                          "https://iiif.wellcomecollection.org/auth/clickthrough",
                        "@type": "AuthCookieService1",
                      },
                    },
                  ],
                },
                target:
                  "https://iiif.wellcomecollection.org/presentation/b32253345/canvases/b32253345_0006.jp2",
              },
            ],
          },
        ],
      },
    ],
    partOf: [
      {
        id: "https://iiif.wellcomecollection.org/presentation/collections/archives/PP/MHP/B.1",
        type: "Collection",
        label: {
          en: ["Papers"],
        },
        partOf: [
          {
            id: "https://iiif.wellcomecollection.org/presentation/collections/archives/PP/MHP/B",
            type: "Collection",
            label: {
              en: ["Own writings"],
            },
            partOf: [
              {
                id: "https://iiif.wellcomecollection.org/presentation/collections/archives/PP/MHP",
                type: "Collection",
                label: {
                  en: ["Pappworth, Maurice"],
                },
              },
            ],
          },
        ],
      },
    ],
  },
  {
    "@context": "http://iiif.io/api/presentation/3/context.json",
    id: "https://iiif.wellcomecollection.org/presentation/b32253345",
    type: "Manifest",
    label: {
      en: [
        "Article, \"The Non Diseases Diagnosed by 'Health Check' Units\" with annotated notes",
      ],
    },
    thumbnail: [
      {
        id: "https://iiif.wellcomecollection.org/thumbs/b32253345_0001.jp2/full/66,100/0/default.jpg",
        type: "Image",
        width: 66,
        height: 100,
        service: [
          {
            "@id":
              "https://iiif.wellcomecollection.org/thumbs/b32253345_0001.jp2",
            "@type": "ImageService2",
            profile: "http://iiif.io/api/image/2/level0.json",
            width: 133,
            height: 200,
            sizes: [
              {
                width: 66,
                height: 100,
              },
              {
                width: 133,
                height: 200,
              },
            ],
          },
        ],
      },
    ],
    homepage: [
      {
        id: "https://wellcomecollection.org/works/htf3kn6s",
        type: "Text",
        label: {
          en: [
            "Article, \"The Non Diseases Diagnosed by 'Health Check' Units\" with annotated notes",
          ],
        },
        format: "text/html",
        language: ["en"],
      },
    ],
    metadata: [
      {
        label: {
          en: ["Reference"],
        },
        value: {
          none: ["PP/MHP/B.1/6"],
        },
      },
      {
        label: {
          en: ["Publication/creation"],
        },
        value: {
          none: ["Mid to late 20th Century"],
        },
      },
      {
        label: {
          en: ["Physical description"],
        },
        value: {
          en: ["1 file"],
        },
      },
      {
        label: {
          en: ["Attribution and usage"],
        },
        value: {
          en: [
            "Wellcome Collection",
            'Works in this archive created by Maurice Pappworth are available under a <a href="https://creativecommons.org/licenses/by/4.0/">CC-BY</a> licence. Please be aware that works in this archive created by other organisations and individuals are not covered under this licence, and you should obtain any necessary permissions before copying or adapting any such works.',
          ],
        },
      },
    ],
    provider: [
      {
        id: "https://wellcomecollection.org",
        type: "Agent",
        label: {
          en: [
            "Wellcome Collection",
            "183 Euston Road",
            "London NW1 2BE UK",
            "T +44 (0)20 7611 8722",
            "E library@wellcomecollection.org",
            "https://wellcomecollection.org",
          ],
        },
        homepage: [
          {
            id: "https://wellcomecollection.org/works",
            type: "Text",
            label: {
              en: ["Explore our collections"],
            },
            format: "text/html",
          },
        ],
        logo: [
          {
            id: "https://iiif.wellcomecollection.org/logos/wellcome-collection-black.png",
            type: "Image",
            format: "image/png",
          },
        ],
      },
    ],
    rendering: [
      {
        id: "https://iiif.wellcomecollection.org/pdf/b32253345",
        type: "Text",
        label: {
          en: ["View as PDF"],
        },
        format: "application/pdf",
      },
    ],
    seeAlso: [
      {
        id: "https://api.wellcomecollection.org/catalogue/v2/works/htf3kn6s",
        type: "Dataset",
        profile: "https://api.wellcomecollection.org/catalogue/v2/context.json",
        label: {
          en: ["Wellcome Collection Catalogue API"],
        },
        format: "application/json",
      },
    ],
    services: [
      {
        id: "https://iiif.wellcomecollection.org/presentation/b32253345#tracking",
        type: "Text",
        profile: "http://universalviewer.io/tracking-extensions-profile",
        label: {
          en: [
            "Format: Archive, Institution: n/a, Identifier: b32253345, Digicode: n/a, Collection code: PP/MHP/B.1/6",
          ],
        },
      },
      {
        id: "https://iiif.wellcomecollection.org/presentation/b32253345#timestamp",
        type: "Text",
        profile:
          "https://github.com/wellcomecollection/iiif-builder/build-timestamp",
        label: {
          none: ["2022-01-12T15:25:40.2118148Z"],
        },
      },
      {
        "@id": "https://iiif.wellcomecollection.org/auth/clickthrough",
        "@type": "AuthCookieService1",
        profile: "http://iiif.io/api/auth/1/clickthrough",
        label: "Content advisory",
        description:
          '<p>This digitised material is free to access, but contains information or visuals that may:</p><ul><li>include personal details of living individuals</li><li>be upsetting or distressing</li><li>be explicit or graphic</li><li>include objects and images of objects decontextualised in a way that is offensive to the originating culture.</li></ul>By viewing this material, we ask that you use the content lawfully, ethically and responsibly under the conditions set out in our <a href="https://wellcomecollection.cdn.prismic.io/wellcomecollection/d4817da5-c71a-4151-81c4-83e39ad4f5b3_Wellcome+Collection_Access+Policy_Aug+2020.pdf">Access Policy</a>.',
        service: [
          {
            "@id": "https://iiif.wellcomecollection.org/auth/token",
            "@type": "AuthTokenService1",
            profile: "http://iiif.io/api/auth/1/token",
          },
          {
            "@id":
              "https://iiif.wellcomecollection.org/auth/clickthrough/logout",
            "@type": "AuthLogoutService1",
            profile: "http://iiif.io/api/auth/1/logout",
            label: "Log out of Wellcome Collection",
          },
        ],
        confirmLabel: "Accept Terms and Open",
        header: "Content advisory",
        failureHeader: "Terms not accepted",
        failureDescription: "You must accept the terms to view the content.",
      },
      {
        id: "https://iiif.wellcomecollection.org/presentation/b32253345#accesscontrolhints",
        type: "Text",
        profile: "http://wellcomelibrary.org/ld/iiif-ext/access-control-hints",
        label: {
          en: ["clickthrough"],
        },
      },
    ],
    items: [
      {
        id: "https://iiif.wellcomecollection.org/presentation/b32253345/canvases/b32253345_0001.jp2",
        type: "Canvas",
        label: {
          none: ["-"],
        },
        width: 3231,
        height: 4869,
        thumbnail: [
          {
            id: "https://iiif.wellcomecollection.org/thumbs/b32253345_0001.jp2/full/66,100/0/default.jpg",
            type: "Image",
            width: 66,
            height: 100,
            service: [
              {
                "@id":
                  "https://iiif.wellcomecollection.org/thumbs/b32253345_0001.jp2",
                "@type": "ImageService2",
                profile: "http://iiif.io/api/image/2/level0.json",
                width: 133,
                height: 200,
                sizes: [
                  {
                    width: 66,
                    height: 100,
                  },
                  {
                    width: 133,
                    height: 200,
                  },
                ],
              },
            ],
          },
        ],
        items: [
          {
            id: "https://iiif.wellcomecollection.org/presentation/b32253345/canvases/b32253345_0001.jp2/painting",
            type: "AnnotationPage",
            items: [
              {
                id: "https://iiif.wellcomecollection.org/presentation/b32253345/canvases/b32253345_0001.jp2/painting/anno",
                type: "Annotation",
                motivation: "painting",
                body: {
                  id: "https://iiif.wellcomecollection.org/image/b32253345_0001.jp2/full/133,200/0/default.jpg",
                  type: "Image",
                  width: 133,
                  height: 200,
                  format: "image/jpeg",
                  service: [
                    {
                      "@id":
                        "https://iiif.wellcomecollection.org/image/b32253345_0001.jp2",
                      "@type": "ImageService2",
                      profile: "http://iiif.io/api/image/2/level1.json",
                      width: 3231,
                      height: 4869,
                      service: {
                        "@id":
                          "https://iiif.wellcomecollection.org/auth/clickthrough",
                        "@type": "AuthCookieService1",
                      },
                    },
                  ],
                },
                target:
                  "https://iiif.wellcomecollection.org/presentation/b32253345/canvases/b32253345_0001.jp2",
              },
            ],
          },
        ],
      },
      {
        id: "https://iiif.wellcomecollection.org/presentation/b32253345/canvases/b32253345_0002.jp2",
        type: "Canvas",
        label: {
          none: ["-"],
        },
        width: 3077,
        height: 4869,
        thumbnail: [
          {
            id: "https://iiif.wellcomecollection.org/thumbs/b32253345_0002.jp2/full/63,100/0/default.jpg",
            type: "Image",
            width: 63,
            height: 100,
            service: [
              {
                "@id":
                  "https://iiif.wellcomecollection.org/thumbs/b32253345_0002.jp2",
                "@type": "ImageService2",
                profile: "http://iiif.io/api/image/2/level0.json",
                width: 126,
                height: 200,
                sizes: [
                  {
                    width: 63,
                    height: 100,
                  },
                  {
                    width: 126,
                    height: 200,
                  },
                ],
              },
            ],
          },
        ],
        items: [
          {
            id: "https://iiif.wellcomecollection.org/presentation/b32253345/canvases/b32253345_0002.jp2/painting",
            type: "AnnotationPage",
            items: [
              {
                id: "https://iiif.wellcomecollection.org/presentation/b32253345/canvases/b32253345_0002.jp2/painting/anno",
                type: "Annotation",
                motivation: "painting",
                body: {
                  id: "https://iiif.wellcomecollection.org/image/b32253345_0002.jp2/full/126,200/0/default.jpg",
                  type: "Image",
                  width: 126,
                  height: 200,
                  format: "image/jpeg",
                  service: [
                    {
                      "@id":
                        "https://iiif.wellcomecollection.org/image/b32253345_0002.jp2",
                      "@type": "ImageService2",
                      profile: "http://iiif.io/api/image/2/level1.json",
                      width: 3077,
                      height: 4869,
                      service: {
                        "@id":
                          "https://iiif.wellcomecollection.org/auth/clickthrough",
                        "@type": "AuthCookieService1",
                      },
                    },
                  ],
                },
                target:
                  "https://iiif.wellcomecollection.org/presentation/b32253345/canvases/b32253345_0002.jp2",
              },
            ],
          },
        ],
      },
      {
        id: "https://iiif.wellcomecollection.org/presentation/b32253345/canvases/b32253345_0003.jp2",
        type: "Canvas",
        label: {
          none: ["-"],
        },
        width: 3077,
        height: 4869,
        thumbnail: [
          {
            id: "https://iiif.wellcomecollection.org/thumbs/b32253345_0003.jp2/full/63,100/0/default.jpg",
            type: "Image",
            width: 63,
            height: 100,
            service: [
              {
                "@id":
                  "https://iiif.wellcomecollection.org/thumbs/b32253345_0003.jp2",
                "@type": "ImageService2",
                profile: "http://iiif.io/api/image/2/level0.json",
                width: 126,
                height: 200,
                sizes: [
                  {
                    width: 63,
                    height: 100,
                  },
                  {
                    width: 126,
                    height: 200,
                  },
                ],
              },
            ],
          },
        ],
        items: [
          {
            id: "https://iiif.wellcomecollection.org/presentation/b32253345/canvases/b32253345_0003.jp2/painting",
            type: "AnnotationPage",
            items: [
              {
                id: "https://iiif.wellcomecollection.org/presentation/b32253345/canvases/b32253345_0003.jp2/painting/anno",
                type: "Annotation",
                motivation: "painting",
                body: {
                  id: "https://iiif.wellcomecollection.org/image/b32253345_0003.jp2/full/126,200/0/default.jpg",
                  type: "Image",
                  width: 126,
                  height: 200,
                  format: "image/jpeg",
                  service: [
                    {
                      "@id":
                        "https://iiif.wellcomecollection.org/image/b32253345_0003.jp2",
                      "@type": "ImageService2",
                      profile: "http://iiif.io/api/image/2/level1.json",
                      width: 3077,
                      height: 4869,
                      service: {
                        "@id":
                          "https://iiif.wellcomecollection.org/auth/clickthrough",
                        "@type": "AuthCookieService1",
                      },
                    },
                  ],
                },
                target:
                  "https://iiif.wellcomecollection.org/presentation/b32253345/canvases/b32253345_0003.jp2",
              },
            ],
          },
        ],
      },
      {
        id: "https://iiif.wellcomecollection.org/presentation/b32253345/canvases/b32253345_0004.jp2",
        type: "Canvas",
        label: {
          none: ["-"],
        },
        width: 3240,
        height: 4869,
        thumbnail: [
          {
            id: "https://iiif.wellcomecollection.org/thumbs/b32253345_0004.jp2/full/67,100/0/default.jpg",
            type: "Image",
            width: 67,
            height: 100,
            service: [
              {
                "@id":
                  "https://iiif.wellcomecollection.org/thumbs/b32253345_0004.jp2",
                "@type": "ImageService2",
                profile: "http://iiif.io/api/image/2/level0.json",
                width: 133,
                height: 200,
                sizes: [
                  {
                    width: 67,
                    height: 100,
                  },
                  {
                    width: 133,
                    height: 200,
                  },
                ],
              },
            ],
          },
        ],
        items: [
          {
            id: "https://iiif.wellcomecollection.org/presentation/b32253345/canvases/b32253345_0004.jp2/painting",
            type: "AnnotationPage",
            items: [
              {
                id: "https://iiif.wellcomecollection.org/presentation/b32253345/canvases/b32253345_0004.jp2/painting/anno",
                type: "Annotation",
                motivation: "painting",
                body: {
                  id: "https://iiif.wellcomecollection.org/image/b32253345_0004.jp2/full/133,200/0/default.jpg",
                  type: "Image",
                  width: 133,
                  height: 200,
                  format: "image/jpeg",
                  service: [
                    {
                      "@id":
                        "https://iiif.wellcomecollection.org/image/b32253345_0004.jp2",
                      "@type": "ImageService2",
                      profile: "http://iiif.io/api/image/2/level1.json",
                      width: 3240,
                      height: 4869,
                      service: {
                        "@id":
                          "https://iiif.wellcomecollection.org/auth/clickthrough",
                        "@type": "AuthCookieService1",
                      },
                    },
                  ],
                },
                target:
                  "https://iiif.wellcomecollection.org/presentation/b32253345/canvases/b32253345_0004.jp2",
              },
            ],
          },
        ],
      },
      {
        id: "https://iiif.wellcomecollection.org/presentation/b32253345/canvases/b32253345_0005.jp2",
        type: "Canvas",
        label: {
          none: ["-"],
        },
        width: 3891,
        height: 5467,
        thumbnail: [
          {
            id: "https://iiif.wellcomecollection.org/thumbs/b32253345_0005.jp2/full/71,100/0/default.jpg",
            type: "Image",
            width: 71,
            height: 100,
            service: [
              {
                "@id":
                  "https://iiif.wellcomecollection.org/thumbs/b32253345_0005.jp2",
                "@type": "ImageService2",
                profile: "http://iiif.io/api/image/2/level0.json",
                width: 142,
                height: 200,
                sizes: [
                  {
                    width: 71,
                    height: 100,
                  },
                  {
                    width: 142,
                    height: 200,
                  },
                ],
              },
            ],
          },
        ],
        items: [
          {
            id: "https://iiif.wellcomecollection.org/presentation/b32253345/canvases/b32253345_0005.jp2/painting",
            type: "AnnotationPage",
            items: [
              {
                id: "https://iiif.wellcomecollection.org/presentation/b32253345/canvases/b32253345_0005.jp2/painting/anno",
                type: "Annotation",
                motivation: "painting",
                body: {
                  id: "https://iiif.wellcomecollection.org/image/b32253345_0005.jp2/full/142,200/0/default.jpg",
                  type: "Image",
                  width: 142,
                  height: 200,
                  format: "image/jpeg",
                  service: [
                    {
                      "@id":
                        "https://iiif.wellcomecollection.org/image/b32253345_0005.jp2",
                      "@type": "ImageService2",
                      profile: "http://iiif.io/api/image/2/level1.json",
                      width: 3891,
                      height: 5467,
                      service: {
                        "@id":
                          "https://iiif.wellcomecollection.org/auth/clickthrough",
                        "@type": "AuthCookieService1",
                      },
                    },
                  ],
                },
                target:
                  "https://iiif.wellcomecollection.org/presentation/b32253345/canvases/b32253345_0005.jp2",
              },
            ],
          },
        ],
      },
      {
        id: "https://iiif.wellcomecollection.org/presentation/b32253345/canvases/b32253345_0006.jp2",
        type: "Canvas",
        label: {
          none: ["-"],
        },
        width: 3928,
        height: 5467,
        thumbnail: [
          {
            id: "https://iiif.wellcomecollection.org/thumbs/b32253345_0006.jp2/full/72,100/0/default.jpg",
            type: "Image",
            width: 72,
            height: 100,
            service: [
              {
                "@id":
                  "https://iiif.wellcomecollection.org/thumbs/b32253345_0006.jp2",
                "@type": "ImageService2",
                profile: "http://iiif.io/api/image/2/level0.json",
                width: 144,
                height: 200,
                sizes: [
                  {
                    width: 72,
                    height: 100,
                  },
                  {
                    width: 144,
                    height: 200,
                  },
                ],
              },
            ],
          },
        ],
        items: [
          {
            id: "https://iiif.wellcomecollection.org/presentation/b32253345/canvases/b32253345_0006.jp2/painting",
            type: "AnnotationPage",
            items: [
              {
                id: "https://iiif.wellcomecollection.org/presentation/b32253345/canvases/b32253345_0006.jp2/painting/anno",
                type: "Annotation",
                motivation: "painting",
                body: {
                  id: "https://iiif.wellcomecollection.org/image/b32253345_0006.jp2/full/144,200/0/default.jpg",
                  type: "Image",
                  width: 144,
                  height: 200,
                  format: "image/jpeg",
                  service: [
                    {
                      "@id":
                        "https://iiif.wellcomecollection.org/image/b32253345_0006.jp2",
                      "@type": "ImageService2",
                      profile: "http://iiif.io/api/image/2/level1.json",
                      width: 3928,
                      height: 5467,
                      service: {
                        "@id":
                          "https://iiif.wellcomecollection.org/auth/clickthrough",
                        "@type": "AuthCookieService1",
                      },
                    },
                  ],
                },
                target:
                  "https://iiif.wellcomecollection.org/presentation/b32253345/canvases/b32253345_0006.jp2",
              },
            ],
          },
        ],
      },
    ],
    partOf: [
      {
        id: "https://iiif.wellcomecollection.org/presentation/collections/archives/PP/MHP/B.1",
        type: "Collection",
        label: {
          en: ["Papers"],
        },
        partOf: [
          {
            id: "https://iiif.wellcomecollection.org/presentation/collections/archives/PP/MHP/B",
            type: "Collection",
            label: {
              en: ["Own writings"],
            },
            partOf: [
              {
                id: "https://iiif.wellcomecollection.org/presentation/collections/archives/PP/MHP",
                type: "Collection",
                label: {
                  en: ["Pappworth, Maurice"],
                },
              },
            ],
          },
        ],
      },
    ],
  },
  {
    id: "https://digirati-co-uk.github.io/wunder.json",
    type: "Manifest",
    behavior: ["paged"],
    label: {
      en: ["Wunder der Vererbung / von Fritz Bolle."],
    },
    metadata: [
      {
        label: {
          en: ["Publication/creation"],
        },
        value: {
          none: ["Murnau ; München : Sebastian Lux, [1951]"],
        },
      },
      {
        label: {
          en: ["Physical description"],
        },
        value: {
          en: ["31 pages : illustrations ; 15 cm."],
        },
      },
      {
        label: {
          en: ["Contributors"],
        },
        value: {
          none: ["Bolle, Fritz."],
        },
      },
      {
        label: {
          en: ["Type/technique"],
        },
        value: {
          en: ["Pamphlets"],
        },
      },
      {
        label: {
          en: ["Subjects"],
        },
        value: {
          en: ["Genetics - history"],
        },
      },
      {
        label: {
          en: ["Attribution and usage"],
        },
        value: {
          en: [
            "Wellcome Collection",
            '<span>You have permission to make copies of this work under a <a target="_top" href="http://creativecommons.org/licenses/by-nc/4.0/">Creative Commons, Attribution, Non-commercial license</a>.<br/><br/>Non-commercial use includes private study, academic research, teaching, and other activities that are not primarily intended for, or directed towards, commercial advantage or private monetary compensation. See the <a target="_top" href="http://creativecommons.org/licenses/by-nc/4.0/legalcode">Legal Code</a> for further information.<br/><br/>Image source should be attributed as specified in the full catalogue record. If no source is given the image should be attributed to Wellcome Collection.</span>',
          ],
        },
      },
    ],
    rights: "http://creativecommons.org/licenses/by-nc/4.0/",
    thumbnail: [
      {
        id: "https://iiif.wellcomecollection.org/thumbs/b18035723_0004.JP2/full/72,100/0/default.jpg",
        type: "Image",
        height: 100,
        width: 72,
        service: [
          {
            "@id":
              "https://iiif.wellcomecollection.org/thumbs/b18035723_0004.JP2",
            "@type": "ImageService2",
            profile: "http://iiif.io/api/image/2/level0.json",
            width: 732,
            height: 1024,
            sizes: [
              {
                width: 72,
                height: 100,
              },
              {
                width: 143,
                height: 200,
              },
              {
                width: 286,
                height: 400,
              },
              {
                width: 732,
                height: 1024,
              },
            ],
          },
        ],
      },
    ],
    provider: [
      {
        id: "https://wellcomecollection.org",
        type: "Agent",
        label: {
          en: [
            "Wellcome Collection",
            "183 Euston Road",
            "London NW1 2BE UK",
            "T +44 (0)20 7611 8722",
            "E library@wellcomecollection.org",
            "https://wellcomecollection.org",
          ],
        },
        homepage: [
          {
            id: "https://wellcomecollection.org/works",
            type: "Text",
            format: "text/html",
            label: {
              en: ["Explore our collections"],
            },
          },
        ],
        logo: [
          {
            id: "https://iiif.wellcomecollection.org/logos/wellcome-collection-black.png",
            type: "Image",
            format: "image/png",
          },
        ],
      },
    ],
    seeAlso: [
      {
        id: "https://api.wellcomecollection.org/catalogue/v2/works/krqp99r9",
        type: "Dataset",
        format: "application/json",
        profile: "https://api.wellcomecollection.org/catalogue/v2/context.json",
        label: {
          en: ["Wellcome Collection Catalogue API"],
        },
      },
    ],
    service: [
      {
        "@id": "https://iiif.wellcomecollection.org/search/v1/b18035723",
        "@type": "SearchService1",
        profile: "http://iiif.io/api/search/1/search",
        label: "Search within this manifest",
        service: {
          "@id":
            "https://iiif.wellcomecollection.org/search/autocomplete/v1/b18035723",
          "@type": "AutoCompleteService1",
          profile: "http://iiif.io/api/search/1/autocomplete",
          label: "Autocomplete words in this manifest",
        },
      },
    ],
    services: [
      {
        id: "https://iiif.wellcomecollection.org/presentation/b18035723#tracking",
        type: "Text",
        profile: "http://universalviewer.io/tracking-extensions-profile",
        label: {
          en: [
            "Format: Monograph, Institution: n/a, Identifier: b18035723, Digicode: diggenetics, Collection code: n/a",
          ],
        },
      },
      {
        id: "https://iiif.wellcomecollection.org/presentation/b18035723#timestamp",
        type: "Text",
        profile:
          "https://github.com/wellcomecollection/iiif-builder/build-timestamp",
        label: {
          none: ["2021-04-29T21:58:28.9247406Z"],
        },
      },
      {
        id: "https://iiif.wellcomecollection.org/presentation/b18035723#accesscontrolhints",
        type: "Text",
        profile: "http://wellcomelibrary.org/ld/iiif-ext/access-control-hints",
        label: {
          en: ["open"],
        },
      },
    ],
    rendering: [
      {
        id: "https://iiif.wellcomecollection.org/pdf/b18035723",
        type: "Text",
        format: "application/pdf",
        label: {
          en: ["View as PDF"],
        },
      },
      {
        id: "https://api.wellcomecollection.org/text/v1/b18035723",
        type: "Text",
        format: "text/plain",
        label: {
          en: ["View raw text"],
        },
      },
    ],
    partOf: [
      {
        id: "https://iiif.wellcomecollection.org/presentation/collections/contributors/xtwzf3g5",
        type: "ContentResource",
      },
      {
        id: "https://iiif.wellcomecollection.org/presentation/collections/subjects/hq8gcy73",
        type: "ContentResource",
      },
      {
        id: "https://iiif.wellcomecollection.org/presentation/collections/genres/Pamphlets",
        type: "ContentResource",
      },
    ],
    items: [
      {
        id: "https://digirati-co-uk.github.io/wunder/canvases/0",
        type: "Canvas",
        height: 3543,
        width: 2569,
        label: {
          none: ["-"],
        },
        thumbnail: [
          {
            id: "https://iiif.wellcomecollection.org/thumbs/b18035723_0001.JP2/full/73,100/0/default.jpg",
            type: "Image",
            height: 100,
            width: 73,
            service: [
              {
                "@id":
                  "https://iiif.wellcomecollection.org/thumbs/b18035723_0001.JP2",
                "@type": "ImageService2",
                profile: "http://iiif.io/api/image/2/level0.json",
                width: 742,
                height: 1024,
                sizes: [
                  {
                    width: 73,
                    height: 100,
                  },
                  {
                    width: 145,
                    height: 200,
                  },
                  {
                    width: 290,
                    height: 400,
                  },
                  {
                    width: 742,
                    height: 1024,
                  },
                ],
              },
            ],
          },
        ],
        seeAlso: [
          {
            id: "https://api.wellcomecollection.org/text/alto/b18035723/b18035723_0001.JP2",
            type: "Dataset",
            format: "text/xml",
            profile: "http://www.loc.gov/standards/alto/v3/alto.xsd",
            label: {
              none: ["METS-ALTO XML"],
            },
          },
        ],
        items: [
          {
            id: "https://iiif.wellcomecollection.org/presentation/b18035723/canvases/b18035723_0001.JP2/painting",
            type: "AnnotationPage",
            items: [
              {
                id: "https://iiif.wellcomecollection.org/presentation/b18035723/canvases/b18035723_0001.JP2/painting/anno",
                type: "Annotation",
                motivation: ["painting"],
                target: "https://digirati-co-uk.github.io/wunder/canvases/0",
                body: [
                  {
                    id: "https://iiif.wellcomecollection.org/image/b18035723_0001.JP2/full/742,1024/0/default.jpg",
                    type: "Image",
                    format: "image/jpeg",
                    height: 1024,
                    width: 742,
                    service: [
                      {
                        "@id":
                          "https://iiif.wellcomecollection.org/image/b18035723_0001.JP2",
                        "@type": "ImageService2",
                        profile: "http://iiif.io/api/image/2/level1.json",
                        width: 2569,
                        height: 3543,
                      },
                    ],
                  },
                ],
              },
            ],
          },
        ],
        annotations: [
          {
            id: "https://digirati-co-uk.github.io/wunder/annos/0.json",
            type: "AnnotationPage",
            label: {
              en: ["Text of page  -"],
            },
            items: [],
          },
        ],
      },
      {
        id: "https://digirati-co-uk.github.io/wunder/canvases/1",
        type: "Canvas",
        height: 3372,
        width: 2411,
        label: {
          none: ["-"],
        },
        thumbnail: [
          {
            id: "https://iiif.wellcomecollection.org/thumbs/b18035723_0003.JP2/full/72,100/0/default.jpg",
            type: "Image",
            height: 100,
            width: 72,
            service: [
              {
                "@id":
                  "https://iiif.wellcomecollection.org/thumbs/b18035723_0003.JP2",
                "@type": "ImageService2",
                profile: "http://iiif.io/api/image/2/level0.json",
                width: 732,
                height: 1024,
                sizes: [
                  {
                    width: 72,
                    height: 100,
                  },
                  {
                    width: 143,
                    height: 200,
                  },
                  {
                    width: 286,
                    height: 400,
                  },
                  {
                    width: 732,
                    height: 1024,
                  },
                ],
              },
            ],
          },
        ],
        seeAlso: [
          {
            id: "https://api.wellcomecollection.org/text/alto/b18035723/b18035723_0003.JP2",
            type: "Dataset",
            format: "text/xml",
            profile: "http://www.loc.gov/standards/alto/v3/alto.xsd",
            label: {
              none: ["METS-ALTO XML"],
            },
          },
        ],
        items: [
          {
            id: "https://iiif.wellcomecollection.org/presentation/b18035723/canvases/b18035723_0003.JP2/painting",
            type: "AnnotationPage",
            items: [
              {
                id: "https://iiif.wellcomecollection.org/presentation/b18035723/canvases/b18035723_0003.JP2/painting/anno",
                type: "Annotation",
                motivation: ["painting"],
                target: "https://digirati-co-uk.github.io/wunder/canvases/1",
                body: [
                  {
                    id: "https://iiif.wellcomecollection.org/image/b18035723_0003.JP2/full/732,1024/0/default.jpg",
                    type: "Image",
                    format: "image/jpeg",
                    height: 1024,
                    width: 732,
                    service: [
                      {
                        "@id":
                          "https://iiif.wellcomecollection.org/image/b18035723_0003.JP2",
                        "@type": "ImageService2",
                        profile: "http://iiif.io/api/image/2/level1.json",
                        width: 2411,
                        height: 3372,
                      },
                    ],
                  },
                ],
              },
            ],
          },
        ],
        annotations: [
          {
            id: "https://digirati-co-uk.github.io/wunder/annos/1.json",
            type: "AnnotationPage",
            label: {
              en: ["Text of page  -"],
            },
            items: [],
          },
        ],
      },
      {
        id: "https://digirati-co-uk.github.io/wunder/canvases/2",
        type: "Canvas",
        height: 3372,
        width: 2411,
        label: {
          none: ["-"],
        },
        thumbnail: [
          {
            id: "https://iiif.wellcomecollection.org/thumbs/b18035723_0004.JP2/full/72,100/0/default.jpg",
            type: "Image",
            height: 100,
            width: 72,
            service: [
              {
                "@id":
                  "https://iiif.wellcomecollection.org/thumbs/b18035723_0004.JP2",
                "@type": "ImageService2",
                profile: "http://iiif.io/api/image/2/level0.json",
                width: 732,
                height: 1024,
                sizes: [
                  {
                    width: 72,
                    height: 100,
                  },
                  {
                    width: 143,
                    height: 200,
                  },
                  {
                    width: 286,
                    height: 400,
                  },
                  {
                    width: 732,
                    height: 1024,
                  },
                ],
              },
            ],
          },
        ],
        seeAlso: [
          {
            id: "https://api.wellcomecollection.org/text/alto/b18035723/b18035723_0004.JP2",
            type: "Dataset",
            format: "text/xml",
            profile: "http://www.loc.gov/standards/alto/v3/alto.xsd",
            label: {
              none: ["METS-ALTO XML"],
            },
          },
        ],
        items: [
          {
            id: "https://iiif.wellcomecollection.org/presentation/b18035723/canvases/b18035723_0004.JP2/painting",
            type: "AnnotationPage",
            items: [
              {
                id: "https://iiif.wellcomecollection.org/presentation/b18035723/canvases/b18035723_0004.JP2/painting/anno",
                type: "Annotation",
                motivation: ["painting"],
                target: "https://digirati-co-uk.github.io/wunder/canvases/2",
                body: [
                  {
                    id: "https://iiif.wellcomecollection.org/image/b18035723_0004.JP2/full/732,1024/0/default.jpg",
                    type: "Image",
                    format: "image/jpeg",
                    height: 1024,
                    width: 732,
                    service: [
                      {
                        "@id":
                          "https://iiif.wellcomecollection.org/image/b18035723_0004.JP2",
                        "@type": "ImageService2",
                        profile: "http://iiif.io/api/image/2/level1.json",
                        width: 2411,
                        height: 3372,
                      },
                    ],
                  },
                ],
              },
            ],
          },
        ],
        annotations: [
          {
            id: "https://digirati-co-uk.github.io/wunder/annos/2.json",
            type: "AnnotationPage",
            label: {
              en: ["Text of page  -"],
            },
            items: [],
          },
        ],
      },
      {
        id: "https://digirati-co-uk.github.io/wunder/canvases/3",
        type: "Canvas",
        height: 3372,
        width: 2411,
        label: {
          none: ["2"],
        },
        thumbnail: [
          {
            id: "https://iiif.wellcomecollection.org/thumbs/b18035723_0005.JP2/full/72,100/0/default.jpg",
            type: "Image",
            height: 100,
            width: 72,
            service: [
              {
                "@id":
                  "https://iiif.wellcomecollection.org/thumbs/b18035723_0005.JP2",
                "@type": "ImageService2",
                profile: "http://iiif.io/api/image/2/level0.json",
                width: 732,
                height: 1024,
                sizes: [
                  {
                    width: 72,
                    height: 100,
                  },
                  {
                    width: 143,
                    height: 200,
                  },
                  {
                    width: 286,
                    height: 400,
                  },
                  {
                    width: 732,
                    height: 1024,
                  },
                ],
              },
            ],
          },
        ],
        seeAlso: [
          {
            id: "https://api.wellcomecollection.org/text/alto/b18035723/b18035723_0005.JP2",
            type: "Dataset",
            format: "text/xml",
            profile: "http://www.loc.gov/standards/alto/v3/alto.xsd",
            label: {
              none: ["METS-ALTO XML"],
            },
          },
        ],
        items: [
          {
            id: "https://iiif.wellcomecollection.org/presentation/b18035723/canvases/b18035723_0005.JP2/painting",
            type: "AnnotationPage",
            items: [
              {
                id: "https://iiif.wellcomecollection.org/presentation/b18035723/canvases/b18035723_0005.JP2/painting/anno",
                type: "Annotation",
                motivation: ["painting"],
                target: "https://digirati-co-uk.github.io/wunder/canvases/3",
                body: [
                  {
                    id: "https://iiif.wellcomecollection.org/image/b18035723_0005.JP2/full/732,1024/0/default.jpg",
                    type: "Image",
                    format: "image/jpeg",
                    height: 1024,
                    width: 732,
                    service: [
                      {
                        "@id":
                          "https://iiif.wellcomecollection.org/image/b18035723_0005.JP2",
                        "@type": "ImageService2",
                        profile: "http://iiif.io/api/image/2/level1.json",
                        width: 2411,
                        height: 3372,
                      },
                    ],
                  },
                ],
              },
            ],
          },
        ],
        annotations: [
          {
            id: "https://digirati-co-uk.github.io/wunder/annos/3.json",
            type: "AnnotationPage",
            label: {
              en: ["Text of page 2"],
            },
            items: [],
          },
        ],
      },
      {
        id: "https://digirati-co-uk.github.io/wunder/canvases/4",
        type: "Canvas",
        height: 3372,
        width: 2411,
        label: {
          none: ["3"],
        },
        thumbnail: [
          {
            id: "https://iiif.wellcomecollection.org/thumbs/b18035723_0006.JP2/full/72,100/0/default.jpg",
            type: "Image",
            height: 100,
            width: 72,
            service: [
              {
                "@id":
                  "https://iiif.wellcomecollection.org/thumbs/b18035723_0006.JP2",
                "@type": "ImageService2",
                profile: "http://iiif.io/api/image/2/level0.json",
                width: 732,
                height: 1024,
                sizes: [
                  {
                    width: 72,
                    height: 100,
                  },
                  {
                    width: 143,
                    height: 200,
                  },
                  {
                    width: 286,
                    height: 400,
                  },
                  {
                    width: 732,
                    height: 1024,
                  },
                ],
              },
            ],
          },
        ],
        seeAlso: [
          {
            id: "https://api.wellcomecollection.org/text/alto/b18035723/b18035723_0006.JP2",
            type: "Dataset",
            format: "text/xml",
            profile: "http://www.loc.gov/standards/alto/v3/alto.xsd",
            label: {
              none: ["METS-ALTO XML"],
            },
          },
        ],
        items: [
          {
            id: "https://iiif.wellcomecollection.org/presentation/b18035723/canvases/b18035723_0006.JP2/painting",
            type: "AnnotationPage",
            items: [
              {
                id: "https://iiif.wellcomecollection.org/presentation/b18035723/canvases/b18035723_0006.JP2/painting/anno",
                type: "Annotation",
                motivation: ["painting"],
                target: "https://digirati-co-uk.github.io/wunder/canvases/4",
                body: [
                  {
                    id: "https://iiif.wellcomecollection.org/image/b18035723_0006.JP2/full/732,1024/0/default.jpg",
                    type: "Image",
                    format: "image/jpeg",
                    height: 1024,
                    width: 732,
                    service: [
                      {
                        "@id":
                          "https://iiif.wellcomecollection.org/image/b18035723_0006.JP2",
                        "@type": "ImageService2",
                        profile: "http://iiif.io/api/image/2/level1.json",
                        width: 2411,
                        height: 3372,
                      },
                    ],
                  },
                ],
              },
            ],
          },
        ],
        annotations: [
          {
            id: "https://digirati-co-uk.github.io/wunder/annos/4.json",
            type: "AnnotationPage",
            label: {
              en: ["Text of page 3"],
            },
            items: [],
          },
        ],
      },
      {
        id: "https://digirati-co-uk.github.io/wunder/canvases/5",
        type: "Canvas",
        height: 2736,
        width: 2008,
        label: {
          none: ["4"],
        },
        thumbnail: [
          {
            id: "https://iiif.wellcomecollection.org/thumbs/b18035723_0007.JP2/full/73,100/0/default.jpg",
            type: "Image",
            height: 100,
            width: 73,
            service: [
              {
                "@id":
                  "https://iiif.wellcomecollection.org/thumbs/b18035723_0007.JP2",
                "@type": "ImageService2",
                profile: "http://iiif.io/api/image/2/level0.json",
                width: 752,
                height: 1024,
                sizes: [
                  {
                    width: 73,
                    height: 100,
                  },
                  {
                    width: 147,
                    height: 200,
                  },
                  {
                    width: 294,
                    height: 400,
                  },
                  {
                    width: 752,
                    height: 1024,
                  },
                ],
              },
            ],
          },
        ],
        seeAlso: [
          {
            id: "https://api.wellcomecollection.org/text/alto/b18035723/b18035723_0007.JP2",
            type: "Dataset",
            format: "text/xml",
            profile: "http://www.loc.gov/standards/alto/v3/alto.xsd",
            label: {
              none: ["METS-ALTO XML"],
            },
          },
        ],
        items: [
          {
            id: "https://iiif.wellcomecollection.org/presentation/b18035723/canvases/b18035723_0007.JP2/painting",
            type: "AnnotationPage",
            items: [
              {
                id: "https://iiif.wellcomecollection.org/presentation/b18035723/canvases/b18035723_0007.JP2/painting/anno",
                type: "Annotation",
                motivation: ["painting"],
                target: "https://digirati-co-uk.github.io/wunder/canvases/5",
                body: [
                  {
                    id: "https://iiif.wellcomecollection.org/image/b18035723_0007.JP2/full/752,1024/0/default.jpg",
                    type: "Image",
                    format: "image/jpeg",
                    height: 1024,
                    width: 752,
                    service: [
                      {
                        "@id":
                          "https://iiif.wellcomecollection.org/image/b18035723_0007.JP2",
                        "@type": "ImageService2",
                        profile: "http://iiif.io/api/image/2/level1.json",
                        width: 2008,
                        height: 2736,
                      },
                    ],
                  },
                ],
              },
            ],
          },
        ],
        annotations: [
          {
            id: "https://digirati-co-uk.github.io/wunder/annos/5.json",
            type: "AnnotationPage",
            label: {
              en: ["Text of page 4"],
            },
            items: [],
          },
        ],
      },
      {
        id: "https://digirati-co-uk.github.io/wunder/canvases/6",
        type: "Canvas",
        height: 2740,
        width: 2008,
        label: {
          none: ["5"],
        },
        thumbnail: [
          {
            id: "https://iiif.wellcomecollection.org/thumbs/b18035723_0008.JP2/full/73,100/0/default.jpg",
            type: "Image",
            height: 100,
            width: 73,
            service: [
              {
                "@id":
                  "https://iiif.wellcomecollection.org/thumbs/b18035723_0008.JP2",
                "@type": "ImageService2",
                profile: "http://iiif.io/api/image/2/level0.json",
                width: 750,
                height: 1024,
                sizes: [
                  {
                    width: 73,
                    height: 100,
                  },
                  {
                    width: 147,
                    height: 200,
                  },
                  {
                    width: 293,
                    height: 400,
                  },
                  {
                    width: 750,
                    height: 1024,
                  },
                ],
              },
            ],
          },
        ],
        seeAlso: [
          {
            id: "https://api.wellcomecollection.org/text/alto/b18035723/b18035723_0008.JP2",
            type: "Dataset",
            format: "text/xml",
            profile: "http://www.loc.gov/standards/alto/v3/alto.xsd",
            label: {
              none: ["METS-ALTO XML"],
            },
          },
        ],
        items: [
          {
            id: "https://iiif.wellcomecollection.org/presentation/b18035723/canvases/b18035723_0008.JP2/painting",
            type: "AnnotationPage",
            items: [
              {
                id: "https://iiif.wellcomecollection.org/presentation/b18035723/canvases/b18035723_0008.JP2/painting/anno",
                type: "Annotation",
                motivation: ["painting"],
                target: "https://digirati-co-uk.github.io/wunder/canvases/6",
                body: [
                  {
                    id: "https://iiif.wellcomecollection.org/image/b18035723_0008.JP2/full/750,1024/0/default.jpg",
                    type: "Image",
                    format: "image/jpeg",
                    height: 1024,
                    width: 750,
                    service: [
                      {
                        "@id":
                          "https://iiif.wellcomecollection.org/image/b18035723_0008.JP2",
                        "@type": "ImageService2",
                        profile: "http://iiif.io/api/image/2/level1.json",
                        width: 2008,
                        height: 2740,
                      },
                    ],
                  },
                ],
              },
            ],
          },
        ],
        annotations: [
          {
            id: "https://digirati-co-uk.github.io/wunder/annos/6.json",
            type: "AnnotationPage",
            label: {
              en: ["Text of page 5"],
            },
            items: [],
          },
        ],
      },
      {
        id: "https://digirati-co-uk.github.io/wunder/canvases/7",
        type: "Canvas",
        height: 3372,
        width: 2411,
        label: {
          none: ["6"],
        },
        thumbnail: [
          {
            id: "https://iiif.wellcomecollection.org/thumbs/b18035723_0009.JP2/full/72,100/0/default.jpg",
            type: "Image",
            height: 100,
            width: 72,
            service: [
              {
                "@id":
                  "https://iiif.wellcomecollection.org/thumbs/b18035723_0009.JP2",
                "@type": "ImageService2",
                profile: "http://iiif.io/api/image/2/level0.json",
                width: 732,
                height: 1024,
                sizes: [
                  {
                    width: 72,
                    height: 100,
                  },
                  {
                    width: 143,
                    height: 200,
                  },
                  {
                    width: 286,
                    height: 400,
                  },
                  {
                    width: 732,
                    height: 1024,
                  },
                ],
              },
            ],
          },
        ],
        seeAlso: [
          {
            id: "https://api.wellcomecollection.org/text/alto/b18035723/b18035723_0009.JP2",
            type: "Dataset",
            format: "text/xml",
            profile: "http://www.loc.gov/standards/alto/v3/alto.xsd",
            label: {
              none: ["METS-ALTO XML"],
            },
          },
        ],
        items: [
          {
            id: "https://iiif.wellcomecollection.org/presentation/b18035723/canvases/b18035723_0009.JP2/painting",
            type: "AnnotationPage",
            items: [
              {
                id: "https://iiif.wellcomecollection.org/presentation/b18035723/canvases/b18035723_0009.JP2/painting/anno",
                type: "Annotation",
                motivation: ["painting"],
                target: "https://digirati-co-uk.github.io/wunder/canvases/7",
                body: [
                  {
                    id: "https://iiif.wellcomecollection.org/image/b18035723_0009.JP2/full/732,1024/0/default.jpg",
                    type: "Image",
                    format: "image/jpeg",
                    height: 1024,
                    width: 732,
                    service: [
                      {
                        "@id":
                          "https://iiif.wellcomecollection.org/image/b18035723_0009.JP2",
                        "@type": "ImageService2",
                        profile: "http://iiif.io/api/image/2/level1.json",
                        width: 2411,
                        height: 3372,
                      },
                    ],
                  },
                ],
              },
            ],
          },
        ],
        annotations: [
          {
            id: "https://digirati-co-uk.github.io/wunder/annos/7.json",
            type: "AnnotationPage",
            label: {
              en: ["Text of page 6"],
            },
            items: [],
          },
        ],
      },
      {
        id: "https://digirati-co-uk.github.io/wunder/canvases/8",
        type: "Canvas",
        height: 3372,
        width: 2411,
        label: {
          none: ["7"],
        },
        thumbnail: [
          {
            id: "https://iiif.wellcomecollection.org/thumbs/b18035723_0010.JP2/full/72,100/0/default.jpg",
            type: "Image",
            height: 100,
            width: 72,
            service: [
              {
                "@id":
                  "https://iiif.wellcomecollection.org/thumbs/b18035723_0010.JP2",
                "@type": "ImageService2",
                profile: "http://iiif.io/api/image/2/level0.json",
                width: 732,
                height: 1024,
                sizes: [
                  {
                    width: 72,
                    height: 100,
                  },
                  {
                    width: 143,
                    height: 200,
                  },
                  {
                    width: 286,
                    height: 400,
                  },
                  {
                    width: 732,
                    height: 1024,
                  },
                ],
              },
            ],
          },
        ],
        seeAlso: [
          {
            id: "https://api.wellcomecollection.org/text/alto/b18035723/b18035723_0010.JP2",
            type: "Dataset",
            format: "text/xml",
            profile: "http://www.loc.gov/standards/alto/v3/alto.xsd",
            label: {
              none: ["METS-ALTO XML"],
            },
          },
        ],
        items: [
          {
            id: "https://iiif.wellcomecollection.org/presentation/b18035723/canvases/b18035723_0010.JP2/painting",
            type: "AnnotationPage",
            items: [
              {
                id: "https://iiif.wellcomecollection.org/presentation/b18035723/canvases/b18035723_0010.JP2/painting/anno",
                type: "Annotation",
                motivation: ["painting"],
                target: "https://digirati-co-uk.github.io/wunder/canvases/8",
                body: [
                  {
                    id: "https://iiif.wellcomecollection.org/image/b18035723_0010.JP2/full/732,1024/0/default.jpg",
                    type: "Image",
                    format: "image/jpeg",
                    height: 1024,
                    width: 732,
                    service: [
                      {
                        "@id":
                          "https://iiif.wellcomecollection.org/image/b18035723_0010.JP2",
                        "@type": "ImageService2",
                        profile: "http://iiif.io/api/image/2/level1.json",
                        width: 2411,
                        height: 3372,
                      },
                    ],
                  },
                ],
              },
            ],
          },
        ],
        annotations: [
          {
            id: "https://digirati-co-uk.github.io/wunder/annos/8.json",
            type: "AnnotationPage",
            label: {
              en: ["Text of page 7"],
            },
            items: [],
          },
        ],
      },
      {
        id: "https://digirati-co-uk.github.io/wunder/canvases/9",
        type: "Canvas",
        height: 3372,
        width: 2411,
        label: {
          none: ["8"],
        },
        thumbnail: [
          {
            id: "https://iiif.wellcomecollection.org/thumbs/b18035723_0011.JP2/full/72,100/0/default.jpg",
            type: "Image",
            height: 100,
            width: 72,
            service: [
              {
                "@id":
                  "https://iiif.wellcomecollection.org/thumbs/b18035723_0011.JP2",
                "@type": "ImageService2",
                profile: "http://iiif.io/api/image/2/level0.json",
                width: 732,
                height: 1024,
                sizes: [
                  {
                    width: 72,
                    height: 100,
                  },
                  {
                    width: 143,
                    height: 200,
                  },
                  {
                    width: 286,
                    height: 400,
                  },
                  {
                    width: 732,
                    height: 1024,
                  },
                ],
              },
            ],
          },
        ],
        seeAlso: [
          {
            id: "https://api.wellcomecollection.org/text/alto/b18035723/b18035723_0011.JP2",
            type: "Dataset",
            format: "text/xml",
            profile: "http://www.loc.gov/standards/alto/v3/alto.xsd",
            label: {
              none: ["METS-ALTO XML"],
            },
          },
        ],
        items: [
          {
            id: "https://iiif.wellcomecollection.org/presentation/b18035723/canvases/b18035723_0011.JP2/painting",
            type: "AnnotationPage",
            items: [
              {
                id: "https://iiif.wellcomecollection.org/presentation/b18035723/canvases/b18035723_0011.JP2/painting/anno",
                type: "Annotation",
                motivation: ["painting"],
                target: "https://digirati-co-uk.github.io/wunder/canvases/9",
                body: [
                  {
                    id: "https://iiif.wellcomecollection.org/image/b18035723_0011.JP2/full/732,1024/0/default.jpg",
                    type: "Image",
                    format: "image/jpeg",
                    height: 1024,
                    width: 732,
                    service: [
                      {
                        "@id":
                          "https://iiif.wellcomecollection.org/image/b18035723_0011.JP2",
                        "@type": "ImageService2",
                        profile: "http://iiif.io/api/image/2/level1.json",
                        width: 2411,
                        height: 3372,
                      },
                    ],
                  },
                ],
              },
            ],
          },
        ],
        annotations: [
          {
            id: "https://digirati-co-uk.github.io/wunder/annos/9.json",
            type: "AnnotationPage",
            label: {
              en: ["Text of page 8"],
            },
            items: [],
          },
        ],
      },
      {
        id: "https://digirati-co-uk.github.io/wunder/canvases/10",
        type: "Canvas",
        height: 3372,
        width: 2411,
        label: {
          none: ["9"],
        },
        thumbnail: [
          {
            id: "https://iiif.wellcomecollection.org/thumbs/b18035723_0012.JP2/full/72,100/0/default.jpg",
            type: "Image",
            height: 100,
            width: 72,
            service: [
              {
                "@id":
                  "https://iiif.wellcomecollection.org/thumbs/b18035723_0012.JP2",
                "@type": "ImageService2",
                profile: "http://iiif.io/api/image/2/level0.json",
                width: 732,
                height: 1024,
                sizes: [
                  {
                    width: 72,
                    height: 100,
                  },
                  {
                    width: 143,
                    height: 200,
                  },
                  {
                    width: 286,
                    height: 400,
                  },
                  {
                    width: 732,
                    height: 1024,
                  },
                ],
              },
            ],
          },
        ],
        seeAlso: [
          {
            id: "https://api.wellcomecollection.org/text/alto/b18035723/b18035723_0012.JP2",
            type: "Dataset",
            format: "text/xml",
            profile: "http://www.loc.gov/standards/alto/v3/alto.xsd",
            label: {
              none: ["METS-ALTO XML"],
            },
          },
        ],
        items: [
          {
            id: "https://iiif.wellcomecollection.org/presentation/b18035723/canvases/b18035723_0012.JP2/painting",
            type: "AnnotationPage",
            items: [
              {
                id: "https://iiif.wellcomecollection.org/presentation/b18035723/canvases/b18035723_0012.JP2/painting/anno",
                type: "Annotation",
                motivation: ["painting"],
                target: "https://digirati-co-uk.github.io/wunder/canvases/10",
                body: [
                  {
                    id: "https://iiif.wellcomecollection.org/image/b18035723_0012.JP2/full/732,1024/0/default.jpg",
                    type: "Image",
                    format: "image/jpeg",
                    height: 1024,
                    width: 732,
                    service: [
                      {
                        "@id":
                          "https://iiif.wellcomecollection.org/image/b18035723_0012.JP2",
                        "@type": "ImageService2",
                        profile: "http://iiif.io/api/image/2/level1.json",
                        width: 2411,
                        height: 3372,
                      },
                    ],
                  },
                ],
              },
            ],
          },
        ],
        annotations: [
          {
            id: "https://digirati-co-uk.github.io/wunder/annos/10.json",
            type: "AnnotationPage",
            label: {
              en: ["Text of page 9"],
            },
            items: [],
          },
        ],
      },
      {
        id: "https://digirati-co-uk.github.io/wunder/canvases/11",
        type: "Canvas",
        height: 3372,
        width: 2411,
        label: {
          none: ["10"],
        },
        thumbnail: [
          {
            id: "https://iiif.wellcomecollection.org/thumbs/b18035723_0013.JP2/full/72,100/0/default.jpg",
            type: "Image",
            height: 100,
            width: 72,
            service: [
              {
                "@id":
                  "https://iiif.wellcomecollection.org/thumbs/b18035723_0013.JP2",
                "@type": "ImageService2",
                profile: "http://iiif.io/api/image/2/level0.json",
                width: 732,
                height: 1024,
                sizes: [
                  {
                    width: 72,
                    height: 100,
                  },
                  {
                    width: 143,
                    height: 200,
                  },
                  {
                    width: 286,
                    height: 400,
                  },
                  {
                    width: 732,
                    height: 1024,
                  },
                ],
              },
            ],
          },
        ],
        seeAlso: [
          {
            id: "https://api.wellcomecollection.org/text/alto/b18035723/b18035723_0013.JP2",
            type: "Dataset",
            format: "text/xml",
            profile: "http://www.loc.gov/standards/alto/v3/alto.xsd",
            label: {
              none: ["METS-ALTO XML"],
            },
          },
        ],
        items: [
          {
            id: "https://iiif.wellcomecollection.org/presentation/b18035723/canvases/b18035723_0013.JP2/painting",
            type: "AnnotationPage",
            items: [
              {
                id: "https://iiif.wellcomecollection.org/presentation/b18035723/canvases/b18035723_0013.JP2/painting/anno",
                type: "Annotation",
                motivation: ["painting"],
                target: "https://digirati-co-uk.github.io/wunder/canvases/11",
                body: [
                  {
                    id: "https://iiif.wellcomecollection.org/image/b18035723_0013.JP2/full/732,1024/0/default.jpg",
                    type: "Image",
                    format: "image/jpeg",
                    height: 1024,
                    width: 732,
                    service: [
                      {
                        "@id":
                          "https://iiif.wellcomecollection.org/image/b18035723_0013.JP2",
                        "@type": "ImageService2",
                        profile: "http://iiif.io/api/image/2/level1.json",
                        width: 2411,
                        height: 3372,
                      },
                    ],
                  },
                ],
              },
            ],
          },
        ],
        annotations: [
          {
            id: "https://digirati-co-uk.github.io/wunder/annos/11.json",
            type: "AnnotationPage",
            label: {
              en: ["Text of page 10"],
            },
            items: [],
          },
        ],
      },
      {
        id: "https://digirati-co-uk.github.io/wunder/canvases/12",
        type: "Canvas",
        height: 3372,
        width: 2411,
        label: {
          none: ["11"],
        },
        thumbnail: [
          {
            id: "https://iiif.wellcomecollection.org/thumbs/b18035723_0014.JP2/full/72,100/0/default.jpg",
            type: "Image",
            height: 100,
            width: 72,
            service: [
              {
                "@id":
                  "https://iiif.wellcomecollection.org/thumbs/b18035723_0014.JP2",
                "@type": "ImageService2",
                profile: "http://iiif.io/api/image/2/level0.json",
                width: 732,
                height: 1024,
                sizes: [
                  {
                    width: 72,
                    height: 100,
                  },
                  {
                    width: 143,
                    height: 200,
                  },
                  {
                    width: 286,
                    height: 400,
                  },
                  {
                    width: 732,
                    height: 1024,
                  },
                ],
              },
            ],
          },
        ],
        seeAlso: [
          {
            id: "https://api.wellcomecollection.org/text/alto/b18035723/b18035723_0014.JP2",
            type: "Dataset",
            format: "text/xml",
            profile: "http://www.loc.gov/standards/alto/v3/alto.xsd",
            label: {
              none: ["METS-ALTO XML"],
            },
          },
        ],
        items: [
          {
            id: "https://iiif.wellcomecollection.org/presentation/b18035723/canvases/b18035723_0014.JP2/painting",
            type: "AnnotationPage",
            items: [
              {
                id: "https://iiif.wellcomecollection.org/presentation/b18035723/canvases/b18035723_0014.JP2/painting/anno",
                type: "Annotation",
                motivation: ["painting"],
                target: "https://digirati-co-uk.github.io/wunder/canvases/12",
                body: [
                  {
                    id: "https://iiif.wellcomecollection.org/image/b18035723_0014.JP2/full/732,1024/0/default.jpg",
                    type: "Image",
                    format: "image/jpeg",
                    height: 1024,
                    width: 732,
                    service: [
                      {
                        "@id":
                          "https://iiif.wellcomecollection.org/image/b18035723_0014.JP2",
                        "@type": "ImageService2",
                        profile: "http://iiif.io/api/image/2/level1.json",
                        width: 2411,
                        height: 3372,
                      },
                    ],
                  },
                ],
              },
            ],
          },
        ],
        annotations: [
          {
            id: "https://digirati-co-uk.github.io/wunder/annos/12.json",
            type: "AnnotationPage",
            label: {
              en: ["Text of page 11"],
            },
            items: [],
          },
        ],
      },
      {
        id: "https://digirati-co-uk.github.io/wunder/canvases/13",
        type: "Canvas",
        height: 3372,
        width: 2411,
        label: {
          none: ["12"],
        },
        thumbnail: [
          {
            id: "https://iiif.wellcomecollection.org/thumbs/b18035723_0015.JP2/full/72,100/0/default.jpg",
            type: "Image",
            height: 100,
            width: 72,
            service: [
              {
                "@id":
                  "https://iiif.wellcomecollection.org/thumbs/b18035723_0015.JP2",
                "@type": "ImageService2",
                profile: "http://iiif.io/api/image/2/level0.json",
                width: 732,
                height: 1024,
                sizes: [
                  {
                    width: 72,
                    height: 100,
                  },
                  {
                    width: 143,
                    height: 200,
                  },
                  {
                    width: 286,
                    height: 400,
                  },
                  {
                    width: 732,
                    height: 1024,
                  },
                ],
              },
            ],
          },
        ],
        seeAlso: [
          {
            id: "https://api.wellcomecollection.org/text/alto/b18035723/b18035723_0015.JP2",
            type: "Dataset",
            format: "text/xml",
            profile: "http://www.loc.gov/standards/alto/v3/alto.xsd",
            label: {
              none: ["METS-ALTO XML"],
            },
          },
        ],
        items: [
          {
            id: "https://iiif.wellcomecollection.org/presentation/b18035723/canvases/b18035723_0015.JP2/painting",
            type: "AnnotationPage",
            items: [
              {
                id: "https://iiif.wellcomecollection.org/presentation/b18035723/canvases/b18035723_0015.JP2/painting/anno",
                type: "Annotation",
                motivation: ["painting"],
                target: "https://digirati-co-uk.github.io/wunder/canvases/13",
                body: [
                  {
                    id: "https://iiif.wellcomecollection.org/image/b18035723_0015.JP2/full/732,1024/0/default.jpg",
                    type: "Image",
                    format: "image/jpeg",
                    height: 1024,
                    width: 732,
                    service: [
                      {
                        "@id":
                          "https://iiif.wellcomecollection.org/image/b18035723_0015.JP2",
                        "@type": "ImageService2",
                        profile: "http://iiif.io/api/image/2/level1.json",
                        width: 2411,
                        height: 3372,
                      },
                    ],
                  },
                ],
              },
            ],
          },
        ],
        annotations: [
          {
            id: "https://digirati-co-uk.github.io/wunder/annos/13.json",
            type: "AnnotationPage",
            label: {
              en: ["Text of page 12"],
            },
            items: [],
          },
        ],
      },
      {
        id: "https://digirati-co-uk.github.io/wunder/canvases/14",
        type: "Canvas",
        height: 3372,
        width: 2411,
        label: {
          none: ["13"],
        },
        thumbnail: [
          {
            id: "https://iiif.wellcomecollection.org/thumbs/b18035723_0016.JP2/full/72,100/0/default.jpg",
            type: "Image",
            height: 100,
            width: 72,
            service: [
              {
                "@id":
                  "https://iiif.wellcomecollection.org/thumbs/b18035723_0016.JP2",
                "@type": "ImageService2",
                profile: "http://iiif.io/api/image/2/level0.json",
                width: 732,
                height: 1024,
                sizes: [
                  {
                    width: 72,
                    height: 100,
                  },
                  {
                    width: 143,
                    height: 200,
                  },
                  {
                    width: 286,
                    height: 400,
                  },
                  {
                    width: 732,
                    height: 1024,
                  },
                ],
              },
            ],
          },
        ],
        seeAlso: [
          {
            id: "https://api.wellcomecollection.org/text/alto/b18035723/b18035723_0016.JP2",
            type: "Dataset",
            format: "text/xml",
            profile: "http://www.loc.gov/standards/alto/v3/alto.xsd",
            label: {
              none: ["METS-ALTO XML"],
            },
          },
        ],
        items: [
          {
            id: "https://iiif.wellcomecollection.org/presentation/b18035723/canvases/b18035723_0016.JP2/painting",
            type: "AnnotationPage",
            items: [
              {
                id: "https://iiif.wellcomecollection.org/presentation/b18035723/canvases/b18035723_0016.JP2/painting/anno",
                type: "Annotation",
                motivation: ["painting"],
                target: "https://digirati-co-uk.github.io/wunder/canvases/14",
                body: [
                  {
                    id: "https://iiif.wellcomecollection.org/image/b18035723_0016.JP2/full/732,1024/0/default.jpg",
                    type: "Image",
                    format: "image/jpeg",
                    height: 1024,
                    width: 732,
                    service: [
                      {
                        "@id":
                          "https://iiif.wellcomecollection.org/image/b18035723_0016.JP2",
                        "@type": "ImageService2",
                        profile: "http://iiif.io/api/image/2/level1.json",
                        width: 2411,
                        height: 3372,
                      },
                    ],
                  },
                ],
              },
            ],
          },
        ],
        annotations: [
          {
            id: "https://digirati-co-uk.github.io/wunder/annos/14.json",
            type: "AnnotationPage",
            label: {
              en: ["Text of page 13"],
            },
            items: [],
          },
        ],
      },
      {
        id: "https://digirati-co-uk.github.io/wunder/canvases/15",
        type: "Canvas",
        height: 3372,
        width: 2411,
        label: {
          none: ["14"],
        },
        thumbnail: [
          {
            id: "https://iiif.wellcomecollection.org/thumbs/b18035723_0017.JP2/full/72,100/0/default.jpg",
            type: "Image",
            height: 100,
            width: 72,
            service: [
              {
                "@id":
                  "https://iiif.wellcomecollection.org/thumbs/b18035723_0017.JP2",
                "@type": "ImageService2",
                profile: "http://iiif.io/api/image/2/level0.json",
                width: 732,
                height: 1024,
                sizes: [
                  {
                    width: 72,
                    height: 100,
                  },
                  {
                    width: 143,
                    height: 200,
                  },
                  {
                    width: 286,
                    height: 400,
                  },
                  {
                    width: 732,
                    height: 1024,
                  },
                ],
              },
            ],
          },
        ],
        seeAlso: [
          {
            id: "https://api.wellcomecollection.org/text/alto/b18035723/b18035723_0017.JP2",
            type: "Dataset",
            format: "text/xml",
            profile: "http://www.loc.gov/standards/alto/v3/alto.xsd",
            label: {
              none: ["METS-ALTO XML"],
            },
          },
        ],
        items: [
          {
            id: "https://iiif.wellcomecollection.org/presentation/b18035723/canvases/b18035723_0017.JP2/painting",
            type: "AnnotationPage",
            items: [
              {
                id: "https://iiif.wellcomecollection.org/presentation/b18035723/canvases/b18035723_0017.JP2/painting/anno",
                type: "Annotation",
                motivation: ["painting"],
                target: "https://digirati-co-uk.github.io/wunder/canvases/15",
                body: [
                  {
                    id: "https://iiif.wellcomecollection.org/image/b18035723_0017.JP2/full/732,1024/0/default.jpg",
                    type: "Image",
                    format: "image/jpeg",
                    height: 1024,
                    width: 732,
                    service: [
                      {
                        "@id":
                          "https://iiif.wellcomecollection.org/image/b18035723_0017.JP2",
                        "@type": "ImageService2",
                        profile: "http://iiif.io/api/image/2/level1.json",
                        width: 2411,
                        height: 3372,
                      },
                    ],
                  },
                ],
              },
            ],
          },
        ],
        annotations: [
          {
            id: "https://digirati-co-uk.github.io/wunder/annos/15.json",
            type: "AnnotationPage",
            label: {
              en: ["Text of page 14"],
            },
            items: [],
          },
        ],
      },
      {
        id: "https://digirati-co-uk.github.io/wunder/canvases/16",
        type: "Canvas",
        height: 3372,
        width: 2411,
        label: {
          none: ["15"],
        },
        thumbnail: [
          {
            id: "https://iiif.wellcomecollection.org/thumbs/b18035723_0018.JP2/full/72,100/0/default.jpg",
            type: "Image",
            height: 100,
            width: 72,
            service: [
              {
                "@id":
                  "https://iiif.wellcomecollection.org/thumbs/b18035723_0018.JP2",
                "@type": "ImageService2",
                profile: "http://iiif.io/api/image/2/level0.json",
                width: 732,
                height: 1024,
                sizes: [
                  {
                    width: 72,
                    height: 100,
                  },
                  {
                    width: 143,
                    height: 200,
                  },
                  {
                    width: 286,
                    height: 400,
                  },
                  {
                    width: 732,
                    height: 1024,
                  },
                ],
              },
            ],
          },
        ],
        seeAlso: [
          {
            id: "https://api.wellcomecollection.org/text/alto/b18035723/b18035723_0018.JP2",
            type: "Dataset",
            format: "text/xml",
            profile: "http://www.loc.gov/standards/alto/v3/alto.xsd",
            label: {
              none: ["METS-ALTO XML"],
            },
          },
        ],
        items: [
          {
            id: "https://iiif.wellcomecollection.org/presentation/b18035723/canvases/b18035723_0018.JP2/painting",
            type: "AnnotationPage",
            items: [
              {
                id: "https://iiif.wellcomecollection.org/presentation/b18035723/canvases/b18035723_0018.JP2/painting/anno",
                type: "Annotation",
                motivation: ["painting"],
                target: "https://digirati-co-uk.github.io/wunder/canvases/16",
                body: [
                  {
                    id: "https://iiif.wellcomecollection.org/image/b18035723_0018.JP2/full/732,1024/0/default.jpg",
                    type: "Image",
                    format: "image/jpeg",
                    height: 1024,
                    width: 732,
                    service: [
                      {
                        "@id":
                          "https://iiif.wellcomecollection.org/image/b18035723_0018.JP2",
                        "@type": "ImageService2",
                        profile: "http://iiif.io/api/image/2/level1.json",
                        width: 2411,
                        height: 3372,
                      },
                    ],
                  },
                ],
              },
            ],
          },
        ],
        annotations: [
          {
            id: "https://digirati-co-uk.github.io/wunder/annos/16.json",
            type: "AnnotationPage",
            label: {
              en: ["Text of page 15"],
            },
            items: [],
          },
        ],
      },
      {
        id: "https://digirati-co-uk.github.io/wunder/canvases/17",
        type: "Canvas",
        height: 3372,
        width: 2411,
        label: {
          none: ["16"],
        },
        thumbnail: [
          {
            id: "https://iiif.wellcomecollection.org/thumbs/b18035723_0019.JP2/full/72,100/0/default.jpg",
            type: "Image",
            height: 100,
            width: 72,
            service: [
              {
                "@id":
                  "https://iiif.wellcomecollection.org/thumbs/b18035723_0019.JP2",
                "@type": "ImageService2",
                profile: "http://iiif.io/api/image/2/level0.json",
                width: 732,
                height: 1024,
                sizes: [
                  {
                    width: 72,
                    height: 100,
                  },
                  {
                    width: 143,
                    height: 200,
                  },
                  {
                    width: 286,
                    height: 400,
                  },
                  {
                    width: 732,
                    height: 1024,
                  },
                ],
              },
            ],
          },
        ],
        seeAlso: [
          {
            id: "https://api.wellcomecollection.org/text/alto/b18035723/b18035723_0019.JP2",
            type: "Dataset",
            format: "text/xml",
            profile: "http://www.loc.gov/standards/alto/v3/alto.xsd",
            label: {
              none: ["METS-ALTO XML"],
            },
          },
        ],
        items: [
          {
            id: "https://iiif.wellcomecollection.org/presentation/b18035723/canvases/b18035723_0019.JP2/painting",
            type: "AnnotationPage",
            items: [
              {
                id: "https://iiif.wellcomecollection.org/presentation/b18035723/canvases/b18035723_0019.JP2/painting/anno",
                type: "Annotation",
                motivation: ["painting"],
                target: "https://digirati-co-uk.github.io/wunder/canvases/17",
                body: [
                  {
                    id: "https://iiif.wellcomecollection.org/image/b18035723_0019.JP2/full/732,1024/0/default.jpg",
                    type: "Image",
                    format: "image/jpeg",
                    height: 1024,
                    width: 732,
                    service: [
                      {
                        "@id":
                          "https://iiif.wellcomecollection.org/image/b18035723_0019.JP2",
                        "@type": "ImageService2",
                        profile: "http://iiif.io/api/image/2/level1.json",
                        width: 2411,
                        height: 3372,
                      },
                    ],
                  },
                ],
              },
            ],
          },
        ],
        annotations: [
          {
            id: "https://digirati-co-uk.github.io/wunder/annos/17.json",
            type: "AnnotationPage",
            label: {
              en: ["Text of page 16"],
            },
            items: [],
          },
        ],
      },
      {
        id: "https://digirati-co-uk.github.io/wunder/canvases/18",
        type: "Canvas",
        height: 3372,
        width: 2411,
        label: {
          none: ["17"],
        },
        thumbnail: [
          {
            id: "https://iiif.wellcomecollection.org/thumbs/b18035723_0020.JP2/full/72,100/0/default.jpg",
            type: "Image",
            height: 100,
            width: 72,
            service: [
              {
                "@id":
                  "https://iiif.wellcomecollection.org/thumbs/b18035723_0020.JP2",
                "@type": "ImageService2",
                profile: "http://iiif.io/api/image/2/level0.json",
                width: 732,
                height: 1024,
                sizes: [
                  {
                    width: 72,
                    height: 100,
                  },
                  {
                    width: 143,
                    height: 200,
                  },
                  {
                    width: 286,
                    height: 400,
                  },
                  {
                    width: 732,
                    height: 1024,
                  },
                ],
              },
            ],
          },
        ],
        seeAlso: [
          {
            id: "https://api.wellcomecollection.org/text/alto/b18035723/b18035723_0020.JP2",
            type: "Dataset",
            format: "text/xml",
            profile: "http://www.loc.gov/standards/alto/v3/alto.xsd",
            label: {
              none: ["METS-ALTO XML"],
            },
          },
        ],
        items: [
          {
            id: "https://iiif.wellcomecollection.org/presentation/b18035723/canvases/b18035723_0020.JP2/painting",
            type: "AnnotationPage",
            items: [
              {
                id: "https://iiif.wellcomecollection.org/presentation/b18035723/canvases/b18035723_0020.JP2/painting/anno",
                type: "Annotation",
                motivation: ["painting"],
                target: "https://digirati-co-uk.github.io/wunder/canvases/18",
                body: [
                  {
                    id: "https://iiif.wellcomecollection.org/image/b18035723_0020.JP2/full/732,1024/0/default.jpg",
                    type: "Image",
                    format: "image/jpeg",
                    height: 1024,
                    width: 732,
                    service: [
                      {
                        "@id":
                          "https://iiif.wellcomecollection.org/image/b18035723_0020.JP2",
                        "@type": "ImageService2",
                        profile: "http://iiif.io/api/image/2/level1.json",
                        width: 2411,
                        height: 3372,
                      },
                    ],
                  },
                ],
              },
            ],
          },
        ],
        annotations: [
          {
            id: "https://digirati-co-uk.github.io/wunder/annos/18.json",
            type: "AnnotationPage",
            label: {
              en: ["Text of page 17"],
            },
            items: [],
          },
        ],
      },
      {
        id: "https://digirati-co-uk.github.io/wunder/canvases/19",
        type: "Canvas",
        height: 3372,
        width: 2411,
        label: {
          none: ["18"],
        },
        thumbnail: [
          {
            id: "https://iiif.wellcomecollection.org/thumbs/b18035723_0021.JP2/full/72,100/0/default.jpg",
            type: "Image",
            height: 100,
            width: 72,
            service: [
              {
                "@id":
                  "https://iiif.wellcomecollection.org/thumbs/b18035723_0021.JP2",
                "@type": "ImageService2",
                profile: "http://iiif.io/api/image/2/level0.json",
                width: 732,
                height: 1024,
                sizes: [
                  {
                    width: 72,
                    height: 100,
                  },
                  {
                    width: 143,
                    height: 200,
                  },
                  {
                    width: 286,
                    height: 400,
                  },
                  {
                    width: 732,
                    height: 1024,
                  },
                ],
              },
            ],
          },
        ],
        seeAlso: [
          {
            id: "https://api.wellcomecollection.org/text/alto/b18035723/b18035723_0021.JP2",
            type: "Dataset",
            format: "text/xml",
            profile: "http://www.loc.gov/standards/alto/v3/alto.xsd",
            label: {
              none: ["METS-ALTO XML"],
            },
          },
        ],
        items: [
          {
            id: "https://iiif.wellcomecollection.org/presentation/b18035723/canvases/b18035723_0021.JP2/painting",
            type: "AnnotationPage",
            items: [
              {
                id: "https://iiif.wellcomecollection.org/presentation/b18035723/canvases/b18035723_0021.JP2/painting/anno",
                type: "Annotation",
                motivation: ["painting"],
                target: "https://digirati-co-uk.github.io/wunder/canvases/19",
                body: [
                  {
                    id: "https://iiif.wellcomecollection.org/image/b18035723_0021.JP2/full/732,1024/0/default.jpg",
                    type: "Image",
                    format: "image/jpeg",
                    height: 1024,
                    width: 732,
                    service: [
                      {
                        "@id":
                          "https://iiif.wellcomecollection.org/image/b18035723_0021.JP2",
                        "@type": "ImageService2",
                        profile: "http://iiif.io/api/image/2/level1.json",
                        width: 2411,
                        height: 3372,
                      },
                    ],
                  },
                ],
              },
            ],
          },
        ],
        annotations: [
          {
            id: "https://digirati-co-uk.github.io/wunder/annos/19.json",
            type: "AnnotationPage",
            label: {
              en: ["Text of page 18"],
            },
            items: [],
          },
        ],
      },
      {
        id: "https://digirati-co-uk.github.io/wunder/canvases/20",
        type: "Canvas",
        height: 3372,
        width: 2411,
        label: {
          none: ["19"],
        },
        thumbnail: [
          {
            id: "https://iiif.wellcomecollection.org/thumbs/b18035723_0022.JP2/full/72,100/0/default.jpg",
            type: "Image",
            height: 100,
            width: 72,
            service: [
              {
                "@id":
                  "https://iiif.wellcomecollection.org/thumbs/b18035723_0022.JP2",
                "@type": "ImageService2",
                profile: "http://iiif.io/api/image/2/level0.json",
                width: 732,
                height: 1024,
                sizes: [
                  {
                    width: 72,
                    height: 100,
                  },
                  {
                    width: 143,
                    height: 200,
                  },
                  {
                    width: 286,
                    height: 400,
                  },
                  {
                    width: 732,
                    height: 1024,
                  },
                ],
              },
            ],
          },
        ],
        seeAlso: [
          {
            id: "https://api.wellcomecollection.org/text/alto/b18035723/b18035723_0022.JP2",
            type: "Dataset",
            format: "text/xml",
            profile: "http://www.loc.gov/standards/alto/v3/alto.xsd",
            label: {
              none: ["METS-ALTO XML"],
            },
          },
        ],
        items: [
          {
            id: "https://iiif.wellcomecollection.org/presentation/b18035723/canvases/b18035723_0022.JP2/painting",
            type: "AnnotationPage",
            items: [
              {
                id: "https://iiif.wellcomecollection.org/presentation/b18035723/canvases/b18035723_0022.JP2/painting/anno",
                type: "Annotation",
                motivation: ["painting"],
                target: "https://digirati-co-uk.github.io/wunder/canvases/20",
                body: [
                  {
                    id: "https://iiif.wellcomecollection.org/image/b18035723_0022.JP2/full/732,1024/0/default.jpg",
                    type: "Image",
                    format: "image/jpeg",
                    height: 1024,
                    width: 732,
                    service: [
                      {
                        "@id":
                          "https://iiif.wellcomecollection.org/image/b18035723_0022.JP2",
                        "@type": "ImageService2",
                        profile: "http://iiif.io/api/image/2/level1.json",
                        width: 2411,
                        height: 3372,
                      },
                    ],
                  },
                ],
              },
            ],
          },
        ],
        annotations: [
          {
            id: "https://digirati-co-uk.github.io/wunder/annos/20.json",
            type: "AnnotationPage",
            label: {
              en: ["Text of page 19"],
            },
            items: [],
          },
        ],
      },
      {
        id: "https://digirati-co-uk.github.io/wunder/canvases/21",
        type: "Canvas",
        height: 3372,
        width: 2411,
        label: {
          none: ["20"],
        },
        thumbnail: [
          {
            id: "https://iiif.wellcomecollection.org/thumbs/b18035723_0023.JP2/full/72,100/0/default.jpg",
            type: "Image",
            height: 100,
            width: 72,
            service: [
              {
                "@id":
                  "https://iiif.wellcomecollection.org/thumbs/b18035723_0023.JP2",
                "@type": "ImageService2",
                profile: "http://iiif.io/api/image/2/level0.json",
                width: 732,
                height: 1024,
                sizes: [
                  {
                    width: 72,
                    height: 100,
                  },
                  {
                    width: 143,
                    height: 200,
                  },
                  {
                    width: 286,
                    height: 400,
                  },
                  {
                    width: 732,
                    height: 1024,
                  },
                ],
              },
            ],
          },
        ],
        seeAlso: [
          {
            id: "https://api.wellcomecollection.org/text/alto/b18035723/b18035723_0023.JP2",
            type: "Dataset",
            format: "text/xml",
            profile: "http://www.loc.gov/standards/alto/v3/alto.xsd",
            label: {
              none: ["METS-ALTO XML"],
            },
          },
        ],
        items: [
          {
            id: "https://iiif.wellcomecollection.org/presentation/b18035723/canvases/b18035723_0023.JP2/painting",
            type: "AnnotationPage",
            items: [
              {
                id: "https://iiif.wellcomecollection.org/presentation/b18035723/canvases/b18035723_0023.JP2/painting/anno",
                type: "Annotation",
                motivation: ["painting"],
                target: "https://digirati-co-uk.github.io/wunder/canvases/21",
                body: [
                  {
                    id: "https://iiif.wellcomecollection.org/image/b18035723_0023.JP2/full/732,1024/0/default.jpg",
                    type: "Image",
                    format: "image/jpeg",
                    height: 1024,
                    width: 732,
                    service: [
                      {
                        "@id":
                          "https://iiif.wellcomecollection.org/image/b18035723_0023.JP2",
                        "@type": "ImageService2",
                        profile: "http://iiif.io/api/image/2/level1.json",
                        width: 2411,
                        height: 3372,
                      },
                    ],
                  },
                ],
              },
            ],
          },
        ],
        annotations: [
          {
            id: "https://digirati-co-uk.github.io/wunder/annos/21.json",
            type: "AnnotationPage",
            label: {
              en: ["Text of page 20"],
            },
            items: [],
          },
        ],
      },
      {
        id: "https://digirati-co-uk.github.io/wunder/canvases/22",
        type: "Canvas",
        height: 3372,
        width: 2411,
        label: {
          none: ["21"],
        },
        thumbnail: [
          {
            id: "https://iiif.wellcomecollection.org/thumbs/b18035723_0024.JP2/full/72,100/0/default.jpg",
            type: "Image",
            height: 100,
            width: 72,
            service: [
              {
                "@id":
                  "https://iiif.wellcomecollection.org/thumbs/b18035723_0024.JP2",
                "@type": "ImageService2",
                profile: "http://iiif.io/api/image/2/level0.json",
                width: 732,
                height: 1024,
                sizes: [
                  {
                    width: 72,
                    height: 100,
                  },
                  {
                    width: 143,
                    height: 200,
                  },
                  {
                    width: 286,
                    height: 400,
                  },
                  {
                    width: 732,
                    height: 1024,
                  },
                ],
              },
            ],
          },
        ],
        seeAlso: [
          {
            id: "https://api.wellcomecollection.org/text/alto/b18035723/b18035723_0024.JP2",
            type: "Dataset",
            format: "text/xml",
            profile: "http://www.loc.gov/standards/alto/v3/alto.xsd",
            label: {
              none: ["METS-ALTO XML"],
            },
          },
        ],
        items: [
          {
            id: "https://iiif.wellcomecollection.org/presentation/b18035723/canvases/b18035723_0024.JP2/painting",
            type: "AnnotationPage",
            items: [
              {
                id: "https://iiif.wellcomecollection.org/presentation/b18035723/canvases/b18035723_0024.JP2/painting/anno",
                type: "Annotation",
                motivation: ["painting"],
                target: "https://digirati-co-uk.github.io/wunder/canvases/22",
                body: [
                  {
                    id: "https://iiif.wellcomecollection.org/image/b18035723_0024.JP2/full/732,1024/0/default.jpg",
                    type: "Image",
                    format: "image/jpeg",
                    height: 1024,
                    width: 732,
                    service: [
                      {
                        "@id":
                          "https://iiif.wellcomecollection.org/image/b18035723_0024.JP2",
                        "@type": "ImageService2",
                        profile: "http://iiif.io/api/image/2/level1.json",
                        width: 2411,
                        height: 3372,
                      },
                    ],
                  },
                ],
              },
            ],
          },
        ],
        annotations: [
          {
            id: "https://digirati-co-uk.github.io/wunder/annos/22.json",
            type: "AnnotationPage",
            label: {
              en: ["Text of page 21"],
            },
            items: [],
          },
        ],
      },
      {
        id: "https://digirati-co-uk.github.io/wunder/canvases/23",
        type: "Canvas",
        height: 3372,
        width: 2411,
        label: {
          none: ["22"],
        },
        thumbnail: [
          {
            id: "https://iiif.wellcomecollection.org/thumbs/b18035723_0025.JP2/full/72,100/0/default.jpg",
            type: "Image",
            height: 100,
            width: 72,
            service: [
              {
                "@id":
                  "https://iiif.wellcomecollection.org/thumbs/b18035723_0025.JP2",
                "@type": "ImageService2",
                profile: "http://iiif.io/api/image/2/level0.json",
                width: 732,
                height: 1024,
                sizes: [
                  {
                    width: 72,
                    height: 100,
                  },
                  {
                    width: 143,
                    height: 200,
                  },
                  {
                    width: 286,
                    height: 400,
                  },
                  {
                    width: 732,
                    height: 1024,
                  },
                ],
              },
            ],
          },
        ],
        seeAlso: [
          {
            id: "https://api.wellcomecollection.org/text/alto/b18035723/b18035723_0025.JP2",
            type: "Dataset",
            format: "text/xml",
            profile: "http://www.loc.gov/standards/alto/v3/alto.xsd",
            label: {
              none: ["METS-ALTO XML"],
            },
          },
        ],
        items: [
          {
            id: "https://iiif.wellcomecollection.org/presentation/b18035723/canvases/b18035723_0025.JP2/painting",
            type: "AnnotationPage",
            items: [
              {
                id: "https://iiif.wellcomecollection.org/presentation/b18035723/canvases/b18035723_0025.JP2/painting/anno",
                type: "Annotation",
                motivation: ["painting"],
                target: "https://digirati-co-uk.github.io/wunder/canvases/23",
                body: [
                  {
                    id: "https://iiif.wellcomecollection.org/image/b18035723_0025.JP2/full/732,1024/0/default.jpg",
                    type: "Image",
                    format: "image/jpeg",
                    height: 1024,
                    width: 732,
                    service: [
                      {
                        "@id":
                          "https://iiif.wellcomecollection.org/image/b18035723_0025.JP2",
                        "@type": "ImageService2",
                        profile: "http://iiif.io/api/image/2/level1.json",
                        width: 2411,
                        height: 3372,
                      },
                    ],
                  },
                ],
              },
            ],
          },
        ],
        annotations: [
          {
            id: "https://digirati-co-uk.github.io/wunder/annos/23.json",
            type: "AnnotationPage",
            label: {
              en: ["Text of page 22"],
            },
            items: [],
          },
        ],
      },
      {
        id: "https://digirati-co-uk.github.io/wunder/canvases/24",
        type: "Canvas",
        height: 3372,
        width: 2411,
        label: {
          none: ["23"],
        },
        thumbnail: [
          {
            id: "https://iiif.wellcomecollection.org/thumbs/b18035723_0026.JP2/full/72,100/0/default.jpg",
            type: "Image",
            height: 100,
            width: 72,
            service: [
              {
                "@id":
                  "https://iiif.wellcomecollection.org/thumbs/b18035723_0026.JP2",
                "@type": "ImageService2",
                profile: "http://iiif.io/api/image/2/level0.json",
                width: 732,
                height: 1024,
                sizes: [
                  {
                    width: 72,
                    height: 100,
                  },
                  {
                    width: 143,
                    height: 200,
                  },
                  {
                    width: 286,
                    height: 400,
                  },
                  {
                    width: 732,
                    height: 1024,
                  },
                ],
              },
            ],
          },
        ],
        seeAlso: [
          {
            id: "https://api.wellcomecollection.org/text/alto/b18035723/b18035723_0026.JP2",
            type: "Dataset",
            format: "text/xml",
            profile: "http://www.loc.gov/standards/alto/v3/alto.xsd",
            label: {
              none: ["METS-ALTO XML"],
            },
          },
        ],
        items: [
          {
            id: "https://iiif.wellcomecollection.org/presentation/b18035723/canvases/b18035723_0026.JP2/painting",
            type: "AnnotationPage",
            items: [
              {
                id: "https://iiif.wellcomecollection.org/presentation/b18035723/canvases/b18035723_0026.JP2/painting/anno",
                type: "Annotation",
                motivation: ["painting"],
                target: "https://digirati-co-uk.github.io/wunder/canvases/24",
                body: [
                  {
                    id: "https://iiif.wellcomecollection.org/image/b18035723_0026.JP2/full/732,1024/0/default.jpg",
                    type: "Image",
                    format: "image/jpeg",
                    height: 1024,
                    width: 732,
                    service: [
                      {
                        "@id":
                          "https://iiif.wellcomecollection.org/image/b18035723_0026.JP2",
                        "@type": "ImageService2",
                        profile: "http://iiif.io/api/image/2/level1.json",
                        width: 2411,
                        height: 3372,
                      },
                    ],
                  },
                ],
              },
            ],
          },
        ],
        annotations: [
          {
            id: "https://digirati-co-uk.github.io/wunder/annos/24.json",
            type: "AnnotationPage",
            label: {
              en: ["Text of page 23"],
            },
            items: [],
          },
        ],
      },
      {
        id: "https://digirati-co-uk.github.io/wunder/canvases/25",
        type: "Canvas",
        height: 3372,
        width: 2411,
        label: {
          none: ["24"],
        },
        thumbnail: [
          {
            id: "https://iiif.wellcomecollection.org/thumbs/b18035723_0027.JP2/full/72,100/0/default.jpg",
            type: "Image",
            height: 100,
            width: 72,
            service: [
              {
                "@id":
                  "https://iiif.wellcomecollection.org/thumbs/b18035723_0027.JP2",
                "@type": "ImageService2",
                profile: "http://iiif.io/api/image/2/level0.json",
                width: 732,
                height: 1024,
                sizes: [
                  {
                    width: 72,
                    height: 100,
                  },
                  {
                    width: 143,
                    height: 200,
                  },
                  {
                    width: 286,
                    height: 400,
                  },
                  {
                    width: 732,
                    height: 1024,
                  },
                ],
              },
            ],
          },
        ],
        seeAlso: [
          {
            id: "https://api.wellcomecollection.org/text/alto/b18035723/b18035723_0027.JP2",
            type: "Dataset",
            format: "text/xml",
            profile: "http://www.loc.gov/standards/alto/v3/alto.xsd",
            label: {
              none: ["METS-ALTO XML"],
            },
          },
        ],
        items: [
          {
            id: "https://iiif.wellcomecollection.org/presentation/b18035723/canvases/b18035723_0027.JP2/painting",
            type: "AnnotationPage",
            items: [
              {
                id: "https://iiif.wellcomecollection.org/presentation/b18035723/canvases/b18035723_0027.JP2/painting/anno",
                type: "Annotation",
                motivation: ["painting"],
                target: "https://digirati-co-uk.github.io/wunder/canvases/25",
                body: [
                  {
                    id: "https://iiif.wellcomecollection.org/image/b18035723_0027.JP2/full/732,1024/0/default.jpg",
                    type: "Image",
                    format: "image/jpeg",
                    height: 1024,
                    width: 732,
                    service: [
                      {
                        "@id":
                          "https://iiif.wellcomecollection.org/image/b18035723_0027.JP2",
                        "@type": "ImageService2",
                        profile: "http://iiif.io/api/image/2/level1.json",
                        width: 2411,
                        height: 3372,
                      },
                    ],
                  },
                ],
              },
            ],
          },
        ],
        annotations: [
          {
            id: "https://digirati-co-uk.github.io/wunder/annos/25.json",
            type: "AnnotationPage",
            label: {
              en: ["Text of page 24"],
            },
            items: [],
          },
        ],
      },
      {
        id: "https://digirati-co-uk.github.io/wunder/canvases/26",
        type: "Canvas",
        height: 3372,
        width: 2411,
        label: {
          none: ["25"],
        },
        thumbnail: [
          {
            id: "https://iiif.wellcomecollection.org/thumbs/b18035723_0028.JP2/full/72,100/0/default.jpg",
            type: "Image",
            height: 100,
            width: 72,
            service: [
              {
                "@id":
                  "https://iiif.wellcomecollection.org/thumbs/b18035723_0028.JP2",
                "@type": "ImageService2",
                profile: "http://iiif.io/api/image/2/level0.json",
                width: 732,
                height: 1024,
                sizes: [
                  {
                    width: 72,
                    height: 100,
                  },
                  {
                    width: 143,
                    height: 200,
                  },
                  {
                    width: 286,
                    height: 400,
                  },
                  {
                    width: 732,
                    height: 1024,
                  },
                ],
              },
            ],
          },
        ],
        seeAlso: [
          {
            id: "https://api.wellcomecollection.org/text/alto/b18035723/b18035723_0028.JP2",
            type: "Dataset",
            format: "text/xml",
            profile: "http://www.loc.gov/standards/alto/v3/alto.xsd",
            label: {
              none: ["METS-ALTO XML"],
            },
          },
        ],
        items: [
          {
            id: "https://iiif.wellcomecollection.org/presentation/b18035723/canvases/b18035723_0028.JP2/painting",
            type: "AnnotationPage",
            items: [
              {
                id: "https://iiif.wellcomecollection.org/presentation/b18035723/canvases/b18035723_0028.JP2/painting/anno",
                type: "Annotation",
                motivation: ["painting"],
                target: "https://digirati-co-uk.github.io/wunder/canvases/26",
                body: [
                  {
                    id: "https://iiif.wellcomecollection.org/image/b18035723_0028.JP2/full/732,1024/0/default.jpg",
                    type: "Image",
                    format: "image/jpeg",
                    height: 1024,
                    width: 732,
                    service: [
                      {
                        "@id":
                          "https://iiif.wellcomecollection.org/image/b18035723_0028.JP2",
                        "@type": "ImageService2",
                        profile: "http://iiif.io/api/image/2/level1.json",
                        width: 2411,
                        height: 3372,
                      },
                    ],
                  },
                ],
              },
            ],
          },
        ],
        annotations: [
          {
            id: "https://digirati-co-uk.github.io/wunder/annos/26.json",
            type: "AnnotationPage",
            label: {
              en: ["Text of page 25"],
            },
            items: [],
          },
        ],
      },
      {
        id: "https://digirati-co-uk.github.io/wunder/canvases/27",
        type: "Canvas",
        height: 3372,
        width: 2411,
        label: {
          none: ["26"],
        },
        thumbnail: [
          {
            id: "https://iiif.wellcomecollection.org/thumbs/b18035723_0029.JP2/full/72,100/0/default.jpg",
            type: "Image",
            height: 100,
            width: 72,
            service: [
              {
                "@id":
                  "https://iiif.wellcomecollection.org/thumbs/b18035723_0029.JP2",
                "@type": "ImageService2",
                profile: "http://iiif.io/api/image/2/level0.json",
                width: 732,
                height: 1024,
                sizes: [
                  {
                    width: 72,
                    height: 100,
                  },
                  {
                    width: 143,
                    height: 200,
                  },
                  {
                    width: 286,
                    height: 400,
                  },
                  {
                    width: 732,
                    height: 1024,
                  },
                ],
              },
            ],
          },
        ],
        seeAlso: [
          {
            id: "https://api.wellcomecollection.org/text/alto/b18035723/b18035723_0029.JP2",
            type: "Dataset",
            format: "text/xml",
            profile: "http://www.loc.gov/standards/alto/v3/alto.xsd",
            label: {
              none: ["METS-ALTO XML"],
            },
          },
        ],
        items: [
          {
            id: "https://iiif.wellcomecollection.org/presentation/b18035723/canvases/b18035723_0029.JP2/painting",
            type: "AnnotationPage",
            items: [
              {
                id: "https://iiif.wellcomecollection.org/presentation/b18035723/canvases/b18035723_0029.JP2/painting/anno",
                type: "Annotation",
                motivation: ["painting"],
                target: "https://digirati-co-uk.github.io/wunder/canvases/27",
                body: [
                  {
                    id: "https://iiif.wellcomecollection.org/image/b18035723_0029.JP2/full/732,1024/0/default.jpg",
                    type: "Image",
                    format: "image/jpeg",
                    height: 1024,
                    width: 732,
                    service: [
                      {
                        "@id":
                          "https://iiif.wellcomecollection.org/image/b18035723_0029.JP2",
                        "@type": "ImageService2",
                        profile: "http://iiif.io/api/image/2/level1.json",
                        width: 2411,
                        height: 3372,
                      },
                    ],
                  },
                ],
              },
            ],
          },
        ],
        annotations: [
          {
            id: "https://digirati-co-uk.github.io/wunder/annos/27.json",
            type: "AnnotationPage",
            label: {
              en: ["Text of page 26"],
            },
            items: [],
          },
        ],
      },
      {
        id: "https://digirati-co-uk.github.io/wunder/canvases/28",
        type: "Canvas",
        height: 3372,
        width: 2411,
        label: {
          none: ["27"],
        },
        thumbnail: [
          {
            id: "https://iiif.wellcomecollection.org/thumbs/b18035723_0030.JP2/full/72,100/0/default.jpg",
            type: "Image",
            height: 100,
            width: 72,
            service: [
              {
                "@id":
                  "https://iiif.wellcomecollection.org/thumbs/b18035723_0030.JP2",
                "@type": "ImageService2",
                profile: "http://iiif.io/api/image/2/level0.json",
                width: 732,
                height: 1024,
                sizes: [
                  {
                    width: 72,
                    height: 100,
                  },
                  {
                    width: 143,
                    height: 200,
                  },
                  {
                    width: 286,
                    height: 400,
                  },
                  {
                    width: 732,
                    height: 1024,
                  },
                ],
              },
            ],
          },
        ],
        seeAlso: [
          {
            id: "https://api.wellcomecollection.org/text/alto/b18035723/b18035723_0030.JP2",
            type: "Dataset",
            format: "text/xml",
            profile: "http://www.loc.gov/standards/alto/v3/alto.xsd",
            label: {
              none: ["METS-ALTO XML"],
            },
          },
        ],
        items: [
          {
            id: "https://iiif.wellcomecollection.org/presentation/b18035723/canvases/b18035723_0030.JP2/painting",
            type: "AnnotationPage",
            items: [
              {
                id: "https://iiif.wellcomecollection.org/presentation/b18035723/canvases/b18035723_0030.JP2/painting/anno",
                type: "Annotation",
                motivation: ["painting"],
                target: "https://digirati-co-uk.github.io/wunder/canvases/28",
                body: [
                  {
                    id: "https://iiif.wellcomecollection.org/image/b18035723_0030.JP2/full/732,1024/0/default.jpg",
                    type: "Image",
                    format: "image/jpeg",
                    height: 1024,
                    width: 732,
                    service: [
                      {
                        "@id":
                          "https://iiif.wellcomecollection.org/image/b18035723_0030.JP2",
                        "@type": "ImageService2",
                        profile: "http://iiif.io/api/image/2/level1.json",
                        width: 2411,
                        height: 3372,
                      },
                    ],
                  },
                ],
              },
            ],
          },
        ],
        annotations: [
          {
            id: "https://digirati-co-uk.github.io/wunder/annos/28.json",
            type: "AnnotationPage",
            label: {
              en: ["Text of page 27"],
            },
            items: [],
          },
        ],
      },
      {
        id: "https://digirati-co-uk.github.io/wunder/canvases/29",
        type: "Canvas",
        height: 3372,
        width: 2411,
        label: {
          none: ["28"],
        },
        thumbnail: [
          {
            id: "https://iiif.wellcomecollection.org/thumbs/b18035723_0031.JP2/full/72,100/0/default.jpg",
            type: "Image",
            height: 100,
            width: 72,
            service: [
              {
                "@id":
                  "https://iiif.wellcomecollection.org/thumbs/b18035723_0031.JP2",
                "@type": "ImageService2",
                profile: "http://iiif.io/api/image/2/level0.json",
                width: 732,
                height: 1024,
                sizes: [
                  {
                    width: 72,
                    height: 100,
                  },
                  {
                    width: 143,
                    height: 200,
                  },
                  {
                    width: 286,
                    height: 400,
                  },
                  {
                    width: 732,
                    height: 1024,
                  },
                ],
              },
            ],
          },
        ],
        seeAlso: [
          {
            id: "https://api.wellcomecollection.org/text/alto/b18035723/b18035723_0031.JP2",
            type: "Dataset",
            format: "text/xml",
            profile: "http://www.loc.gov/standards/alto/v3/alto.xsd",
            label: {
              none: ["METS-ALTO XML"],
            },
          },
        ],
        items: [
          {
            id: "https://iiif.wellcomecollection.org/presentation/b18035723/canvases/b18035723_0031.JP2/painting",
            type: "AnnotationPage",
            items: [
              {
                id: "https://iiif.wellcomecollection.org/presentation/b18035723/canvases/b18035723_0031.JP2/painting/anno",
                type: "Annotation",
                motivation: ["painting"],
                target: "https://digirati-co-uk.github.io/wunder/canvases/29",
                body: [
                  {
                    id: "https://iiif.wellcomecollection.org/image/b18035723_0031.JP2/full/732,1024/0/default.jpg",
                    type: "Image",
                    format: "image/jpeg",
                    height: 1024,
                    width: 732,
                    service: [
                      {
                        "@id":
                          "https://iiif.wellcomecollection.org/image/b18035723_0031.JP2",
                        "@type": "ImageService2",
                        profile: "http://iiif.io/api/image/2/level1.json",
                        width: 2411,
                        height: 3372,
                      },
                    ],
                  },
                ],
              },
            ],
          },
        ],
        annotations: [
          {
            id: "https://digirati-co-uk.github.io/wunder/annos/29.json",
            type: "AnnotationPage",
            label: {
              en: ["Text of page 28"],
            },
            items: [],
          },
        ],
      },
      {
        id: "https://digirati-co-uk.github.io/wunder/canvases/30",
        type: "Canvas",
        height: 3372,
        width: 2411,
        label: {
          none: ["29"],
        },
        thumbnail: [
          {
            id: "https://iiif.wellcomecollection.org/thumbs/b18035723_0032.JP2/full/72,100/0/default.jpg",
            type: "Image",
            height: 100,
            width: 72,
            service: [
              {
                "@id":
                  "https://iiif.wellcomecollection.org/thumbs/b18035723_0032.JP2",
                "@type": "ImageService2",
                profile: "http://iiif.io/api/image/2/level0.json",
                width: 732,
                height: 1024,
                sizes: [
                  {
                    width: 72,
                    height: 100,
                  },
                  {
                    width: 143,
                    height: 200,
                  },
                  {
                    width: 286,
                    height: 400,
                  },
                  {
                    width: 732,
                    height: 1024,
                  },
                ],
              },
            ],
          },
        ],
        seeAlso: [
          {
            id: "https://api.wellcomecollection.org/text/alto/b18035723/b18035723_0032.JP2",
            type: "Dataset",
            format: "text/xml",
            profile: "http://www.loc.gov/standards/alto/v3/alto.xsd",
            label: {
              none: ["METS-ALTO XML"],
            },
          },
        ],
        items: [
          {
            id: "https://iiif.wellcomecollection.org/presentation/b18035723/canvases/b18035723_0032.JP2/painting",
            type: "AnnotationPage",
            items: [
              {
                id: "https://iiif.wellcomecollection.org/presentation/b18035723/canvases/b18035723_0032.JP2/painting/anno",
                type: "Annotation",
                motivation: ["painting"],
                target: "https://digirati-co-uk.github.io/wunder/canvases/30",
                body: [
                  {
                    id: "https://iiif.wellcomecollection.org/image/b18035723_0032.JP2/full/732,1024/0/default.jpg",
                    type: "Image",
                    format: "image/jpeg",
                    height: 1024,
                    width: 732,
                    service: [
                      {
                        "@id":
                          "https://iiif.wellcomecollection.org/image/b18035723_0032.JP2",
                        "@type": "ImageService2",
                        profile: "http://iiif.io/api/image/2/level1.json",
                        width: 2411,
                        height: 3372,
                      },
                    ],
                  },
                ],
              },
            ],
          },
        ],
        annotations: [
          {
            id: "https://digirati-co-uk.github.io/wunder/annos/30.json",
            type: "AnnotationPage",
            label: {
              en: ["Text of page 29"],
            },
            items: [],
          },
        ],
      },
      {
        id: "https://digirati-co-uk.github.io/wunder/canvases/31",
        type: "Canvas",
        height: 3372,
        width: 2411,
        label: {
          none: ["30"],
        },
        thumbnail: [
          {
            id: "https://iiif.wellcomecollection.org/thumbs/b18035723_0033.JP2/full/72,100/0/default.jpg",
            type: "Image",
            height: 100,
            width: 72,
            service: [
              {
                "@id":
                  "https://iiif.wellcomecollection.org/thumbs/b18035723_0033.JP2",
                "@type": "ImageService2",
                profile: "http://iiif.io/api/image/2/level0.json",
                width: 732,
                height: 1024,
                sizes: [
                  {
                    width: 72,
                    height: 100,
                  },
                  {
                    width: 143,
                    height: 200,
                  },
                  {
                    width: 286,
                    height: 400,
                  },
                  {
                    width: 732,
                    height: 1024,
                  },
                ],
              },
            ],
          },
        ],
        seeAlso: [
          {
            id: "https://api.wellcomecollection.org/text/alto/b18035723/b18035723_0033.JP2",
            type: "Dataset",
            format: "text/xml",
            profile: "http://www.loc.gov/standards/alto/v3/alto.xsd",
            label: {
              none: ["METS-ALTO XML"],
            },
          },
        ],
        items: [
          {
            id: "https://iiif.wellcomecollection.org/presentation/b18035723/canvases/b18035723_0033.JP2/painting",
            type: "AnnotationPage",
            items: [
              {
                id: "https://iiif.wellcomecollection.org/presentation/b18035723/canvases/b18035723_0033.JP2/painting/anno",
                type: "Annotation",
                motivation: ["painting"],
                target: "https://digirati-co-uk.github.io/wunder/canvases/31",
                body: [
                  {
                    id: "https://iiif.wellcomecollection.org/image/b18035723_0033.JP2/full/732,1024/0/default.jpg",
                    type: "Image",
                    format: "image/jpeg",
                    height: 1024,
                    width: 732,
                    service: [
                      {
                        "@id":
                          "https://iiif.wellcomecollection.org/image/b18035723_0033.JP2",
                        "@type": "ImageService2",
                        profile: "http://iiif.io/api/image/2/level1.json",
                        width: 2411,
                        height: 3372,
                      },
                    ],
                  },
                ],
              },
            ],
          },
        ],
        annotations: [
          {
            id: "https://digirati-co-uk.github.io/wunder/annos/31.json",
            type: "AnnotationPage",
            label: {
              en: ["Text of page 30"],
            },
            items: [],
          },
        ],
      },
      {
        id: "https://digirati-co-uk.github.io/wunder/canvases/32",
        type: "Canvas",
        height: 3372,
        width: 2411,
        label: {
          none: ["31"],
        },
        thumbnail: [
          {
            id: "https://iiif.wellcomecollection.org/thumbs/b18035723_0034.JP2/full/72,100/0/default.jpg",
            type: "Image",
            height: 100,
            width: 72,
            service: [
              {
                "@id":
                  "https://iiif.wellcomecollection.org/thumbs/b18035723_0034.JP2",
                "@type": "ImageService2",
                profile: "http://iiif.io/api/image/2/level0.json",
                width: 732,
                height: 1024,
                sizes: [
                  {
                    width: 72,
                    height: 100,
                  },
                  {
                    width: 143,
                    height: 200,
                  },
                  {
                    width: 286,
                    height: 400,
                  },
                  {
                    width: 732,
                    height: 1024,
                  },
                ],
              },
            ],
          },
        ],
        seeAlso: [
          {
            id: "https://api.wellcomecollection.org/text/alto/b18035723/b18035723_0034.JP2",
            type: "Dataset",
            format: "text/xml",
            profile: "http://www.loc.gov/standards/alto/v3/alto.xsd",
            label: {
              none: ["METS-ALTO XML"],
            },
          },
        ],
        items: [
          {
            id: "https://iiif.wellcomecollection.org/presentation/b18035723/canvases/b18035723_0034.JP2/painting",
            type: "AnnotationPage",
            items: [
              {
                id: "https://iiif.wellcomecollection.org/presentation/b18035723/canvases/b18035723_0034.JP2/painting/anno",
                type: "Annotation",
                motivation: ["painting"],
                target: "https://digirati-co-uk.github.io/wunder/canvases/32",
                body: [
                  {
                    id: "https://iiif.wellcomecollection.org/image/b18035723_0034.JP2/full/732,1024/0/default.jpg",
                    type: "Image",
                    format: "image/jpeg",
                    height: 1024,
                    width: 732,
                    service: [
                      {
                        "@id":
                          "https://iiif.wellcomecollection.org/image/b18035723_0034.JP2",
                        "@type": "ImageService2",
                        profile: "http://iiif.io/api/image/2/level1.json",
                        width: 2411,
                        height: 3372,
                      },
                    ],
                  },
                ],
              },
            ],
          },
        ],
        annotations: [
          {
            id: "https://digirati-co-uk.github.io/wunder/annos/32.json",
            type: "AnnotationPage",
            label: {
              en: ["Text of page 31"],
            },
            items: [],
          },
        ],
      },
      {
        id: "https://digirati-co-uk.github.io/wunder/canvases/33",
        type: "Canvas",
        height: 3372,
        width: 2411,
        label: {
          none: ["-"],
        },
        thumbnail: [
          {
            id: "https://iiif.wellcomecollection.org/thumbs/b18035723_0035.JP2/full/72,100/0/default.jpg",
            type: "Image",
            height: 100,
            width: 72,
            service: [
              {
                "@id":
                  "https://iiif.wellcomecollection.org/thumbs/b18035723_0035.JP2",
                "@type": "ImageService2",
                profile: "http://iiif.io/api/image/2/level0.json",
                width: 732,
                height: 1024,
                sizes: [
                  {
                    width: 72,
                    height: 100,
                  },
                  {
                    width: 143,
                    height: 200,
                  },
                  {
                    width: 286,
                    height: 400,
                  },
                  {
                    width: 732,
                    height: 1024,
                  },
                ],
              },
            ],
          },
        ],
        seeAlso: [
          {
            id: "https://api.wellcomecollection.org/text/alto/b18035723/b18035723_0035.JP2",
            type: "Dataset",
            format: "text/xml",
            profile: "http://www.loc.gov/standards/alto/v3/alto.xsd",
            label: {
              none: ["METS-ALTO XML"],
            },
          },
        ],
        items: [
          {
            id: "https://iiif.wellcomecollection.org/presentation/b18035723/canvases/b18035723_0035.JP2/painting",
            type: "AnnotationPage",
            items: [
              {
                id: "https://iiif.wellcomecollection.org/presentation/b18035723/canvases/b18035723_0035.JP2/painting/anno",
                type: "Annotation",
                motivation: ["painting"],
                target: "https://digirati-co-uk.github.io/wunder/canvases/33",
                body: [
                  {
                    id: "https://iiif.wellcomecollection.org/image/b18035723_0035.JP2/full/732,1024/0/default.jpg",
                    type: "Image",
                    format: "image/jpeg",
                    height: 1024,
                    width: 732,
                    service: [
                      {
                        "@id":
                          "https://iiif.wellcomecollection.org/image/b18035723_0035.JP2",
                        "@type": "ImageService2",
                        profile: "http://iiif.io/api/image/2/level1.json",
                        width: 2411,
                        height: 3372,
                      },
                    ],
                  },
                ],
              },
            ],
          },
        ],
        annotations: [
          {
            id: "https://digirati-co-uk.github.io/wunder/annos/33.json",
            type: "AnnotationPage",
            label: {
              en: ["Text of page  -"],
            },
            items: [],
          },
        ],
      },
      {
        id: "https://digirati-co-uk.github.io/wunder/canvases/34",
        type: "Canvas",
        height: 3372,
        width: 2411,
        label: {
          none: ["-"],
        },
        thumbnail: [
          {
            id: "https://iiif.wellcomecollection.org/thumbs/b18035723_0036.JP2/full/72,100/0/default.jpg",
            type: "Image",
            height: 100,
            width: 72,
            service: [
              {
                "@id":
                  "https://iiif.wellcomecollection.org/thumbs/b18035723_0036.JP2",
                "@type": "ImageService2",
                profile: "http://iiif.io/api/image/2/level0.json",
                width: 732,
                height: 1024,
                sizes: [
                  {
                    width: 72,
                    height: 100,
                  },
                  {
                    width: 143,
                    height: 200,
                  },
                  {
                    width: 286,
                    height: 400,
                  },
                  {
                    width: 732,
                    height: 1024,
                  },
                ],
              },
            ],
          },
        ],
        seeAlso: [
          {
            id: "https://api.wellcomecollection.org/text/alto/b18035723/b18035723_0036.JP2",
            type: "Dataset",
            format: "text/xml",
            profile: "http://www.loc.gov/standards/alto/v3/alto.xsd",
            label: {
              none: ["METS-ALTO XML"],
            },
          },
        ],
        items: [
          {
            id: "https://iiif.wellcomecollection.org/presentation/b18035723/canvases/b18035723_0036.JP2/painting",
            type: "AnnotationPage",
            items: [
              {
                id: "https://iiif.wellcomecollection.org/presentation/b18035723/canvases/b18035723_0036.JP2/painting/anno",
                type: "Annotation",
                motivation: ["painting"],
                target: "https://digirati-co-uk.github.io/wunder/canvases/34",
                body: [
                  {
                    id: "https://iiif.wellcomecollection.org/image/b18035723_0036.JP2/full/732,1024/0/default.jpg",
                    type: "Image",
                    format: "image/jpeg",
                    height: 1024,
                    width: 732,
                    service: [
                      {
                        "@id":
                          "https://iiif.wellcomecollection.org/image/b18035723_0036.JP2",
                        "@type": "ImageService2",
                        profile: "http://iiif.io/api/image/2/level1.json",
                        width: 2411,
                        height: 3372,
                      },
                    ],
                  },
                ],
              },
            ],
          },
        ],
        annotations: [
          {
            id: "https://digirati-co-uk.github.io/wunder/annos/34.json",
            type: "AnnotationPage",
            label: {
              en: ["Text of page  -"],
            },
            items: [],
          },
        ],
      },
      {
        id: "https://digirati-co-uk.github.io/wunder/canvases/35",
        type: "Canvas",
        height: 3040,
        width: 2231,
        label: {
          none: ["-"],
        },
        thumbnail: [
          {
            id: "https://iiif.wellcomecollection.org/thumbs/b18035723_0002.JP2/full/73,100/0/default.jpg",
            type: "Image",
            height: 100,
            width: 73,
            service: [
              {
                "@id":
                  "https://iiif.wellcomecollection.org/thumbs/b18035723_0002.JP2",
                "@type": "ImageService2",
                profile: "http://iiif.io/api/image/2/level0.json",
                width: 751,
                height: 1024,
                sizes: [
                  {
                    width: 73,
                    height: 100,
                  },
                  {
                    width: 147,
                    height: 200,
                  },
                  {
                    width: 294,
                    height: 400,
                  },
                  {
                    width: 751,
                    height: 1024,
                  },
                ],
              },
            ],
          },
        ],
        seeAlso: [
          {
            id: "https://api.wellcomecollection.org/text/alto/b18035723/b18035723_0002.JP2",
            type: "Dataset",
            format: "text/xml",
            profile: "http://www.loc.gov/standards/alto/v3/alto.xsd",
            label: {
              none: ["METS-ALTO XML"],
            },
          },
        ],
        items: [
          {
            id: "https://iiif.wellcomecollection.org/presentation/b18035723/canvases/b18035723_0002.JP2/painting",
            type: "AnnotationPage",
            items: [
              {
                id: "https://iiif.wellcomecollection.org/presentation/b18035723/canvases/b18035723_0002.JP2/painting/anno",
                type: "Annotation",
                motivation: ["painting"],
                target: "https://digirati-co-uk.github.io/wunder/canvases/35",
                body: [
                  {
                    id: "https://iiif.wellcomecollection.org/image/b18035723_0002.JP2/full/751,1024/0/default.jpg",
                    type: "Image",
                    format: "image/jpeg",
                    height: 1024,
                    width: 751,
                    service: [
                      {
                        "@id":
                          "https://iiif.wellcomecollection.org/image/b18035723_0002.JP2",
                        "@type": "ImageService2",
                        profile: "http://iiif.io/api/image/2/level1.json",
                        width: 2231,
                        height: 3040,
                      },
                    ],
                  },
                ],
              },
            ],
          },
        ],
        annotations: [
          {
            id: "https://digirati-co-uk.github.io/wunder/annos/35.json",
            type: "AnnotationPage",
            label: {
              en: ["Text of page  -"],
            },
            items: [],
          },
        ],
      },
    ],
    structures: [
      {
        id: "https://iiif.wellcomecollection.org/presentation/b18035723/ranges/LOG_0001",
        type: "Range",
        label: {
          none: ["Front Cover"],
        },
        items: [
          {
            id: "https://iiif.wellcomecollection.org/presentation/b18035723/canvases/b18035723_0001.JP2",
            type: "Canvas",
          },
        ],
      },
      {
        id: "https://iiif.wellcomecollection.org/presentation/b18035723/ranges/LOG_0003",
        type: "Range",
        label: {
          none: ["Title Page"],
        },
        items: [
          {
            id: "https://iiif.wellcomecollection.org/presentation/b18035723/canvases/b18035723_0004.JP2",
            type: "Canvas",
          },
        ],
      },
      {
        id: "https://iiif.wellcomecollection.org/presentation/b18035723/ranges/LOG_0002",
        type: "Range",
        label: {
          none: ["Back Cover"],
        },
        items: [
          {
            id: "https://iiif.wellcomecollection.org/presentation/b18035723/canvases/b18035723_0002.JP2",
            type: "Canvas",
          },
        ],
      },
    ],
  },
  {
    id: "https://digirati-co-uk.github.io/wunder.json",
    type: "Manifest",
    behavior: ["paged"],
    label: {
      en: ["Wunder der Vererbung / von Fritz Bolle."],
    },
    metadata: [
      {
        label: {
          en: ["Publication/creation"],
        },
        value: {
          none: ["Murnau ; München : Sebastian Lux, [1951]"],
        },
      },
      {
        label: {
          en: ["Physical description"],
        },
        value: {
          en: ["31 pages : illustrations ; 15 cm."],
        },
      },
      {
        label: {
          en: ["Contributors"],
        },
        value: {
          none: ["Bolle, Fritz."],
        },
      },
      {
        label: {
          en: ["Type/technique"],
        },
        value: {
          en: ["Pamphlets"],
        },
      },
      {
        label: {
          en: ["Subjects"],
        },
        value: {
          en: ["Genetics - history"],
        },
      },
      {
        label: {
          en: ["Attribution and usage"],
        },
        value: {
          en: [
            "Wellcome Collection",
            '<span>You have permission to make copies of this work under a <a target="_top" href="http://creativecommons.org/licenses/by-nc/4.0/">Creative Commons, Attribution, Non-commercial license</a>.<br/><br/>Non-commercial use includes private study, academic research, teaching, and other activities that are not primarily intended for, or directed towards, commercial advantage or private monetary compensation. See the <a target="_top" href="http://creativecommons.org/licenses/by-nc/4.0/legalcode">Legal Code</a> for further information.<br/><br/>Image source should be attributed as specified in the full catalogue record. If no source is given the image should be attributed to Wellcome Collection.</span>',
          ],
        },
      },
    ],
    rights: "http://creativecommons.org/licenses/by-nc/4.0/",
    thumbnail: [
      {
        id: "https://iiif.wellcomecollection.org/thumbs/b18035723_0004.JP2/full/72,100/0/default.jpg",
        type: "Image",
        height: 100,
        width: 72,
        service: [
          {
            "@id":
              "https://iiif.wellcomecollection.org/thumbs/b18035723_0004.JP2",
            "@type": "ImageService2",
            profile: "http://iiif.io/api/image/2/level0.json",
            width: 732,
            height: 1024,
            sizes: [
              {
                width: 72,
                height: 100,
              },
              {
                width: 143,
                height: 200,
              },
              {
                width: 286,
                height: 400,
              },
              {
                width: 732,
                height: 1024,
              },
            ],
          },
        ],
      },
    ],
    provider: [
      {
        id: "https://wellcomecollection.org",
        type: "Agent",
        label: {
          en: [
            "Wellcome Collection",
            "183 Euston Road",
            "London NW1 2BE UK",
            "T +44 (0)20 7611 8722",
            "E library@wellcomecollection.org",
            "https://wellcomecollection.org",
          ],
        },
        homepage: [
          {
            id: "https://wellcomecollection.org/works",
            type: "Text",
            format: "text/html",
            label: {
              en: ["Explore our collections"],
            },
          },
        ],
        logo: [
          {
            id: "https://iiif.wellcomecollection.org/logos/wellcome-collection-black.png",
            type: "Image",
            format: "image/png",
          },
        ],
      },
    ],
    seeAlso: [
      {
        id: "https://api.wellcomecollection.org/catalogue/v2/works/krqp99r9",
        type: "Dataset",
        format: "application/json",
        profile: "https://api.wellcomecollection.org/catalogue/v2/context.json",
        label: {
          en: ["Wellcome Collection Catalogue API"],
        },
      },
    ],
    service: [
      {
        "@id": "https://iiif.wellcomecollection.org/search/v1/b18035723",
        "@type": "SearchService1",
        profile: "http://iiif.io/api/search/1/search",
        label: "Search within this manifest",
        service: {
          "@id":
            "https://iiif.wellcomecollection.org/search/autocomplete/v1/b18035723",
          "@type": "AutoCompleteService1",
          profile: "http://iiif.io/api/search/1/autocomplete",
          label: "Autocomplete words in this manifest",
        },
      },
    ],
    services: [
      {
        id: "https://iiif.wellcomecollection.org/presentation/b18035723#tracking",
        type: "Text",
        profile: "http://universalviewer.io/tracking-extensions-profile",
        label: {
          en: [
            "Format: Monograph, Institution: n/a, Identifier: b18035723, Digicode: diggenetics, Collection code: n/a",
          ],
        },
      },
      {
        id: "https://iiif.wellcomecollection.org/presentation/b18035723#timestamp",
        type: "Text",
        profile:
          "https://github.com/wellcomecollection/iiif-builder/build-timestamp",
        label: {
          none: ["2021-04-29T21:58:28.9247406Z"],
        },
      },
      {
        id: "https://iiif.wellcomecollection.org/presentation/b18035723#accesscontrolhints",
        type: "Text",
        profile: "http://wellcomelibrary.org/ld/iiif-ext/access-control-hints",
        label: {
          en: ["open"],
        },
      },
    ],
    rendering: [
      {
        id: "https://iiif.wellcomecollection.org/pdf/b18035723",
        type: "Text",
        format: "application/pdf",
        label: {
          en: ["View as PDF"],
        },
      },
      {
        id: "https://api.wellcomecollection.org/text/v1/b18035723",
        type: "Text",
        format: "text/plain",
        label: {
          en: ["View raw text"],
        },
      },
    ],
    partOf: [
      {
        id: "https://iiif.wellcomecollection.org/presentation/collections/contributors/xtwzf3g5",
        type: "ContentResource",
      },
      {
        id: "https://iiif.wellcomecollection.org/presentation/collections/subjects/hq8gcy73",
        type: "ContentResource",
      },
      {
        id: "https://iiif.wellcomecollection.org/presentation/collections/genres/Pamphlets",
        type: "ContentResource",
      },
    ],
    items: [
      {
        id: "https://digirati-co-uk.github.io/wunder/canvases/0",
        type: "Canvas",
        height: 3543,
        width: 2569,
        label: {
          none: ["-"],
        },
        thumbnail: [
          {
            id: "https://iiif.wellcomecollection.org/thumbs/b18035723_0001.JP2/full/73,100/0/default.jpg",
            type: "Image",
            height: 100,
            width: 73,
            service: [
              {
                "@id":
                  "https://iiif.wellcomecollection.org/thumbs/b18035723_0001.JP2",
                "@type": "ImageService2",
                profile: "http://iiif.io/api/image/2/level0.json",
                width: 742,
                height: 1024,
                sizes: [
                  {
                    width: 73,
                    height: 100,
                  },
                  {
                    width: 145,
                    height: 200,
                  },
                  {
                    width: 290,
                    height: 400,
                  },
                  {
                    width: 742,
                    height: 1024,
                  },
                ],
              },
            ],
          },
        ],
        seeAlso: [
          {
            id: "https://api.wellcomecollection.org/text/alto/b18035723/b18035723_0001.JP2",
            type: "Dataset",
            format: "text/xml",
            profile: "http://www.loc.gov/standards/alto/v3/alto.xsd",
            label: {
              none: ["METS-ALTO XML"],
            },
          },
        ],
        items: [
          {
            id: "https://iiif.wellcomecollection.org/presentation/b18035723/canvases/b18035723_0001.JP2/painting",
            type: "AnnotationPage",
            items: [
              {
                id: "https://iiif.wellcomecollection.org/presentation/b18035723/canvases/b18035723_0001.JP2/painting/anno",
                type: "Annotation",
                motivation: ["painting"],
                target: "https://digirati-co-uk.github.io/wunder/canvases/0",
                body: [
                  {
                    id: "https://iiif.wellcomecollection.org/image/b18035723_0001.JP2/full/742,1024/0/default.jpg",
                    type: "Image",
                    format: "image/jpeg",
                    height: 1024,
                    width: 742,
                    service: [
                      {
                        "@id":
                          "https://iiif.wellcomecollection.org/image/b18035723_0001.JP2",
                        "@type": "ImageService2",
                        profile: "http://iiif.io/api/image/2/level1.json",
                        width: 2569,
                        height: 3543,
                      },
                    ],
                  },
                ],
              },
            ],
          },
        ],
        annotations: [
          {
            id: "https://digirati-co-uk.github.io/wunder/annos/0.json",
            type: "AnnotationPage",
            label: {
              en: ["Text of page  -"],
            },
            items: [],
          },
        ],
      },
      {
        id: "https://digirati-co-uk.github.io/wunder/canvases/1",
        type: "Canvas",
        height: 3372,
        width: 2411,
        label: {
          none: ["-"],
        },
        thumbnail: [
          {
            id: "https://iiif.wellcomecollection.org/thumbs/b18035723_0003.JP2/full/72,100/0/default.jpg",
            type: "Image",
            height: 100,
            width: 72,
            service: [
              {
                "@id":
                  "https://iiif.wellcomecollection.org/thumbs/b18035723_0003.JP2",
                "@type": "ImageService2",
                profile: "http://iiif.io/api/image/2/level0.json",
                width: 732,
                height: 1024,
                sizes: [
                  {
                    width: 72,
                    height: 100,
                  },
                  {
                    width: 143,
                    height: 200,
                  },
                  {
                    width: 286,
                    height: 400,
                  },
                  {
                    width: 732,
                    height: 1024,
                  },
                ],
              },
            ],
          },
        ],
        seeAlso: [
          {
            id: "https://api.wellcomecollection.org/text/alto/b18035723/b18035723_0003.JP2",
            type: "Dataset",
            format: "text/xml",
            profile: "http://www.loc.gov/standards/alto/v3/alto.xsd",
            label: {
              none: ["METS-ALTO XML"],
            },
          },
        ],
        items: [
          {
            id: "https://iiif.wellcomecollection.org/presentation/b18035723/canvases/b18035723_0003.JP2/painting",
            type: "AnnotationPage",
            items: [
              {
                id: "https://iiif.wellcomecollection.org/presentation/b18035723/canvases/b18035723_0003.JP2/painting/anno",
                type: "Annotation",
                motivation: ["painting"],
                target: "https://digirati-co-uk.github.io/wunder/canvases/1",
                body: [
                  {
                    id: "https://iiif.wellcomecollection.org/image/b18035723_0003.JP2/full/732,1024/0/default.jpg",
                    type: "Image",
                    format: "image/jpeg",
                    height: 1024,
                    width: 732,
                    service: [
                      {
                        "@id":
                          "https://iiif.wellcomecollection.org/image/b18035723_0003.JP2",
                        "@type": "ImageService2",
                        profile: "http://iiif.io/api/image/2/level1.json",
                        width: 2411,
                        height: 3372,
                      },
                    ],
                  },
                ],
              },
            ],
          },
        ],
        annotations: [
          {
            id: "https://digirati-co-uk.github.io/wunder/annos/1.json",
            type: "AnnotationPage",
            label: {
              en: ["Text of page  -"],
            },
            items: [],
          },
        ],
      },
      {
        id: "https://digirati-co-uk.github.io/wunder/canvases/2",
        type: "Canvas",
        height: 3372,
        width: 2411,
        label: {
          none: ["-"],
        },
        thumbnail: [
          {
            id: "https://iiif.wellcomecollection.org/thumbs/b18035723_0004.JP2/full/72,100/0/default.jpg",
            type: "Image",
            height: 100,
            width: 72,
            service: [
              {
                "@id":
                  "https://iiif.wellcomecollection.org/thumbs/b18035723_0004.JP2",
                "@type": "ImageService2",
                profile: "http://iiif.io/api/image/2/level0.json",
                width: 732,
                height: 1024,
                sizes: [
                  {
                    width: 72,
                    height: 100,
                  },
                  {
                    width: 143,
                    height: 200,
                  },
                  {
                    width: 286,
                    height: 400,
                  },
                  {
                    width: 732,
                    height: 1024,
                  },
                ],
              },
            ],
          },
        ],
        seeAlso: [
          {
            id: "https://api.wellcomecollection.org/text/alto/b18035723/b18035723_0004.JP2",
            type: "Dataset",
            format: "text/xml",
            profile: "http://www.loc.gov/standards/alto/v3/alto.xsd",
            label: {
              none: ["METS-ALTO XML"],
            },
          },
        ],
        items: [
          {
            id: "https://iiif.wellcomecollection.org/presentation/b18035723/canvases/b18035723_0004.JP2/painting",
            type: "AnnotationPage",
            items: [
              {
                id: "https://iiif.wellcomecollection.org/presentation/b18035723/canvases/b18035723_0004.JP2/painting/anno",
                type: "Annotation",
                motivation: ["painting"],
                target: "https://digirati-co-uk.github.io/wunder/canvases/2",
                body: [
                  {
                    id: "https://iiif.wellcomecollection.org/image/b18035723_0004.JP2/full/732,1024/0/default.jpg",
                    type: "Image",
                    format: "image/jpeg",
                    height: 1024,
                    width: 732,
                    service: [
                      {
                        "@id":
                          "https://iiif.wellcomecollection.org/image/b18035723_0004.JP2",
                        "@type": "ImageService2",
                        profile: "http://iiif.io/api/image/2/level1.json",
                        width: 2411,
                        height: 3372,
                      },
                    ],
                  },
                ],
              },
            ],
          },
        ],
        annotations: [
          {
            id: "https://digirati-co-uk.github.io/wunder/annos/2.json",
            type: "AnnotationPage",
            label: {
              en: ["Text of page  -"],
            },
            items: [],
          },
        ],
      },
      {
        id: "https://digirati-co-uk.github.io/wunder/canvases/3",
        type: "Canvas",
        height: 3372,
        width: 2411,
        label: {
          none: ["2"],
        },
        thumbnail: [
          {
            id: "https://iiif.wellcomecollection.org/thumbs/b18035723_0005.JP2/full/72,100/0/default.jpg",
            type: "Image",
            height: 100,
            width: 72,
            service: [
              {
                "@id":
                  "https://iiif.wellcomecollection.org/thumbs/b18035723_0005.JP2",
                "@type": "ImageService2",
                profile: "http://iiif.io/api/image/2/level0.json",
                width: 732,
                height: 1024,
                sizes: [
                  {
                    width: 72,
                    height: 100,
                  },
                  {
                    width: 143,
                    height: 200,
                  },
                  {
                    width: 286,
                    height: 400,
                  },
                  {
                    width: 732,
                    height: 1024,
                  },
                ],
              },
            ],
          },
        ],
        seeAlso: [
          {
            id: "https://api.wellcomecollection.org/text/alto/b18035723/b18035723_0005.JP2",
            type: "Dataset",
            format: "text/xml",
            profile: "http://www.loc.gov/standards/alto/v3/alto.xsd",
            label: {
              none: ["METS-ALTO XML"],
            },
          },
        ],
        items: [
          {
            id: "https://iiif.wellcomecollection.org/presentation/b18035723/canvases/b18035723_0005.JP2/painting",
            type: "AnnotationPage",
            items: [
              {
                id: "https://iiif.wellcomecollection.org/presentation/b18035723/canvases/b18035723_0005.JP2/painting/anno",
                type: "Annotation",
                motivation: ["painting"],
                target: "https://digirati-co-uk.github.io/wunder/canvases/3",
                body: [
                  {
                    id: "https://iiif.wellcomecollection.org/image/b18035723_0005.JP2/full/732,1024/0/default.jpg",
                    type: "Image",
                    format: "image/jpeg",
                    height: 1024,
                    width: 732,
                    service: [
                      {
                        "@id":
                          "https://iiif.wellcomecollection.org/image/b18035723_0005.JP2",
                        "@type": "ImageService2",
                        profile: "http://iiif.io/api/image/2/level1.json",
                        width: 2411,
                        height: 3372,
                      },
                    ],
                  },
                ],
              },
            ],
          },
        ],
        annotations: [
          {
            id: "https://digirati-co-uk.github.io/wunder/annos/3.json",
            type: "AnnotationPage",
            label: {
              en: ["Text of page 2"],
            },
            items: [],
          },
        ],
      },
      {
        id: "https://digirati-co-uk.github.io/wunder/canvases/4",
        type: "Canvas",
        height: 3372,
        width: 2411,
        label: {
          none: ["3"],
        },
        thumbnail: [
          {
            id: "https://iiif.wellcomecollection.org/thumbs/b18035723_0006.JP2/full/72,100/0/default.jpg",
            type: "Image",
            height: 100,
            width: 72,
            service: [
              {
                "@id":
                  "https://iiif.wellcomecollection.org/thumbs/b18035723_0006.JP2",
                "@type": "ImageService2",
                profile: "http://iiif.io/api/image/2/level0.json",
                width: 732,
                height: 1024,
                sizes: [
                  {
                    width: 72,
                    height: 100,
                  },
                  {
                    width: 143,
                    height: 200,
                  },
                  {
                    width: 286,
                    height: 400,
                  },
                  {
                    width: 732,
                    height: 1024,
                  },
                ],
              },
            ],
          },
        ],
        seeAlso: [
          {
            id: "https://api.wellcomecollection.org/text/alto/b18035723/b18035723_0006.JP2",
            type: "Dataset",
            format: "text/xml",
            profile: "http://www.loc.gov/standards/alto/v3/alto.xsd",
            label: {
              none: ["METS-ALTO XML"],
            },
          },
        ],
        items: [
          {
            id: "https://iiif.wellcomecollection.org/presentation/b18035723/canvases/b18035723_0006.JP2/painting",
            type: "AnnotationPage",
            items: [
              {
                id: "https://iiif.wellcomecollection.org/presentation/b18035723/canvases/b18035723_0006.JP2/painting/anno",
                type: "Annotation",
                motivation: ["painting"],
                target: "https://digirati-co-uk.github.io/wunder/canvases/4",
                body: [
                  {
                    id: "https://iiif.wellcomecollection.org/image/b18035723_0006.JP2/full/732,1024/0/default.jpg",
                    type: "Image",
                    format: "image/jpeg",
                    height: 1024,
                    width: 732,
                    service: [
                      {
                        "@id":
                          "https://iiif.wellcomecollection.org/image/b18035723_0006.JP2",
                        "@type": "ImageService2",
                        profile: "http://iiif.io/api/image/2/level1.json",
                        width: 2411,
                        height: 3372,
                      },
                    ],
                  },
                ],
              },
            ],
          },
        ],
        annotations: [
          {
            id: "https://digirati-co-uk.github.io/wunder/annos/4.json",
            type: "AnnotationPage",
            label: {
              en: ["Text of page 3"],
            },
            items: [],
          },
        ],
      },
      {
        id: "https://digirati-co-uk.github.io/wunder/canvases/5",
        type: "Canvas",
        height: 2736,
        width: 2008,
        label: {
          none: ["4"],
        },
        thumbnail: [
          {
            id: "https://iiif.wellcomecollection.org/thumbs/b18035723_0007.JP2/full/73,100/0/default.jpg",
            type: "Image",
            height: 100,
            width: 73,
            service: [
              {
                "@id":
                  "https://iiif.wellcomecollection.org/thumbs/b18035723_0007.JP2",
                "@type": "ImageService2",
                profile: "http://iiif.io/api/image/2/level0.json",
                width: 752,
                height: 1024,
                sizes: [
                  {
                    width: 73,
                    height: 100,
                  },
                  {
                    width: 147,
                    height: 200,
                  },
                  {
                    width: 294,
                    height: 400,
                  },
                  {
                    width: 752,
                    height: 1024,
                  },
                ],
              },
            ],
          },
        ],
        seeAlso: [
          {
            id: "https://api.wellcomecollection.org/text/alto/b18035723/b18035723_0007.JP2",
            type: "Dataset",
            format: "text/xml",
            profile: "http://www.loc.gov/standards/alto/v3/alto.xsd",
            label: {
              none: ["METS-ALTO XML"],
            },
          },
        ],
        items: [
          {
            id: "https://iiif.wellcomecollection.org/presentation/b18035723/canvases/b18035723_0007.JP2/painting",
            type: "AnnotationPage",
            items: [
              {
                id: "https://iiif.wellcomecollection.org/presentation/b18035723/canvases/b18035723_0007.JP2/painting/anno",
                type: "Annotation",
                motivation: ["painting"],
                target: "https://digirati-co-uk.github.io/wunder/canvases/5",
                body: [
                  {
                    id: "https://iiif.wellcomecollection.org/image/b18035723_0007.JP2/full/752,1024/0/default.jpg",
                    type: "Image",
                    format: "image/jpeg",
                    height: 1024,
                    width: 752,
                    service: [
                      {
                        "@id":
                          "https://iiif.wellcomecollection.org/image/b18035723_0007.JP2",
                        "@type": "ImageService2",
                        profile: "http://iiif.io/api/image/2/level1.json",
                        width: 2008,
                        height: 2736,
                      },
                    ],
                  },
                ],
              },
            ],
          },
        ],
        annotations: [
          {
            id: "https://digirati-co-uk.github.io/wunder/annos/5.json",
            type: "AnnotationPage",
            label: {
              en: ["Text of page 4"],
            },
            items: [],
          },
        ],
      },
      {
        id: "https://digirati-co-uk.github.io/wunder/canvases/6",
        type: "Canvas",
        height: 2740,
        width: 2008,
        label: {
          none: ["5"],
        },
        thumbnail: [
          {
            id: "https://iiif.wellcomecollection.org/thumbs/b18035723_0008.JP2/full/73,100/0/default.jpg",
            type: "Image",
            height: 100,
            width: 73,
            service: [
              {
                "@id":
                  "https://iiif.wellcomecollection.org/thumbs/b18035723_0008.JP2",
                "@type": "ImageService2",
                profile: "http://iiif.io/api/image/2/level0.json",
                width: 750,
                height: 1024,
                sizes: [
                  {
                    width: 73,
                    height: 100,
                  },
                  {
                    width: 147,
                    height: 200,
                  },
                  {
                    width: 293,
                    height: 400,
                  },
                  {
                    width: 750,
                    height: 1024,
                  },
                ],
              },
            ],
          },
        ],
        seeAlso: [
          {
            id: "https://api.wellcomecollection.org/text/alto/b18035723/b18035723_0008.JP2",
            type: "Dataset",
            format: "text/xml",
            profile: "http://www.loc.gov/standards/alto/v3/alto.xsd",
            label: {
              none: ["METS-ALTO XML"],
            },
          },
        ],
        items: [
          {
            id: "https://iiif.wellcomecollection.org/presentation/b18035723/canvases/b18035723_0008.JP2/painting",
            type: "AnnotationPage",
            items: [
              {
                id: "https://iiif.wellcomecollection.org/presentation/b18035723/canvases/b18035723_0008.JP2/painting/anno",
                type: "Annotation",
                motivation: ["painting"],
                target: "https://digirati-co-uk.github.io/wunder/canvases/6",
                body: [
                  {
                    id: "https://iiif.wellcomecollection.org/image/b18035723_0008.JP2/full/750,1024/0/default.jpg",
                    type: "Image",
                    format: "image/jpeg",
                    height: 1024,
                    width: 750,
                    service: [
                      {
                        "@id":
                          "https://iiif.wellcomecollection.org/image/b18035723_0008.JP2",
                        "@type": "ImageService2",
                        profile: "http://iiif.io/api/image/2/level1.json",
                        width: 2008,
                        height: 2740,
                      },
                    ],
                  },
                ],
              },
            ],
          },
        ],
        annotations: [
          {
            id: "https://digirati-co-uk.github.io/wunder/annos/6.json",
            type: "AnnotationPage",
            label: {
              en: ["Text of page 5"],
            },
            items: [],
          },
        ],
      },
      {
        id: "https://digirati-co-uk.github.io/wunder/canvases/7",
        type: "Canvas",
        height: 3372,
        width: 2411,
        label: {
          none: ["6"],
        },
        thumbnail: [
          {
            id: "https://iiif.wellcomecollection.org/thumbs/b18035723_0009.JP2/full/72,100/0/default.jpg",
            type: "Image",
            height: 100,
            width: 72,
            service: [
              {
                "@id":
                  "https://iiif.wellcomecollection.org/thumbs/b18035723_0009.JP2",
                "@type": "ImageService2",
                profile: "http://iiif.io/api/image/2/level0.json",
                width: 732,
                height: 1024,
                sizes: [
                  {
                    width: 72,
                    height: 100,
                  },
                  {
                    width: 143,
                    height: 200,
                  },
                  {
                    width: 286,
                    height: 400,
                  },
                  {
                    width: 732,
                    height: 1024,
                  },
                ],
              },
            ],
          },
        ],
        seeAlso: [
          {
            id: "https://api.wellcomecollection.org/text/alto/b18035723/b18035723_0009.JP2",
            type: "Dataset",
            format: "text/xml",
            profile: "http://www.loc.gov/standards/alto/v3/alto.xsd",
            label: {
              none: ["METS-ALTO XML"],
            },
          },
        ],
        items: [
          {
            id: "https://iiif.wellcomecollection.org/presentation/b18035723/canvases/b18035723_0009.JP2/painting",
            type: "AnnotationPage",
            items: [
              {
                id: "https://iiif.wellcomecollection.org/presentation/b18035723/canvases/b18035723_0009.JP2/painting/anno",
                type: "Annotation",
                motivation: ["painting"],
                target: "https://digirati-co-uk.github.io/wunder/canvases/7",
                body: [
                  {
                    id: "https://iiif.wellcomecollection.org/image/b18035723_0009.JP2/full/732,1024/0/default.jpg",
                    type: "Image",
                    format: "image/jpeg",
                    height: 1024,
                    width: 732,
                    service: [
                      {
                        "@id":
                          "https://iiif.wellcomecollection.org/image/b18035723_0009.JP2",
                        "@type": "ImageService2",
                        profile: "http://iiif.io/api/image/2/level1.json",
                        width: 2411,
                        height: 3372,
                      },
                    ],
                  },
                ],
              },
            ],
          },
        ],
        annotations: [
          {
            id: "https://digirati-co-uk.github.io/wunder/annos/7.json",
            type: "AnnotationPage",
            label: {
              en: ["Text of page 6"],
            },
            items: [],
          },
        ],
      },
      {
        id: "https://digirati-co-uk.github.io/wunder/canvases/8",
        type: "Canvas",
        height: 3372,
        width: 2411,
        label: {
          none: ["7"],
        },
        thumbnail: [
          {
            id: "https://iiif.wellcomecollection.org/thumbs/b18035723_0010.JP2/full/72,100/0/default.jpg",
            type: "Image",
            height: 100,
            width: 72,
            service: [
              {
                "@id":
                  "https://iiif.wellcomecollection.org/thumbs/b18035723_0010.JP2",
                "@type": "ImageService2",
                profile: "http://iiif.io/api/image/2/level0.json",
                width: 732,
                height: 1024,
                sizes: [
                  {
                    width: 72,
                    height: 100,
                  },
                  {
                    width: 143,
                    height: 200,
                  },
                  {
                    width: 286,
                    height: 400,
                  },
                  {
                    width: 732,
                    height: 1024,
                  },
                ],
              },
            ],
          },
        ],
        seeAlso: [
          {
            id: "https://api.wellcomecollection.org/text/alto/b18035723/b18035723_0010.JP2",
            type: "Dataset",
            format: "text/xml",
            profile: "http://www.loc.gov/standards/alto/v3/alto.xsd",
            label: {
              none: ["METS-ALTO XML"],
            },
          },
        ],
        items: [
          {
            id: "https://iiif.wellcomecollection.org/presentation/b18035723/canvases/b18035723_0010.JP2/painting",
            type: "AnnotationPage",
            items: [
              {
                id: "https://iiif.wellcomecollection.org/presentation/b18035723/canvases/b18035723_0010.JP2/painting/anno",
                type: "Annotation",
                motivation: ["painting"],
                target: "https://digirati-co-uk.github.io/wunder/canvases/8",
                body: [
                  {
                    id: "https://iiif.wellcomecollection.org/image/b18035723_0010.JP2/full/732,1024/0/default.jpg",
                    type: "Image",
                    format: "image/jpeg",
                    height: 1024,
                    width: 732,
                    service: [
                      {
                        "@id":
                          "https://iiif.wellcomecollection.org/image/b18035723_0010.JP2",
                        "@type": "ImageService2",
                        profile: "http://iiif.io/api/image/2/level1.json",
                        width: 2411,
                        height: 3372,
                      },
                    ],
                  },
                ],
              },
            ],
          },
        ],
        annotations: [
          {
            id: "https://digirati-co-uk.github.io/wunder/annos/8.json",
            type: "AnnotationPage",
            label: {
              en: ["Text of page 7"],
            },
            items: [],
          },
        ],
      },
      {
        id: "https://digirati-co-uk.github.io/wunder/canvases/9",
        type: "Canvas",
        height: 3372,
        width: 2411,
        label: {
          none: ["8"],
        },
        thumbnail: [
          {
            id: "https://iiif.wellcomecollection.org/thumbs/b18035723_0011.JP2/full/72,100/0/default.jpg",
            type: "Image",
            height: 100,
            width: 72,
            service: [
              {
                "@id":
                  "https://iiif.wellcomecollection.org/thumbs/b18035723_0011.JP2",
                "@type": "ImageService2",
                profile: "http://iiif.io/api/image/2/level0.json",
                width: 732,
                height: 1024,
                sizes: [
                  {
                    width: 72,
                    height: 100,
                  },
                  {
                    width: 143,
                    height: 200,
                  },
                  {
                    width: 286,
                    height: 400,
                  },
                  {
                    width: 732,
                    height: 1024,
                  },
                ],
              },
            ],
          },
        ],
        seeAlso: [
          {
            id: "https://api.wellcomecollection.org/text/alto/b18035723/b18035723_0011.JP2",
            type: "Dataset",
            format: "text/xml",
            profile: "http://www.loc.gov/standards/alto/v3/alto.xsd",
            label: {
              none: ["METS-ALTO XML"],
            },
          },
        ],
        items: [
          {
            id: "https://iiif.wellcomecollection.org/presentation/b18035723/canvases/b18035723_0011.JP2/painting",
            type: "AnnotationPage",
            items: [
              {
                id: "https://iiif.wellcomecollection.org/presentation/b18035723/canvases/b18035723_0011.JP2/painting/anno",
                type: "Annotation",
                motivation: ["painting"],
                target: "https://digirati-co-uk.github.io/wunder/canvases/9",
                body: [
                  {
                    id: "https://iiif.wellcomecollection.org/image/b18035723_0011.JP2/full/732,1024/0/default.jpg",
                    type: "Image",
                    format: "image/jpeg",
                    height: 1024,
                    width: 732,
                    service: [
                      {
                        "@id":
                          "https://iiif.wellcomecollection.org/image/b18035723_0011.JP2",
                        "@type": "ImageService2",
                        profile: "http://iiif.io/api/image/2/level1.json",
                        width: 2411,
                        height: 3372,
                      },
                    ],
                  },
                ],
              },
            ],
          },
        ],
        annotations: [
          {
            id: "https://digirati-co-uk.github.io/wunder/annos/9.json",
            type: "AnnotationPage",
            label: {
              en: ["Text of page 8"],
            },
            items: [],
          },
        ],
      },
      {
        id: "https://digirati-co-uk.github.io/wunder/canvases/10",
        type: "Canvas",
        height: 3372,
        width: 2411,
        label: {
          none: ["9"],
        },
        thumbnail: [
          {
            id: "https://iiif.wellcomecollection.org/thumbs/b18035723_0012.JP2/full/72,100/0/default.jpg",
            type: "Image",
            height: 100,
            width: 72,
            service: [
              {
                "@id":
                  "https://iiif.wellcomecollection.org/thumbs/b18035723_0012.JP2",
                "@type": "ImageService2",
                profile: "http://iiif.io/api/image/2/level0.json",
                width: 732,
                height: 1024,
                sizes: [
                  {
                    width: 72,
                    height: 100,
                  },
                  {
                    width: 143,
                    height: 200,
                  },
                  {
                    width: 286,
                    height: 400,
                  },
                  {
                    width: 732,
                    height: 1024,
                  },
                ],
              },
            ],
          },
        ],
        seeAlso: [
          {
            id: "https://api.wellcomecollection.org/text/alto/b18035723/b18035723_0012.JP2",
            type: "Dataset",
            format: "text/xml",
            profile: "http://www.loc.gov/standards/alto/v3/alto.xsd",
            label: {
              none: ["METS-ALTO XML"],
            },
          },
        ],
        items: [
          {
            id: "https://iiif.wellcomecollection.org/presentation/b18035723/canvases/b18035723_0012.JP2/painting",
            type: "AnnotationPage",
            items: [
              {
                id: "https://iiif.wellcomecollection.org/presentation/b18035723/canvases/b18035723_0012.JP2/painting/anno",
                type: "Annotation",
                motivation: ["painting"],
                target: "https://digirati-co-uk.github.io/wunder/canvases/10",
                body: [
                  {
                    id: "https://iiif.wellcomecollection.org/image/b18035723_0012.JP2/full/732,1024/0/default.jpg",
                    type: "Image",
                    format: "image/jpeg",
                    height: 1024,
                    width: 732,
                    service: [
                      {
                        "@id":
                          "https://iiif.wellcomecollection.org/image/b18035723_0012.JP2",
                        "@type": "ImageService2",
                        profile: "http://iiif.io/api/image/2/level1.json",
                        width: 2411,
                        height: 3372,
                      },
                    ],
                  },
                ],
              },
            ],
          },
        ],
        annotations: [
          {
            id: "https://digirati-co-uk.github.io/wunder/annos/10.json",
            type: "AnnotationPage",
            label: {
              en: ["Text of page 9"],
            },
            items: [],
          },
        ],
      },
      {
        id: "https://digirati-co-uk.github.io/wunder/canvases/11",
        type: "Canvas",
        height: 3372,
        width: 2411,
        label: {
          none: ["10"],
        },
        thumbnail: [
          {
            id: "https://iiif.wellcomecollection.org/thumbs/b18035723_0013.JP2/full/72,100/0/default.jpg",
            type: "Image",
            height: 100,
            width: 72,
            service: [
              {
                "@id":
                  "https://iiif.wellcomecollection.org/thumbs/b18035723_0013.JP2",
                "@type": "ImageService2",
                profile: "http://iiif.io/api/image/2/level0.json",
                width: 732,
                height: 1024,
                sizes: [
                  {
                    width: 72,
                    height: 100,
                  },
                  {
                    width: 143,
                    height: 200,
                  },
                  {
                    width: 286,
                    height: 400,
                  },
                  {
                    width: 732,
                    height: 1024,
                  },
                ],
              },
            ],
          },
        ],
        seeAlso: [
          {
            id: "https://api.wellcomecollection.org/text/alto/b18035723/b18035723_0013.JP2",
            type: "Dataset",
            format: "text/xml",
            profile: "http://www.loc.gov/standards/alto/v3/alto.xsd",
            label: {
              none: ["METS-ALTO XML"],
            },
          },
        ],
        items: [
          {
            id: "https://iiif.wellcomecollection.org/presentation/b18035723/canvases/b18035723_0013.JP2/painting",
            type: "AnnotationPage",
            items: [
              {
                id: "https://iiif.wellcomecollection.org/presentation/b18035723/canvases/b18035723_0013.JP2/painting/anno",
                type: "Annotation",
                motivation: ["painting"],
                target: "https://digirati-co-uk.github.io/wunder/canvases/11",
                body: [
                  {
                    id: "https://iiif.wellcomecollection.org/image/b18035723_0013.JP2/full/732,1024/0/default.jpg",
                    type: "Image",
                    format: "image/jpeg",
                    height: 1024,
                    width: 732,
                    service: [
                      {
                        "@id":
                          "https://iiif.wellcomecollection.org/image/b18035723_0013.JP2",
                        "@type": "ImageService2",
                        profile: "http://iiif.io/api/image/2/level1.json",
                        width: 2411,
                        height: 3372,
                      },
                    ],
                  },
                ],
              },
            ],
          },
        ],
        annotations: [
          {
            id: "https://digirati-co-uk.github.io/wunder/annos/11.json",
            type: "AnnotationPage",
            label: {
              en: ["Text of page 10"],
            },
            items: [],
          },
        ],
      },
      {
        id: "https://digirati-co-uk.github.io/wunder/canvases/12",
        type: "Canvas",
        height: 3372,
        width: 2411,
        label: {
          none: ["11"],
        },
        thumbnail: [
          {
            id: "https://iiif.wellcomecollection.org/thumbs/b18035723_0014.JP2/full/72,100/0/default.jpg",
            type: "Image",
            height: 100,
            width: 72,
            service: [
              {
                "@id":
                  "https://iiif.wellcomecollection.org/thumbs/b18035723_0014.JP2",
                "@type": "ImageService2",
                profile: "http://iiif.io/api/image/2/level0.json",
                width: 732,
                height: 1024,
                sizes: [
                  {
                    width: 72,
                    height: 100,
                  },
                  {
                    width: 143,
                    height: 200,
                  },
                  {
                    width: 286,
                    height: 400,
                  },
                  {
                    width: 732,
                    height: 1024,
                  },
                ],
              },
            ],
          },
        ],
        seeAlso: [
          {
            id: "https://api.wellcomecollection.org/text/alto/b18035723/b18035723_0014.JP2",
            type: "Dataset",
            format: "text/xml",
            profile: "http://www.loc.gov/standards/alto/v3/alto.xsd",
            label: {
              none: ["METS-ALTO XML"],
            },
          },
        ],
        items: [
          {
            id: "https://iiif.wellcomecollection.org/presentation/b18035723/canvases/b18035723_0014.JP2/painting",
            type: "AnnotationPage",
            items: [
              {
                id: "https://iiif.wellcomecollection.org/presentation/b18035723/canvases/b18035723_0014.JP2/painting/anno",
                type: "Annotation",
                motivation: ["painting"],
                target: "https://digirati-co-uk.github.io/wunder/canvases/12",
                body: [
                  {
                    id: "https://iiif.wellcomecollection.org/image/b18035723_0014.JP2/full/732,1024/0/default.jpg",
                    type: "Image",
                    format: "image/jpeg",
                    height: 1024,
                    width: 732,
                    service: [
                      {
                        "@id":
                          "https://iiif.wellcomecollection.org/image/b18035723_0014.JP2",
                        "@type": "ImageService2",
                        profile: "http://iiif.io/api/image/2/level1.json",
                        width: 2411,
                        height: 3372,
                      },
                    ],
                  },
                ],
              },
            ],
          },
        ],
        annotations: [
          {
            id: "https://digirati-co-uk.github.io/wunder/annos/12.json",
            type: "AnnotationPage",
            label: {
              en: ["Text of page 11"],
            },
            items: [],
          },
        ],
      },
      {
        id: "https://digirati-co-uk.github.io/wunder/canvases/13",
        type: "Canvas",
        height: 3372,
        width: 2411,
        label: {
          none: ["12"],
        },
        thumbnail: [
          {
            id: "https://iiif.wellcomecollection.org/thumbs/b18035723_0015.JP2/full/72,100/0/default.jpg",
            type: "Image",
            height: 100,
            width: 72,
            service: [
              {
                "@id":
                  "https://iiif.wellcomecollection.org/thumbs/b18035723_0015.JP2",
                "@type": "ImageService2",
                profile: "http://iiif.io/api/image/2/level0.json",
                width: 732,
                height: 1024,
                sizes: [
                  {
                    width: 72,
                    height: 100,
                  },
                  {
                    width: 143,
                    height: 200,
                  },
                  {
                    width: 286,
                    height: 400,
                  },
                  {
                    width: 732,
                    height: 1024,
                  },
                ],
              },
            ],
          },
        ],
        seeAlso: [
          {
            id: "https://api.wellcomecollection.org/text/alto/b18035723/b18035723_0015.JP2",
            type: "Dataset",
            format: "text/xml",
            profile: "http://www.loc.gov/standards/alto/v3/alto.xsd",
            label: {
              none: ["METS-ALTO XML"],
            },
          },
        ],
        items: [
          {
            id: "https://iiif.wellcomecollection.org/presentation/b18035723/canvases/b18035723_0015.JP2/painting",
            type: "AnnotationPage",
            items: [
              {
                id: "https://iiif.wellcomecollection.org/presentation/b18035723/canvases/b18035723_0015.JP2/painting/anno",
                type: "Annotation",
                motivation: ["painting"],
                target: "https://digirati-co-uk.github.io/wunder/canvases/13",
                body: [
                  {
                    id: "https://iiif.wellcomecollection.org/image/b18035723_0015.JP2/full/732,1024/0/default.jpg",
                    type: "Image",
                    format: "image/jpeg",
                    height: 1024,
                    width: 732,
                    service: [
                      {
                        "@id":
                          "https://iiif.wellcomecollection.org/image/b18035723_0015.JP2",
                        "@type": "ImageService2",
                        profile: "http://iiif.io/api/image/2/level1.json",
                        width: 2411,
                        height: 3372,
                      },
                    ],
                  },
                ],
              },
            ],
          },
        ],
        annotations: [
          {
            id: "https://digirati-co-uk.github.io/wunder/annos/13.json",
            type: "AnnotationPage",
            label: {
              en: ["Text of page 12"],
            },
            items: [],
          },
        ],
      },
      {
        id: "https://digirati-co-uk.github.io/wunder/canvases/14",
        type: "Canvas",
        height: 3372,
        width: 2411,
        label: {
          none: ["13"],
        },
        thumbnail: [
          {
            id: "https://iiif.wellcomecollection.org/thumbs/b18035723_0016.JP2/full/72,100/0/default.jpg",
            type: "Image",
            height: 100,
            width: 72,
            service: [
              {
                "@id":
                  "https://iiif.wellcomecollection.org/thumbs/b18035723_0016.JP2",
                "@type": "ImageService2",
                profile: "http://iiif.io/api/image/2/level0.json",
                width: 732,
                height: 1024,
                sizes: [
                  {
                    width: 72,
                    height: 100,
                  },
                  {
                    width: 143,
                    height: 200,
                  },
                  {
                    width: 286,
                    height: 400,
                  },
                  {
                    width: 732,
                    height: 1024,
                  },
                ],
              },
            ],
          },
        ],
        seeAlso: [
          {
            id: "https://api.wellcomecollection.org/text/alto/b18035723/b18035723_0016.JP2",
            type: "Dataset",
            format: "text/xml",
            profile: "http://www.loc.gov/standards/alto/v3/alto.xsd",
            label: {
              none: ["METS-ALTO XML"],
            },
          },
        ],
        items: [
          {
            id: "https://iiif.wellcomecollection.org/presentation/b18035723/canvases/b18035723_0016.JP2/painting",
            type: "AnnotationPage",
            items: [
              {
                id: "https://iiif.wellcomecollection.org/presentation/b18035723/canvases/b18035723_0016.JP2/painting/anno",
                type: "Annotation",
                motivation: ["painting"],
                target: "https://digirati-co-uk.github.io/wunder/canvases/14",
                body: [
                  {
                    id: "https://iiif.wellcomecollection.org/image/b18035723_0016.JP2/full/732,1024/0/default.jpg",
                    type: "Image",
                    format: "image/jpeg",
                    height: 1024,
                    width: 732,
                    service: [
                      {
                        "@id":
                          "https://iiif.wellcomecollection.org/image/b18035723_0016.JP2",
                        "@type": "ImageService2",
                        profile: "http://iiif.io/api/image/2/level1.json",
                        width: 2411,
                        height: 3372,
                      },
                    ],
                  },
                ],
              },
            ],
          },
        ],
        annotations: [
          {
            id: "https://digirati-co-uk.github.io/wunder/annos/14.json",
            type: "AnnotationPage",
            label: {
              en: ["Text of page 13"],
            },
            items: [],
          },
        ],
      },
      {
        id: "https://digirati-co-uk.github.io/wunder/canvases/15",
        type: "Canvas",
        height: 3372,
        width: 2411,
        label: {
          none: ["14"],
        },
        thumbnail: [
          {
            id: "https://iiif.wellcomecollection.org/thumbs/b18035723_0017.JP2/full/72,100/0/default.jpg",
            type: "Image",
            height: 100,
            width: 72,
            service: [
              {
                "@id":
                  "https://iiif.wellcomecollection.org/thumbs/b18035723_0017.JP2",
                "@type": "ImageService2",
                profile: "http://iiif.io/api/image/2/level0.json",
                width: 732,
                height: 1024,
                sizes: [
                  {
                    width: 72,
                    height: 100,
                  },
                  {
                    width: 143,
                    height: 200,
                  },
                  {
                    width: 286,
                    height: 400,
                  },
                  {
                    width: 732,
                    height: 1024,
                  },
                ],
              },
            ],
          },
        ],
        seeAlso: [
          {
            id: "https://api.wellcomecollection.org/text/alto/b18035723/b18035723_0017.JP2",
            type: "Dataset",
            format: "text/xml",
            profile: "http://www.loc.gov/standards/alto/v3/alto.xsd",
            label: {
              none: ["METS-ALTO XML"],
            },
          },
        ],
        items: [
          {
            id: "https://iiif.wellcomecollection.org/presentation/b18035723/canvases/b18035723_0017.JP2/painting",
            type: "AnnotationPage",
            items: [
              {
                id: "https://iiif.wellcomecollection.org/presentation/b18035723/canvases/b18035723_0017.JP2/painting/anno",
                type: "Annotation",
                motivation: ["painting"],
                target: "https://digirati-co-uk.github.io/wunder/canvases/15",
                body: [
                  {
                    id: "https://iiif.wellcomecollection.org/image/b18035723_0017.JP2/full/732,1024/0/default.jpg",
                    type: "Image",
                    format: "image/jpeg",
                    height: 1024,
                    width: 732,
                    service: [
                      {
                        "@id":
                          "https://iiif.wellcomecollection.org/image/b18035723_0017.JP2",
                        "@type": "ImageService2",
                        profile: "http://iiif.io/api/image/2/level1.json",
                        width: 2411,
                        height: 3372,
                      },
                    ],
                  },
                ],
              },
            ],
          },
        ],
        annotations: [
          {
            id: "https://digirati-co-uk.github.io/wunder/annos/15.json",
            type: "AnnotationPage",
            label: {
              en: ["Text of page 14"],
            },
            items: [],
          },
        ],
      },
      {
        id: "https://digirati-co-uk.github.io/wunder/canvases/16",
        type: "Canvas",
        height: 3372,
        width: 2411,
        label: {
          none: ["15"],
        },
        thumbnail: [
          {
            id: "https://iiif.wellcomecollection.org/thumbs/b18035723_0018.JP2/full/72,100/0/default.jpg",
            type: "Image",
            height: 100,
            width: 72,
            service: [
              {
                "@id":
                  "https://iiif.wellcomecollection.org/thumbs/b18035723_0018.JP2",
                "@type": "ImageService2",
                profile: "http://iiif.io/api/image/2/level0.json",
                width: 732,
                height: 1024,
                sizes: [
                  {
                    width: 72,
                    height: 100,
                  },
                  {
                    width: 143,
                    height: 200,
                  },
                  {
                    width: 286,
                    height: 400,
                  },
                  {
                    width: 732,
                    height: 1024,
                  },
                ],
              },
            ],
          },
        ],
        seeAlso: [
          {
            id: "https://api.wellcomecollection.org/text/alto/b18035723/b18035723_0018.JP2",
            type: "Dataset",
            format: "text/xml",
            profile: "http://www.loc.gov/standards/alto/v3/alto.xsd",
            label: {
              none: ["METS-ALTO XML"],
            },
          },
        ],
        items: [
          {
            id: "https://iiif.wellcomecollection.org/presentation/b18035723/canvases/b18035723_0018.JP2/painting",
            type: "AnnotationPage",
            items: [
              {
                id: "https://iiif.wellcomecollection.org/presentation/b18035723/canvases/b18035723_0018.JP2/painting/anno",
                type: "Annotation",
                motivation: ["painting"],
                target: "https://digirati-co-uk.github.io/wunder/canvases/16",
                body: [
                  {
                    id: "https://iiif.wellcomecollection.org/image/b18035723_0018.JP2/full/732,1024/0/default.jpg",
                    type: "Image",
                    format: "image/jpeg",
                    height: 1024,
                    width: 732,
                    service: [
                      {
                        "@id":
                          "https://iiif.wellcomecollection.org/image/b18035723_0018.JP2",
                        "@type": "ImageService2",
                        profile: "http://iiif.io/api/image/2/level1.json",
                        width: 2411,
                        height: 3372,
                      },
                    ],
                  },
                ],
              },
            ],
          },
        ],
        annotations: [
          {
            id: "https://digirati-co-uk.github.io/wunder/annos/16.json",
            type: "AnnotationPage",
            label: {
              en: ["Text of page 15"],
            },
            items: [],
          },
        ],
      },
      {
        id: "https://digirati-co-uk.github.io/wunder/canvases/17",
        type: "Canvas",
        height: 3372,
        width: 2411,
        label: {
          none: ["16"],
        },
        thumbnail: [
          {
            id: "https://iiif.wellcomecollection.org/thumbs/b18035723_0019.JP2/full/72,100/0/default.jpg",
            type: "Image",
            height: 100,
            width: 72,
            service: [
              {
                "@id":
                  "https://iiif.wellcomecollection.org/thumbs/b18035723_0019.JP2",
                "@type": "ImageService2",
                profile: "http://iiif.io/api/image/2/level0.json",
                width: 732,
                height: 1024,
                sizes: [
                  {
                    width: 72,
                    height: 100,
                  },
                  {
                    width: 143,
                    height: 200,
                  },
                  {
                    width: 286,
                    height: 400,
                  },
                  {
                    width: 732,
                    height: 1024,
                  },
                ],
              },
            ],
          },
        ],
        seeAlso: [
          {
            id: "https://api.wellcomecollection.org/text/alto/b18035723/b18035723_0019.JP2",
            type: "Dataset",
            format: "text/xml",
            profile: "http://www.loc.gov/standards/alto/v3/alto.xsd",
            label: {
              none: ["METS-ALTO XML"],
            },
          },
        ],
        items: [
          {
            id: "https://iiif.wellcomecollection.org/presentation/b18035723/canvases/b18035723_0019.JP2/painting",
            type: "AnnotationPage",
            items: [
              {
                id: "https://iiif.wellcomecollection.org/presentation/b18035723/canvases/b18035723_0019.JP2/painting/anno",
                type: "Annotation",
                motivation: ["painting"],
                target: "https://digirati-co-uk.github.io/wunder/canvases/17",
                body: [
                  {
                    id: "https://iiif.wellcomecollection.org/image/b18035723_0019.JP2/full/732,1024/0/default.jpg",
                    type: "Image",
                    format: "image/jpeg",
                    height: 1024,
                    width: 732,
                    service: [
                      {
                        "@id":
                          "https://iiif.wellcomecollection.org/image/b18035723_0019.JP2",
                        "@type": "ImageService2",
                        profile: "http://iiif.io/api/image/2/level1.json",
                        width: 2411,
                        height: 3372,
                      },
                    ],
                  },
                ],
              },
            ],
          },
        ],
        annotations: [
          {
            id: "https://digirati-co-uk.github.io/wunder/annos/17.json",
            type: "AnnotationPage",
            label: {
              en: ["Text of page 16"],
            },
            items: [],
          },
        ],
      },
      {
        id: "https://digirati-co-uk.github.io/wunder/canvases/18",
        type: "Canvas",
        height: 3372,
        width: 2411,
        label: {
          none: ["17"],
        },
        thumbnail: [
          {
            id: "https://iiif.wellcomecollection.org/thumbs/b18035723_0020.JP2/full/72,100/0/default.jpg",
            type: "Image",
            height: 100,
            width: 72,
            service: [
              {
                "@id":
                  "https://iiif.wellcomecollection.org/thumbs/b18035723_0020.JP2",
                "@type": "ImageService2",
                profile: "http://iiif.io/api/image/2/level0.json",
                width: 732,
                height: 1024,
                sizes: [
                  {
                    width: 72,
                    height: 100,
                  },
                  {
                    width: 143,
                    height: 200,
                  },
                  {
                    width: 286,
                    height: 400,
                  },
                  {
                    width: 732,
                    height: 1024,
                  },
                ],
              },
            ],
          },
        ],
        seeAlso: [
          {
            id: "https://api.wellcomecollection.org/text/alto/b18035723/b18035723_0020.JP2",
            type: "Dataset",
            format: "text/xml",
            profile: "http://www.loc.gov/standards/alto/v3/alto.xsd",
            label: {
              none: ["METS-ALTO XML"],
            },
          },
        ],
        items: [
          {
            id: "https://iiif.wellcomecollection.org/presentation/b18035723/canvases/b18035723_0020.JP2/painting",
            type: "AnnotationPage",
            items: [
              {
                id: "https://iiif.wellcomecollection.org/presentation/b18035723/canvases/b18035723_0020.JP2/painting/anno",
                type: "Annotation",
                motivation: ["painting"],
                target: "https://digirati-co-uk.github.io/wunder/canvases/18",
                body: [
                  {
                    id: "https://iiif.wellcomecollection.org/image/b18035723_0020.JP2/full/732,1024/0/default.jpg",
                    type: "Image",
                    format: "image/jpeg",
                    height: 1024,
                    width: 732,
                    service: [
                      {
                        "@id":
                          "https://iiif.wellcomecollection.org/image/b18035723_0020.JP2",
                        "@type": "ImageService2",
                        profile: "http://iiif.io/api/image/2/level1.json",
                        width: 2411,
                        height: 3372,
                      },
                    ],
                  },
                ],
              },
            ],
          },
        ],
        annotations: [
          {
            id: "https://digirati-co-uk.github.io/wunder/annos/18.json",
            type: "AnnotationPage",
            label: {
              en: ["Text of page 17"],
            },
            items: [],
          },
        ],
      },
      {
        id: "https://digirati-co-uk.github.io/wunder/canvases/19",
        type: "Canvas",
        height: 3372,
        width: 2411,
        label: {
          none: ["18"],
        },
        thumbnail: [
          {
            id: "https://iiif.wellcomecollection.org/thumbs/b18035723_0021.JP2/full/72,100/0/default.jpg",
            type: "Image",
            height: 100,
            width: 72,
            service: [
              {
                "@id":
                  "https://iiif.wellcomecollection.org/thumbs/b18035723_0021.JP2",
                "@type": "ImageService2",
                profile: "http://iiif.io/api/image/2/level0.json",
                width: 732,
                height: 1024,
                sizes: [
                  {
                    width: 72,
                    height: 100,
                  },
                  {
                    width: 143,
                    height: 200,
                  },
                  {
                    width: 286,
                    height: 400,
                  },
                  {
                    width: 732,
                    height: 1024,
                  },
                ],
              },
            ],
          },
        ],
        seeAlso: [
          {
            id: "https://api.wellcomecollection.org/text/alto/b18035723/b18035723_0021.JP2",
            type: "Dataset",
            format: "text/xml",
            profile: "http://www.loc.gov/standards/alto/v3/alto.xsd",
            label: {
              none: ["METS-ALTO XML"],
            },
          },
        ],
        items: [
          {
            id: "https://iiif.wellcomecollection.org/presentation/b18035723/canvases/b18035723_0021.JP2/painting",
            type: "AnnotationPage",
            items: [
              {
                id: "https://iiif.wellcomecollection.org/presentation/b18035723/canvases/b18035723_0021.JP2/painting/anno",
                type: "Annotation",
                motivation: ["painting"],
                target: "https://digirati-co-uk.github.io/wunder/canvases/19",
                body: [
                  {
                    id: "https://iiif.wellcomecollection.org/image/b18035723_0021.JP2/full/732,1024/0/default.jpg",
                    type: "Image",
                    format: "image/jpeg",
                    height: 1024,
                    width: 732,
                    service: [
                      {
                        "@id":
                          "https://iiif.wellcomecollection.org/image/b18035723_0021.JP2",
                        "@type": "ImageService2",
                        profile: "http://iiif.io/api/image/2/level1.json",
                        width: 2411,
                        height: 3372,
                      },
                    ],
                  },
                ],
              },
            ],
          },
        ],
        annotations: [
          {
            id: "https://digirati-co-uk.github.io/wunder/annos/19.json",
            type: "AnnotationPage",
            label: {
              en: ["Text of page 18"],
            },
            items: [],
          },
        ],
      },
      {
        id: "https://digirati-co-uk.github.io/wunder/canvases/20",
        type: "Canvas",
        height: 3372,
        width: 2411,
        label: {
          none: ["19"],
        },
        thumbnail: [
          {
            id: "https://iiif.wellcomecollection.org/thumbs/b18035723_0022.JP2/full/72,100/0/default.jpg",
            type: "Image",
            height: 100,
            width: 72,
            service: [
              {
                "@id":
                  "https://iiif.wellcomecollection.org/thumbs/b18035723_0022.JP2",
                "@type": "ImageService2",
                profile: "http://iiif.io/api/image/2/level0.json",
                width: 732,
                height: 1024,
                sizes: [
                  {
                    width: 72,
                    height: 100,
                  },
                  {
                    width: 143,
                    height: 200,
                  },
                  {
                    width: 286,
                    height: 400,
                  },
                  {
                    width: 732,
                    height: 1024,
                  },
                ],
              },
            ],
          },
        ],
        seeAlso: [
          {
            id: "https://api.wellcomecollection.org/text/alto/b18035723/b18035723_0022.JP2",
            type: "Dataset",
            format: "text/xml",
            profile: "http://www.loc.gov/standards/alto/v3/alto.xsd",
            label: {
              none: ["METS-ALTO XML"],
            },
          },
        ],
        items: [
          {
            id: "https://iiif.wellcomecollection.org/presentation/b18035723/canvases/b18035723_0022.JP2/painting",
            type: "AnnotationPage",
            items: [
              {
                id: "https://iiif.wellcomecollection.org/presentation/b18035723/canvases/b18035723_0022.JP2/painting/anno",
                type: "Annotation",
                motivation: ["painting"],
                target: "https://digirati-co-uk.github.io/wunder/canvases/20",
                body: [
                  {
                    id: "https://iiif.wellcomecollection.org/image/b18035723_0022.JP2/full/732,1024/0/default.jpg",
                    type: "Image",
                    format: "image/jpeg",
                    height: 1024,
                    width: 732,
                    service: [
                      {
                        "@id":
                          "https://iiif.wellcomecollection.org/image/b18035723_0022.JP2",
                        "@type": "ImageService2",
                        profile: "http://iiif.io/api/image/2/level1.json",
                        width: 2411,
                        height: 3372,
                      },
                    ],
                  },
                ],
              },
            ],
          },
        ],
        annotations: [
          {
            id: "https://digirati-co-uk.github.io/wunder/annos/20.json",
            type: "AnnotationPage",
            label: {
              en: ["Text of page 19"],
            },
            items: [],
          },
        ],
      },
      {
        id: "https://digirati-co-uk.github.io/wunder/canvases/21",
        type: "Canvas",
        height: 3372,
        width: 2411,
        label: {
          none: ["20"],
        },
        thumbnail: [
          {
            id: "https://iiif.wellcomecollection.org/thumbs/b18035723_0023.JP2/full/72,100/0/default.jpg",
            type: "Image",
            height: 100,
            width: 72,
            service: [
              {
                "@id":
                  "https://iiif.wellcomecollection.org/thumbs/b18035723_0023.JP2",
                "@type": "ImageService2",
                profile: "http://iiif.io/api/image/2/level0.json",
                width: 732,
                height: 1024,
                sizes: [
                  {
                    width: 72,
                    height: 100,
                  },
                  {
                    width: 143,
                    height: 200,
                  },
                  {
                    width: 286,
                    height: 400,
                  },
                  {
                    width: 732,
                    height: 1024,
                  },
                ],
              },
            ],
          },
        ],
        seeAlso: [
          {
            id: "https://api.wellcomecollection.org/text/alto/b18035723/b18035723_0023.JP2",
            type: "Dataset",
            format: "text/xml",
            profile: "http://www.loc.gov/standards/alto/v3/alto.xsd",
            label: {
              none: ["METS-ALTO XML"],
            },
          },
        ],
        items: [
          {
            id: "https://iiif.wellcomecollection.org/presentation/b18035723/canvases/b18035723_0023.JP2/painting",
            type: "AnnotationPage",
            items: [
              {
                id: "https://iiif.wellcomecollection.org/presentation/b18035723/canvases/b18035723_0023.JP2/painting/anno",
                type: "Annotation",
                motivation: ["painting"],
                target: "https://digirati-co-uk.github.io/wunder/canvases/21",
                body: [
                  {
                    id: "https://iiif.wellcomecollection.org/image/b18035723_0023.JP2/full/732,1024/0/default.jpg",
                    type: "Image",
                    format: "image/jpeg",
                    height: 1024,
                    width: 732,
                    service: [
                      {
                        "@id":
                          "https://iiif.wellcomecollection.org/image/b18035723_0023.JP2",
                        "@type": "ImageService2",
                        profile: "http://iiif.io/api/image/2/level1.json",
                        width: 2411,
                        height: 3372,
                      },
                    ],
                  },
                ],
              },
            ],
          },
        ],
        annotations: [
          {
            id: "https://digirati-co-uk.github.io/wunder/annos/21.json",
            type: "AnnotationPage",
            label: {
              en: ["Text of page 20"],
            },
            items: [],
          },
        ],
      },
      {
        id: "https://digirati-co-uk.github.io/wunder/canvases/22",
        type: "Canvas",
        height: 3372,
        width: 2411,
        label: {
          none: ["21"],
        },
        thumbnail: [
          {
            id: "https://iiif.wellcomecollection.org/thumbs/b18035723_0024.JP2/full/72,100/0/default.jpg",
            type: "Image",
            height: 100,
            width: 72,
            service: [
              {
                "@id":
                  "https://iiif.wellcomecollection.org/thumbs/b18035723_0024.JP2",
                "@type": "ImageService2",
                profile: "http://iiif.io/api/image/2/level0.json",
                width: 732,
                height: 1024,
                sizes: [
                  {
                    width: 72,
                    height: 100,
                  },
                  {
                    width: 143,
                    height: 200,
                  },
                  {
                    width: 286,
                    height: 400,
                  },
                  {
                    width: 732,
                    height: 1024,
                  },
                ],
              },
            ],
          },
        ],
        seeAlso: [
          {
            id: "https://api.wellcomecollection.org/text/alto/b18035723/b18035723_0024.JP2",
            type: "Dataset",
            format: "text/xml",
            profile: "http://www.loc.gov/standards/alto/v3/alto.xsd",
            label: {
              none: ["METS-ALTO XML"],
            },
          },
        ],
        items: [
          {
            id: "https://iiif.wellcomecollection.org/presentation/b18035723/canvases/b18035723_0024.JP2/painting",
            type: "AnnotationPage",
            items: [
              {
                id: "https://iiif.wellcomecollection.org/presentation/b18035723/canvases/b18035723_0024.JP2/painting/anno",
                type: "Annotation",
                motivation: ["painting"],
                target: "https://digirati-co-uk.github.io/wunder/canvases/22",
                body: [
                  {
                    id: "https://iiif.wellcomecollection.org/image/b18035723_0024.JP2/full/732,1024/0/default.jpg",
                    type: "Image",
                    format: "image/jpeg",
                    height: 1024,
                    width: 732,
                    service: [
                      {
                        "@id":
                          "https://iiif.wellcomecollection.org/image/b18035723_0024.JP2",
                        "@type": "ImageService2",
                        profile: "http://iiif.io/api/image/2/level1.json",
                        width: 2411,
                        height: 3372,
                      },
                    ],
                  },
                ],
              },
            ],
          },
        ],
        annotations: [
          {
            id: "https://digirati-co-uk.github.io/wunder/annos/22.json",
            type: "AnnotationPage",
            label: {
              en: ["Text of page 21"],
            },
            items: [],
          },
        ],
      },
      {
        id: "https://digirati-co-uk.github.io/wunder/canvases/23",
        type: "Canvas",
        height: 3372,
        width: 2411,
        label: {
          none: ["22"],
        },
        thumbnail: [
          {
            id: "https://iiif.wellcomecollection.org/thumbs/b18035723_0025.JP2/full/72,100/0/default.jpg",
            type: "Image",
            height: 100,
            width: 72,
            service: [
              {
                "@id":
                  "https://iiif.wellcomecollection.org/thumbs/b18035723_0025.JP2",
                "@type": "ImageService2",
                profile: "http://iiif.io/api/image/2/level0.json",
                width: 732,
                height: 1024,
                sizes: [
                  {
                    width: 72,
                    height: 100,
                  },
                  {
                    width: 143,
                    height: 200,
                  },
                  {
                    width: 286,
                    height: 400,
                  },
                  {
                    width: 732,
                    height: 1024,
                  },
                ],
              },
            ],
          },
        ],
        seeAlso: [
          {
            id: "https://api.wellcomecollection.org/text/alto/b18035723/b18035723_0025.JP2",
            type: "Dataset",
            format: "text/xml",
            profile: "http://www.loc.gov/standards/alto/v3/alto.xsd",
            label: {
              none: ["METS-ALTO XML"],
            },
          },
        ],
        items: [
          {
            id: "https://iiif.wellcomecollection.org/presentation/b18035723/canvases/b18035723_0025.JP2/painting",
            type: "AnnotationPage",
            items: [
              {
                id: "https://iiif.wellcomecollection.org/presentation/b18035723/canvases/b18035723_0025.JP2/painting/anno",
                type: "Annotation",
                motivation: ["painting"],
                target: "https://digirati-co-uk.github.io/wunder/canvases/23",
                body: [
                  {
                    id: "https://iiif.wellcomecollection.org/image/b18035723_0025.JP2/full/732,1024/0/default.jpg",
                    type: "Image",
                    format: "image/jpeg",
                    height: 1024,
                    width: 732,
                    service: [
                      {
                        "@id":
                          "https://iiif.wellcomecollection.org/image/b18035723_0025.JP2",
                        "@type": "ImageService2",
                        profile: "http://iiif.io/api/image/2/level1.json",
                        width: 2411,
                        height: 3372,
                      },
                    ],
                  },
                ],
              },
            ],
          },
        ],
        annotations: [
          {
            id: "https://digirati-co-uk.github.io/wunder/annos/23.json",
            type: "AnnotationPage",
            label: {
              en: ["Text of page 22"],
            },
            items: [],
          },
        ],
      },
      {
        id: "https://digirati-co-uk.github.io/wunder/canvases/24",
        type: "Canvas",
        height: 3372,
        width: 2411,
        label: {
          none: ["23"],
        },
        thumbnail: [
          {
            id: "https://iiif.wellcomecollection.org/thumbs/b18035723_0026.JP2/full/72,100/0/default.jpg",
            type: "Image",
            height: 100,
            width: 72,
            service: [
              {
                "@id":
                  "https://iiif.wellcomecollection.org/thumbs/b18035723_0026.JP2",
                "@type": "ImageService2",
                profile: "http://iiif.io/api/image/2/level0.json",
                width: 732,
                height: 1024,
                sizes: [
                  {
                    width: 72,
                    height: 100,
                  },
                  {
                    width: 143,
                    height: 200,
                  },
                  {
                    width: 286,
                    height: 400,
                  },
                  {
                    width: 732,
                    height: 1024,
                  },
                ],
              },
            ],
          },
        ],
        seeAlso: [
          {
            id: "https://api.wellcomecollection.org/text/alto/b18035723/b18035723_0026.JP2",
            type: "Dataset",
            format: "text/xml",
            profile: "http://www.loc.gov/standards/alto/v3/alto.xsd",
            label: {
              none: ["METS-ALTO XML"],
            },
          },
        ],
        items: [
          {
            id: "https://iiif.wellcomecollection.org/presentation/b18035723/canvases/b18035723_0026.JP2/painting",
            type: "AnnotationPage",
            items: [
              {
                id: "https://iiif.wellcomecollection.org/presentation/b18035723/canvases/b18035723_0026.JP2/painting/anno",
                type: "Annotation",
                motivation: ["painting"],
                target: "https://digirati-co-uk.github.io/wunder/canvases/24",
                body: [
                  {
                    id: "https://iiif.wellcomecollection.org/image/b18035723_0026.JP2/full/732,1024/0/default.jpg",
                    type: "Image",
                    format: "image/jpeg",
                    height: 1024,
                    width: 732,
                    service: [
                      {
                        "@id":
                          "https://iiif.wellcomecollection.org/image/b18035723_0026.JP2",
                        "@type": "ImageService2",
                        profile: "http://iiif.io/api/image/2/level1.json",
                        width: 2411,
                        height: 3372,
                      },
                    ],
                  },
                ],
              },
            ],
          },
        ],
        annotations: [
          {
            id: "https://digirati-co-uk.github.io/wunder/annos/24.json",
            type: "AnnotationPage",
            label: {
              en: ["Text of page 23"],
            },
            items: [],
          },
        ],
      },
      {
        id: "https://digirati-co-uk.github.io/wunder/canvases/25",
        type: "Canvas",
        height: 3372,
        width: 2411,
        label: {
          none: ["24"],
        },
        thumbnail: [
          {
            id: "https://iiif.wellcomecollection.org/thumbs/b18035723_0027.JP2/full/72,100/0/default.jpg",
            type: "Image",
            height: 100,
            width: 72,
            service: [
              {
                "@id":
                  "https://iiif.wellcomecollection.org/thumbs/b18035723_0027.JP2",
                "@type": "ImageService2",
                profile: "http://iiif.io/api/image/2/level0.json",
                width: 732,
                height: 1024,
                sizes: [
                  {
                    width: 72,
                    height: 100,
                  },
                  {
                    width: 143,
                    height: 200,
                  },
                  {
                    width: 286,
                    height: 400,
                  },
                  {
                    width: 732,
                    height: 1024,
                  },
                ],
              },
            ],
          },
        ],
        seeAlso: [
          {
            id: "https://api.wellcomecollection.org/text/alto/b18035723/b18035723_0027.JP2",
            type: "Dataset",
            format: "text/xml",
            profile: "http://www.loc.gov/standards/alto/v3/alto.xsd",
            label: {
              none: ["METS-ALTO XML"],
            },
          },
        ],
        items: [
          {
            id: "https://iiif.wellcomecollection.org/presentation/b18035723/canvases/b18035723_0027.JP2/painting",
            type: "AnnotationPage",
            items: [
              {
                id: "https://iiif.wellcomecollection.org/presentation/b18035723/canvases/b18035723_0027.JP2/painting/anno",
                type: "Annotation",
                motivation: ["painting"],
                target: "https://digirati-co-uk.github.io/wunder/canvases/25",
                body: [
                  {
                    id: "https://iiif.wellcomecollection.org/image/b18035723_0027.JP2/full/732,1024/0/default.jpg",
                    type: "Image",
                    format: "image/jpeg",
                    height: 1024,
                    width: 732,
                    service: [
                      {
                        "@id":
                          "https://iiif.wellcomecollection.org/image/b18035723_0027.JP2",
                        "@type": "ImageService2",
                        profile: "http://iiif.io/api/image/2/level1.json",
                        width: 2411,
                        height: 3372,
                      },
                    ],
                  },
                ],
              },
            ],
          },
        ],
        annotations: [
          {
            id: "https://digirati-co-uk.github.io/wunder/annos/25.json",
            type: "AnnotationPage",
            label: {
              en: ["Text of page 24"],
            },
            items: [],
          },
        ],
      },
      {
        id: "https://digirati-co-uk.github.io/wunder/canvases/26",
        type: "Canvas",
        height: 3372,
        width: 2411,
        label: {
          none: ["25"],
        },
        thumbnail: [
          {
            id: "https://iiif.wellcomecollection.org/thumbs/b18035723_0028.JP2/full/72,100/0/default.jpg",
            type: "Image",
            height: 100,
            width: 72,
            service: [
              {
                "@id":
                  "https://iiif.wellcomecollection.org/thumbs/b18035723_0028.JP2",
                "@type": "ImageService2",
                profile: "http://iiif.io/api/image/2/level0.json",
                width: 732,
                height: 1024,
                sizes: [
                  {
                    width: 72,
                    height: 100,
                  },
                  {
                    width: 143,
                    height: 200,
                  },
                  {
                    width: 286,
                    height: 400,
                  },
                  {
                    width: 732,
                    height: 1024,
                  },
                ],
              },
            ],
          },
        ],
        seeAlso: [
          {
            id: "https://api.wellcomecollection.org/text/alto/b18035723/b18035723_0028.JP2",
            type: "Dataset",
            format: "text/xml",
            profile: "http://www.loc.gov/standards/alto/v3/alto.xsd",
            label: {
              none: ["METS-ALTO XML"],
            },
          },
        ],
        items: [
          {
            id: "https://iiif.wellcomecollection.org/presentation/b18035723/canvases/b18035723_0028.JP2/painting",
            type: "AnnotationPage",
            items: [
              {
                id: "https://iiif.wellcomecollection.org/presentation/b18035723/canvases/b18035723_0028.JP2/painting/anno",
                type: "Annotation",
                motivation: ["painting"],
                target: "https://digirati-co-uk.github.io/wunder/canvases/26",
                body: [
                  {
                    id: "https://iiif.wellcomecollection.org/image/b18035723_0028.JP2/full/732,1024/0/default.jpg",
                    type: "Image",
                    format: "image/jpeg",
                    height: 1024,
                    width: 732,
                    service: [
                      {
                        "@id":
                          "https://iiif.wellcomecollection.org/image/b18035723_0028.JP2",
                        "@type": "ImageService2",
                        profile: "http://iiif.io/api/image/2/level1.json",
                        width: 2411,
                        height: 3372,
                      },
                    ],
                  },
                ],
              },
            ],
          },
        ],
        annotations: [
          {
            id: "https://digirati-co-uk.github.io/wunder/annos/26.json",
            type: "AnnotationPage",
            label: {
              en: ["Text of page 25"],
            },
            items: [],
          },
        ],
      },
      {
        id: "https://digirati-co-uk.github.io/wunder/canvases/27",
        type: "Canvas",
        height: 3372,
        width: 2411,
        label: {
          none: ["26"],
        },
        thumbnail: [
          {
            id: "https://iiif.wellcomecollection.org/thumbs/b18035723_0029.JP2/full/72,100/0/default.jpg",
            type: "Image",
            height: 100,
            width: 72,
            service: [
              {
                "@id":
                  "https://iiif.wellcomecollection.org/thumbs/b18035723_0029.JP2",
                "@type": "ImageService2",
                profile: "http://iiif.io/api/image/2/level0.json",
                width: 732,
                height: 1024,
                sizes: [
                  {
                    width: 72,
                    height: 100,
                  },
                  {
                    width: 143,
                    height: 200,
                  },
                  {
                    width: 286,
                    height: 400,
                  },
                  {
                    width: 732,
                    height: 1024,
                  },
                ],
              },
            ],
          },
        ],
        seeAlso: [
          {
            id: "https://api.wellcomecollection.org/text/alto/b18035723/b18035723_0029.JP2",
            type: "Dataset",
            format: "text/xml",
            profile: "http://www.loc.gov/standards/alto/v3/alto.xsd",
            label: {
              none: ["METS-ALTO XML"],
            },
          },
        ],
        items: [
          {
            id: "https://iiif.wellcomecollection.org/presentation/b18035723/canvases/b18035723_0029.JP2/painting",
            type: "AnnotationPage",
            items: [
              {
                id: "https://iiif.wellcomecollection.org/presentation/b18035723/canvases/b18035723_0029.JP2/painting/anno",
                type: "Annotation",
                motivation: ["painting"],
                target: "https://digirati-co-uk.github.io/wunder/canvases/27",
                body: [
                  {
                    id: "https://iiif.wellcomecollection.org/image/b18035723_0029.JP2/full/732,1024/0/default.jpg",
                    type: "Image",
                    format: "image/jpeg",
                    height: 1024,
                    width: 732,
                    service: [
                      {
                        "@id":
                          "https://iiif.wellcomecollection.org/image/b18035723_0029.JP2",
                        "@type": "ImageService2",
                        profile: "http://iiif.io/api/image/2/level1.json",
                        width: 2411,
                        height: 3372,
                      },
                    ],
                  },
                ],
              },
            ],
          },
        ],
        annotations: [
          {
            id: "https://digirati-co-uk.github.io/wunder/annos/27.json",
            type: "AnnotationPage",
            label: {
              en: ["Text of page 26"],
            },
            items: [],
          },
        ],
      },
      {
        id: "https://digirati-co-uk.github.io/wunder/canvases/28",
        type: "Canvas",
        height: 3372,
        width: 2411,
        label: {
          none: ["27"],
        },
        thumbnail: [
          {
            id: "https://iiif.wellcomecollection.org/thumbs/b18035723_0030.JP2/full/72,100/0/default.jpg",
            type: "Image",
            height: 100,
            width: 72,
            service: [
              {
                "@id":
                  "https://iiif.wellcomecollection.org/thumbs/b18035723_0030.JP2",
                "@type": "ImageService2",
                profile: "http://iiif.io/api/image/2/level0.json",
                width: 732,
                height: 1024,
                sizes: [
                  {
                    width: 72,
                    height: 100,
                  },
                  {
                    width: 143,
                    height: 200,
                  },
                  {
                    width: 286,
                    height: 400,
                  },
                  {
                    width: 732,
                    height: 1024,
                  },
                ],
              },
            ],
          },
        ],
        seeAlso: [
          {
            id: "https://api.wellcomecollection.org/text/alto/b18035723/b18035723_0030.JP2",
            type: "Dataset",
            format: "text/xml",
            profile: "http://www.loc.gov/standards/alto/v3/alto.xsd",
            label: {
              none: ["METS-ALTO XML"],
            },
          },
        ],
        items: [
          {
            id: "https://iiif.wellcomecollection.org/presentation/b18035723/canvases/b18035723_0030.JP2/painting",
            type: "AnnotationPage",
            items: [
              {
                id: "https://iiif.wellcomecollection.org/presentation/b18035723/canvases/b18035723_0030.JP2/painting/anno",
                type: "Annotation",
                motivation: ["painting"],
                target: "https://digirati-co-uk.github.io/wunder/canvases/28",
                body: [
                  {
                    id: "https://iiif.wellcomecollection.org/image/b18035723_0030.JP2/full/732,1024/0/default.jpg",
                    type: "Image",
                    format: "image/jpeg",
                    height: 1024,
                    width: 732,
                    service: [
                      {
                        "@id":
                          "https://iiif.wellcomecollection.org/image/b18035723_0030.JP2",
                        "@type": "ImageService2",
                        profile: "http://iiif.io/api/image/2/level1.json",
                        width: 2411,
                        height: 3372,
                      },
                    ],
                  },
                ],
              },
            ],
          },
        ],
        annotations: [
          {
            id: "https://digirati-co-uk.github.io/wunder/annos/28.json",
            type: "AnnotationPage",
            label: {
              en: ["Text of page 27"],
            },
            items: [],
          },
        ],
      },
      {
        id: "https://digirati-co-uk.github.io/wunder/canvases/29",
        type: "Canvas",
        height: 3372,
        width: 2411,
        label: {
          none: ["28"],
        },
        thumbnail: [
          {
            id: "https://iiif.wellcomecollection.org/thumbs/b18035723_0031.JP2/full/72,100/0/default.jpg",
            type: "Image",
            height: 100,
            width: 72,
            service: [
              {
                "@id":
                  "https://iiif.wellcomecollection.org/thumbs/b18035723_0031.JP2",
                "@type": "ImageService2",
                profile: "http://iiif.io/api/image/2/level0.json",
                width: 732,
                height: 1024,
                sizes: [
                  {
                    width: 72,
                    height: 100,
                  },
                  {
                    width: 143,
                    height: 200,
                  },
                  {
                    width: 286,
                    height: 400,
                  },
                  {
                    width: 732,
                    height: 1024,
                  },
                ],
              },
            ],
          },
        ],
        seeAlso: [
          {
            id: "https://api.wellcomecollection.org/text/alto/b18035723/b18035723_0031.JP2",
            type: "Dataset",
            format: "text/xml",
            profile: "http://www.loc.gov/standards/alto/v3/alto.xsd",
            label: {
              none: ["METS-ALTO XML"],
            },
          },
        ],
        items: [
          {
            id: "https://iiif.wellcomecollection.org/presentation/b18035723/canvases/b18035723_0031.JP2/painting",
            type: "AnnotationPage",
            items: [
              {
                id: "https://iiif.wellcomecollection.org/presentation/b18035723/canvases/b18035723_0031.JP2/painting/anno",
                type: "Annotation",
                motivation: ["painting"],
                target: "https://digirati-co-uk.github.io/wunder/canvases/29",
                body: [
                  {
                    id: "https://iiif.wellcomecollection.org/image/b18035723_0031.JP2/full/732,1024/0/default.jpg",
                    type: "Image",
                    format: "image/jpeg",
                    height: 1024,
                    width: 732,
                    service: [
                      {
                        "@id":
                          "https://iiif.wellcomecollection.org/image/b18035723_0031.JP2",
                        "@type": "ImageService2",
                        profile: "http://iiif.io/api/image/2/level1.json",
                        width: 2411,
                        height: 3372,
                      },
                    ],
                  },
                ],
              },
            ],
          },
        ],
        annotations: [
          {
            id: "https://digirati-co-uk.github.io/wunder/annos/29.json",
            type: "AnnotationPage",
            label: {
              en: ["Text of page 28"],
            },
            items: [],
          },
        ],
      },
      {
        id: "https://digirati-co-uk.github.io/wunder/canvases/30",
        type: "Canvas",
        height: 3372,
        width: 2411,
        label: {
          none: ["29"],
        },
        thumbnail: [
          {
            id: "https://iiif.wellcomecollection.org/thumbs/b18035723_0032.JP2/full/72,100/0/default.jpg",
            type: "Image",
            height: 100,
            width: 72,
            service: [
              {
                "@id":
                  "https://iiif.wellcomecollection.org/thumbs/b18035723_0032.JP2",
                "@type": "ImageService2",
                profile: "http://iiif.io/api/image/2/level0.json",
                width: 732,
                height: 1024,
                sizes: [
                  {
                    width: 72,
                    height: 100,
                  },
                  {
                    width: 143,
                    height: 200,
                  },
                  {
                    width: 286,
                    height: 400,
                  },
                  {
                    width: 732,
                    height: 1024,
                  },
                ],
              },
            ],
          },
        ],
        seeAlso: [
          {
            id: "https://api.wellcomecollection.org/text/alto/b18035723/b18035723_0032.JP2",
            type: "Dataset",
            format: "text/xml",
            profile: "http://www.loc.gov/standards/alto/v3/alto.xsd",
            label: {
              none: ["METS-ALTO XML"],
            },
          },
        ],
        items: [
          {
            id: "https://iiif.wellcomecollection.org/presentation/b18035723/canvases/b18035723_0032.JP2/painting",
            type: "AnnotationPage",
            items: [
              {
                id: "https://iiif.wellcomecollection.org/presentation/b18035723/canvases/b18035723_0032.JP2/painting/anno",
                type: "Annotation",
                motivation: ["painting"],
                target: "https://digirati-co-uk.github.io/wunder/canvases/30",
                body: [
                  {
                    id: "https://iiif.wellcomecollection.org/image/b18035723_0032.JP2/full/732,1024/0/default.jpg",
                    type: "Image",
                    format: "image/jpeg",
                    height: 1024,
                    width: 732,
                    service: [
                      {
                        "@id":
                          "https://iiif.wellcomecollection.org/image/b18035723_0032.JP2",
                        "@type": "ImageService2",
                        profile: "http://iiif.io/api/image/2/level1.json",
                        width: 2411,
                        height: 3372,
                      },
                    ],
                  },
                ],
              },
            ],
          },
        ],
        annotations: [
          {
            id: "https://digirati-co-uk.github.io/wunder/annos/30.json",
            type: "AnnotationPage",
            label: {
              en: ["Text of page 29"],
            },
            items: [],
          },
        ],
      },
      {
        id: "https://digirati-co-uk.github.io/wunder/canvases/31",
        type: "Canvas",
        height: 3372,
        width: 2411,
        label: {
          none: ["30"],
        },
        thumbnail: [
          {
            id: "https://iiif.wellcomecollection.org/thumbs/b18035723_0033.JP2/full/72,100/0/default.jpg",
            type: "Image",
            height: 100,
            width: 72,
            service: [
              {
                "@id":
                  "https://iiif.wellcomecollection.org/thumbs/b18035723_0033.JP2",
                "@type": "ImageService2",
                profile: "http://iiif.io/api/image/2/level0.json",
                width: 732,
                height: 1024,
                sizes: [
                  {
                    width: 72,
                    height: 100,
                  },
                  {
                    width: 143,
                    height: 200,
                  },
                  {
                    width: 286,
                    height: 400,
                  },
                  {
                    width: 732,
                    height: 1024,
                  },
                ],
              },
            ],
          },
        ],
        seeAlso: [
          {
            id: "https://api.wellcomecollection.org/text/alto/b18035723/b18035723_0033.JP2",
            type: "Dataset",
            format: "text/xml",
            profile: "http://www.loc.gov/standards/alto/v3/alto.xsd",
            label: {
              none: ["METS-ALTO XML"],
            },
          },
        ],
        items: [
          {
            id: "https://iiif.wellcomecollection.org/presentation/b18035723/canvases/b18035723_0033.JP2/painting",
            type: "AnnotationPage",
            items: [
              {
                id: "https://iiif.wellcomecollection.org/presentation/b18035723/canvases/b18035723_0033.JP2/painting/anno",
                type: "Annotation",
                motivation: ["painting"],
                target: "https://digirati-co-uk.github.io/wunder/canvases/31",
                body: [
                  {
                    id: "https://iiif.wellcomecollection.org/image/b18035723_0033.JP2/full/732,1024/0/default.jpg",
                    type: "Image",
                    format: "image/jpeg",
                    height: 1024,
                    width: 732,
                    service: [
                      {
                        "@id":
                          "https://iiif.wellcomecollection.org/image/b18035723_0033.JP2",
                        "@type": "ImageService2",
                        profile: "http://iiif.io/api/image/2/level1.json",
                        width: 2411,
                        height: 3372,
                      },
                    ],
                  },
                ],
              },
            ],
          },
        ],
        annotations: [
          {
            id: "https://digirati-co-uk.github.io/wunder/annos/31.json",
            type: "AnnotationPage",
            label: {
              en: ["Text of page 30"],
            },
            items: [],
          },
        ],
      },
      {
        id: "https://digirati-co-uk.github.io/wunder/canvases/32",
        type: "Canvas",
        height: 3372,
        width: 2411,
        label: {
          none: ["31"],
        },
        thumbnail: [
          {
            id: "https://iiif.wellcomecollection.org/thumbs/b18035723_0034.JP2/full/72,100/0/default.jpg",
            type: "Image",
            height: 100,
            width: 72,
            service: [
              {
                "@id":
                  "https://iiif.wellcomecollection.org/thumbs/b18035723_0034.JP2",
                "@type": "ImageService2",
                profile: "http://iiif.io/api/image/2/level0.json",
                width: 732,
                height: 1024,
                sizes: [
                  {
                    width: 72,
                    height: 100,
                  },
                  {
                    width: 143,
                    height: 200,
                  },
                  {
                    width: 286,
                    height: 400,
                  },
                  {
                    width: 732,
                    height: 1024,
                  },
                ],
              },
            ],
          },
        ],
        seeAlso: [
          {
            id: "https://api.wellcomecollection.org/text/alto/b18035723/b18035723_0034.JP2",
            type: "Dataset",
            format: "text/xml",
            profile: "http://www.loc.gov/standards/alto/v3/alto.xsd",
            label: {
              none: ["METS-ALTO XML"],
            },
          },
        ],
        items: [
          {
            id: "https://iiif.wellcomecollection.org/presentation/b18035723/canvases/b18035723_0034.JP2/painting",
            type: "AnnotationPage",
            items: [
              {
                id: "https://iiif.wellcomecollection.org/presentation/b18035723/canvases/b18035723_0034.JP2/painting/anno",
                type: "Annotation",
                motivation: ["painting"],
                target: "https://digirati-co-uk.github.io/wunder/canvases/32",
                body: [
                  {
                    id: "https://iiif.wellcomecollection.org/image/b18035723_0034.JP2/full/732,1024/0/default.jpg",
                    type: "Image",
                    format: "image/jpeg",
                    height: 1024,
                    width: 732,
                    service: [
                      {
                        "@id":
                          "https://iiif.wellcomecollection.org/image/b18035723_0034.JP2",
                        "@type": "ImageService2",
                        profile: "http://iiif.io/api/image/2/level1.json",
                        width: 2411,
                        height: 3372,
                      },
                    ],
                  },
                ],
              },
            ],
          },
        ],
        annotations: [
          {
            id: "https://digirati-co-uk.github.io/wunder/annos/32.json",
            type: "AnnotationPage",
            label: {
              en: ["Text of page 31"],
            },
            items: [],
          },
        ],
      },
      {
        id: "https://digirati-co-uk.github.io/wunder/canvases/33",
        type: "Canvas",
        height: 3372,
        width: 2411,
        label: {
          none: ["-"],
        },
        thumbnail: [
          {
            id: "https://iiif.wellcomecollection.org/thumbs/b18035723_0035.JP2/full/72,100/0/default.jpg",
            type: "Image",
            height: 100,
            width: 72,
            service: [
              {
                "@id":
                  "https://iiif.wellcomecollection.org/thumbs/b18035723_0035.JP2",
                "@type": "ImageService2",
                profile: "http://iiif.io/api/image/2/level0.json",
                width: 732,
                height: 1024,
                sizes: [
                  {
                    width: 72,
                    height: 100,
                  },
                  {
                    width: 143,
                    height: 200,
                  },
                  {
                    width: 286,
                    height: 400,
                  },
                  {
                    width: 732,
                    height: 1024,
                  },
                ],
              },
            ],
          },
        ],
        seeAlso: [
          {
            id: "https://api.wellcomecollection.org/text/alto/b18035723/b18035723_0035.JP2",
            type: "Dataset",
            format: "text/xml",
            profile: "http://www.loc.gov/standards/alto/v3/alto.xsd",
            label: {
              none: ["METS-ALTO XML"],
            },
          },
        ],
        items: [
          {
            id: "https://iiif.wellcomecollection.org/presentation/b18035723/canvases/b18035723_0035.JP2/painting",
            type: "AnnotationPage",
            items: [
              {
                id: "https://iiif.wellcomecollection.org/presentation/b18035723/canvases/b18035723_0035.JP2/painting/anno",
                type: "Annotation",
                motivation: ["painting"],
                target: "https://digirati-co-uk.github.io/wunder/canvases/33",
                body: [
                  {
                    id: "https://iiif.wellcomecollection.org/image/b18035723_0035.JP2/full/732,1024/0/default.jpg",
                    type: "Image",
                    format: "image/jpeg",
                    height: 1024,
                    width: 732,
                    service: [
                      {
                        "@id":
                          "https://iiif.wellcomecollection.org/image/b18035723_0035.JP2",
                        "@type": "ImageService2",
                        profile: "http://iiif.io/api/image/2/level1.json",
                        width: 2411,
                        height: 3372,
                      },
                    ],
                  },
                ],
              },
            ],
          },
        ],
        annotations: [
          {
            id: "https://digirati-co-uk.github.io/wunder/annos/33.json",
            type: "AnnotationPage",
            label: {
              en: ["Text of page  -"],
            },
            items: [],
          },
        ],
      },
      {
        id: "https://digirati-co-uk.github.io/wunder/canvases/34",
        type: "Canvas",
        height: 3372,
        width: 2411,
        label: {
          none: ["-"],
        },
        thumbnail: [
          {
            id: "https://iiif.wellcomecollection.org/thumbs/b18035723_0036.JP2/full/72,100/0/default.jpg",
            type: "Image",
            height: 100,
            width: 72,
            service: [
              {
                "@id":
                  "https://iiif.wellcomecollection.org/thumbs/b18035723_0036.JP2",
                "@type": "ImageService2",
                profile: "http://iiif.io/api/image/2/level0.json",
                width: 732,
                height: 1024,
                sizes: [
                  {
                    width: 72,
                    height: 100,
                  },
                  {
                    width: 143,
                    height: 200,
                  },
                  {
                    width: 286,
                    height: 400,
                  },
                  {
                    width: 732,
                    height: 1024,
                  },
                ],
              },
            ],
          },
        ],
        seeAlso: [
          {
            id: "https://api.wellcomecollection.org/text/alto/b18035723/b18035723_0036.JP2",
            type: "Dataset",
            format: "text/xml",
            profile: "http://www.loc.gov/standards/alto/v3/alto.xsd",
            label: {
              none: ["METS-ALTO XML"],
            },
          },
        ],
        items: [
          {
            id: "https://iiif.wellcomecollection.org/presentation/b18035723/canvases/b18035723_0036.JP2/painting",
            type: "AnnotationPage",
            items: [
              {
                id: "https://iiif.wellcomecollection.org/presentation/b18035723/canvases/b18035723_0036.JP2/painting/anno",
                type: "Annotation",
                motivation: ["painting"],
                target: "https://digirati-co-uk.github.io/wunder/canvases/34",
                body: [
                  {
                    id: "https://iiif.wellcomecollection.org/image/b18035723_0036.JP2/full/732,1024/0/default.jpg",
                    type: "Image",
                    format: "image/jpeg",
                    height: 1024,
                    width: 732,
                    service: [
                      {
                        "@id":
                          "https://iiif.wellcomecollection.org/image/b18035723_0036.JP2",
                        "@type": "ImageService2",
                        profile: "http://iiif.io/api/image/2/level1.json",
                        width: 2411,
                        height: 3372,
                      },
                    ],
                  },
                ],
              },
            ],
          },
        ],
        annotations: [
          {
            id: "https://digirati-co-uk.github.io/wunder/annos/34.json",
            type: "AnnotationPage",
            label: {
              en: ["Text of page  -"],
            },
            items: [],
          },
        ],
      },
      {
        id: "https://digirati-co-uk.github.io/wunder/canvases/35",
        type: "Canvas",
        height: 3040,
        width: 2231,
        label: {
          none: ["-"],
        },
        thumbnail: [
          {
            id: "https://iiif.wellcomecollection.org/thumbs/b18035723_0002.JP2/full/73,100/0/default.jpg",
            type: "Image",
            height: 100,
            width: 73,
            service: [
              {
                "@id":
                  "https://iiif.wellcomecollection.org/thumbs/b18035723_0002.JP2",
                "@type": "ImageService2",
                profile: "http://iiif.io/api/image/2/level0.json",
                width: 751,
                height: 1024,
                sizes: [
                  {
                    width: 73,
                    height: 100,
                  },
                  {
                    width: 147,
                    height: 200,
                  },
                  {
                    width: 294,
                    height: 400,
                  },
                  {
                    width: 751,
                    height: 1024,
                  },
                ],
              },
            ],
          },
        ],
        seeAlso: [
          {
            id: "https://api.wellcomecollection.org/text/alto/b18035723/b18035723_0002.JP2",
            type: "Dataset",
            format: "text/xml",
            profile: "http://www.loc.gov/standards/alto/v3/alto.xsd",
            label: {
              none: ["METS-ALTO XML"],
            },
          },
        ],
        items: [
          {
            id: "https://iiif.wellcomecollection.org/presentation/b18035723/canvases/b18035723_0002.JP2/painting",
            type: "AnnotationPage",
            items: [
              {
                id: "https://iiif.wellcomecollection.org/presentation/b18035723/canvases/b18035723_0002.JP2/painting/anno",
                type: "Annotation",
                motivation: ["painting"],
                target: "https://digirati-co-uk.github.io/wunder/canvases/35",
                body: [
                  {
                    id: "https://iiif.wellcomecollection.org/image/b18035723_0002.JP2/full/751,1024/0/default.jpg",
                    type: "Image",
                    format: "image/jpeg",
                    height: 1024,
                    width: 751,
                    service: [
                      {
                        "@id":
                          "https://iiif.wellcomecollection.org/image/b18035723_0002.JP2",
                        "@type": "ImageService2",
                        profile: "http://iiif.io/api/image/2/level1.json",
                        width: 2231,
                        height: 3040,
                      },
                    ],
                  },
                ],
              },
            ],
          },
        ],
        annotations: [
          {
            id: "https://digirati-co-uk.github.io/wunder/annos/35.json",
            type: "AnnotationPage",
            label: {
              en: ["Text of page  -"],
            },
            items: [],
          },
        ],
      },
    ],
    structures: [
      {
        id: "https://iiif.wellcomecollection.org/presentation/b18035723/ranges/LOG_0001",
        type: "Range",
        label: {
          none: ["Front Cover"],
        },
        items: [
          {
            id: "https://iiif.wellcomecollection.org/presentation/b18035723/canvases/b18035723_0001.JP2",
            type: "Canvas",
          },
        ],
      },
      {
        id: "https://iiif.wellcomecollection.org/presentation/b18035723/ranges/LOG_0003",
        type: "Range",
        label: {
          none: ["Title Page"],
        },
        items: [
          {
            id: "https://iiif.wellcomecollection.org/presentation/b18035723/canvases/b18035723_0004.JP2",
            type: "Canvas",
          },
        ],
      },
      {
        id: "https://iiif.wellcomecollection.org/presentation/b18035723/ranges/LOG_0002",
        type: "Range",
        label: {
          none: ["Back Cover"],
        },
        items: [
          {
            id: "https://iiif.wellcomecollection.org/presentation/b18035723/canvases/b18035723_0002.JP2",
            type: "Canvas",
          },
        ],
      },
    ],
  },
];
