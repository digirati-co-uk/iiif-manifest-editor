import * as React from "react";
import { AddIcon } from "../components/icons/AddIcon";
import { BackIcon } from "../components/icons/BackIcon";
import { CheckIcon } from "../components/icons/CheckIcon";
import { CloseIcon } from "../components/icons/CloseIcon";
import { CollapseFullscreen } from "../components/icons/CollapseFullscreen";
import { CopyIcon } from "../components/icons/CopyIcon";
import { DeleteIcon } from "../components/icons/DeleteIcon";
import { DownIcon } from "../components/icons/DownIcon";
import { EditIcon } from "../components/icons/EditIcon";
import { GridIcon } from "../components/icons/GridIcon";
import { InfoIcon } from "../components/icons/InfoIcon";
import { ManifestEditorIcon } from "../components/icons/ManifestEditorIcon";
import { MenuIcon } from "../components/icons/MenuIcon";
import { MoreMenu } from "../components/icons/MoreMenu";
import { OpenFullscreen } from "../components/icons/OpenFullscreen";
import { PreviewIcon } from "../components/icons/PreviewIcon";
import { SubdirectoryIcon } from "../components/icons/SubdirectoryIcon";
import { ThumbnailStripIcon } from "../components/icons/ThumbnailStripIcon";
import { TickIcon } from "../components/icons/TickIcon";
import { TreeIcon } from "../components/icons/TreeIcon";

import { ComponentMeta, ComponentStory } from "@storybook/react";
import { FlexContainerColumn } from "../components/layout/FlexContainer";
import { LightBoxWithoutSides } from "../components/atoms/LightBox";

export default {
  title: "Manifest Editor/Icons",
  component: AddIcon,
} as ComponentMeta<typeof AddIcon>;

const Template: ComponentStory<typeof AddIcon> = (args) => {
  return (
    <FlexContainerColumn style={{ display: "flex", flexWrap: "wrap" }}>
      <LightBoxWithoutSides
        style={{
          margin: "10px",
          justifyContent: "space-between",
        }}
      >
        <AddIcon />
        Add Icon
      </LightBoxWithoutSides>
      <LightBoxWithoutSides
        style={{
          margin: "50px",
          justifyContent: "space-between",
        }}
      >
        <BackIcon />
        BackIcon
      </LightBoxWithoutSides>
      <LightBoxWithoutSides
        style={{
          margin: "10px",
          justifyContent: "space-between",
        }}
      >
        <CheckIcon />
        CheckIcon
      </LightBoxWithoutSides>
      <LightBoxWithoutSides
        style={{
          margin: "10px",
          justifyContent: "space-between",
        }}
      >
        <CloseIcon />
      </LightBoxWithoutSides>
      <LightBoxWithoutSides
        style={{
          margin: "10px",
          justifyContent: "space-between",
        }}
      >
        <CollapseFullscreen />
        CollapseFullscreen
      </LightBoxWithoutSides>
      <LightBoxWithoutSides
        style={{
          margin: "10px",
          justifyContent: "space-between",
        }}
      >
        <CopyIcon />
        CopyIcon
      </LightBoxWithoutSides>
      <LightBoxWithoutSides
        style={{
          margin: "10px",
          justifyContent: "space-between",
        }}
      >
        <DeleteIcon />
        DeleteIcon
      </LightBoxWithoutSides>
      <LightBoxWithoutSides
        style={{
          margin: "10px",
          justifyContent: "space-between",
        }}
      >
        <DownIcon />
        DownIcon
      </LightBoxWithoutSides>
      <LightBoxWithoutSides
        style={{
          margin: "10px",
          justifyContent: "space-between",
        }}
      >
        <EditIcon />
        EditIcon
      </LightBoxWithoutSides>
      <LightBoxWithoutSides
        style={{
          margin: "10px",
          justifyContent: "space-between",
        }}
      >
        <GridIcon />
        GridIcon
      </LightBoxWithoutSides>
      <LightBoxWithoutSides
        style={{
          margin: "10px",
          justifyContent: "space-between",
        }}
      >
        <InfoIcon />
        InfoIcon
      </LightBoxWithoutSides>
      <LightBoxWithoutSides
        style={{
          margin: "10px",
          justifyContent: "space-between",
        }}
      >
        <ManifestEditorIcon />
        ManifestEditorIcon
      </LightBoxWithoutSides>
      <LightBoxWithoutSides
        style={{
          margin: "10px",
          justifyContent: "space-between",
        }}
      >
        <MenuIcon />
        MenuIcon
      </LightBoxWithoutSides>
      <LightBoxWithoutSides
        style={{
          margin: "10px",
          justifyContent: "space-between",
        }}
      >
        <MoreMenu />
        MoreMenu
      </LightBoxWithoutSides>
      <LightBoxWithoutSides
        style={{
          margin: "10px",
          justifyContent: "space-between",
        }}
      >
        <OpenFullscreen />
        OpenFullscreen
      </LightBoxWithoutSides>
      <LightBoxWithoutSides
        style={{
          margin: "10px",
          justifyContent: "space-between",
        }}
      >
        <PreviewIcon />
        Preview
      </LightBoxWithoutSides>
      <LightBoxWithoutSides
        style={{
          margin: "10px",
          justifyContent: "space-between",
        }}
      >
        <SubdirectoryIcon />
        Subdirectory
      </LightBoxWithoutSides>
      <LightBoxWithoutSides
        style={{
          margin: "10px",
          justifyContent: "space-between",
        }}
      >
        <ThumbnailStripIcon />
        ThumbnailStripIcon
      </LightBoxWithoutSides>
      <LightBoxWithoutSides
        style={{
          margin: "10px",
          justifyContent: "space-between",
        }}
      >
        <TickIcon />
        TickIcon
      </LightBoxWithoutSides>
      <LightBoxWithoutSides
        style={{
          margin: "10px",
          justifyContent: "space-between",
        }}
      >
        <TreeIcon />
        TreeIcon
      </LightBoxWithoutSides>
    </FlexContainerColumn>
  );
};

export const AnExample = Template.bind({});

AnExample.args = {};
