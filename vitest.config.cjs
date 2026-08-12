module.exports = {
  root: process.cwd(),
  test: {
    server: {
      deps: {
        inline: ["iiif-browser", "react-timeago"],
      },
    },
  },
};
