const URLs = {
  prod: "https://iiif-preview.stephen.wf/store",
  // Need iiif-preview to be running locally.
  local: "http://127.0.0.1:8787/store"
};

export const useSave = async (manifest: any) => {
  const requestOptions = {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      ...manifest
    })
  };
  // Don't commit URLs.local here
  let responseData = {};
  await fetch(URLs.prod, requestOptions)
    .then(response => {
      return response.json().catch(err => {
        console.error(`'${err}' happened!`);
        return {};
      });
    })
    .then(data => {
      responseData = { ...data };
    });

  return responseData;
};