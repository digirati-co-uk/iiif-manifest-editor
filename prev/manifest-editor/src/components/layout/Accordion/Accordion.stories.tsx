import { Accordion, AccordionContainer, AccordionItem } from "./Accordion";

export default { title: "Accordion", panel: "right" };

export const defaultStory = () => {
  return (
    <div style={{ flex: 1, marginBottom: "2em" }}>
      <h3 style={{ paddingLeft: "0.5em" }}>Accordion</h3>
      <Accordion
        items={[
          {
            label: "First one",
            initialOpen: true,
            children: <div>This is the first one</div>,
          },
          {
            label: "Second one",
            children: <div>This is the second one</div>,
          },
        ]}
      />
    </div>
  );
};

export const withComposition = () => {
  return (
    <div style={{ flex: 1, marginBottom: "2em" }}>
      <h3 style={{ paddingLeft: "0.5em" }}>Accordion with composition</h3>
      <AccordionContainer>
        <AccordionItem label="First one">
          <div>This is the first one</div>
        </AccordionItem>
        <AccordionItem label="Second one">
          <div>This is the second one</div>
        </AccordionItem>
      </AccordionContainer>
    </div>
  );
};

export const withSingleMode = () => {
  return (
    <div style={{ flex: 1, marginBottom: "2em" }}>
      <h3 style={{ paddingLeft: "0.5em" }}>Accordion (single mode)</h3>
      <Accordion
        singleMode
        items={[
          {
            label: "First one with a very long title that will be trimmed",
            initialOpen: true,
            children: (
              <div>
                <p>This is the first one</p>
                <p>This is the first one</p>
                <p>This is the first one</p>
                <p>This is the first one</p>
                <p>This is the first one</p>
              </div>
            ),
          },
          {
            label: "Second one",
            children: (
              <div>
                <p>This is the second one</p>
                <p>This is the second one</p>
                <p>This is the second one</p>
                <p>This is the second one</p>
                <p>This is the second one</p>
              </div>
            ),
          },
          {
            label: "Third one",
            children: (
              <div>
                <p>This is the second one</p>
                <p>This is the second one</p>
                <p>This is the second one</p>
                <p>This is the second one</p>
                <p>This is the second one</p>
              </div>
            ),
          },
          {
            label: "Fouth one",
            children: (
              <div>
                <p>
                  This is the second one. This is the second one. This is the second one. This is the second one. This
                  is the second one. This is the second one.{" "}
                </p>
                <p>This is the second one</p>
                <p>This is the second one</p>
                <p>This is the second one</p>
                <p>This is the second one</p>
              </div>
            ),
          },
        ]}
      />
    </div>
  );
};
