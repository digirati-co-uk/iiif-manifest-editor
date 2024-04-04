import _SelectSearch, { SelectSearchProps } from "react-select-search";
import "react-select-search/style.css";
import styled from "styled-components";

const SelectContainer = styled.div`
  width: 100%;

  --select-search-selected: #3498db;
  --select-search-background: #fff;
  --select-search-border: #dce0e8;
  --select-search-text: #000;
  --select-search-subtle-text: #6c6f85;
  --select-search-inverted-text: var(--select-search-background);
  --select-search-highlight: #eff1f5;
  --select-search-font: inherit;

  .select-search-container {
    font-size: 0.85em;
    width: 100%;
  }

  .select-search-value {
  }
  .select-search-input {
    border: none;
    background: #f8f9fa;
    border-bottom: 1px solid #cad0d5;
    border-radius: 0;
    font-size: inherit;
    padding: 0.75em 1em;
    height: auto;
    line-height: inherit;

    &:focus {
      border-color: #3498db;
    }
  }
  .select-search-select {
    border: 1px solid var(--select-search-border);
  }
  .select-search-container:not(.select-search-is-multiple) .select-search-select {
    top: 3em;
  }
  .select-search-options {
    font-size: 1em;
  }
  .select-search-row {
  }
  .select-search-option {
    font-size: 1em;
  }
  .select-search-group {
  }
  .select-search-group-header {
  }
  .select-search-is-selected {
  }
  .select-search-is-highlighted {
  }
  .select-search-is-loading {
  }
  .select-search-is-multiple {
  }
  .select-search-has-focus {
    border-color: #3498db;
  }
`;

export function SelectSearchField(props: SelectSearchProps) {
  // This is the rights field.
  return (
    <SelectContainer>
      <_SelectSearch {...props} />
    </SelectContainer>
  );
}
