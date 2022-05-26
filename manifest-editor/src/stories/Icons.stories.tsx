import * as React from "react";
import { AddIcon } from "../icons/AddIcon";
import { BackIcon } from "../icons/BackIcon";
import { CheckIcon } from "../icons/CheckIcon";
import { CloseIcon } from "../icons/CloseIcon";
import { CollapseFullscreen } from "../icons/CollapseFullscreen";
import { CopyIcon } from "../icons/CopyIcon";
import { DeleteIcon } from "../icons/DeleteIcon";
import { DownIcon } from "../icons/DownIcon";
import { EditIcon } from "../icons/EditIcon";
import { GridIcon } from "../icons/GridIcon";
import { InfoIcon } from "../icons/InfoIcon";
import { ManifestEditorIcon } from "../icons/ManifestEditorIcon";
import { MenuIcon } from "../icons/MenuIcon";
import { MoreMenu } from "../icons/MoreMenu";
import { OpenFullscreen } from "../icons/OpenFullscreen";
import { PreviewIcon } from "../icons/PreviewIcon";
import { SubdirectoryIcon } from "../icons/SubdirectoryIcon";
import { ThumbnailStripIcon } from "../icons/ThumbnailStripIcon";
import { TickIcon } from "../icons/TickIcon";
import { TreeIcon } from "../icons/TreeIcon";

import { ComponentMeta, ComponentStory } from "@storybook/react";
import { FlexContainerColumn } from "../components/layout/FlexContainer";
import { LightBoxWithoutSides } from "../atoms/LightBox";
import { MoreVetical } from "../icons/MoreVertical";

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
        <MoreVetical />
        MoreVertical
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
