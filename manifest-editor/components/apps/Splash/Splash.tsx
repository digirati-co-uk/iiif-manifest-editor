export const Splash: React.FC<{ welcome: any }> = ({ welcome }) => {
  return (
    <div>
      <div
        className="text-container"
        dangerouslySetInnerHTML={{ __html: welcome }}
      />
      <h1>I am the splash screen</h1>
    </div>
  );
};
