import { DimensionsForm } from "./DimensionsForm";
import { SingleValueInput } from "./SingleValueInput";

export const TechnicalForm = () => {
  return (
    <>
      <SingleValueInput dispatchType={"behavior"} />
      <DimensionsForm />
    </>
  );
};
