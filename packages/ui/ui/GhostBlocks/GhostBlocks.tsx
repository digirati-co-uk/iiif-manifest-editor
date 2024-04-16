import $ from "./GhostBlocks.module.css";
export function GhostBlocks() {
  return (
    <>
      <div data-header="true" className={$.ghostLoadingBlock} />
      <div className={$.ghostBlockList}>
        <div className={$.ghostLoadingBlock} />
        <div className={$.ghostLoadingBlock} />
        <div className={$.ghostLoadingBlock} />
        <div className={$.ghostLoadingBlock} />
      </div>
    </>
  );
}
