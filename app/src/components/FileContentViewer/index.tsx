import React, { useState, useEffect } from 'react';
import DocViewer, { DocViewerRenderers } from "react-doc-viewer";
import { FileType } from '../../types/File';
import { triggerDownload } from '../../services/utils';
import { Document, Page } from 'react-pdf';
import { pdfjs } from 'react-pdf';
import 'react-pdf/dist/esm/Page/TextLayer.css';
import 'react-pdf/dist/esm/Page/AnnotationLayer.css';
pdfjs.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.js`;

interface FileContentViewerProps {
    blob: Blob;
    file: FileType;
}

const FileContentViewer: React.FC<FileContentViewerProps> = ({ blob, file }) => {
    const [url, setUrl] = useState<string>('');
    const [numPages, setNumPages] = useState<number>();
    const [pageNumber, setPageNumber] = useState<number>(1);

    function onDocumentLoadSuccess({ numPages }: { numPages: number }): void {
        setNumPages(numPages);
    }

    useEffect(() => {
        setUrl(URL.createObjectURL(blob));
        return () => {
            // Nettoyer l'objet URL lors du démontage du composant
            URL.revokeObjectURL(url);
        };
    }, [blob]);

    switch (file.extension?.toLowerCase()) {


        case 'jpg':
        case 'png':
        case 'jpeg':
        case 'pdf':
            return (
                <img
                    style={{
                        maxWidth: '100%',
                        height: 'auto',
                    }}
                    src={url}
                    alt="PDF"
                />
                /*
                <Document file={url} onLoadSuccess={onDocumentLoadSuccess}>
                    <Page pageNumber={pageNumber} />
                </Document> */
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

            return <pre>{text}</pre>;


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