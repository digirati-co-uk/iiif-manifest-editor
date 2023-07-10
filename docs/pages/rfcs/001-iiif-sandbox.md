# IIIF Sandbox

## The problem

When editing a IIIF manifest, you need to see it working in viewers like Mirador, UV, or custom viewing environments. While we can (and should) extend some of these viewers to accept a blob of JSON data in a request, or via postMessage, so that the Manifest Editor can save data for preview, this won't be possible for every viewer everywhere.

Instead, the manifest needs to be hosted somewhere so it can be loaded by a viewer over HTTP.

![image](https://user-images.githubusercontent.com/1443575/151345653-774665de-0e15-4ca2-b1d6-ecad1e7698ea.png)

You can do this by:

 - checking it into GitHub and hosting in gh-pages
 - running a local web server, saving the file from the browser to local disk, and serving on localhost
 - POSTing the manifest to some configured endpoint that will accept it and host it

The GitHub route is great but is subject to caching delays which quickly get annoying. Plus you need a GitHub account.
The local web server is great for developers but an extra overhead for casual users or a training context.
The last of these is one of the integration mechanisms manifest editor will support; institutions can implement their own endpoints to integrate with their own CMS, storage, or whatever.

This RFC proposes a variant of the third that is always available to all users of the manifest editor, and is used for previewing - even if you have the first and/or second mechanisms above, you might not want to have to commit, or push to storage, every time you want to check on your work in the editor.

It's a service that **any client, anywhere** can POST a IIIF manifest to, so that the manifest is available on the public web, over https, with the necessary CORS headers.

## Background discussions

 - https://github.com/digirati-co-uk/iiif-manifest-editor/issues/1
 - https://github.com/digirati-co-uk/iiif-manifest-editor/discussions/3

## Proposal

`iiif-sandbox.digirati.io`

The Manifest Editor has a built-in integration with this service.

The exact technical implementation depends on platform. It is likely to be an AWS lambda + public (read) S3 bucket, or a Cloudflare worker + R2 storage.

Any client (not just the manifest editor) can POST a IIIF Manifest payload (i.e., a JSON body) to the `/store` endpoint:

```
POST /store HTTP/1.1
Host: iiif-sandbox.digirati.io
Content-Type: application/json

{
  "id": <original-id>,
  // rest of valid IIIF manifest
}
```

There is no access control of any kind on this request, anyone can post.

The request is handled by a worker/lambda or whatever serverless equivalent. This is written in JavaScript to take advantage of the Vault component, below.
The worker will mint three identifiers. It's an implementation decision how it does this - e.g., to avoid any need for DB storage, these identifiers could be 2-way encrypted (not hashes) - you can obtain either of them from the other, if in possession of a secret. The worker is in possession of this secret but clients are not. Or the service could be a KV store that allows lookup by these identifiers.


The worker:

1. Validate that the content is below the configured size threshold
1. Validates that the content is valid JSON (parse it into a JS object)
2. Loads the object into an instance of Vault (https://iiif-canvas-panel.netlify.app/docs/components/vault) - if it succeeds, it's a valid manifest.
3. If either 1, 2 or 3 fail, return a 400 Bad Request, with a JSON body `{ "error": "Bad Request" }` (we can expand on that later)
4. If it was successfully loaded into vault, mint the *manifest* identifier. This is like a Google doc link - an unguessable long string.
5. Replace the `id` of the manifest in the uploaded JSON with `https://iiif-sandbox.digirati.io/p3/<manifest-identifier>.json`. The /p3/ path reserves a "namespace" for future versions.
6. Add or update a custom service block in the manifest that stores the `<original-id>` (see note "Storing the original ID" below)
6. Store the manifest in the publicly read-only bucket, where it will be available at that address. The bucket policy adds the `Access-Control-Allow-Origin: *` header.
7. From the manifest identifier, mint the *update* identifier.
8. Return an HTTP 201 Created response, with the `Location` header set to the manifest location address - the new manifest `id`. The body of the response looks like this: 

```
{
    "location": "https://iiif-sandbox.digirati.io/p3/<manifest-identifier>.json",
    "updateLocation": "https://iiif-sandbox.digirati.io/update/<update-identifier>",  
    "deleteLocation": "https://iiif-preview.stephen.wf/delete/<delete-identifier>",
    "expirationTtl": 172800
}
```

* Location - This is the URL to your manifest
* Update location - PUT to this with new Body, you get back the same as above with a new Update location (this rotates, acts like an E-Tag)
* Delete location - This will be stable, unlike the update location which could change. You can DELETE to either the latest update endpoint or this delete location
* Expiration TTL - This is a TTL (currently 48-hours)

Note that `<update-identifier>` and `<delete-identifier>` might be multiple path segments, because an implementation decision might result in something that looks like this:

```
{
    "location": "https://iiif-sandbox.digirati.io/p3/mmmm.json",
    "updateLocation": "https://iiif-sandbox.digirati.io/update/u1u1",  
    "deleteLocation": "https://iiif-preview.stephen.wf/delete/d1d1",
    "expirationTtl": 172800
}
```

or something that looks like this, that includes the original minted manifest ID as a path segment in the update and delete locations:

```
{
    "location": "https://iiif-sandbox.digirati.io/p3/mmmm.json",
    "updateLocation": "https://iiif-sandbox.digirati.io/update/mmmm/u2u2",  
    "deleteLocation": "https://iiif-preview.stephen.wf/delete/mmmm/d2d2",
    "expirationTtl": 172800
}
```

The client just treats these as resource URLs whatever their shape. The important thing is that you can't guess the update and delete URLs from the manifest URL, and that the client - and the user - keeps the update and delete URLs secret, unless some special use case is OK with them being known. The Manifest URL is the one more likely to be shared, by far! 

It's up to the client application what they do with this returned information. The manifest will be available immediately at `https://iiif-sandbox.digirati.io/p3/<manifest-identifier>.json`.

If anyone POSTs to `https://iiif-sandbox.digirati.io/update/<update-identifier>`, the following happens:

```
POST /update/<update-identifier> HTTP/1.1
Host: iiif-sandbox.digirati.io
Content-Type: application/json

{
  "id": <original-id>,
  // rest of valid IIIF manifest
}
```

1. The worker extracts the `<update-identifier>` and determines the corresponding `<manifest-identifier>`.
2. If this doesn't work, return the Bad Request error.
3. Validate by performing steps 1, 2 and 3 above. 
4. If invalid, return the Bad Request error.
5. If valid, replace the `id` of the manifest in the uploaded JSON with `https://iiif-sandbox.digirati.io/p3/<manifest-identifier>.json`. 
6. Add or update a custom service block in the manifest that stores the `<original-id>`.
5. **Overwrite** the JSON stored at `/p3/<manifest-identifier>.json` with the new JSON
6. Return the same 201 Created response body as before.


## Considerations

### Storing the original ID

The client uploads a manifest like:

```
{
  "id": <original-id>,
  // rest of valid IIIF manifest
}
```

It would be useful for the value of `<original-id>` to be stored in the manifest; the client might need it when it comes to "properly" persist the manifest to their own storage, or when re-opening the manifest from the sandbox. It gets stored like this:

```
  ... ,
  "seeAlso": [
    // any existing seeAlsos ,
    {
      "id": "<original-id>",
      "type": "Manifest",
      "profile": "https://iiif-sandbox.digirati.io/original-id"
    }
  ],
  ...
```


### Maximum size

100KB? 100KB when gzipped? Be generous at first, wait and see...

### Encryption and appearance of IDs

The `<manifest-id>` should be something like a Google Doc id - security through obscurity, unguessable:

```
https://iiif-sandbox.digirati.io/p3/qhLkGfWtxQ80dZF4FVBnkHE27AKXoCKo1.json
```

This is what is public and shared. There's no reason why the minting algorithm can't be open; we can demonstrate that it produces _effectively_ unguessable strings. Ultimately, this service is used at the user's risk. People can see the minting, encryption and decryption code and see that it is fit for purpose for this use case, but still, this is not to be used as a password manager or other high-security storage.

The update token is derived from this token, so is likely to be longer:

```
https://iiif-sandbox.digirati.io/update/0dZF4FdZF4FVBnkHE27AKXoCKo1nkHVBxQ80dZF4FVBnkHE27AKXoCKo1nkHqhLkGfWt.json

// or 

https://iiif-sandbox.digirati.io/update/qhLkGfWtxQ80dZF4FVBnkHE27AKXoCKo1/80dZF4FVBnkHE27AKXoCKo1nkHqhLkGfWt.json
```

It's up to the client to keep this secret, if they want it to be secret (you can imagine scenarios where it's shared just like a public Google doc).

### Abuse

Anyone can post to this. But it won't get hosted if it's above a certain size, or not JSON. It also needs to be parseable by Vault - which isn't quite the same as a valid manifest. You could, for example, host this:

```
{
    "@context": "http://iiif.io/api/presentation/3/context.json", 
    "id": "my-id",
    "type": "Manifest"
}
```

... a just-started, WIP manifest. 

But you can't host images, videos, arbitrary docs. The worker gateway insists that it's a manifest (or later a collection), which makes the oppurtunity for abuse a lot less.

# Preview Expiry

In the earlier example the server set a default expiry of 48 hrs:

```
    "expirationTtl": 172800
```

This is an implemenation decision. If implemented as lambda+S3 it might not be worth having any expiry, but if KV store, it could be.

The Manifest Editor should be aware of the TTL set and inform the user. The preview button and its dropdown are set from config, with the direct button press being the same as the first item in the dropdown (see https://github.com/digirati-co-uk/iiif-manifest-editor/wiki/Preview).

The preview mechanism (for the purposes of this RFC) is a series of format strings - that tell the Manifest Editor where to insert manifest URIs. E.g.,

```json
//... lots of other config,
"preview": [
  {
    "label": "Universal Viewer",
    "mechanism": "previewService",
    "template": "https://universalviewer.io/examples/#?manifest={iiifResource}" 
  },
  {
    "label": "Ocean Liners",
    "mechanism": "previewService",
    "template": "https://canvas-panel.digirati.com/#/examples/fullpage?manifest={iiifResource}" 
  },
  {
    "label": "Raw Manifest",
    "mechanism": "previewService",
    "template": "{iiifResource}" 
  }
],
// more config...
```

When clicking the preview button or an option from the drop down, the Manifest Editor:

1. Pushes the current Manifest to the preview service
2. If any errors, show message and abort
3. Once it has a reponse with a ttl, open a new window on the formatted template string, replacing {iiifResource} with the URL
4. Using a non-modal alert (e.g., a bar) message the user that the link will expire in xxx hrs.
5. Include a "don't show again" in this bar.


# Preview and Permalink POSTboxes

The above examples use /store which is good for a default implementation. However, we can, instaed of /store (or as well as), have:

```
/preview
/permalink
```

The difference here is that /preview will impose an expiry, a TTL, whereas /permalink will not - the resource will be available at that URL indefinitely.

This means that the IIIF Sandbox service can also be used in the Save menu, as described in [Saving IIIF](https://github.com/digirati-co-uk/iiif-manifest-editor/wiki/Saving-IIIF)

`/store` should always be available, in which case it's up to the server whether it sets a TTL.

`/preview` and `/permalink` are also available in our version, for explicitness - Preview menu vs Save menu. In our case, /store is an alias for /preview.

For all three variants there's no difference in the Manifest URL generated - it's still 
`https://iiif-sandbox.digirati.io/p3/qhLkGfWtxQ80dZF4FVBnkHE27AKXoCKo1.json` or similar.



## Implementation options

 - With cloudflare R2 and workers the running costs might even be free - "R2 will zero-rate infrequent storage operations under a threshold — currently planned to be in the single digit requests per second range." However this is still a private alpha.
 - AWS Lambda and S3 is probably easiest for us to just use, especially with a digirati.io address and cert.
 - Cloudflare KV is another option
 
