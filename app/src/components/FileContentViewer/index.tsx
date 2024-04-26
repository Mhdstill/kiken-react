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
    const [pageNumber, setPageNumber] = useState<number>(1);
    const [documentWidth, setDocumentWidth] = useState<number>(0);
    const [loading, setLoading] = useState<boolean>(false);


    useEffect(() => {
        setUrl(URL.createObjectURL(blob));
        return () => {
            // Nettoyer l'objet URL lors du démontage du composant
            URL.revokeObjectURL(url);
        };
    }, [blob]);

    function waitForElementAndResize(selector: string, callback: (element: HTMLElement) => void) {
        const observer = new MutationObserver((mutationsList) => {
            for (const mutation of mutationsList) {
                if (mutation.type === 'childList') {
                    const element = document.querySelector(selector) as HTMLElement;
                    if (element) {
                        callback(element);
                        observeResize(element);
                        observer.disconnect(); // Arrêter d'observer une fois que l'élément est trouvé
                        break;
                    }
                }
            }
        });

        observer.observe(document.body, { childList: true, subtree: true });
    }

    function observeResize(element: HTMLElement) {
        const resizeObserver = new ResizeObserver(() => {
            console.log('Element resized');

            // Mettre à jour la modal
            const modal = document.querySelector('.ant-modal') as HTMLElement;
            const modalBody = document.querySelector('.ant-modal-body') as HTMLElement;
            if (modal && modalBody) {
                const pdfWidth = element.clientWidth;
                const largeurEcran = window.innerWidth;
                var newWidth = pdfWidth + 48;
                console.log(newWidth)
                if (largeurEcran <= pdfWidth) {
                    newWidth = largeurEcran - 48;
                    const style = document.createElement('style');
                    style.textContent = `
                            .react-pdf__Page {
                                width: ${newWidth} !important;
                            }
                            .react-pdf__Page__canvas {
                                max-width: 100% !important;
                                height: auto !important;
                            }
                        `;
                    document.head.appendChild(style);
                    /*
                    console.log(newWidth)
                    const pages = document.querySelectorAll('.react-pdf__Page');
                    pages.forEach((page: any) => {
                        console.log(page);
                        page.style.width = `${newWidth - 50}px`;
                    });
                    const canvas = document.querySelectorAll('.react-pdf__Page__canvas');
                    canvas.forEach((canva: any) => {
                        canva.style.width = `100%`;
                        canva.style.height = `auto`;
                    }); */
                }
                modal.style.width = `${newWidth}px`;
                modalBody.style.width = `${newWidth}px`;

            }
        });

        resizeObserver.observe(element);
    }

    function onDocumentLoadSuccess({ numPages }: { numPages: number }): void {
        setNumPages(numPages);
        waitForElementAndResize('.react-pdf__Page', (documentElement: HTMLElement) => {
            console.log(documentElement.clientWidth);
        });
    }

    switch (file.extension?.toLowerCase()) {
        case 'jpg':
        case 'png':
        case 'jpeg':
            return (
                <img
                    style={{
                        maxWidth: '100%',
                        height: 'auto',
                    }}
                    src={url}
                    alt="PDF"
                />
            );

        case 'pdf':
            return (
                <div id="pdf-document" style={{ maxWidth: '100%' }}>
                    {loading ? (<Spin size="large" />) : (<></>)}

                    <div style={{ maxWidth: '100%', display: loading ? 'none' : 'block' }}>
                        <Document file={url} onLoadSuccess={onDocumentLoadSuccess}>
                            {[...Array(numPages)].map((_, index) => (
                                <Page key={`page_${index + 1}`} pageNumber={index + 1} />
                            ))}
                        </Document>
                    </div>
                </div >
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
