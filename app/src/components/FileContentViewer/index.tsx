import React, { useState, useEffect } from 'react';
import { FileType } from '../../types/File';
import { Document, Page, pdfjs } from 'react-pdf';
import 'react-pdf/dist/esm/Page/TextLayer.css';
import 'react-pdf/dist/esm/Page/AnnotationLayer.css';
import { Spin } from 'antd';
pdfjs.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.js`;

interface FileContentViewerProps {
    blob: Blob;
    file: FileType;
}

const FileContentViewer: React.FC<FileContentViewerProps> = ({ blob, file }) => {
    const [url, setUrl] = useState<string>('');
    const [numPages, setNumPages] = useState<number>();
    const [loading, setLoading] = useState<boolean>(true);

    useEffect(() => {
        setUrl(URL.createObjectURL(blob));
        return () => {
            URL.revokeObjectURL(url);
        };
    }, [blob]);

    function onDocumentLoadSuccess({ numPages }: { numPages: number }): void {
        setNumPages(numPages);
        setLoading(false);
    }

    switch (file.extension?.toLowerCase()) {
        case 'jpg':
        case 'png':
        case 'jpeg':
            return (
                <img
                    className="viewer-image"
                    src={url}
                    alt="Image"
                />
            );

        case 'pdf':
            return (
                <div className="pdf-container">
                    {loading && <div className="loading-container"><Spin size="large" /></div>}
                    <Document
                        file={url}
                        onLoadSuccess={onDocumentLoadSuccess}
                        loading={<Spin size="large" />}
                        className="pdf-document"
                    >
                        {Array.from(new Array(numPages), (el, index) => (
                            <Page
                                key={`page_${index + 1}`}
                                pageNumber={index + 1}
                                className="pdf-page"
                                renderTextLayer={false}
                                renderAnnotationLayer={false}
                            />
                        ))}
                    </Document>
                </div>
            );

        case 'txt':
            const [text, setText] = useState<string>('');

            useEffect(() => {
                const reader = new FileReader();
                reader.onload = (event) => {
                    const text = event.target?.result as string;
                    setText(text);
                };
                reader.readAsText(blob);
            }, [blob]);

            return <pre className="text-content">{text}</pre>;

        case 'pptx':
        case 'ppt':
        case 'xlsx':
        case 'xls':
        case 'doc':
        case 'docx':
            return null;

        default:
            return null;
    }
};

export default FileContentViewer;
export const READABLE_EXTENSIONS = ["jpg", "png", "jpeg", "pdf", "txt"];
