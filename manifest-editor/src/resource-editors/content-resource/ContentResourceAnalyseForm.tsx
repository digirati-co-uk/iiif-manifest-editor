import { analyse } from "../../helpers/analyse";
import { ContentResourceStyles as S } from "./ContentResource.styles";

export function ContentResourceAnalyseForm() {
  // 1. Single box, filled out
  // 2. Remove box, show loading
  // 3. Show readonly details, to be confirmed
  // 4. Redirect to editor.

  return (
    <S.AnalyseContainer>
      <S.AnalyseInput />
    </S.AnalyseContainer>
  );
}
