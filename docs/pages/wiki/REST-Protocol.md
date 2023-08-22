One of the options supported for [[Saving IIIF]] is to save to IIIF resources.

This feature is probably not in v1, but we can provide an implementation of a client in Manifest Editor later, and a reference server implementation (e.g., a container over an S3 bucket, or file system).

The user browses around IIIF resources with a [[IIIF Browser]] (as in Load, Import). These resources are IIIF Collections and Manifests. Not all resources will support all operations, and adopters might have a mixture of read-only and "writable" collections. For UI purposes, the adopter can use labels to convey this sort of information to the client, but as well as that, the client can issue an OPTIONS request to see whether a resource (or potential resource) supports a particular operation:

```
OPTIONS /some-top-level/my-collection HTTP/1.1

HTTP/1.1 204 No Content
Allow: OPTIONS, GET, HEAD, POST
```

## Save to a Collection

The protocol supports a IIIF Collection as a _storage container_.

The client POSTs a Manifest (JSON payload) to a IIIF Collection URL.

The client can indicate the required URL of the manifest in its `id` property, but the server can override that and store the manifest with a different ID from that supplied. This also means that the client doesn't have to know in advance what the Manifest URL will be, it allows the server to assign `id`s to manifests.

The relationship between `id` in the POSTed manifest and on the server is an implementation decision, the protocol is the same either way, making this flexible. If an `id` is supplied, then an implementation probably requires that the `id` is a child path of the Collection POSTed to.

The server returns a 201 Created if the operation resulted in a new resource being created, or a 204 if the operation updated an existing resource (which might be the case if the `id` of the manifest is that of one already in the collection - again, an implementation decision).

Either way, for 201 and 204, the server returns a `Location` header with the `id` of the now dereferenceable manifest, so that the editor can carry on with that URL.

It's up to the server _where_ in the Collection `items` the Manifest ends up (e.g., first, last, alphabetical). This is an implementation decision.

## Save a Collection or Manifest

A Collection can be saved to another collection with POST, as above - again, it's up to the server what to make of the POSTed collection, whether to assign it a new `id`.

A Collection itself, or a Manifest, can be saved directly with PUT to a URL.

This results in a 201 Create or a 204 for an update. It can also be rejected for various reasons.

## ETags and Versioning

We can avoid a protocol that describes locks and other complex behaviour by making it a client responsibility. All IIIF resources served by the protocol include an ETag in the response headers. When the Manifest Editor (or any other client) intends to open a Manifest for editing, it takes note of the ETag value. Any POST or PUT back to the repository **must ** include an [If-Match](https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/If-Match) header with the ETag acquired, and the Manifest Editor should be prepared to receive an HTTP 412 status response if someone else has modified the Manifest since that ETag was acquired.

Versioning is probably an implementation decision - a protocol implementation may not support it. If it is supported, we need to specify the conditions under which a new version is made, and the mechanism for obtaining previous versions of a resource at a particular URI. 

## Collections as storage containers and Collections as resources

A IIIF Collection, in this protocol, is both a storage container at that URI (you can POST Manifests into it) and an editable IIIF Resource (you can edit its label, its metadata, its thumbnail and so on). This needs careful handling.

- The `items` in a Collection may be automatically generated, growing as more Manifests are POSTed into it.
- The `items` in a Collection might be references to Manifests and Collections that are NOT children of the Collection, i.e., might be references to Manifests and Collections that are not stored in the corresponding storage container or might not even be stored in this repository at all (might be elsewhere on the web).
 
## Add a reference to a Manifest to a Collection

In some scenarios you will already have a saved Manifest somewhere - you are not asking the server to store the manifest, just to add a reference to it to the Collection's `items`.

This works in exactly the same way as the POST to a collection - except that the POSTed Manifest body does not have an `items` property.

It could be as simple as `{ "id": xxx, "type": "Manifest" }` (like a Vault reference).
Or it could include a `label`, and possibly other metadata - but not `items`, which indicates you want to store the actual Manifest.

It is an implementation decision how the server handles it. For example, POSTing just the bare manifest reference might cause the server to GET the Manifest to find out what its `label` is, or assign its own label. Similarly the semantics of supplying a `label` at POST time are up to the implementation. Typically this would be "use this label _in the collection_ even if different from the Manifest's label when dereferenced" - but it's up to the server.

## PATCH operations

This protocol should not support arbitrary Graph-QL style patching. The unit of work it the Manifest as that is what is being held in the Manifest Editor and sent back for saving. For example, you can't independently edit a Canvas (even if we support dereferencing of canvases in the future) - the Manifest or Collection is the unit of distribution.

However, if you wanted to change the `label` of a Collection that is acting as storage container, you are faced with a problem. The Collection might contain thousands of `items` and you might not know what they are. It might be very active storage (lots of additions happening while you're trying to edit properties of the collection itself). You can't acquire a lock to prevent this happening, hoping that the `items` hasn't changed while you were editing metadata.

An HTTP `PATCH` to a storage container Collection must not include the `items` property but can update any other property. 

Given a Storage Container Collection, you might cause a change in its `items` in any of these ways:

1. adding a child Storage Container Collection
2. adding a child Collection that is a reference to some other IIIF Collection anywhere, not intended to be a child storage container
3. adding a Manifest to be stored in the storage container
4. adding a Manifest reference to some other, external Manifest

Details (HIGHLY PROVISIONAL! - needs properly specifying and experimenting)

1. To create a new Collection that functions as a storage container, POST the Collection to another storage container. You must provide an `id` that is a child path of the container, or omit the `id` altogether allowing the repository to create an `id`, and you *must* include an `items` property that is an empty array.
2. The POSTed Collection must not have an `id` that is a child path of the container, and it must not have an `items` property. Alternatively, POST to a reserved path `<collection-uri>/items` (no child resource may be called `items`)
3. POST the JSON to the storage container; if an `id` is supplied it must be a child path.
4. As for 2.

Other possibilities: use the IIIF `behavior` with a value of `storage` to be explicit about what the resource is.

Questions:

 - how do you rename a storage container collection?
 - how do you delete items members where they are references rather than stored resources? (stored resources can just be DELETEd with HTTP)

## Access Control

As an API interaction, all the above has nothing to do with IIIF Auth. It suits an OAuth2 interaction. A client like the Manifest Editor can acquire tokens on behalf of the user by logging in. This protocol should not describe those tokens. The might be (are likely to be) JWT but that's an implementation decision, the tokens are opaque to clients like Manifest Editor.

## Change Discovery API

A IIIF Repository implementing this protocol should also implement the IIIF Change Discovery API.
(IIIF Builder might want to browse such endpoints)

## Comparison with Web Annotation Protocol

(see https://www.w3.org/TR/annotation-protocol/#annotation-containers)

 - We don't need our collections-as-storage-containers to be [Linked Data Platform Containers](https://www.w3.org/TR/ldp/#ldpc-container)
 - We could adopt the rule that a container's URI must end with a `/`

## Limitations

By adopting the IIIF Collection as a container, we keep things simple but we lose formal paging. Organisation of Collections into manageable units becomes a client concern (don't put 100,000 manifests in a single container and expect the resulting IIIF Collection to be usable).

If the need for paged containers becomes strong, the protocol could also support containers as [Activity Streams Ordered Collections](https://www.w3.org/TR/activitystreams-core/#collections) - and could be the same container, a different resource URI exposes the "virtual" collection it as an OrderedCollection.

IIIF Explorer can be made to navigate OrderedCollections, with paging support.

Search/autocomplete for items in collections (IIIF or AS Ordered) can be layered on top.