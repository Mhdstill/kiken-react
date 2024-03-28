import React from 'react';
import { ModalAction, FileAction as Action } from './auth/auth';
import { FileType } from '../types/File'; // Assurez-vous d'importer le bon type de fichier ici
import DocViewer, { DocViewerRenderers } from 'react-doc-viewer';

// Fonction utilitaire pour rendre le contenu de fichier dans la modal en fonction du type de fichier
export const renderFileContentFromBlob = (blob: Blob, file: FileType, modalDispatch: React.Dispatch<any>, t: (key: string) => string): void => {
  const url = URL.createObjectURL(blob);
  /*
  if (blob.type.indexOf('image') > -1 || blob.type === 'application/pdf') {
    modalDispatch({
      type: Action.SHOW_FILE,
      imageFile: url,
      onOk: () => triggerDownload(file.name, url),
      okText: t('modal.download'),
    });
  } else {
    triggerDownload(file.name, url);
  }*/


  switch (file.extension?.toLowerCase()) {

    // PDF
    case 'pdf':
      modalDispatch({
        type: Action.SHOW_FILE,
        imageFile: url,
        onOk: () => triggerDownload(file.name, url),
        okText: t('modal.download'),
      });
      break;



    // XLS & XLSX
    case 'xlsx':
    case 'xls':
      modalDispatch({
        type: Action.SHOW_CONTENT,
        onOk: () => triggerDownload(file.name, url),
        okText: t('modal.download'),
        content: <>ICI</>
      });



    //DOC & DOCX
    case 'doc':
    case 'docx':
      const docs = [
        {
          uri:
            url
        },
      ];
      modalDispatch({
        type: Action.SHOW_CONTENT,
        onOk: () => triggerDownload(file.name, URL.createObjectURL(blob)),
        okText: t('modal.download'),
        content: <DocViewer
          documents={docs}
          pluginRenderers={DocViewerRenderers}
          config={{
            header: {
              disableHeader: false,
              disableFileName: false,
              retainURLParams: false
            }
          }}
          style={{ height: 500 }}
        />,
      });
      break;


    // TXT
    case 'txt':
      const reader = new FileReader();
      reader.onload = (event) => {
        const text = event.target?.result as string;
        modalDispatch({
          type: Action.SHOW_CONTENT,
          onOk: () => triggerDownload(file.name, URL.createObjectURL(blob)),
          okText: t('modal.download'),
          content: <pre>{text}</pre>,
        });
      };
      reader.readAsText(blob);
      break;


    // Default
    default:
      // Si le type de fichier n'est pas géré, afficher une image par défaut ou un message d'erreur
      triggerDownload(file.name, url);
      break;
  }
};

// Fonction utilitaire pour télécharger le fichier
const triggerDownload = (filename: string, data: string): void => {
  const a = document.createElement('a');
  a.href = data;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  setTimeout(() => {
    window.URL.revokeObjectURL(data); // Delay revoking the ObjectURL for Firefox
  }, 100);
};
