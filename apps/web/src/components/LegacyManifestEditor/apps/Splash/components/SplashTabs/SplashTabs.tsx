import { SplashTabsStyles as S } from "./SplashTabs.styles";
import { ReactNode } from "react";
import { useLocalStorage } from "@manifest-editor/ui/madoc/use-local-storage";

export function SplashTabs({ children }: { children: Record<string, ReactNode> }) {
  const [current, setCurrent] = useLocalStorage("splash-tabs", "getting-started");

  const menuProps = (type: string) => {
    return { $active: current === type, onClick: () => setCurrent(type) } as const;
  };

  return (
    <S.Container>
      <S.Menu>
        <S.InnerContainer>
          <S.MenuItem {...menuProps("getting-started")}>Getting started</S.MenuItem>
          <S.MenuItem {...menuProps("my-projects")}>My projects</S.MenuItem>
        </S.InnerContainer>
      </S.Menu>
      <S.Content>
        <S.InnerContent>{children[current]}</S.InnerContent>
      </S.Content>
    </S.Container>
  );
}
