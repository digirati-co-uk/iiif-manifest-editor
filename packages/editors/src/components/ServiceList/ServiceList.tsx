import { Service } from "@iiif/presentation-3";
import { parseServiceProfile } from "./ServiceList.utility";
import { ServiceContainer } from "./ServiceList.styles";
import { useLayoutActions } from "@manifest-editor/shell";
import { InputLabel } from "../Input";
import { RichMediaLink } from "@manifest-editor/ui/components/organisms/RichMediaLink/RichMediaLink";

export function ServiceList(props: { resourceId: string; services: Service[] }) {
  const { stack } = useLayoutActions();

  return (
    <ServiceContainer>
      <InputLabel>Services</InputLabel>
      {props.services
        ? props.services.map((service: any, key) => (
            <RichMediaLink
              key={key}
              onClick={(e) => {
                e.preventDefault();
                stack({
                  id: "service-editor",
                  state: { service: service.id || service["@id"], resourceId: props.resourceId },
                });
              }}
              link={service.id || service["@id"]}
              title={service.type || service["@type"] || "Unknown service"}
              label={parseServiceProfile(service.profile)}
            />
          ))
        : null}
    </ServiceContainer>
  );
}
