import { useVault } from "react-iiif-vault";
import invariant from "tiny-invariant";
import { PaddedSidebarContainer } from "../../atoms/PaddedSidebarContainer";
import { ImageService2Editor } from "./ImageService2Editor";
import { useVaultSelector } from "../../hooks/useVaultSelector";
import { ImageService3Editor } from "./ImageService3Editor";

const supportedKeys = ["id", "type", "@id", "@type", "height", "width", "profile", "protocol"];

export function ServiceEditor({ id, resourceId }: { id: string; resourceId: string }) {
  const resource = useVaultSelector((s) => s.iiif.entities.ContentResource[resourceId]);
  const service = (resource as any)?.service.find((r: any) => r.id === id || r["@id"] === id);
  const vault = useVault();

  function updateService(newService: any) {
    vault.modifyEntityField(
      { id: resourceId, type: "ContentResource" },
      "service",
      (resource as any)?.service.map((existingService: any) => {
        if (existingService.id === id || existingService["@id"] === id) {
          return newService;
        }

        return existingService;
      })
    );
  }

  const type = service.type || service["@type"];

  invariant(service, "Service not found");
  invariant(
    type === "ImageService2" || type === "ImageService3",
    `Only image services are currently supported, found type: ${service.type}`
  );
  invariant(
    Object.keys(service).every((s) => {
      return supportedKeys.includes(s);
    }),
    `Service has unsupported properties (${Object.keys(service)
      .filter((s) => !supportedKeys.includes(s))
      .join(", ")})`
  );
  invariant(
    !service["@context"] || typeof service["@context"] === "string",
    "Complex context properties not yet supported"
  );
  invariant(!service.profile || typeof service.profile === "string", "Complex profiles are not yet supported");

  if (service["@id"]) {
    return (
      <PaddedSidebarContainer>
        <ImageService2Editor service={service} onChange={updateService} />
      </PaddedSidebarContainer>
    );
  }

  return (
    <PaddedSidebarContainer>
      <ImageService3Editor service={service} onChange={updateService} />
    </PaddedSidebarContainer>
  );
}
