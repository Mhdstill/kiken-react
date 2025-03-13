import React, { useState, useEffect, useRef } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faQrcode, faCamera, faLightbulb, faRotateRight } from '@fortawesome/free-solid-svg-icons';
// @ts-ignore
import { Html5Qrcode, Html5QrcodeScanType, Html5QrcodeScanner } from 'html5-qrcode';

// Interface pour les appareils de caméra
interface CameraDevice {
  id: string;
  label: string;
}

// Interface étendue pour les contraintes de la caméra
interface ExtendedMediaTrackConstraintSet extends MediaTrackConstraintSet {
  torch?: boolean;
}

const QRScanner: React.FC = () => {
  const [scanning, setScanning] = useState(true);
  const [scanError, setScanError] = useState<string | null>(null);
  const [flashOn, setFlashOn] = useState(false);
  const [cameraId, setCameraId] = useState<string | null>(null);
  const [hasPermission, setHasPermission] = useState<boolean | null>(null);
  const [scannerInitialized, setScannerInitialized] = useState(false);
  
  const isPWA = document.body.classList.contains('pwa-mode');
  const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent) && !(window as any).MSStream;
  
  const scannerRef = useRef<Html5Qrcode | null>(null);
  const scannerContainerId = "qr-reader";
  
  // Configuration améliorée pour le scanner
  const qrConfig = {
    fps: 10,
    qrbox: { width: 250, height: 250 },
    aspectRatio: 1.0,
    disableFlip: false,
    experimentalFeatures: {
      useBarCodeDetectorIfSupported: true
    },
    rememberLastUsedCamera: true,
    supportedScanTypes: [Html5QrcodeScanType.SCAN_TYPE_CAMERA],
    showTorchButtonIfSupported: true,
    showZoomSliderIfSupported: true,
  };
  
  // Fonction pour initialiser le scanner
  const initializeScanner = async () => {
    try {
      // Créer une instance de Html5Qrcode
      if (!scannerRef.current) {
        scannerRef.current = new Html5Qrcode(scannerContainerId);
      }
      
      // Obtenir la liste des caméras disponibles
      const devices = await Html5Qrcode.getCameras();
      
      if (devices && devices.length > 0) {
        // Préférer la caméra arrière si disponible
        const backCamera = devices.find((device: CameraDevice) => 
          device.label.toLowerCase().includes('back') || 
          device.label.toLowerCase().includes('arrière') ||
          device.label.toLowerCase().includes('environment')
        );
        
        // Utiliser la caméra arrière ou la première caméra disponible
        const selectedCamera = backCamera ? backCamera.id : devices[0].id;
        setCameraId(selectedCamera);
        
        // Démarrer le scanner
        startScanner(selectedCamera);
      } else {
        setScanError('Aucune caméra n\'a été trouvée sur votre appareil.');
        setHasPermission(false);
      }
    } catch (error: any) {
      console.error('Erreur lors de l\'initialisation du scanner:', error);
      setScanError('Erreur lors de l\'initialisation du scanner. Veuillez autoriser l\'accès à la caméra.');
      setHasPermission(false);
    }
  };
  
  // Fonction pour démarrer le scanner
  const startScanner = async (deviceId: string) => {
    if (!scannerRef.current) return;
    
    try {
      await scannerRef.current.start(
        { deviceId: { exact: deviceId } },
        qrConfig,
        handleQRCodeDetected,
        handleScanError
      );
      
      setHasPermission(true);
      setScannerInitialized(true);
      console.log('Scanner démarré avec succès');
      
      // Vérifier si le flash est disponible
      try {
        // Accéder directement aux pistes vidéo via l'API MediaDevices
        if (navigator.mediaDevices) {
          const stream = await navigator.mediaDevices.getUserMedia({ video: { deviceId } });
          const videoTrack = stream.getVideoTracks()[0];
          if (videoTrack) {
            const capabilities = videoTrack.getCapabilities();
            // @ts-ignore - torch n'est pas dans les types standard
            if (capabilities.torch) {
              // Flash disponible
              console.log('Flash disponible');
            } else {
              console.log('Flash non disponible');
            }
          }
          // Arrêter ce flux temporaire après vérification
          stream.getTracks().forEach(track => track.stop());
        }
      } catch (error) {
        console.log('Erreur lors de la vérification du flash:', error);
      }
    } catch (error) {
      console.error('Erreur lors du démarrage du scanner:', error);
      
      if (error instanceof Error) {
        if (error.message.includes('Permission denied') || error.message.includes('permission')) {
          setScanError('Accès à la caméra refusé. Veuillez autoriser l\'accès à la caméra dans les paramètres de votre navigateur.');
          setHasPermission(false);
        } else if (error.message.includes('starting camera')) {
          setScanError('Erreur lors du démarrage de la caméra. Veuillez réessayer.');
        } else {
          setScanError(`Erreur: ${error.message}`);
        }
      } else {
        setScanError('Une erreur inconnue s\'est produite.');
      }
    }
  };
  
  // Fonction pour arrêter le scanner
  const stopScanner = () => {
    if (scannerRef.current && scannerRef.current.isScanning) {
      scannerRef.current.stop()
        .then(() => {
          console.log('Scanner arrêté avec succès');
        })
        .catch((error: Error) => {
          console.error('Erreur lors de l\'arrêt du scanner:', error);
        });
    }
  };
  
  // Fonction pour gérer la détection d'un QR code
  const handleQRCodeDetected = (scannedUrl: string) => {
    console.log('QR Code scanné:', scannedUrl);
    
    try {
      // Vérifier si c'est une URL valide
      let url;
      try {
        url = new URL(scannedUrl);
      } catch (e) {
        // Si ce n'est pas une URL valide, essayer de préfixer avec https://
        url = new URL(`https://${scannedUrl}`);
      }
      
      // Extraire le chemin sans le domaine
      const path = url.pathname + url.search + url.hash;
      
      // Obtenir le domaine actuel
      const currentDomain = window.location.origin;
      
      // Construire la nouvelle URL avec le domaine actuel
      const newUrl = `${currentDomain}${path}`;
      
      console.log('Redirection vers:', newUrl);
      
      // Arrêter le scan
      setScanning(false);
      stopScanner();
      
      // Rediriger vers la nouvelle URL
      window.location.href = newUrl;
    } catch (error) {
      console.error('URL invalide:', error);
      setScanError('QR Code invalide. Veuillez scanner un QR Code contenant une URL valide.');
      setScanning(false);
      stopScanner();
    }
  };
  
  // Fonction pour gérer les erreurs de scan
  const handleScanError = (error: string | Error) => {
    // Ne pas afficher les erreurs de scan, seulement les erreurs d'initialisation
    // Réduire la fréquence des logs pour éviter de spammer la console
    if (Math.random() < 0.01) { // Log seulement 1% des erreurs
      console.log('Erreur de scan (ignorée):', error);
    }
  };
  
  // Fonction pour basculer le flash
  const toggleFlash = () => {
    if (!scannerRef.current || !scannerInitialized) return;
    
    try {
      const newFlashState = !flashOn;
      
      // Utiliser l'API Html5Qrcode pour modifier les contraintes
      // @ts-ignore - La méthode n'est pas correctement typée
      scannerRef.current.applyVideoConstraints({
        // @ts-ignore - torch n'est pas dans les types standard
        advanced: [{ torch: newFlashState } as ExtendedMediaTrackConstraintSet]
      }).then(() => {
        setFlashOn(newFlashState);
        console.log(`Flash ${newFlashState ? 'activé' : 'désactivé'}`);
      }).catch((error: any) => {
        console.error('Erreur lors de la modification du flash:', error);
      });
    } catch (error: any) {
      console.error('Erreur lors de la modification du flash:', error);
    }
  };
  
  // Fonction pour redémarrer le scanner
  const restartScanner = () => {
    setScanError(null);
    setScanning(true);
    
    if (cameraId) {
      startScanner(cameraId);
    } else {
      initializeScanner();
    }
  };
  
  // Initialiser le scanner au chargement du composant
  useEffect(() => {
    if (scanning && !scannerInitialized) {
      initializeScanner();
    }
    
    // Nettoyer les ressources lors du démontage du composant
    return () => {
      stopScanner();
    };
  }, [scanning, scannerInitialized]);
  
  return (
    <div className="page-home">
      <div className="c-card p-0 scanner-container">
        <div className="scanner-header">
          <h2 className="text-center mb-2 pt-3">
            <FontAwesomeIcon icon={faQrcode} className="me-2" />
            Scanner un QR Code
          </h2>
          <p className="text-center text-muted mb-3">
            Placez le QR code à l'intérieur du cadre
          </p>
        </div>

        <div className="scanner-viewport">
          {/* Conteneur pour le scanner HTML5 QR Code */}
          <div 
            id={scannerContainerId} 
            style={{ 
              width: '100%', 
              height: '100%',
              display: hasPermission === true && scanning ? 'block' : 'none'
            }}
          ></div>
          
          {/* Afficher un message d'erreur ou d'attente si nécessaire */}
          {(hasPermission !== true || !scanning) && (
            <div className="scanner-placeholder">
              {scanError ? (
                <>
                  <FontAwesomeIcon icon={faCamera} size="3x" />
                  <p className="mt-3 text-danger">{scanError}</p>
                  <button 
                    className="btn btn-outline-primary mt-3"
                    onClick={restartScanner}
                  >
                    <FontAwesomeIcon icon={faRotateRight} className="me-2" />
                    Réessayer
                  </button>
                </>
              ) : (
                <>
                  <FontAwesomeIcon icon={faCamera} size="3x" />
                  <p className="mt-3">
                    {hasPermission === false 
                      ? "Accès à la caméra refusé" 
                      : hasPermission === null 
                        ? "Initialisation de la caméra..." 
                        : "Caméra non activée"}
                  </p>
                </>
              )}
            </div>
          )}
          
          {/* Cadre de scan */}
          <div className="scanner-frame">
            <div className="corner top-left"></div>
            <div className="corner top-right"></div>
            <div className="corner bottom-left"></div>
            <div className="corner bottom-right"></div>
          </div>
        </div>

        {/* Contrôles du scanner */}
        <div className="scanner-controls">
          <button 
            className={`flash-button ${flashOn ? 'active' : ''}`}
            onClick={toggleFlash}
            disabled={!hasPermission || !scannerInitialized}
          >
            <FontAwesomeIcon icon={faLightbulb} />
            <span>{flashOn ? 'Flash ON' : 'Flash OFF'}</span>
          </button>
        </div>

        {/* Indicateur PWA */}
        {isPWA && (
          <div className="pwa-indicator mt-3 mb-3 text-center">
            <div className="pwa-badge-permanent">
              Mode PWA activé
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default QRScanner; 