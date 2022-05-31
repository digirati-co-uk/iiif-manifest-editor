import { Service } from "@iiif/presentation-3";
import { RichMediaLink } from "../../components/organisms/RichMediaLink/RichMediaLink";
import { parseServiceProfile } from "./ServiceList.utility";
import { ServiceContainer } from "./ServiceList.styles";
import { InputLabel } from "../../editors/Input";
import { useLayoutActions } from "../../shell/Layout/Layout.context";

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
