import React, { useState, useEffect, useCallback } from 'react';
import { FileType } from '../../types/File';
import { Document, Page, pdfjs } from 'react-pdf';
import 'react-pdf/dist/esm/Page/TextLayer.css';
import 'react-pdf/dist/esm/Page/AnnotationLayer.css';
import { Spin } from 'antd';
pdfjs.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.js`;

interface FileContentViewerProps {
    blob: Blob;
    file: FileType;
    onLoad?: () => void;
}

const FileContentViewer: React.FC<FileContentViewerProps> = ({ blob, file, onLoad }) => {
    const [url, setUrl] = useState<string>('');
    const [numPages, setNumPages] = useState<number>();
    const [loading, setLoading] = useState<boolean>(true);
    const [scale, setScale] = useState<number>(1);

    useEffect(() => {
        setUrl(URL.createObjectURL(blob));
        return () => {
            URL.revokeObjectURL(url);
        };
    }, [blob]);

    useEffect(() => {
        const handleResize = () => {
            // Set scale based on screen width
            if (window.innerWidth <= 768) { // Mobile devices
                setScale(0.5); // 50% of original size for mobile
            } else if (window.innerWidth <= 1024) { // Tablets
                setScale(0.7); // 70% of original size for tablets
            } else {
                setScale(1); // Full size for desktop
            }
        };

        handleResize(); // Set initial scale
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    function onDocumentLoadSuccess({ numPages }: { numPages: number }): void {
        setNumPages(numPages);
        setLoading(false);
        onLoad?.();
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
                    onLoad={() => onLoad?.()}
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
                                scale={scale}
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
                    onLoad?.();
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
            onLoad?.();
            return null;

        default:
            onLoad?.();
            return null;
    }
};

export default FileContentViewer;
export const READABLE_EXTENSIONS = ["jpg", "png", "jpeg", "pdf", "txt"];
