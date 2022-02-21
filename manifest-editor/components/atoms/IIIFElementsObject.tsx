import {
  Container,
  Key,
  KeyValuePairString,
  ContainerColumn
} from "./IIIFElementsShared";
import { KeyValuePairArray } from "./IIIFElementsArrays";

type KeyObjectPairing = {
  propertyName: string;
  object: any;
};

export const KeyObjectPairing: React.FC<KeyObjectPairing> = ({
  propertyName,
  object
}) => {
  return (
    <Container>
      <Key>{propertyName}</Key>
      <ContainerColumn>
        {Object.entries(object).map(([key, value]) => {
          if (typeof value === "string") {
            return (
              <KeyValuePairString
                onClick={() => console.log("clicked", key)}
                propertyName={key}
                value={value}
              />
            );
          } else if (Array.isArray(value)) {
            return (
              <KeyValuePairArray
                propertyName={key}
                array={value}
                onClick={() => {}}
              />
            );
          } else {
            return (
              <>
                <KeyObjectPairing propertyName={key} object={value} />
              </>
            );
          }
        })}
      </ContainerColumn>
    </Container>
  );
};
