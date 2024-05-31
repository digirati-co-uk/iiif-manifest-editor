import { Button } from "react-aria-components";
import { DownloadIcon } from "./icons/DownloadIcon";
import { useId } from "react-aria";
import { Tooltip, DefaultTooltipContent, TooltipTrigger } from "./Tooltip";

interface DownloadButtonProps {
  getData: () => any;
  fileName: string;
  id?: string;
  fileType?: string;
  label?: string;
}

export function DownloadButton({ label, id: _id, getData, fileName, fileType }: DownloadButtonProps) {
  const id = useId(_id);
  return (
    <Tooltip placement="bottom">
      <TooltipTrigger>
        <Button
          className="bg-me-gray-100 hover:bg-me-primary-500 hover:text-white p-1 rounded-md text-me-primary-500 text-2xl"
          aria-label={label}
          id={id}
          onPress={() => createDownload(getData(), fileName, fileType)}
        >
          <DownloadIcon aria-labelledby={_id} />
        </Button>
        <DefaultTooltipContent>{label}</DefaultTooltipContent>
      </TooltipTrigger>
    </Tooltip>
  );
}

export function createDownload(data: any, fileName: string, fileType = "text/json") {
  // Create a blob with the data we want to download as a file
  const blob = data instanceof Blob ? data : new Blob([data], { type: fileType });
  // Create an anchor element and dispatch a click event on it
  // to trigger a download
  const a = document.createElement("a");
  a.download = fileName;
  a.href = window.URL.createObjectURL(blob);
  const clickEvt = new MouseEvent("click", {
    view: window,
    bubbles: true,
    cancelable: true,
  });
  a.dispatchEvent(clickEvt);
  a.remove();
}
