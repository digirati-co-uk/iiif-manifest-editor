import { Fragment } from "react/jsx-runtime";
import { PanelSideMenuItem } from "./PanelSideMenuItem";

interface PanelSideMenuProps {
  items: Array<{
    id: string;
    icon: React.ReactNode;
    label: string;
    divide?: boolean;
    onClick: () => void;
  }>;
  open: boolean;
  current: string | null;
}

export function PanelSideMenu(props: PanelSideMenuProps) {
  return (
    <div className="bg-white border-t border-r flex flex-col w-12 pb-2" data-open={props.open}>
      {props.items.map((panel) => (
        <Fragment key={panel.id}>
          {panel.divide ? <div className="flex-1 block w-2 min-h-1" /> : null}
          <PanelSideMenuItem
            key={panel.id}
            label={panel.label}
            selected={panel.id === props.current && props.open}
            icon={panel.icon}
            onClick={panel.onClick}
          />
        </Fragment>
      ))}
    </div>
  );
}
