# IIIF Sandbox

## The problem

When editing a IIIF manifest, you need to see it working in viewers like Mirador, UV, or custom viewing environments. While we can (and should) extend some of these viewers to accept a blob of JSON data in a request, or via postMessage, so that the Manifest Editor can save data for preview, this won't be possible for every viewer everywhere.

Instead, the manifest needs to be hosted somewhere so it can be loaded by a viewer over HTTP.

You can do this by:

 - checking it into GitHub and hosting in gh-pages
 - running a local web server, saving the file from the browser to local disk, and serving on localhost
 - POSTing the manifest to some configured endpoint that will accept it and host it

The GitHub route is great but is subject to caching delays which quickly get annoying. Plus you need a GitHub account.
The local web server is great for developers but an extra overhead for casual users or a training context.
The last of these is one of the integration mechanisms manifest editor will support; institutions can implement their own endpoints to integrate with their own CMS, storage, or whatever.

This RFC proposes a variant of the third that is always available to all users of the manifest editor, and is used for previewing - even if you have the first and/or second mechanisms above, you might not want to have to commit, or push to storage, every time you want to check on your work in the editor.

It's a service that **any clien, anywhere** can POST a IIIF manifest to, so that the manifest is available on the public web, over https, with the necessary CORS headers.

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
  "id": <anything>,
  // rest of valid IIIF manifest
}
```

There is no access control of any kind on this request, anyone can post.

The request is handled by a worker/lambda or whatever serverless equivalent. This is written in JavaScript to take advantage of the Vault component, below.
The worker will mint two identifiers, and to avoid any need for DB storage, these two identifiers are 2-way encrypted (not hashes) - you can obtain either of them from the other, if in possession of a secret. The worker is in possession of this secret but clients are not.


The worker:

1. Validate that the content is below the configured size threshold
1. Validates that the content is valid JSON (parse it into a JS object)
2. Loads the object into an instance of Vault (https://iiif-canvas-panel.netlify.app/docs/components/vault) - if it succeeds, it's a valid manifest.
3. If either 1, 2 or 3 fail, return a 400 Bad Request, with a JSON body `{ "error": "Bad Request" }` (we can expand on that later)
4. If it was successfully loaded into vault, mint the *manifest* identifier. This is like a Google doc link - an unguessable long string.
5. Replace the `id` of the manifest in the uploaded JSON with `https://iiif-sandbox.digirati.io/p3/<manifest-identifier>.json`. The /p3/ path reserves a "namespace" for future versions.
6. Store the manifest in the publicly read-only bucket, where it will be available at that address. The bucket policy adds the `Access-Control-Allow-Origin: *` header.
7. From the manifest identifier, mint the *update* identifier.
8. Return an HTTP 201 Created response, with the `Location` header set to that same address. The body of the response looks like this: 

```
{
    "location": "https://iiif-sandbox.digirati.io/p3/<manifest-identifier>.json",
    "updateLocation": "https://iiif-sandbox.digirati.io/p3-update/<update-identifier>"
}
```

It's up to the client application what they do with this information. The manifest will be available immediately at `https://iiif-sandbox.digirati.io/p3/<manifest-identifier>.json`.

If anyone POSTs to `https://iiif-sandbox.digirati.io/p3-update/<update-identifier>`, the following happens:

```
POST /p3-update/<update-identifier> HTTP/1.1
Host: iiif-sandbox.digirati.io
Content-Type: application/json

{
  "id": <anything-again>,
  // rest of valid IIIF manifest
}
```

1. The worker extracts the `<update-identifier>` and using the secret, obtains the corresponding `<manifest-identifier>`.
2. If this doesn't work, return the Bad Request error.
3. Validate by performing steps 1, 2 and 3 above. 
4. If invalid, return the Bad Request error.
5. If valid, replace the `id` of the manifest in the uploaded JSON with `https://iiif-sandbox.digirati.io/p3/<manifest-identifier>.json`. 
5. **Overwrite** the JSON stored at `/p3/<manifest-identifier>.json` with the new JSON
6. Return the same 201 Created response body as before.


## Considerations

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
https://iiif-sandbox.digirati.io/p3-update/0dZF4FdZF4FVBnkHE27AKXoCKo1nkHVBxQ80dZF4FVBnkHE27AKXoCKo1nkHqhLkGfWt.json
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

## Implementation options

 - With cloudflare R2 and workers the running costs might even be free - "R2 will zero-rate infrequent storage operations under a threshold — currently planned to be in the single digit requests per second range." However this is still a private alpha.
 - AWS Lambda and S3 is probably easiest for us to just use, especially with a digirati.io address and cert.
 - Cloudflare KV is another option
 