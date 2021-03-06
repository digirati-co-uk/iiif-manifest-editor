const PERSISTENCEURL = {
  prod: "https://iiif-preview.digirati.services/store",
  // Need iiif-preview to be running locally.
  local: "http://127.0.0.1:8787/store",
};

// Save for 28 hrs.
export const usePreviewLink = async (manifest: any) => {
  const requestOptions = {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(manifest),
  };
  let responseData = {};
  await fetch(PERSISTENCEURL.prod, requestOptions)
    .then((response) => {
      return response.json().catch((err) => {
        console.error(`'${err}' happened!`);
        return {};
      });
    })
    .then((data) => {
      responseData = { ...data };
    });

  return responseData;
};

// HOOKING UP TO THE PREVIEW URL TEMPORARILY UNTIL WE GET PERMALINK IN PLACE TO ALLOW REACT DEVELOPMENT !
// THIS WILL NOT BE PERMALINK FOR NOW AND WILL HAVE AN EXPIRY
export const usePermalink = async (manifest: any) => {
  const requestOptions = {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(manifest),
  };
  let responseData: any;
  await fetch(PERSISTENCEURL.prod, requestOptions)
    .then((response) => {
      return response.json().catch((err) => {
        console.error(`'${err}' happened!`);
        return null;
      });
    })
    .then((data) => {
      responseData = { ...data };
    });

  return responseData;
};

// AS ABOVE HOOKING UP TO THE PREVIEW URL TEMPORARILY UNTIL WE GET PERMALINK IN PLACE TO ALLOW REACT DEVELOPMENT !
// THIS WILL NOT BE PERMALINK FOR NOW AND WILL HAVE AN EXPIRY
export const useUpdatePermalink = async (updateUrl: string | undefined, manifest: any) => {
  const requestOptions = {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      Origin: "*",
    },
    body: JSON.stringify(manifest),
  };
  let responseData = {};
  if (updateUrl) {
    await fetch(updateUrl, requestOptions)
      .then((response) => {
        return response.json().catch((err) => {
          console.error(`'${err}' happened!`);
          return {};
        });
      })
      .then((data) => {
        responseData = { ...data };
      });
  }
  return responseData;
};
