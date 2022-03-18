import { SingleValueInput } from "../SingleValueInput";

export const TechnicalForm = () => {
  return (
    <>
      <SingleValueInput dispatchType={"viewingDirection"} />
      <SingleValueInput dispatchType={"behavior"} />
    </>
  );
};
