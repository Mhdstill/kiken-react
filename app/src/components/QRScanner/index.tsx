import React, { useState, useEffect, useRef } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faQrcode, faCamera, faLightbulb, faRotateRight } from '@fortawesome/free-solid-svg-icons';
// @ts-ignore
import jsQR from 'jsqr';

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
  const [debugInfo, setDebugInfo] = useState<string>('');
  const [videoReady, setVideoReady] = useState(false);
  const [usingFallback, setUsingFallback] = useState(false);
  
  const isPWA = document.body.classList.contains('pwa-mode');
  const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent) && !(window as any).MSStream;
  
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const animationFrameRef = useRef<number | null>(null);
  
  // Fonction pour ajouter des informations de débogage
  const addDebugInfo = (info: string) => {
    console.log(info);
    setDebugInfo(prev => `${prev}\n${info}`);
  };
  
  // Fonction pour demander les permissions via le service worker
  const requestPermissionViaServiceWorker = () => {
    // Vérifier si nous sommes en développement (adresse IP) ou en production
    const isDevelopment = window.location.hostname.match(/^\d+\.\d+\.\d+\.\d+$/) !== null;
    
    if (isDevelopment) {
      addDebugInfo('Mode développement détecté, ignorant le service worker');
      return Promise.reject(new Error('Service Worker ignoré en mode développement'));
    }
    
    if ('serviceWorker' in navigator && navigator.serviceWorker.controller) {
      addDebugInfo('Demande de permission via service worker...');
      return new Promise<void>((resolve, reject) => {
        const messageChannel = new MessageChannel();
        messageChannel.port1.onmessage = (event) => {
          addDebugInfo(`Réponse du service worker: ${JSON.stringify(event.data)}`);
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
    addDebugInfo('Service Worker non disponible');
    return Promise.reject(new Error('Service Worker non disponible'));
  };
  
  // Fonction pour initialiser la vidéo avec le flux
  const initializeVideo = (stream: MediaStream) => {
    addDebugInfo('Initialisation de la vidéo avec le flux...');
    
    if (!videoRef.current) {
      addDebugInfo('ERREUR: Référence vidéo non disponible lors de l\'initialisation');
      return false;
    }
    
    try {
      // Nettoyer d'abord toute source existante
      if (videoRef.current.srcObject) {
        const oldStream = videoRef.current.srcObject as MediaStream;
        oldStream.getTracks().forEach(track => track.stop());
        videoRef.current.srcObject = null;
      }
      
      videoRef.current.srcObject = stream;
      addDebugInfo('Flux vidéo assigné à l\'élément vidéo');
      
      // Pour iOS, essayer de forcer le démarrage de la vidéo
      if (isIOS) {
        videoRef.current.play()
          .then(() => {
            addDebugInfo('Lecture vidéo démarrée immédiatement');
            setVideoReady(true);
          })
          .catch(err => {
            addDebugInfo(`Impossible de démarrer la vidéo immédiatement: ${err instanceof Error ? err.message : String(err)}`);
            // Continuer avec onloadedmetadata
          });
      }
      
      // Ajouter un gestionnaire d'événements pour savoir quand la vidéo commence à jouer
      videoRef.current.onloadedmetadata = () => {
        addDebugInfo('Métadonnées vidéo chargées');
        videoRef.current?.play()
          .then(() => {
            addDebugInfo('Lecture vidéo démarrée');
            setHasPermission(true);
            setVideoReady(true);
          })
          .catch(err => {
            addDebugInfo(`Erreur lors du démarrage de la lecture vidéo: ${err instanceof Error ? err.message : String(err)}`);
            setScanError('Erreur lors du démarrage de la caméra: ' + (err instanceof Error ? err.message : String(err)));
          });
      };
      
      videoRef.current.onerror = (err) => {
        addDebugInfo(`Erreur vidéo: ${JSON.stringify(err)}`);
        setScanError('Erreur lors de l\'initialisation de la vidéo');
      };
      
      return true;
    } catch (error) {
      addDebugInfo(`Erreur lors de l'initialisation de la vidéo: ${error instanceof Error ? error.message : String(error)}`);
      return false;
    }
  };
  
  // Effet pour démarrer la caméra
  useEffect(() => {
    // Fonction pour démarrer la caméra
    const startCamera = async () => {
      try {
        addDebugInfo('Démarrage de la caméra...');
        setPermissionRequested(true);
        
        if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
          addDebugInfo('MediaDevices API non supportée');
          // Pour iOS, essayer via le service worker
          if (isIOS) {
            try {
              await requestPermissionViaServiceWorker();
            } catch (error) {
              addDebugInfo(`Erreur service worker: ${error instanceof Error ? error.message : String(error)}`);
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
            addDebugInfo('Vérification des permissions...');
            // @ts-ignore - 'camera' n'est pas dans les types standard
            const permissionStatus = await navigator.permissions.query({ name: 'camera' });
            addDebugInfo(`État de la permission: ${permissionStatus.state}`);
            
            if (permissionStatus.state === 'denied') {
              setHasPermission(false);
              setScanError(isIOS 
                ? 'Accès à la caméra refusé. Sur iOS, allez dans Réglages > Safari > Caméra et activez l\'accès.'
                : 'Accès à la caméra refusé. Veuillez autoriser l\'accès dans les paramètres de votre navigateur.');
              return;
            }
            
            // Écouter les changements de permission
            permissionStatus.onchange = () => {
              addDebugInfo(`Changement de permission: ${permissionStatus.state}`);
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
            addDebugInfo(`Erreur lors de la vérification des permissions: ${error instanceof Error ? error.message : String(error)}`);
            // Continuer même si la vérification échoue
          }
        }
        
        // Essayer d'accéder directement à la caméra
        try {
          addDebugInfo('Tentative d\'accès à la caméra...');
          
          // Contraintes spécifiques pour iOS
          const constraints = {
            audio: false,
            video: isIOS ? 
              {
                facingMode: 'environment',
                width: { min: 640, ideal: 1280, max: 1920 },
                height: { min: 480, ideal: 720, max: 1080 }
              } : 
              { 
                facingMode: 'environment',
                width: { ideal: 1280 },
                height: { ideal: 720 }
              }
          };
          
          addDebugInfo(`Contraintes utilisées: ${JSON.stringify(constraints)}`);
          const stream = await navigator.mediaDevices.getUserMedia(constraints);
          streamRef.current = stream;
          addDebugInfo('Flux vidéo obtenu');
          
          // Attendre que le DOM soit complètement rendu avant d'initialiser la vidéo
          setTimeout(() => {
            if (initializeVideo(stream)) {
              addDebugInfo('Vidéo initialisée avec succès');
            } else {
              addDebugInfo('Échec de l\'initialisation de la vidéo');
              setScanError('Erreur lors de l\'initialisation de la vidéo. Veuillez réessayer.');
            }
          }, 100);
          
        } catch (error: any) {
          addDebugInfo(`Erreur d'accès à la caméra: ${error.name} - ${error.message}`);
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
        addDebugInfo(`Erreur générale: ${error instanceof Error ? error.message : String(error)}`);
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
  
  // Effet pour démarrer la détection de QR code une fois que la vidéo est prête
  useEffect(() => {
    if (videoReady && hasPermission && scanning) {
      addDebugInfo('Vidéo prête, démarrage de la détection de QR code...');
      
      // Utiliser BarcodeDetector API si disponible
      if ('BarcodeDetector' in window) {
        addDebugInfo('BarcodeDetector API disponible, démarrage de la détection');
        startBarcodeDetection();
      } else {
        addDebugInfo('BarcodeDetector API non disponible, utilisation de jsQR comme solution de repli');
        setUsingFallback(true);
        startJsQrScanner();
      }
    }
  }, [videoReady, hasPermission, scanning]);
  
  const startBarcodeDetection = async () => {
    if (!videoRef.current || !hasPermission || !scanning || !videoReady) {
      addDebugInfo('Impossible de démarrer la détection de code-barres: conditions non remplies');
      return;
    }
    
    try {
      addDebugInfo('Initialisation du détecteur de QR code...');
      // @ts-ignore - BarcodeDetector n'est pas encore dans les types standard de TypeScript
      const barcodeDetector = new BarcodeDetector({ formats: ['qr_code'] });
      
      const detectCode = async () => {
        if (!videoRef.current || !scanning) return;
        
        try {
          // Vérifier que la vidéo est bien chargée et en cours de lecture
          if (videoRef.current.readyState === videoRef.current.HAVE_ENOUGH_DATA) {
            // @ts-ignore
            const barcodes = await barcodeDetector.detect(videoRef.current);
            
            if (barcodes.length > 0) {
              addDebugInfo(`QR code détecté avec succès: ${barcodes[0].rawValue}`);
              // QR code détecté
              handleQRCodeDetected(barcodes[0].rawValue);
            } else {
              // Continuer à scanner
              if (scanning) {
                requestAnimationFrame(detectCode);
              }
            }
          } else {
            // La vidéo n'est pas encore prête, attendre un peu
            if (Math.random() < 0.01) { // Réduire la fréquence des logs
              addDebugInfo('Vidéo pas encore prête, nouvelle tentative...');
            }
            setTimeout(() => {
              if (scanning) {
                requestAnimationFrame(detectCode);
              }
            }, 100);
          }
        } catch (error) {
          if (Math.random() < 0.01) { // Réduire la fréquence des logs
            addDebugInfo(`Erreur lors de la détection: ${error instanceof Error ? error.message : String(error)}`);
          }
          if (scanning) {
            requestAnimationFrame(detectCode);
          }
        }
      };
      
      detectCode();
    } catch (error) {
      addDebugInfo(`BarcodeDetector non supporté ou erreur: ${error instanceof Error ? error.message : String(error)}`);
      if (isIOS) {
        setScanError('Votre version d\'iOS ne prend pas en charge la détection de QR code. Essayez de mettre à jour votre appareil.');
      } else {
        setScanError('Votre navigateur ne prend pas en charge la détection de QR code. Essayez Chrome ou Edge.');
      }
    }
  };
  
  const handleQRCodeDetected = (scannedUrl: string) => {
    addDebugInfo(`QR Code scanné: ${scannedUrl}`);
    
    try {
      // Vérifier si c'est une URL valide
      let url;
      try {
        url = new URL(scannedUrl);
      } catch (e) {
        // Si ce n'est pas une URL valide, essayer de préfixer avec https://
        try {
          url = new URL(`https://${scannedUrl}`);
        } catch (e2) {
          throw new Error('URL invalide même avec préfixe https://');
        }
      }
      
      // Extraire le chemin sans le domaine
      const path = url.pathname + url.search + url.hash;
      
      // Obtenir le domaine actuel
      const currentDomain = window.location.origin;
      
      // Construire la nouvelle URL avec le domaine actuel
      const newUrl = `${currentDomain}${path}`;
      
      addDebugInfo(`Redirection vers: ${newUrl}`);
      
      // Arrêter le scan
      setScanning(false);
      
      // Arrêter la caméra
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
      }
      
      // Rediriger vers la nouvelle URL
      window.location.href = newUrl;
    } catch (error) {
      addDebugInfo(`URL invalide: ${error instanceof Error ? error.message : String(error)}`);
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
            addDebugInfo(`Flash ${newFlashState ? 'activé' : 'désactivé'}`);
          }).catch(error => {
            addDebugInfo(`Erreur lors de l'activation du flash: ${error instanceof Error ? error.message : String(error)}`);
          });
        } else {
          addDebugInfo('Le flash n\'est pas supporté sur cet appareil');
        }
      }
    }
  };

  const restartScanner = () => {
    addDebugInfo('Redémarrage du scanner...');
    setScanError(null);
    setPermissionRequested(false);
    setScanning(true);
    setVideoReady(false);
    setUsingFallback(false);
    
    // Annuler toute animation en cours
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
      animationFrameRef.current = null;
    }
    
    setDebugInfo(''); // Réinitialiser les infos de débogage
  };

  // Fonction de détection de QR code avec jsQR (fallback)
  const startJsQrScanner = () => {
    if (!videoRef.current || !canvasRef.current || !hasPermission || !scanning) {
      addDebugInfo('Impossible de démarrer jsQR: conditions non remplies');
      return;
    }
    
    addDebugInfo('Démarrage de jsQR comme solution de repli');
    
    const canvas = canvasRef.current;
    const context = canvas.getContext('2d');
    
    if (!context) {
      addDebugInfo('Impossible d\'obtenir le contexte 2D du canvas');
      setScanError('Erreur lors de l\'initialisation du scanner');
      return;
    }
    
    const scanQrCode = () => {
      if (!videoRef.current || !canvasRef.current || !context || !scanning) {
        return;
      }
      
      // Ajuster la taille du canvas à celle de la vidéo
      const video = videoRef.current;
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      
      // Dessiner l'image vidéo sur le canvas
      context.drawImage(video, 0, 0, canvas.width, canvas.height);
      
      // Obtenir les données d'image
      const imageData = context.getImageData(0, 0, canvas.width, canvas.height);
      
      // Analyser avec jsQR
      const code = jsQR(imageData.data, imageData.width, imageData.height, {
        inversionAttempts: 'dontInvert',
      });
      
      if (code) {
        addDebugInfo(`QR code détecté avec jsQR: ${code.data}`);
        handleQRCodeDetected(code.data);
      } else if (scanning) {
        // Continuer à scanner
        animationFrameRef.current = requestAnimationFrame(scanQrCode);
      }
    };
    
    // Démarrer le scan
    animationFrameRef.current = requestAnimationFrame(scanQrCode);
  };

  // Nettoyer les ressources lors du démontage du composant
  useEffect(() => {
    return () => {
      // Nettoyer les ressources de la caméra lors du démontage
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
      }
      
      // Annuler toute animation en cours
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, []);

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
          {usingFallback && (
            <p className="text-center text-warning small">
              <FontAwesomeIcon icon={faCamera} className="me-1" />
              Mode de compatibilité activé
            </p>
          )}
        </div>

        <div className="scanner-viewport">
          <video 
            ref={videoRef} 
            id="qr-video" 
            muted 
            playsInline 
            autoPlay
            style={{ 
              width: '100%', 
              height: '100%', 
              objectFit: 'cover',
              display: hasPermission === true && scanning ? 'block' : 'none'
            }}
          />
          <canvas 
            ref={canvasRef} 
            style={{ display: 'none' }}
          />
          
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
              
              {/* Afficher les informations de débogage en mode développement */}
              {debugInfo && (
                <div className="mt-3 p-2 bg-light text-start" style={{ fontSize: '10px', maxHeight: '150px', overflow: 'auto', whiteSpace: 'pre-wrap' }}>
                  <strong>Logs de débogage:</strong>
                  {debugInfo}
                </div>
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