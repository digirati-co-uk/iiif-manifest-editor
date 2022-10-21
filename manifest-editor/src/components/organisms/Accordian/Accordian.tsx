import React, { ReactNode, useState } from "react";
import { LightBoxWithoutSides } from "../../../atoms/LightBox";
import { DownIcon } from "../../../icons/DownIcon";
import { FlexContainerRow } from "../../layout/FlexContainer";

export const Accordian: React.FC<{ renderOpen: boolean; title: string; children: ReactNode }> = ({
  renderOpen,
  title,
  children,
}) => {
  const [isOpen, setIsOpen] = useState(renderOpen);
  return (
    <div>
      <LightBoxWithoutSides onClick={() => setIsOpen(!isOpen)}>
        <FlexContainerRow style={{ alignItem: "center", justifyContent: "space-between" }}>
          {title}
          <DownIcon rotate={isOpen ? 180 : 0} />
        </FlexContainerRow>
      </LightBoxWithoutSides>
      {isOpen && children}
    </div>
  );
};
