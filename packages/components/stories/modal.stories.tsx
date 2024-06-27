import { Modal } from "../src/Modal";

export const LongModal = () => {
  return (
    <Modal title="Example Modal" onClose={() => console.log("Close")}>
      <p>Some example content</p>
      <p>Some example content</p>
      <p>Some example content</p>
      <p>Some example content</p>
      <p>Some example content</p>
      <p>Some example content</p>
      <p>Some example content</p>
      <p>Some example content</p>
      <p>Some example content</p>
      <p>Some example content</p>
      <p>Some example content</p>
      <p>Some example content</p>
      <p>Some example content</p>
      <p>Some example content</p>
      <p>Some example content</p>
      <p>Some example content</p>
      <p>Some example content</p>
      <p>Some example content</p>
      <p>Some example content</p>
      <p>Some example content</p>
      <p>Some example content</p>
      <p>Some example content</p>
      <p>Some example content</p>
      <p>Some example content</p>
      <p>Some example content</p>
      <p>Some example content</p>
      <p>Some example content</p>
      <p>Some example content</p>
      <p>Some example content</p>
      <p>Some example content</p>
      <p>Some example content</p>
      <p>Some example content</p>
      <p>Some example content</p>
    </Modal>
  );
};

export const ShortModal = () => {
  return (
    <Modal title="Example Modal" onClose={() => console.log("Close")}>
      <p>Some example content</p>
      <p>Some example content</p>
      <p>Some example content</p>
    </Modal>
  );
};

export const ActionsModal = () => {
  return (
    <>
      <Modal
        title="Example Modal"
        onClose={() => console.log("Close")}
        actions={
          <button className="bg-black text-white py-2 px-4 rounded" onClick={() => console.log("Action")}>
            Action
          </button>
        }
      >
        <p>Some example content</p>
        <button>Button</button>
        <p>Some example content</p>
        <button>Button</button>
        <p>Some example content</p>
      </Modal>
      <div>
        <p>Behind the modal</p>
        <p>Behind the modal</p>
        <p>Behind the modal</p>
        <p>Behind the modal</p>
        <p>Behind the modal</p>
        <button>button</button>
        <p>Behind the modal</p>
        <p>Behind the modal</p>
        <p>Behind the modal</p>
        <p>Behind the modal</p>
        <button>button</button>
      </div>
    </>
  );
};
