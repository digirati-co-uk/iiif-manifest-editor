const testString = new Promise((resolve) =>
  setTimeout(() => {
    resolve("Hello from test-module.ts");
  }, 500)
);

export default testString;
