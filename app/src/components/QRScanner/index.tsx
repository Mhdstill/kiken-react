import React, { useState, useEffect, useRef } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faQrcode, faCamera, faLightbulb, faRotateRight } from '@fortawesome/free-solid-svg-icons';

// Interfaces personnalisées pour les capacités de la caméra
interface ExtendedMediaTrackCapabilities extends MediaTrackCapabilities {
  torch?: boolean;
}

interface ExtendedMediaTrackConstraintSet extends MediaTrackConstraintSet {
  torch?: boolean;
}

const QRScanner: React.FC = () => {
  const [flashOn, setFlashOn] = useState(false);
  const [hasPermission, setHasPermission] = useState<boolean | null>(null);
  const [scanning, setScanning] = useState(true);
  const [scanError, setScanError] = useState<string | null>(null);
  const [permissionRequested, setPermissionRequested] = useState(false);
  const isPWA = document.body.classList.contains('pwa-mode');
  const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent) && !(window as any).MSStream;
  
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  
  // Fonction pour demander les permissions via le service worker
  const requestPermissionViaServiceWorker = () => {
    if ('serviceWorker' in navigator && navigator.serviceWorker.controller) {
      return new Promise<void>((resolve, reject) => {
        const messageChannel = new MessageChannel();
        messageChannel.port1.onmessage = (event) => {
          if (event.data.type === 'CAMERA_PERMISSION_GRANTED') {
            resolve();
          } else {
            reject(new Error(event.data.error || 'Permission refusée'));
          }
        };
        
        // Vérifier que controller n'est pas null avant d'envoyer le message
        const controller = navigator.serviceWorker.controller;
        if (controller) {
          controller.postMessage({
            type: 'REQUEST_CAMERA_PERMISSION'
          }, [messageChannel.port2]);
        } else {
          reject(new Error('Service Worker non initialisé'));
        }
      });
    }
    return Promise.reject(new Error('Service Worker non disponible'));
  };
  
  useEffect(() => {
    // Fonction pour démarrer la caméra
    const startCamera = async () => {
      try {
        setPermissionRequested(true);
        
        if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
          // Pour iOS, essayer via le service worker
          if (isIOS) {
            try {
              await requestPermissionViaServiceWorker();
            } catch (error) {
              setHasPermission(false);
              setScanError('Accès à la caméra refusé. Sur iOS, veuillez autoriser l\'accès à la caméra dans les paramètres de Safari.');
              return;
            }
          } else {
            setHasPermission(false);
            setScanError('Votre appareil ne prend pas en charge l\'accès à la caméra.');
            return;
          }
        }
        
        // Demander explicitement la permission avant d'accéder à la caméra
        if (navigator.permissions && navigator.permissions.query) {
          try {
            // @ts-ignore - 'camera' n'est pas dans les types standard
            const permissionStatus = await navigator.permissions.query({ name: 'camera' });
            
            if (permissionStatus.state === 'denied') {
              setHasPermission(false);
              setScanError(isIOS 
                ? 'Accès à la caméra refusé. Sur iOS, allez dans Réglages > Safari > Caméra et activez l\'accès.'
                : 'Accès à la caméra refusé. Veuillez autoriser l\'accès dans les paramètres de votre navigateur.');
              return;
            }
            
            // Écouter les changements de permission
            permissionStatus.onchange = () => {
              if (permissionStatus.state === 'granted') {
                setHasPermission(true);
                setScanError(null);
                startCamera();
              } else if (permissionStatus.state === 'denied') {
                setHasPermission(false);
                setScanError(isIOS 
                  ? 'Accès à la caméra refusé. Sur iOS, allez dans Réglages > Safari > Caméra et activez l\'accès.'
                  : 'Accès à la caméra refusé. Veuillez autoriser l\'accès dans les paramètres de votre navigateur.');
              }
            };
          } catch (error) {
            console.log('Erreur lors de la vérification des permissions:', error);
            // Continuer même si la vérification échoue
          }
        }
        
        // Essayer d'accéder directement à la caméra
        try {
          const constraints = {
            video: { 
              facingMode: 'environment',
              width: { ideal: 1280 },
              height: { ideal: 720 }
            }
          };
          
          const stream = await navigator.mediaDevices.getUserMedia(constraints);
          streamRef.current = stream;
          
          if (videoRef.current) {
            videoRef.current.srcObject = stream;
            videoRef.current.play();
            setHasPermission(true);
            
            // Utiliser BarcodeDetector API si disponible
            if ('BarcodeDetector' in window) {
              startBarcodeDetection();
            } else {
              // Fallback pour les navigateurs qui ne supportent pas BarcodeDetector
              if (isIOS) {
                setScanError('Votre version d\'iOS ne prend pas en charge la détection de QR code. Essayez de mettre à jour votre appareil.');
              } else {
                setScanError('Votre navigateur ne prend pas en charge la détection de QR code. Essayez Chrome ou Edge.');
              }
            }
          }
        } catch (error: any) {
          console.error('Erreur d\'accès à la caméra:', error);
          setHasPermission(false);
          
          // Messages d'erreur plus spécifiques
          if (error.name === 'NotAllowedError' || error.name === 'PermissionDeniedError') {
            if (isIOS) {
              setScanError('Accès à la caméra refusé. Sur iOS, allez dans Réglages > Safari > Caméra et activez l\'accès.');
            } else {
              setScanError('Accès à la caméra refusé. Veuillez autoriser l\'accès à la caméra.');
            }
          } else if (error.name === 'NotFoundError') {
            setScanError('Aucune caméra n\'a été trouvée sur votre appareil.');
          } else if (error.name === 'NotReadableError' || error.name === 'AbortError') {
            setScanError('Impossible d\'accéder à la caméra. Elle est peut-être utilisée par une autre application.');
          } else {
            setScanError(`Erreur lors de l'accès à la caméra: ${error.message || 'Erreur inconnue'}`);
          }
        }
      } catch (error) {
        console.error('Erreur générale:', error);
        setHasPermission(false);
        setScanError('Une erreur s\'est produite lors de l\'initialisation de la caméra.');
      }
    };
    
    if (scanning && !permissionRequested) {
      startCamera();
    }
    
    return () => {
      // Nettoyer les ressources de la caméra lors du démontage
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
      }
    };
  }, [scanning, isIOS, permissionRequested]);
  
  const startBarcodeDetection = async () => {
    if (!videoRef.current || !hasPermission || !scanning) {
      return;
    }
    
    try {
      // @ts-ignore - BarcodeDetector n'est pas encore dans les types standard de TypeScript
      const barcodeDetector = new BarcodeDetector({ formats: ['qr_code'] });
      
      const detectCode = async () => {
        if (!videoRef.current || !scanning) return;
        
        try {
          // @ts-ignore
          const barcodes = await barcodeDetector.detect(videoRef.current);
          
          if (barcodes.length > 0) {
            // QR code détecté
            handleQRCodeDetected(barcodes[0].rawValue);
          } else {
            // Continuer à scanner
            if (scanning) {
              requestAnimationFrame(detectCode);
            }
          }
        } catch (error) {
          console.error('Erreur lors de la détection:', error);
          if (scanning) {
            requestAnimationFrame(detectCode);
          }
        }
      };
      
      detectCode();
    } catch (error) {
      console.error('BarcodeDetector non supporté ou erreur:', error);
      if (isIOS) {
        setScanError('Votre version d\'iOS ne prend pas en charge la détection de QR code. Essayez de mettre à jour votre appareil.');
      } else {
        setScanError('Votre navigateur ne prend pas en charge la détection de QR code. Essayez Chrome ou Edge.');
      }
    }
  };
  
  const handleQRCodeDetected = (scannedUrl: string) => {
    console.log('QR Code scanné:', scannedUrl);
    
    try {
      // Vérifier si c'est une URL valide
      const url = new URL(scannedUrl);
      
      // Extraire le chemin sans le domaine
      const path = url.pathname + url.search + url.hash;
      
      // Obtenir le domaine actuel
      const currentDomain = window.location.origin;
      
      // Construire la nouvelle URL avec le domaine actuel
      const newUrl = `${currentDomain}${path}`;
      
      console.log('Redirection vers:', newUrl);
      
      // Arrêter le scan
      setScanning(false);
      
      // Arrêter la caméra
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
      }
      
      // Rediriger vers la nouvelle URL
      window.location.href = newUrl;
    } catch (error) {
      console.error('URL invalide:', error);
      setScanError('QR Code invalide. Veuillez scanner un QR Code contenant une URL valide.');
      setScanning(false);
    }
  };

  const toggleFlash = () => {
    if (streamRef.current) {
      const tracks = streamRef.current.getVideoTracks();
      if (tracks.length > 0) {
        const track = tracks[0];
        const capabilities = track.getCapabilities() as ExtendedMediaTrackCapabilities;
        
        // Vérifier si le flash est supporté
        if (capabilities.torch) {
          const newFlashState = !flashOn;
          track.applyConstraints({
            advanced: [{ torch: newFlashState } as ExtendedMediaTrackConstraintSet]
          }).then(() => {
            setFlashOn(newFlashState);
          }).catch(error => {
            console.error('Erreur lors de l\'activation du flash:', error);
          });
        } else {
          console.log('Le flash n\'est pas supporté sur cet appareil');
        }
      }
    }
  };

  const restartScanner = () => {
    setScanError(null);
    setPermissionRequested(false);
    setScanning(true);
  };

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
          {hasPermission === true && scanning ? (
            <>
              <video 
                ref={videoRef} 
                id="qr-video" 
                muted 
                playsInline 
                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
              />
              <canvas 
                ref={canvasRef} 
                style={{ display: 'none' }}
              />
            </>
          ) : (
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
          <div className="scanner-frame">
            <div className="corner top-left"></div>
            <div className="corner top-right"></div>
            <div className="corner bottom-left"></div>
            <div className="corner bottom-right"></div>
          </div>
        </div>

        <div className="scanner-controls">
          <button 
            className={`flash-button ${flashOn ? 'active' : ''}`}
            onClick={toggleFlash}
            disabled={!hasPermission}
          >
            <FontAwesomeIcon icon={faLightbulb} />
            <span>{flashOn ? 'Flash ON' : 'Flash OFF'}</span>
          </button>
        </div>

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