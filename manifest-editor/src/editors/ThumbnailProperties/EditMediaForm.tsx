import { useState } from "react";
import { analyse } from "../../helpers/analyse";
import { MediaBody } from "../../../types/media-body";
import { Button, CalltoButton, SecondaryButton } from "../../atoms/Button";
import { ErrorMessage } from "../../atoms/callouts/ErrorMessage";
import { SuccessMessage } from "../../atoms/callouts/SuccessMessage";
import { DimensionsTriplet } from "../../atoms/DimensionsTriplet";
import { HorizontalDivider } from "../../atoms/HorizontalDivider";
import { Loading } from "../../atoms/Loading";
import { TickIcon } from "../../icons/TickIcon";
import { FlexContainer, FlexContainerColumn } from "../../components/layout/FlexContainer";
import { InputLabel, Input } from "../Input";

interface EditMediaForm {
  edit: (body: MediaBody) => void;
  close: () => void;
  prevHeight: number;
  prevWidth: number;
  prevDuration: number;
  prevSrc: string;
  prevType: string;
  prevFormat: string;
}

export const EditMediaForm: React.FC<EditMediaForm> = ({
  edit,
  close,
  prevHeight,
  prevWidth,
  prevDuration,
  prevSrc,
  prevType,
  prevFormat,
}) => {
  const [inputValue, setInputValue] = useState<string>(prevSrc);
  const [message, setMessage] = useState<string>();
  const [error, setError] = useState(false);
  const [properties, setProperties] = useState<any>();
  const [type, setType] = useState<string>(prevType);
  const [format, setFormat] = useState<string>(prevFormat);
  const [height, setHeight] = useState<number>(prevHeight);
  const [width, setWidth] = useState<number>(prevWidth);
  const [duration, setDuration] = useState<number>(prevDuration);
  const [isLoading, setIsLoading] = useState(false);

  // Triggered on blur of the URL value.
  const runAnalyser = async () => {
    setIsLoading(true);
    // We want to clear these values if they already exist.
    setProperties(undefined);
    setMessage(undefined);
    setError(false);
    let analysed: any;
    if (inputValue) {
      analysed = await analyse(inputValue);
      setProperties(analysed);
      if (!["Image"].includes(analysed?.type)) {
        setError(true);
        setMessage(`The format that you have provided is not yet supported`);
      } else if (!error && analysed) {
        setMessage(`The URL provided is a ${analysed.width}x${analysed.height} ${analysed.type}.`);
      }
    }
    setIsLoading(false);
  };

  const save = () => {
    if (!inputValue || !type || !format || !height || !width) {
      return;
    }
    const body = { id: inputValue, type, format, height, width };
    edit(body);
  };

  const populateValues = () => {
    // changeHandler(properties.height, index, "height");
    console.log(properties);
    setHeight(properties.height);
    setWidth(properties.width);
    setType(properties.type);
    setFormat(properties.format);
    setProperties(undefined);
    setMessage(undefined);
  };
  return (
    <FlexContainerColumn>
      <FlexContainer>
        <Input
          value={inputValue}
          placeholder={"Paste URL of Media"}
          onChange={(e: any) => setInputValue(e.target.value)}
          onBlur={() => runAnalyser()}
          onKeyPress={(e: any) => {
            if (e.key === "Enter") {
              runAnalyser();
            }
          }}
        />
        <Button aria-label="validate url" onClick={() => runAnalyser()}>
          <TickIcon />
        </Button>
      </FlexContainer>
      <small>Any image or IIIF Image Service</small>
      {isLoading && <Loading />}
      {message && !error && (
        <SuccessMessage>
          <div>
            <img src={inputValue} height={100} style={{ transition: "all 0.3s ease-in" }} />
            {message}

            <SecondaryButton onClick={() => populateValues()}>Use values</SecondaryButton>
          </div>
        </SuccessMessage>
      )}
      {error && message && <ErrorMessage>{message}</ErrorMessage>}
      <HorizontalDivider />
      <InputLabel>
        Media Dimensions
        <DimensionsTriplet
          width={width || 0}
          changeWidth={setWidth}
          height={height || 0}
          changeHeight={setHeight}
          duration={duration || 0}
          changeDuration={setDuration}
        />
      </InputLabel>
      <HorizontalDivider />
      <InputLabel>
        Type
        <Input value={type} placeholder={"Image, sound etc"} onChange={(e: any) => setType(e.target.value)} />
      </InputLabel>
      <HorizontalDivider />
      <InputLabel>
        Format
        <Input value={format} placeholder={"jpg, png etc."} onChange={(e: any) => setFormat(e.target.value)} />
      </InputLabel>
      <FlexContainer style={{ justifyContent: "flex-end" }}>
        <CalltoButton onClick={close} aria-label="cancel">
          CANCEL
        </CalltoButton>
        <CalltoButton disabled={error} onClick={save} aria-label="save">
          SAVE
        </CalltoButton>
      </FlexContainer>
    </FlexContainerColumn>
  );
};
