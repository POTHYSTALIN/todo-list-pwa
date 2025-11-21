import React from 'react';
import { Viewer } from '@toast-ui/react-editor';
import '@toast-ui/editor/dist/toastui-editor-viewer.css';

const MarkdownViewer = ({ content = '' }) => {
  return (
    <div className="markdown-viewer">
      <Viewer initialValue={content} />
    </div>
  );
};

export default MarkdownViewer;

