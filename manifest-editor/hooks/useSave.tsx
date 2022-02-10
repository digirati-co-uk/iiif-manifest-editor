export const useSave = async (manifest: any) => {
  const requestOptions = {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify(manifest)
  };
  let responseData = {};
  await fetch("/api/save/", requestOptions)
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
