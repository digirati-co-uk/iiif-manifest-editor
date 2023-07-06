import { scss as css } from "@acab/ecsstatic";

export const compatibilityTable = css`
  background: #fff;

  /*!
    Pure v3.0.0
    Copyright 2013 Yahoo!
    Licensed under the BSD License.
    https://github.com/pure-css/pure/blob/master/LICENSE
  */

  & {
    /* Remove spacing between table cells (from Normalize.css) */
    border-collapse: collapse;
    border-spacing: 0;
    empty-cells: show;
    border: 1px solid #cbcbcb;
  }

  & caption {
    color: #000;
    font: italic 85%/1 arial, sans-serif;
    padding: 1em 0;
    text-align: center;
  }

  & td,
  & th {
    border-left: 1px solid #cbcbcb; /*  inner column border */
    border-width: 0 0 0 1px;
    font-size: inherit;
    margin: 0;
    overflow: visible; /*to make ths where the title is really long work*/
    padding: 0.5em 1em; /* cell padding */
    text-align: center;
  }

  & thead {
    background-color: #e9effa;
    color: #000;
    text-align: left;
    vertical-align: bottom;
  }

  /*
  striping:
     even - #fff (white)
     odd  - #f2f2f2 (light gray)
  */

  & td {
    background-color: transparent;
  }

  &-odd td {
    background-color: #f2f2f2;
  }

  /* nth-child selector for modern browsers */

  &-striped tr:nth-child(2n-1) td {
    background-color: #f2f2f2;
  }

  /* BORDERED TABLES */

  & td {
    border-bottom: 1px solid #cbcbcb;
  }

  & tbody > tr:last-child > td {
    border-bottom-width: 0;
  }

  /* HORIZONTAL BORDERED TABLES */

  &-horizontal td,
  &-horizontal th {
    border-width: 0 0 1px 0;
    border-bottom: 1px solid #cbcbcb;
  }

  &-horizontal tbody > tr:last-child > td {
    border-bottom-width: 0;
  }
`;
