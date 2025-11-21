import React, { useRef } from 'react';
import { Editor } from '@toast-ui/react-editor';
import '@toast-ui/editor/dist/toastui-editor.css';

const MarkdownEditor = ({ value = '', onChange, height = '300px', placeholder = 'Enter text...' }) => {
  const editorRef = useRef();

  const handleChange = () => {
    if (editorRef.current && onChange) {
      const instance = editorRef.current.getInstance();
      const content = instance.getMarkdown();
      onChange(content);
    }
  };

  return (
    <Editor
      ref={editorRef}
      initialValue={value}
      previewStyle="tab"
      height={height}
      initialEditType="wysiwyg"
      useCommandShortcut={true}
      hideModeSwitch={false}
      onChange={handleChange}
      toolbarItems={[
        ['heading', 'bold', 'italic', 'strike'],
        ['hr', 'quote'],
        ['ul', 'ol', 'task'],
        ['table', 'link'],
        ['code', 'codeblock']
      ]}
    />
  );
};

export default MarkdownEditor;

