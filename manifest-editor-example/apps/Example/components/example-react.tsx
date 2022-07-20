export function ExampleReact({onClick}: {onClick: () => void}) {
  return <div>
    <h3>React example</h3>
    <button onClick={onClick}>Next renderer</button>
  </div>;
}
