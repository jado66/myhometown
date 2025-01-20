import ReactJson from "react-json-view";

const JsonViewer = ({ data, title }) => {
  return (
    <>
      {/* {title && <h6>{title}</h6>} */}
      <ReactJson
        src={data}
        theme="summerfruit:inverted"
        collapsed={1}
        displayDataTypes={false}
        enableClipboard={false}
      />
    </>
  );
};

export default JsonViewer;
