const PERSISTENCEURL = {
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
    body: JSON.stringify(manifest)
  };
  let responseData = {};
  await fetch(PERSISTENCEURL.prod, requestOptions)
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

// HOOKING UP TO THE PREVIEW URL TEMPORARILY UNTIL WE GET PERMALINK IN PLACE TO ALLOW REACT DEVELOPMENT !
// THIS WILL NOT BE PERMALINK FOR NOW AND WILL HAVE AN EXPIRY
export const usePermalink = async (manifest: any) => {
  const requestOptions = {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify(manifest)
  };
  let responseData = {};
  await fetch(PERSISTENCEURL.prod, requestOptions)
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
