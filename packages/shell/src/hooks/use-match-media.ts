// MIT License
//
// Copyright (c) 2020 Jepser Bernardino
//
// Permission is hereby granted, free of charge, to any person obtaining a copy
// of this software and associated documentation files (the "Software"), to deal
// in the Software without restriction, including without limitation the rights
// to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
// copies of the Software, and to permit persons to whom the Software is
// furnished to do so, subject to the following conditions:
//
// The above copyright notice and this permission notice shall be included in all
// copies or substantial portions of the Software.
//
// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
// IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
// FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
// AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
// LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
// OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
// SOFTWARE.
//
// Source: https://github.com/jepser/use-match-media

import { useState, useLayoutEffect } from "react";

type IMediaQuery = Array<string>;

type IMatchedMedia = Array<boolean>;

export function useMatchMedia(queries: IMediaQuery, defaultValues: IMatchedMedia = []): IMatchedMedia {
  const initialValues = defaultValues.length ? defaultValues : Array(queries.length).fill(false);

  if (typeof window === "undefined") return initialValues;

  const mediaQueryLists = queries.map((q) => window.matchMedia(q));
  const getValue = (): IMatchedMedia => {
    // Return the value for the given queries
    const matchedQueries = mediaQueryLists.map((mql) => mql.matches);

    return matchedQueries;
  };

  // State and setter for matched value
  const [value, setValue] = useState(getValue);

  useLayoutEffect(() => {
    // Event listener callback
    // Note: By defining getValue outside of useEffect we ensure that it has ...
    // ... current values of hook args (as this hook only runs on mount/dismount).
    const handler = (): void => setValue(getValue);
    // Set a listener for each media query with above handler as callback.
    mediaQueryLists.forEach((mql) => mql.addListener(handler));
    // Remove listeners on cleanup
    return (): void => mediaQueryLists.forEach((mql) => mql.removeListener(handler));
  }, []);

  return value;
}
