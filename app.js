// Reviewer — Version Web (thème, navigation)
function toggleTheme() {
  const body = document.body;
  const isDark = body.classList.contains('dark-theme');
  body.classList.toggle('dark-theme', !isDark);
  body.classList.toggle('light-theme', isDark);
  const btn = document.getElementById('themeToggle');
  if (btn) btn.textContent = isDark ? 'MODE CLAIR' : 'MODE SOMBRE';
  localStorage.setItem('theme', isDark ? 'light' : 'dark');
}

function switchView(viewName) {
  document.querySelectorAll('.view').forEach(function(v) { v.classList.remove('active'); });
  const target = document.getElementById(viewName + 'View');
  if (target) target.classList.add('active');
  document.querySelectorAll('.nav-btn').forEach(function(btn) {
    btn.classList.toggle('active', btn.dataset.view === viewName);
  });
}

document.addEventListener('DOMContentLoaded', function() {
  var savedTheme = localStorage.getItem('theme') || 'light';
  if (savedTheme === 'dark') {
    document.body.classList.add('dark-theme');
    document.body.classList.remove('light-theme');
    var t = document.getElementById('themeToggle');
    if (t) t.textContent = 'MODE CLAIR';
  } else {
    document.body.classList.add('light-theme');
    document.body.classList.remove('dark-theme');
    var t = document.getElementById('themeToggle');
    if (t) t.textContent = 'MODE SOMBRE';
  }
  document.querySelectorAll('.nav-btn').forEach(function(btn) {
    btn.addEventListener('click', function(e) {
      e.preventDefault();
      if (btn.dataset.view) switchView(btn.dataset.view);
    });
  });
  var themeToggle = document.getElementById('themeToggle');
  if (themeToggle) themeToggle.addEventListener('click', toggleTheme);
});

document.addEventListener('DOMContentLoaded', function initVideoAndImport() {
            // Éléments DOM
            const videoPlayer = document.getElementById('videoPlayer');
            const videoInput = document.getElementById('videoInput');
            if (!videoPlayer || !videoInput) {
                console.error('Reviewer: videoPlayer ou videoInput introuvable.');
                return;
            }
            const videoContainer = document.querySelector('.video-container');
            if (!videoContainer) {
                console.error('Reviewer: videoContainer introuvable.');
                return;
            }
            const overlayImage = document.getElementById('overlayImage');
            const overlayInput = document.getElementById('overlayInput');
            const dropZoneOverlay = document.getElementById('dropZoneOverlay');
            const videoPlaceholder = document.getElementById('videoPlaceholder');
            const toggleOverlayBtn = document.getElementById('toggleOverlay');
            const toggleOrientationBtn = document.getElementById('toggleOrientation');
            const captureScreenshotBtn = document.getElementById('captureScreenshot');
            const opacitySlider = document.getElementById('opacitySlider');
            const xPosSlider = document.getElementById('xPosSlider');
            const yPosSlider = document.getElementById('yPosSlider');
            const widthSlider = document.getElementById('widthSlider');
            const heightSlider = document.getElementById('heightSlider');
            const opacityValue = document.getElementById('opacityValue');
            const xPosValue = document.getElementById('xPosValue');
            const yPosValue = document.getElementById('yPosValue');
            const widthValue = document.getElementById('widthValue');
            const heightValue = document.getElementById('heightValue');
            const notesList = document.getElementById('notesList');
            const noteInput = document.getElementById('noteInput');
            const thumbnailPreview = document.getElementById('thumbnailPreview');
            const addNoteBtn = document.getElementById('addNoteBtn');
            const exportNotesBtn = document.getElementById('exportNotesBtn');
            const exportNotesWithImagesBtn = document.getElementById('exportNotesWithImagesBtn');
            
            // Nouveaux éléments contrôles vidéo
            const progressBar = document.getElementById('progressBar');
            const bufferedBar = document.getElementById('bufferedBar');
            const progressContainer = document.getElementById('progressContainer');
            const playPauseBtn = document.getElementById('playPauseBtn');
            const prevFrameBtn = document.getElementById('prevFrameBtn');
            const nextFrameBtn = document.getElementById('nextFrameBtn');
            const timeDisplay = document.getElementById('timeDisplay');
            const speedSelector = document.getElementById('speedSelector');
            const volumeBtn = document.getElementById('volumeBtn');
            const volumeSlider = document.getElementById('volumeSlider');
            const fullscreenBtn = document.getElementById('fullscreenBtn');
            const helpBtn = document.getElementById('helpBtn');
            const keyboardControls = document.getElementById('keyboardControls');
            const timeTooltip = document.getElementById('timeTooltip');
            
            // Tableau pour stocker les notes et les images clés
            let notes = [];
            let keyframes = [];
            let currentThumbnail = null;
            let inPoint = null;
            let outPoint = null;
            
            // État de lecture
            let isPlaying = false;
            const FRAME_RATE = 30; // Images par seconde par défaut
            const FRAME_DURATION = 1 / FRAME_RATE;
            
            // Variables pour le glissement du curseur
            let isDraggingPlayhead = false;
            
            // === VARIABLES POUR RACCOURCIS J-K-L ===
            let jklPlaybackSpeed = 1; // Vitesse actuelle (1x, 2x, 4x, 8x)
            let jklDirection = 0; // -1 = arrière (J), 0 = pause (K), 1 = avant (L)
            let jklRewindInterval = null; // Interval pour la lecture arrière
            
            // Masquer le placeholder si la vidéo est déjà chargée
            if (videoPlayer.src) {
                videoPlaceholder.style.display = 'none';
            }
            
            // Configuration du glisser-déposer : overlay global + phase capture
            var globalDropOverlay = document.getElementById('globalDropOverlay');
            function preventDefaults(e) {
                e.preventDefault();
                e.stopPropagation();
            }
            
            function hasFiles(dt) {
                return dt && dt.types && (dt.types.indexOf('Files') !== -1 || Array.prototype.indexOf.call(dt.types, 'Files') !== -1);
            }
            
            document.addEventListener('dragenter', function(e) {
                if (hasFiles(e.dataTransfer)) {
                    e.preventDefault();
                    e.stopPropagation();
                    if (globalDropOverlay) globalDropOverlay.classList.add('active');
                    highlight();
                }
            }, true);
            
            document.addEventListener('dragover', function(e) {
                if (hasFiles(e.dataTransfer)) {
                    e.preventDefault();
                    e.stopPropagation();
                    e.dataTransfer.dropEffect = 'copy';
                }
            }, true);
            
            document.addEventListener('dragleave', function(e) {
                if (!e.relatedTarget || !document.contains(e.relatedTarget)) {
                    if (globalDropOverlay) globalDropOverlay.classList.remove('active');
                    unhighlight();
                }
            }, true);
            
            document.addEventListener('drop', function(e) {
                if (e.dataTransfer.files && e.dataTransfer.files.length) {
                    e.preventDefault();
                    e.stopPropagation();
                    if (globalDropOverlay) globalDropOverlay.classList.remove('active');
                    unhighlight();
                    handleDrop(e);
                }
            }, true);
            
            if (globalDropOverlay) {
                globalDropOverlay.addEventListener('dragover', function(e) {
                    e.preventDefault();
                    e.stopPropagation();
                    e.dataTransfer.dropEffect = 'copy';
                }, false);
                globalDropOverlay.addEventListener('drop', function(e) {
                    e.preventDefault();
                    e.stopPropagation();
                    globalDropOverlay.classList.remove('active');
                    unhighlight();
                    handleDrop(e);
                }, false);
            }
            
            ['dragenter', 'dragover'].forEach(eventName => {
                videoContainer.addEventListener(eventName, highlight, false);
            });
            
            ['dragleave', 'drop'].forEach(eventName => {
                videoContainer.addEventListener(eventName, unhighlight, false);
            });
            
            function highlight() {
                videoContainer.classList.add('drop-target');
                if (dropZoneOverlay) dropZoneOverlay.classList.add('active');
            }
            
            function unhighlight() {
                videoContainer.classList.remove('drop-target');
                if (dropZoneOverlay) dropZoneOverlay.classList.remove('active');
            }
            
            videoContainer.addEventListener('drop', handleDrop, false);
            videoPlayer.addEventListener('dragover', preventDefaults, false);
            videoPlayer.addEventListener('drop', function(e) {
                preventDefaults(e);
                handleDrop(e);
            }, false);
            if (dropZoneOverlay) {
                dropZoneOverlay.addEventListener('dragover', preventDefaults, false);
                dropZoneOverlay.addEventListener('drop', function(e) {
                    preventDefaults(e);
                    handleDrop(e);
                }, false);
            }
            
            function handleDrop(e) {
                e.preventDefault();
                e.stopPropagation();
                const dt = e.dataTransfer;
                const file = dt.files && dt.files.length ? dt.files[0] : null;
                
                if (file) {
                    if (file.type.startsWith('video/')) {
                        handleVideoFile(file);
                    } else if (file.type === 'image/png') {
                        handleOverlayFile(file);
                    } else {
                        showNotification('TYPE DE FICHIER NON SUPPORTE. UTILISEZ DES VIDEOS OU DES IMAGES PNG.');
                    }
                }
            }
            
            // Fonction pour gérer les fichiers vidéo (sélection fichier ou glisser-déposer)
            function handleVideoFile(file) {
                if (!file || !videoPlayer) return;
                if (videoPlayer.src && videoPlayer.src.indexOf('blob:') === 0) {
                    URL.revokeObjectURL(videoPlayer.src);
                }
                // Retirer les <source> pour que le navigateur utilise notre blob
                while (videoPlayer.firstChild) videoPlayer.removeChild(videoPlayer.firstChild);
                const videoURL = URL.createObjectURL(file);
                videoPlayer.src = videoURL;
                videoPlayer.load();
                
                videoPlayer.addEventListener('loadedmetadata', function onceMeta() {
                    var w = videoPlayer.videoWidth, h = videoPlayer.videoHeight;
                    if (w && h && videoContainer) {
                        videoContainer.classList.remove('player-1080x1930');
                        videoContainer.style.setProperty('aspect-ratio', w + ' / ' + h);
                        videoContainer.style.setProperty('--video-aspect', String(w / h));
                        videoContainer.classList.add('has-video');
                    }
                }, { once: true });
                videoPlayer.addEventListener('loadeddata', function onceLoaded() {
                    if (videoPlaceholder) videoPlaceholder.style.display = 'none';
                    videoPlayer.removeEventListener('loadeddata', onceLoaded);
                    showNotification('VIDEO CHARGEE AVEC SUCCES');
                }, { once: true });
                videoPlayer.addEventListener('error', function() {
                    showNotification('Erreur de chargement de la video');
                }, { once: true });
                
                notes = [];
                updateNotesList();
            }
            
            // Fonction pour gérer les images PNG
            function handleOverlayFile(file) {
                const reader = new FileReader();
                reader.onload = function(e) {
                    const imageDataURL = e.target.result;
                    overlayImage.src = imageDataURL;
                    overlayImage.style.display = 'block';
                    // Sauvegarder dans localStorage
                    localStorage.setItem('reviewerDefaultOverlay', imageDataURL);
                    showNotification('OVERLAY CHARGE AVEC SUCCES');
                };
                reader.readAsDataURL(file);
            }
            
            // Overlay par défaut en mémoire mais masqué à l'ouverture (activation via OVERLAY ON/OFF)
            var defaultOverlayUrl = 'assets/default-overlay.png';
            var savedOverlay = localStorage.getItem('reviewerDefaultOverlay');
            if (savedOverlay) {
                overlayImage.src = savedOverlay;
            } else {
                overlayImage.src = defaultOverlayUrl;
            }
            overlayImage.style.display = 'none';
            
            // Événements file input normaux
            videoInput.addEventListener('change', function(e) {
                const file = e.target.files[0];
                if (file) {
                    handleVideoFile(file);
                }
            });
            
            overlayInput.addEventListener('change', function(e) {
                const file = e.target.files[0];
                if (file) {
                    handleOverlayFile(file);
                }
            });
            
            // Afficher/masquer l'overlay
            toggleOverlayBtn.addEventListener('click', function() {
                if (overlayImage.style.display === 'none' || overlayImage.style.display === '') {
                    overlayImage.style.display = 'block';
                } else {
                    overlayImage.style.display = 'none';
                }
            });
            
            // Basculer l'orientation (mode vertical par défaut) - optionnel
            if (toggleOrientationBtn) {
                if (videoContainer.classList.contains('vertical')) {
                    toggleOrientationBtn.textContent = 'MODE HORIZONTAL';
                }
                toggleOrientationBtn.addEventListener('click', function() {
                    videoContainer.classList.toggle('vertical');
                    if (videoContainer.classList.contains('vertical')) {
                        toggleOrientationBtn.textContent = 'MODE HORIZONTAL';
                    } else {
                        toggleOrientationBtn.textContent = 'MODE VERTICAL';
                    }
                });
            }

            if (captureScreenshotBtn) {
                captureScreenshotBtn.addEventListener('click', function() {
                    captureThumbnail();
                });
            }
            
            // Fonction pour capturer une capture d'écran
            function captureScreenshot() {
                // Créer un canvas pour dessiner la vidéo
                const canvas = document.createElement('canvas');
                canvas.width = videoPlayer.videoWidth;
                canvas.height = videoPlayer.videoHeight;
                const ctx = canvas.getContext('2d');
                
                // Dessiner la vidéo sur le canvas
                ctx.drawImage(videoPlayer, 0, 0, canvas.width, canvas.height);
                
                // Si l'overlay est visible, le dessiner également
                if (overlayImage.style.display !== 'none') {
                    // Convertir les pourcentages en valeurs réelles
                    const xPos = (parseFloat(overlayImage.style.left || 0) / 100) * canvas.width;
                    const yPos = (parseFloat(overlayImage.style.top || 0) / 100) * canvas.height;
                    const width = (parseFloat(overlayImage.style.width || 100) / 100) * canvas.width;
                    const height = (parseFloat(overlayImage.style.height || 100) / 100) * canvas.height;
                    
                    // Dessiner l'overlay avec les paramètres actuels
                    ctx.globalAlpha = parseFloat(overlayImage.style.opacity || 1);
                    if (overlayImage.complete) {
                        ctx.drawImage(overlayImage, xPos, yPos, width, height);
                    }
                    ctx.globalAlpha = 1.0;
                }
                
                // Utiliser la capture pour ajouter une miniature aux notes
                const dataURL = canvas.toDataURL('image/jpeg', 0.8);
                currentThumbnail = {
                    dataURL: dataURL,
                    time: videoPlayer.currentTime
                };
                updateThumbnailPreview();
                
                showNotification('Capture réalisée - Prête pour une note');
            }
            
            if (opacitySlider) {
                opacitySlider.addEventListener('input', function() {
                    overlayImage.style.opacity = this.value;
                    if (opacityValue) opacityValue.textContent = parseFloat(this.value).toFixed(1);
                });
            }
            if (xPosSlider) {
                xPosSlider.addEventListener('input', function() {
                    overlayImage.style.left = this.value + '%';
                    if (xPosValue) xPosValue.textContent = this.value + '%';
                });
            }
            if (yPosSlider) {
                yPosSlider.addEventListener('input', function() {
                    overlayImage.style.top = this.value + '%';
                    if (yPosValue) yPosValue.textContent = this.value + '%';
                });
            }
            if (widthSlider) {
                widthSlider.addEventListener('input', function() {
                    overlayImage.style.width = this.value + '%';
                    overlayImage.style.height = 'auto';
                    if (widthValue) widthValue.textContent = this.value + '%';
                });
            }
            if (heightSlider) {
                heightSlider.addEventListener('input', function() {
                    overlayImage.style.height = this.value + '%';
                    overlayImage.style.width = 'auto';
                    if (heightValue) heightValue.textContent = this.value + '%';
                });
            }
            
            // Gestion des contrôles vidéo personnalisés
            
            // Mise à jour de la barre de progression
            videoPlayer.addEventListener('timeupdate', updateProgress);
            
            function updateProgress() {
                const currentTime = videoPlayer.currentTime;
                const duration = videoPlayer.duration || 0;
                
                if (duration > 0) {
                    const percentage = (currentTime / duration) * 100;
                    progressBar.style.width = `${percentage}%`;
                    
                    // Mise à jour de la position du curseur de lecture
                    playhead.style.left = `${percentage}%`;
                    
                    // Mise à jour du temps affiché
                    timeDisplay.textContent = `${formatTimecodeShort(currentTime)} / ${formatTimecodeShort(duration)}`;
                }
                
                // Mise à jour des buffered
                updateBufferedBar();
            }
            
            // Mise à jour de la barre de buffer
            function updateBufferedBar() {
                if (videoPlayer.buffered.length > 0) {
                    const bufferedEnd = videoPlayer.buffered.end(videoPlayer.buffered.length - 1);
                    const duration = videoPlayer.duration;
                    const bufferedPercentage = (bufferedEnd / duration) * 100;
                    bufferedBar.style.width = `${bufferedPercentage}%`;
                }
            }
            
            // Format de timecode court (HH:MM:SS)
            function formatTimecodeShort(timeInSeconds) {
                const hours = Math.floor(timeInSeconds / 3600);
                const minutes = Math.floor((timeInSeconds % 3600) / 60);
                const seconds = Math.floor(timeInSeconds % 60);
                
                return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
            }
            
            // Clic sur la barre de progression
            progressContainer.addEventListener('click', seek);
            
            function seek(e) {
                const rect = progressContainer.getBoundingClientRect();
                const clickPositionRatio = (e.clientX - rect.left) / rect.width;
                const seekTime = clickPositionRatio * videoPlayer.duration;
                videoPlayer.currentTime = seekTime;
            }
            
            function updatePlayPauseIcon(isPlaying) {
                var playIcon = document.querySelector('.play-icon');
                var pauseIcon = document.querySelector('.pause-icon');
                if (playIcon && pauseIcon) {
                    playIcon.style.display = isPlaying ? 'none' : 'block';
                    pauseIcon.style.display = isPlaying ? 'block' : 'none';
                }
            }
            
            playPauseBtn.addEventListener('click', togglePlayPause);
            
            function togglePlayPause() {
                if (videoPlayer.paused) {
                    videoPlayer.play();
                    isPlaying = true;
                } else {
                    videoPlayer.pause();
                    isPlaying = false;
                }
                updatePlayPauseIcon(isPlaying);
            }
            
            videoPlayer.addEventListener('play', function() {
                isPlaying = true;
                updatePlayPauseIcon(true);
            });
            videoPlayer.addEventListener('pause', function() {
                isPlaying = false;
                updatePlayPauseIcon(false);
            });
            
            // Navigation par image
            prevFrameBtn.addEventListener('click', prevFrame);
            nextFrameBtn.addEventListener('click', nextFrame);
            
            function prevFrame() {
                if (!videoPlayer.paused) {
                    videoPlayer.pause();
                }
                videoPlayer.currentTime = Math.max(0, videoPlayer.currentTime - FRAME_DURATION);
            }
            
            function nextFrame() {
                if (!videoPlayer.paused) {
                    videoPlayer.pause();
                }
                videoPlayer.currentTime = Math.min(videoPlayer.duration, videoPlayer.currentTime + FRAME_DURATION);
            }
            
            // Contrôle de vitesse
            speedSelector.addEventListener('change', function() {
                videoPlayer.playbackRate = parseFloat(this.value);
                showNotification(`Vitesse: ${this.value}×`);
            });
            
            // Contrôle du volume
            volumeSlider.addEventListener('input', function() {
                videoPlayer.volume = this.value;
                updateVolumeIcon(videoPlayer.muted, this.value);
            });
            
            volumeBtn.addEventListener('click', function() {
                if (videoPlayer.muted) {
                    videoPlayer.muted = false;
                    volumeSlider.value = videoPlayer.volume;
                } else {
                    videoPlayer.muted = true;
                }
                updateVolumeIcon(videoPlayer.muted, volumeSlider.value);
            });
            
            function updateVolumeIcon(muted, volume) {
                var high = volumeBtn.querySelector('.volume-high');
                var mutedEl = volumeBtn.querySelector('.volume-muted');
                var waves = volumeBtn.querySelector('.volume-waves');
                if (high && mutedEl) {
                    if (muted || volume <= 0) {
                        high.style.display = 'none';
                        if (mutedEl) mutedEl.style.display = 'block';
                        if (waves) waves.style.display = 'none';
                    } else {
                        if (mutedEl) mutedEl.style.display = 'none';
                        high.style.display = 'block';
                        if (waves) waves.style.display = volume > 0.5 ? 'block' : 'none';
                    }
                }
            }
            
            // Plein écran
            fullscreenBtn.addEventListener('click', toggleFullscreen);
            
            function toggleFullscreen() {
                var fullscreenTarget = videoContainer.closest('.player-section') || videoContainer;
                if (!document.fullscreenElement) {
                    fullscreenTarget.requestFullscreen().catch(err => {
                        showNotification(`Erreur: ${err.message}`);
                    });
                } else {
                    document.exitFullscreen();
                }
            }
            
            if (helpBtn) {
                helpBtn.addEventListener('click', toggleHelp);
            }
            
            function toggleHelp() {
                keyboardControls.classList.toggle('visible');
            }
            
            // Ajouter un marqueur pour une note dans la timeline
            function addNoteMarker(note) {
                // Marqueur standard pour les notes ponctuelles
                if (!note.isSegment) {
                    const marker = document.createElement('div');
                    marker.className = 'time-marker';
                    marker.id = `note-marker-${note.time.toString().replace('.', '-')}`;
                    const positionPercent = (note.time / videoPlayer.duration) * 100;
                    marker.style.left = `${positionPercent}%`;
                    marker.title = note.text || 'Note';
                    marker.dataset.time = note.time;
                    
                    // Événement de clic sur le marqueur
                    marker.addEventListener('click', function(e) {
                        e.stopPropagation();
                        videoPlayer.currentTime = parseFloat(this.dataset.time);
                    });
                    
                    progressContainer.appendChild(marker);
                } 
                // Marqueurs spéciaux pour les segments (IN et OUT)
                else {
                    // Marqueur IN
                    const markerIn = document.createElement('div');
                    markerIn.className = 'time-marker segment-marker segment-marker-in';
                    markerIn.id = `segment-marker-in-${note.time.toString().replace('.', '-')}`;
                    const positionInPercent = (note.time / videoPlayer.duration) * 100;
                    markerIn.style.left = `${positionInPercent}%`;
                    markerIn.title = `Début: ${formatTimecodeShort(note.time)}`;
                    markerIn.dataset.time = note.time;
                    markerIn.dataset.outTime = note.outTime;
                    markerIn.dataset.index = notes.indexOf(note);
                    
                    // Marqueur OUT
                    const markerOut = document.createElement('div');
                    markerOut.className = 'time-marker segment-marker segment-marker-out';
                    markerOut.id = `segment-marker-out-${note.outTime.toString().replace('.', '-')}`;
                    const positionOutPercent = (note.outTime / videoPlayer.duration) * 100;
                    markerOut.style.left = `${positionOutPercent}%`;
                    markerOut.title = `Fin: ${formatTimecodeShort(note.outTime)}`;
                    markerOut.dataset.time = note.outTime;
                    markerOut.dataset.inTime = note.time;
                    markerOut.dataset.index = notes.indexOf(note);
                    
                    // Zone de segment
                    const segmentZone = document.createElement('div');
                    segmentZone.className = 'segment-zone';
                    segmentZone.style.left = `${positionInPercent}%`;
                    segmentZone.style.width = `${positionOutPercent - positionInPercent}%`;
                    segmentZone.title = note.text || `Segment: ${formatTimecodeShort(note.time)} - ${formatTimecodeShort(note.outTime)}`;
                    segmentZone.dataset.inTime = note.time;
                    segmentZone.dataset.outTime = note.outTime;
                    segmentZone.dataset.index = notes.indexOf(note);
                    
                    // Événements pour les marqueurs et la zone
                    [markerIn, markerOut, segmentZone].forEach(elem => {
                        elem.addEventListener('click', function(e) {
                            e.stopPropagation();
                            const index = parseInt(this.dataset.index);
                            const note = notes[index];
                            
                            // Naviguer vers le point IN
                            videoPlayer.currentTime = note.time;
                            
                            // Proposer la lecture du segment
                            showSegmentPlayButton(note);
                        });
                    });
                    
                    // Ajouter tous les éléments à la barre de progression
                    progressContainer.appendChild(segmentZone);
                    progressContainer.appendChild(markerIn);
                    progressContainer.appendChild(markerOut);
                }
            }
            
            // Afficher un bouton de lecture temporaire pour un segment
            function showSegmentPlayButton(note) {
                // Supprimer tout bouton existant
                const existingBtn = document.getElementById('segment-play-float-btn');
                if (existingBtn) {
                    existingBtn.remove();
                }
                
                // Créer un nouveau bouton flottant
                const playBtn = document.createElement('button');
                playBtn.id = 'segment-play-float-btn';
                playBtn.className = 'segment-play-float-btn';
                playBtn.innerHTML = `▶️ Lire <span>${formatTimecodeShort(note.time)} - ${formatTimecodeShort(note.outTime)}</span>`;
                
                playBtn.addEventListener('click', function() {
                    playSegment(note.time, note.outTime);
                    this.remove();
                });
                
                // Ajouter à la barre de progression
                progressContainer.appendChild(playBtn);
                
                // Positionner le bouton
                const posInPercent = (note.time / videoPlayer.duration) * 100;
                const posOutPercent = (note.outTime / videoPlayer.duration) * 100;
                const centerPos = (posInPercent + posOutPercent) / 2;
                playBtn.style.left = `${centerPos}%`;
                
                // Supprimer après un délai
                setTimeout(() => {
                    if (playBtn.parentNode) {
                        playBtn.parentNode.removeChild(playBtn);
                    }
                }, 3000);
            }
            
            // Fonction pour marquer une image clé
            function addKeyframe() {
                const currentTime = videoPlayer.currentTime;
                const timecode = formatTimecode(currentTime);
                
                // Vérifier si ce keyframe existe déjà
                const existingIndex = keyframes.findIndex(kf => Math.abs(kf.time - currentTime) < 0.01);
                
                if (existingIndex !== -1) {
                    keyframes.splice(existingIndex, 1);
                    showNotification('Image clé supprimée');
                    updateKeyframeMarkers();
                    return;
                }
                
                keyframes.push({
                    time: currentTime,
                    timecode: timecode
                });
                
                // Trier les images clés par temps
                keyframes.sort((a, b) => a.time - b.time);
                
                updateKeyframeMarkers();
                showNotification('Image clé ajoutée');
            }
            
            // Mettre à jour les marqueurs d'images clés
            function updateKeyframeMarkers() {
                // Supprimer les marqueurs existants
                document.querySelectorAll('.keyframe-marker').forEach(marker => marker.remove());
                
                // Ajouter les nouveaux marqueurs
                keyframes.forEach(keyframe => {
                    const marker = document.createElement('div');
                    marker.className = 'time-marker keyframe-marker';
                    const positionPercent = (keyframe.time / videoPlayer.duration) * 100;
                    marker.style.left = `${positionPercent}%`;
                    marker.style.backgroundColor = 'red';
                    marker.title = `Image clé: ${keyframe.timecode}`;
                    marker.dataset.time = keyframe.time;
                    
                    marker.addEventListener('click', function(e) {
                        e.stopPropagation();
                        videoPlayer.currentTime = parseFloat(this.dataset.time);
                    });
                    
                    progressContainer.appendChild(marker);
                });
            }
            
            // Navigation entre les images clés
            function navigateToNextKeyframe() {
                if (keyframes.length === 0) return;
                
                const currentTime = videoPlayer.currentTime;
                const nextKeyframe = keyframes.find(kf => kf.time > currentTime);
                
                if (nextKeyframe) {
                    videoPlayer.currentTime = nextKeyframe.time;
                    showNotification(`Navigation vers ${nextKeyframe.timecode}`);
                } else {
                    // Aller au premier keyframe si on est à la fin
                    videoPlayer.currentTime = keyframes[0].time;
                    showNotification(`Navigation vers ${keyframes[0].timecode}`);
                }
            }
            
            function navigateToPrevKeyframe() {
                if (keyframes.length === 0) return;
                
                const currentTime = videoPlayer.currentTime;
                // Trouver tous les keyframes avant le temps actuel
                const prevKeyframes = keyframes.filter(kf => kf.time < currentTime);
                
                if (prevKeyframes.length > 0) {
                    // Prendre le dernier (le plus proche du temps actuel)
                    const prevKeyframe = prevKeyframes[prevKeyframes.length - 1];
                    videoPlayer.currentTime = prevKeyframe.time;
                    showNotification(`Navigation vers ${prevKeyframe.timecode}`);
                } else {
                    // Aller au dernier keyframe si on est au début
                    videoPlayer.currentTime = keyframes[keyframes.length - 1].time;
                    showNotification(`Navigation vers ${keyframes[keyframes.length - 1].timecode}`);
                }
            }
            
            // Mettre à jour la liste des notes avec la mise à jour des marqueurs
            function updateNotesList() {
                if (!notesList) return;
                if (notes.length === 0) {
                    notesList.innerHTML = '<div class="empty-note">Aucune note. Ajoute des commentaires pendant la lecture.</div>';
                    // S'assurer de supprimer tous les marqueurs de notes
                    document.querySelectorAll('.time-marker:not(.keyframe-marker)').forEach(marker => marker.remove());
                    return;
                }
                
                notesList.innerHTML = '';
                
                // Supprimer les marqueurs de notes existants
                document.querySelectorAll('.time-marker:not(.keyframe-marker)').forEach(marker => marker.remove());
                
                notes.forEach((note, index) => {
                    const noteElement = document.createElement('div');
                    noteElement.className = 'note-item';
                    
                    // Ajouter une classe spécifique pour les notes de segment
                    if (note.isSegment) {
                        noteElement.classList.add('segment-note');
                    }
                    
                    // Ajouter la classe de catégorie
                    noteElement.classList.add('category-' + (note.category || 'default'));
                    
                    let noteHTML = '';
                    
                    // Affichage du timecode différent pour les notes de segment
                    if (note.isSegment) {
                        noteHTML += `
                            <div class="note-timecode segment-timecode" data-time="${note.time}" data-out-time="${note.outTime}">
                                ${formatTimecodeShort(note.time)} - ${formatTimecodeShort(note.outTime)}
                            </div>
                            <div class="note-content">
                        `;
                    } else {
                        noteHTML += `
                        <div class="note-timecode" data-time="${note.time}">${note.timecode}</div>
                            <div class="note-content">
                        `;
                    }
                    
                    if (note.thumbnail) {
                        noteHTML += `<img src="${note.thumbnail}" alt="Capture à ${note.timecode}" class="note-thumbnail" data-index="${index}">`;
                    }
                    
                    if (note.text) {
                        // Ajouter le badge de catégorie à côté du texte
                        let categoryBadge = '';
                        if (note.category && note.category !== 'default') {
                            const categoryLabels = {
                                'montage': 'Montage',
                                'edito': 'Édito',
                                'coquille': 'Coquille'
                            };
                            categoryBadge = `<span class="category-badge category-${note.category}">${categoryLabels[note.category]}</span>`;
                        }
                        
                        noteHTML += `<div class="note-text editable" data-index="${index}">${note.text} ${categoryBadge}</div>`;
                    }
                    
                    // Afficher la durée pour les segments
                    if (note.isSegment) {
                        const durationFormatted = formatDuration(note.duration);
                        noteHTML += `<div class="note-duration">Durée: ${durationFormatted}</div>`;
                    }
                    
                    // Ajouter un sélecteur de catégorie pour chaque note
                    noteHTML += `
                        <div class="note-category-selector inline-selector">
                            <label class="category-option" title="Aucune catégorie">
                                <input type="radio" name="noteCategory-${index}" value="default" ${note.category === 'default' || !note.category ? 'checked' : ''} data-index="${index}">
                                <span class="category-color category-default"></span>
                                <span class="category-label">Aucune</span>
                            </label>
                            <label class="category-option" title="Note de montage">
                                <input type="radio" name="noteCategory-${index}" value="montage" ${note.category === 'montage' ? 'checked' : ''} data-index="${index}">
                                <span class="category-color category-montage"></span>
                                <span class="category-label">Montage</span>
                            </label>
                            <label class="category-option" title="Note éditoriale">
                                <input type="radio" name="noteCategory-${index}" value="edito" ${note.category === 'edito' ? 'checked' : ''} data-index="${index}">
                                <span class="category-color category-edito"></span>
                                <span class="category-label">Édito</span>
                            </label>
                            <label class="category-option" title="Coquille">
                                <input type="radio" name="noteCategory-${index}" value="coquille" ${note.category === 'coquille' ? 'checked' : ''} data-index="${index}">
                                <span class="category-color category-coquille"></span>
                                <span class="category-label">Coquille</span>
                            </label>
                        </div>
                    `;
                    
                    noteHTML += `
                        </div>
                        <button class="delete-note" data-index="${index}">×</button>
                    `;
                    
                    noteElement.innerHTML = noteHTML;
                    
                    notesList.appendChild(noteElement);
                    
                    // Ajouter un marqueur pour cette note
                    if (videoPlayer.duration) {
                        addNoteMarker(note);
                    }
                });
                
                // Ajouter les événements après avoir créé les éléments
                document.querySelectorAll('.note-timecode').forEach(element => {
                    element.addEventListener('click', function() {
                        const time = parseFloat(this.getAttribute('data-time'));
                        videoPlayer.currentTime = time;
                        
                        // Si c'est un segment, proposer de lire le segment
                        if (this.classList.contains('segment-timecode')) {
                            const outTime = parseFloat(this.getAttribute('data-out-time'));
                            
                            // Créer un bouton lecture de segment si pas déjà présent
                            if (!this.querySelector('.play-segment-btn')) {
                                const playBtn = document.createElement('button');
                                playBtn.className = 'play-segment-btn';
                                playBtn.innerHTML = '▶️ Lire segment';
                                this.appendChild(playBtn);
                                
                                playBtn.addEventListener('click', function(e) {
                                    e.stopPropagation();
                                    const parentEl = this.closest('.note-timecode');
                                    const inTime = parseFloat(parentEl.getAttribute('data-time'));
                                    const outTime = parseFloat(parentEl.getAttribute('data-out-time'));
                                    playSegment(inTime, outTime);
                                    this.remove();
                                });
                                
                                // Supprimer après un délai
                                setTimeout(() => {
                                    if (playBtn.parentNode === this) {
                                        this.removeChild(playBtn);
                                    }
                                }, 3000);
                            }
                        }
                    });
                });
                
                // Ajouter les événements pour les boutons de suppression
                document.querySelectorAll('.delete-note').forEach(button => {
                    button.addEventListener('click', function() {
                        const index = parseInt(this.getAttribute('data-index'));
                        // Demande de confirmation
                        if (confirm('Supprimer cette note ?')) {
                            notes.splice(index, 1);
                            updateNotesList();
                            showNotification('Note supprimée');
                        }
                    });
                });
                
                // Ajouter les événements pour les sélecteurs de catégorie
                document.querySelectorAll('.note-category-selector input[type="radio"]').forEach(radio => {
                    radio.addEventListener('change', function() {
                        if (this.checked) {
                            const index = parseInt(this.getAttribute('data-index'));
                            const category = this.value;
                            
                            // Mettre à jour la catégorie de la note
                            notes[index].category = category;
                            
                            // Mettre à jour la classe CSS de l'élément parent
                            const noteItem = this.closest('.note-item');
                            
                            // Supprimer toutes les classes de catégorie existantes
                            noteItem.classList.remove('category-default', 'category-montage', 'category-edito', 'category-coquille');
                            
                            // Ajouter la nouvelle classe de catégorie
                            noteItem.classList.add('category-' + category);
                            
                            // Mettre à jour le badge de catégorie
                            const noteText = noteItem.querySelector('.note-text');
                            const existingBadge = noteItem.querySelector('.category-badge');
                            
                            if (existingBadge) {
                                existingBadge.remove();
                            }
                            
                            if (category !== 'default') {
                                const categoryLabels = {
                                    'montage': 'Montage',
                                    'edito': 'Édito',
                                    'coquille': 'Coquille'
                                };
                                
                                const badge = document.createElement('span');
                                badge.className = `category-badge category-${category}`;
                                badge.textContent = categoryLabels[category];
                                noteText.appendChild(badge);
                                
                                showNotification(`Catégorie modifiée: ${categoryLabels[category]}`);
                            } else {
                                showNotification('Catégorie supprimée');
                            }
                        }
                    });
                });
                
                // Gérer les miniatures
                document.querySelectorAll('.note-thumbnail').forEach(element => {
                    element.addEventListener('click', function() {
                        const index = parseInt(this.getAttribute('data-index'));
                        const note = notes[index];
                        
                        // Afficher l'image dans le modal
                        document.getElementById('captureModalImage').src = note.thumbnail;
                        captureModal.classList.add('show');
                    });
                });
                
                // Ajouter les gestionnaires d'événements pour l'édition des notes
                document.querySelectorAll('.note-text.editable').forEach(element => {
                    element.addEventListener('click', function() {
                        const index = parseInt(this.getAttribute('data-index'));
                        const note = notes[index];
                        const currentText = note.text;
                        
                        // Ne pas activer le mode édition si déjà en cours
                        if (this.classList.contains('editing')) return;
                        
                        // Enregistrer le contenu actuel
                        this.dataset.originalContent = this.innerHTML;
                        
                        // Supprimer tout badge existant
                        const textOnly = currentText;
                        
                        // Créer l'interface d'édition
                        this.classList.add('editing');
                        this.innerHTML = `
                            <textarea class="edit-input" autofocus>${textOnly}</textarea>
                            <div class="note-edit-buttons">
                                <button class="note-edit-cancel">Annuler</button>
                                <button class="note-edit-save">Enregistrer</button>
                            </div>
                        `;
                        
                        // Activer le mode d'édition global pour désactiver les raccourcis clavier
                        isEditingNote = true;
                        
                        // Focus sur le textarea
                        const textarea = this.querySelector('textarea');
                        textarea.focus();
                        textarea.setSelectionRange(textarea.value.length, textarea.value.length);
                        
                        // Gestionnaire pour le bouton Sauvegarder
                        this.querySelector('.note-edit-save').addEventListener('click', function() {
                            const newText = textarea.value.trim();
                            
                            // Ne rien faire si le texte est vide
                            if (newText === '') return;
                            
                            // Mettre à jour les données
                            note.text = newText;
                            
                            // Désactiver le mode d'édition
                            isEditingNote = false;
                            
                            // Mettre à jour l'affichage
                            updateNotesList();
                            
                            showNotification('Note mise à jour');
                        });
                        
                        // Gestionnaire pour le bouton Annuler
                        this.querySelector('.note-edit-cancel').addEventListener('click', function() {
                            // Restaurer le contenu original
                            element.innerHTML = element.dataset.originalContent;
                            element.classList.remove('editing');
                            
                            // Désactiver le mode d'édition
                            isEditingNote = false;
                        });
                        
                        // Gérer la touche Escape pour annuler
                        textarea.addEventListener('keydown', function(e) {
                            if (e.key === 'Escape') {
                                element.innerHTML = element.dataset.originalContent;
                                element.classList.remove('editing');
                                
                                // Désactiver le mode d'édition
                                isEditingNote = false;
                                
                                e.preventDefault();
                            } else if (e.key === 'Enter' && e.ctrlKey) {
                                // Ctrl+Enter pour sauvegarder
                                const newText = textarea.value.trim();
                                if (newText !== '') {
                                    note.text = newText;
                                    
                                    // Désactiver le mode d'édition
                                    isEditingNote = false;
                                    
                                    updateNotesList();
                                    showNotification('Note mise à jour');
                                }
                                e.preventDefault();
                            }
                        });
                        
                        // Empêcher la propagation de l'événement pour éviter de déclencher d'autres clics
                        const stopPropagation = function(e) {
                            e.stopPropagation();
                        };
                        
                        textarea.addEventListener('click', stopPropagation);
                        this.querySelector('.note-edit-save').addEventListener('click', stopPropagation);
                        this.querySelector('.note-edit-cancel').addEventListener('click', stopPropagation);
                    });
                });
            }
            
            // Formater la durée en HH:MM:SS
            function formatDuration(durationInSeconds) {
                const hours = Math.floor(durationInSeconds / 3600);
                const minutes = Math.floor((durationInSeconds % 3600) / 60);
                const seconds = Math.floor(durationInSeconds % 60);
                
                return `${hours > 0 ? hours + 'h ' : ''}${minutes}m ${seconds}s`;
            }
            
            // Lecture d'un segment
            function playSegment(startTime, endTime) {
                videoPlayer.currentTime = startTime;
                
                // Créer un écouteur temporaire pour arrêter la lecture à la fin du segment
                const segmentEndListener = function() {
                    if (videoPlayer.currentTime >= endTime) {
                        videoPlayer.pause();
                        videoPlayer.removeEventListener('timeupdate', segmentEndListener);
                    }
                };
                
                videoPlayer.addEventListener('timeupdate', segmentEndListener);
                videoPlayer.play();
                
                showNotification(`Lecture du segment de ${formatTimecodeShort(startTime)} à ${formatTimecodeShort(endTime)}`);
            }
            
            // Ajouter une fonction pour charger les métadonnées vidéo
            videoPlayer.addEventListener('loadedmetadata', function() {
                updateProgress();
                updateKeyframeMarkers();
                updateNotesList();
            });
            
            // Variable globale pour suivre l'état d'édition des notes
            let isEditingNote = false;
            
            // ============================================
            // FONCTIONS RACCOURCIS J-K-L (MONTAGE)
            // ============================================
            
            /**
             * Gère la touche J (lecture arrière)
             */
            function handleJKey() {
                if (!videoPlayer || !videoPlayer.src) return;
                
                // Si on était en avant (L), réinitialiser
                if (jklDirection === 1) {
                    jklPlaybackSpeed = 1;
                }
                
                // Si on était déjà en arrière, augmenter la vitesse
                if (jklDirection === -1) {
                    jklPlaybackSpeed = Math.min(jklPlaybackSpeed * 2, 8); // Max 8x
                } else {
                    jklPlaybackSpeed = 1; // Première pression = 1x
                }
                
                jklDirection = -1;
                startRewind();
                updatePlaybackSpeedDisplay();
            }
            
            /**
             * Gère la touche K (pause)
             */
            function handleKKey() {
                if (!videoPlayer || !videoPlayer.src) return;
                
                stopRewind();
                videoPlayer.pause();
                videoPlayer.playbackRate = 1; // Reset à vitesse normale
                jklDirection = 0;
                jklPlaybackSpeed = 1;
                updatePlaybackSpeedDisplay();
            }
            
            /**
             * Gère la touche L (lecture avant)
             */
            function handleLKey() {
                if (!videoPlayer || !videoPlayer.src) return;
                
                // Si on était en arrière (J), réinitialiser
                if (jklDirection === -1) {
                    stopRewind();
                    jklPlaybackSpeed = 1;
                }
                
                // Si on était déjà en avant, augmenter la vitesse
                if (jklDirection === 1) {
                    jklPlaybackSpeed = Math.min(jklPlaybackSpeed * 2, 8); // Max 8x
                } else {
                    jklPlaybackSpeed = 1; // Première pression = 1x
                }
                
                jklDirection = 1;
                startForward();
                updatePlaybackSpeedDisplay();
            }
            
            /**
             * Démarre la lecture arrière (rewind)
             */
            function startRewind() {
                stopRewind(); // Arrêter l'interval précédent si existe
                
                videoPlayer.pause(); // Mettre en pause le lecteur natif
                
                // Calculer le pas de rewind selon la vitesse
                const rewindStep = 0.1 * jklPlaybackSpeed; // 0.1s * vitesse
                
                jklRewindInterval = setInterval(function() {
                    if (videoPlayer.currentTime > 0) {
                        videoPlayer.currentTime = Math.max(0, videoPlayer.currentTime - rewindStep);
                    } else {
                        handleKKey(); // Auto-pause à la fin
                    }
                }, 100); // Mise à jour toutes les 100ms
            }
            
            /**
             * Arrête la lecture arrière
             */
            function stopRewind() {
                if (jklRewindInterval) {
                    clearInterval(jklRewindInterval);
                    jklRewindInterval = null;
                }
            }
            
            /**
             * Démarre la lecture avant (forward)
             */
            function startForward() {
                stopRewind(); // S'assurer qu'on n'est pas en rewind
                
                videoPlayer.playbackRate = jklPlaybackSpeed;
                videoPlayer.play();
            }
            
            /**
             * Met à jour l'affichage de la vitesse dans l'interface
             */
            function updatePlaybackSpeedDisplay() {
                const speedDisplay = document.querySelector('.speed-value') || document.querySelector('[data-speed]');
                if (speedDisplay) {
                    if (jklDirection === -1) {
                        speedDisplay.textContent = '-' + jklPlaybackSpeed + 'x';
                    } else if (jklDirection === 1) {
                        speedDisplay.textContent = jklPlaybackSpeed + 'x';
                    } else {
                        speedDisplay.textContent = '1x';
                    }
                }
                // Mettre à jour le sélecteur de vitesse si la valeur existe
                if (speedSelector) {
                    var opt = speedSelector.querySelector('option[value="' + jklPlaybackSpeed + '"]');
                    if (opt) speedSelector.value = String(jklPlaybackSpeed);
                    else if (jklDirection === 0) speedSelector.value = '1';
                }
            }
            
            // Raccourcis clavier améliorés
            document.addEventListener('keydown', function(e) {
                // Si l'élément actif est un champ de texte ou si on est en train d'éditer une note, ne pas capturer les raccourcis
                if (document.activeElement.tagName === 'INPUT' || document.activeElement.tagName === 'TEXTAREA' || isEditingNote) {
                    return;
                }
                
                switch(e.key) {
                    case ' ':  // Espace
                        e.preventDefault();
                        togglePlayPause();
                        break;
                    case 'ArrowLeft':  // Flèche gauche - image précédente
                        e.preventDefault();
                        prevFrame();
                        break;
                    case 'ArrowRight':  // Flèche droite - image suivante
                        e.preventDefault();
                        nextFrame();
                        break;
                    case ',':  // Virgule - image précédente
                        e.preventDefault();
                        prevFrame();
                        break;
                    case '.':  // Point - image suivante
                        e.preventDefault();
                        nextFrame();
                        break;
                    case 'n':  // N pour nouvelle note
                        e.preventDefault();
                        noteInput.focus();
                        break;
                    case 's':  // S pour capture d'écran
                        e.preventDefault();
                        captureThumbnail(); // Uniquement capturer pour les notes
                        break;
                    case 'o':  // O pour définir le point OUT ou toggle overlay
                        e.preventDefault();
                        if (e.shiftKey) {
                            // S'assurer que la vidéo est en pause avant de définir le point OUT
                            if (!videoPlayer.paused) {
                                videoPlayer.pause();
                            }
                            setOutPointBtn.click(); // Shift+O pour point OUT
                        } else {
                            toggleOverlayBtn.click(); // O seul pour toggle overlay
                        }
                        break;
                    case 'f':  // F pour plein écran
                        e.preventDefault();
                        toggleFullscreen();
                        break;
                    case 'h':  // H pour aide
                        e.preventDefault();
                        toggleHelp();
                        break;
                    case 'm':  // M pour marquer une image clé
                        e.preventDefault();
                        addKeyframe();
                        break;
                    case '[':  // Crochet gauche - keyframe précédent
                        e.preventDefault();
                        navigateToPrevKeyframe();
                        break;
                    case ']':  // Crochet droit - keyframe suivant
                        e.preventDefault();
                        navigateToNextKeyframe();
                        break;
                    case '1': case '2': case '3': case '4': case '5':
                    case '6': case '7': case '8': case '9':
                        // Touches numériques pour la navigation dans la vidéo
                        e.preventDefault();
                        const percent = parseInt(e.key) * 10;
                        videoPlayer.currentTime = videoPlayer.duration * (percent / 100);
                        showNotification(`Saut à ${percent}%`);
                        break;
                    case 'ArrowUp':  // Flèche haut - avancer de 1 seconde
                        e.preventDefault();
                        videoPlayer.currentTime = Math.min(videoPlayer.duration, videoPlayer.currentTime + 1);
                        break;
                    case 'ArrowDown':  // Flèche bas - reculer de 1 seconde
                        e.preventDefault();
                        videoPlayer.currentTime = Math.max(0, videoPlayer.currentTime - 1);
                        break;
                    case 'c':  // C pour capture de miniature
                        e.preventDefault();
                        captureThumbnail();
                        break;
                    case 'i':  // I pour définir le point IN
                        e.preventDefault();
                        // S'assurer que la vidéo est en pause avant de définir le point IN
                        if (!videoPlayer.paused) {
                            videoPlayer.pause();
                        }
                        setInPointBtn.click();
                        break;
                    case 'o':  // O pour définir le point OUT ou toggle overlay
                        e.preventDefault();
                        if (e.shiftKey) {
                            // S'assurer que la vidéo est en pause avant de définir le point OUT
                            if (!videoPlayer.paused) {
                                videoPlayer.pause();
                            }
                            setOutPointBtn.click(); // Shift+O pour point OUT
                        } else {
                            toggleOverlayBtn.click(); // O seul pour toggle overlay
                        }
                        break;
                    case 'j': case 'J':  // J = Lecture arrière (rewind)
                        e.preventDefault();
                        handleJKey();
                        break;
                    case 'k': case 'K':  // K = Pause
                        e.preventDefault();
                        handleKKey();
                        break;
                    case 'l': case 'L':  // L = Lecture avant (forward)
                        e.preventDefault();
                        handleLKey();
                        break;
                }
            });
            
            window.addEventListener('beforeunload', function() {
                stopRewind();
            });
            
            // Ajout du modal de prévisualisation
            const captureModal = document.createElement('div');
            captureModal.className = 'capture-modal';
            captureModal.innerHTML = `
                <div class="capture-modal-content">
                    <button class="capture-modal-close">&times;</button>
                    <img id="captureModalImage" src="" alt="Capture d'écran">
                </div>
            `;
            document.body.appendChild(captureModal);
            
            // Fermer le modal lorsqu'on clique sur le bouton de fermeture
            document.querySelector('.capture-modal-close').addEventListener('click', function() {
                captureModal.classList.remove('show');
            });
            
            // Fermer le modal lorsqu'on clique en dehors de l'image
            captureModal.addEventListener('click', function(e) {
                if (e.target === captureModal) {
                    captureModal.classList.remove('show');
                }
            });
            
            if (thumbnailPreview) thumbnailPreview.addEventListener('click', function() {
                captureThumbnail();
            });
            
            // Fonction pour capturer une miniature
            function captureThumbnail() {
                if (!videoPlayer.src) {
                    showNotification('Aucune vidéo chargée');
                    return;
                }
                
                // Pause de la vidéo pour faciliter la prise de note
                if (!videoPlayer.paused) {
                    videoPlayer.pause();
                }
                
                // Créer un canvas pour dessiner la vidéo en miniature
                const canvas = document.createElement('canvas');
                const aspectRatio = videoPlayer.videoWidth / videoPlayer.videoHeight;
                const thumbWidth = 320;
                canvas.width = thumbWidth;
                canvas.height = thumbWidth / aspectRatio;
                const ctx = canvas.getContext('2d');
                
                // Dessiner la vidéo sur le canvas
                ctx.drawImage(videoPlayer, 0, 0, canvas.width, canvas.height);
                
                // Si l'overlay est visible, le dessiner également
                if (overlayImage.style.display !== 'none') {
                    // Convertir les pourcentages en valeurs réelles
                    const xPos = (parseFloat(overlayImage.style.left || 0) / 100) * canvas.width;
                    const yPos = (parseFloat(overlayImage.style.top || 0) / 100) * canvas.height;
                    const width = (parseFloat(overlayImage.style.width || 100) / 100) * canvas.width;
                    const height = (parseFloat(overlayImage.style.height || 100) / 100) * canvas.height;
                    
                    // Dessiner l'overlay avec les paramètres actuels
                    ctx.globalAlpha = parseFloat(overlayImage.style.opacity || 1);
                    if (overlayImage.complete) {
                        ctx.drawImage(overlayImage, xPos, yPos, width, height);
                    }
                    ctx.globalAlpha = 1.0;
                }
                
                // Convertir le canvas en URL de données
                const dataURL = canvas.toDataURL('image/jpeg', 0.8);
                
                // Stocker la miniature actuelle
                currentThumbnail = {
                    dataURL: dataURL,
                    time: videoPlayer.currentTime
                };
                updateThumbnailPreview();
                if (thumbnailPreview) {
                    thumbnailPreview.classList.add('highlight');
                    setTimeout(function() { thumbnailPreview.classList.remove('highlight'); }, 1000);
                }
                if (noteInput) noteInput.focus();
                showNotification('Capture ajoutée - Ajoutez votre note');
            }
            
            // Mettre à jour l'aperçu de la miniature
            function updateThumbnailPreview() {
                if (!thumbnailPreview) return;
                if (currentThumbnail) {
                    thumbnailPreview.innerHTML = `
                        <img src="${currentThumbnail.dataURL}" alt="Capture d'écran">
                        <div class="capture-placeholder">
                            <span>RECAPTURER</span>
                        </div>
                    `;
                } else {
                    thumbnailPreview.innerHTML = `
                        <span>CAPTURE</span>
                        <div class="capture-placeholder">
                            <span>CAPTURER</span>
                        </div>
                    `;
                }
            }
            
            // Ajouter une note (texte, capture ou segment) — lecture directe du DOM
            function addNote() {
                var inputEl = document.getElementById('noteInput');
                var listEl = document.getElementById('notesList');
                if (!listEl) return;
                var noteText = (inputEl && inputEl.value) ? inputEl.value.trim() : '';
                var hasSegment = inPoint !== null && outPoint !== null;
                if (!noteText && !currentThumbnail && !hasSegment) return;
                
                var t = videoPlayer.currentTime;
                if (isNaN(t)) t = 0;
                var isSegment = hasSegment;
                var noteTime = isSegment ? inPoint : t;
                
                var note = {
                    time: noteTime,
                    timecode: formatTimecode(noteTime),
                    text: noteText || '',
                    thumbnail: currentThumbnail ? currentThumbnail.dataURL : null,
                    category: 'default'
                };
                if (isSegment) {
                    note.isSegment = true;
                    note.outTime = outPoint;
                    note.outTimecode = formatTimecode(outPoint);
                    note.duration = outPoint - inPoint;
                }
                notes.push(note);
                notes.sort(function(a, b) { return a.time - b.time; });
                updateNotesList();
                if (inputEl) { inputEl.value = ''; inputEl.setAttribute('placeholder', 'Ajouter une note...'); }
                currentThumbnail = null;
                if (typeof updateThumbnailPreview === 'function') updateThumbnailPreview();
                if (isSegment && typeof resetSegmentPoints === 'function') resetSegmentPoints();
            }
            
            // Exporter les notes (à partir du tableau en mémoire) — export direct au clic
            function exportNotes() {
                try {
                    var list = Array.isArray(notes) ? notes.slice() : [];
                    if (list.length === 0) {
                        if (typeof showNotification === 'function') showNotification('Aucune note à exporter');
                        return;
                    }
                    list.sort(function(a, b) { return (a.time || 0) - (b.time || 0); });

                    function formatTimecodeExport(sec) {
                        if (typeof sec !== 'number' || isNaN(sec)) sec = 0;
                        var h = Math.floor(sec / 3600);
                        var m = Math.floor((sec % 3600) / 60);
                        var s = Math.floor(sec % 60);
                        var ms = Math.floor((sec % 1) * 1000);
                        var msStr = String(ms);
                        while (msStr.length < 3) msStr = '0' + msStr;
                        return (h < 10 ? '0' : '') + h + ':' + (m < 10 ? '0' : '') + m + ':' + (s < 10 ? '0' : '') + s + '.' + msStr;
                    }

                    function formatNoteForExport(note) {
                        var text = (note.text || '').replace(/Montage|Édito|Coquille/g, '').trim();
                        var tc = note.timecode || formatTimecodeExport(note.time);
                        if (note.isSegment && note.outTimecode) {
                            return '[IN: ' + tc + '] [OUT: ' + note.outTimecode + '] ' + (text || '(segment)') + '\n\n';
                        }
                        return '[' + tc + '] ' + (text || '(sans texte)') + '\n\n';
                    }

                    var exportText = 'NOTES DE MONTAGE\n\n';
                    list.forEach(function(n) { exportText += formatNoteForExport(n); });
                    downloadTextFile(exportText, 'notes_montage.txt');
                    if (typeof showNotification === 'function') showNotification('Notes exportées');
                } catch (err) {
                    console.error('Export notes:', err);
                    if (typeof showNotification === 'function') showNotification('Erreur lors de l\'export');
                }
            }
            
            // Fonction utilitaire pour télécharger un fichier texte
            function downloadTextFile(content, filename) {
                const a = document.createElement('a');
                const blob = new Blob([content], { type: 'text/plain' });
                const url = URL.createObjectURL(blob);
                a.href = url;
                a.download = filename;
                a.click();
                URL.revokeObjectURL(url);
            }

            function downloadHtmlFile(content, filename) {
                const a = document.createElement('a');
                const blob = new Blob([content], { type: 'text/html' });
                const url = URL.createObjectURL(blob);
                a.href = url;
                a.download = filename;
                a.click();
                URL.revokeObjectURL(url);
            }
            
            // Exporter les notes avec les images
            function exportNotesWithImages() {
                const notes = document.querySelectorAll('.note-item');
                if (notes.length === 0) {
                    showNotification('Aucune note à exporter');
                    return;
                }
                
                let notesArray = [];
                
                notes.forEach(note => {
                    const timecode = note.querySelector('.note-timecode').textContent;
                    const noteText = note.querySelector('.note-text').textContent.replace(/Montage|Édito|Coquille/g, '').trim();
                    const thumbnail = note.querySelector('.note-thumbnail');
                    const timeValue = note.querySelector('.note-timecode').getAttribute('data-time');
                    
                    // Déterminer la catégorie
                    let category = 'default';
                    if (note.classList.contains('category-montage')) category = 'montage';
                    else if (note.classList.contains('category-edito')) category = 'edito';
                    else if (note.classList.contains('category-coquille')) category = 'coquille';
                    
                    // Vérifier si c'est une note de segment
                    const isSegment = note.classList.contains('segment-note');
                    
                    let noteHtml = '';
                    if (isSegment) {
                        noteHtml = `
                            <div class="note-entry segment-entry category-${category}">
                                <div class="note-timecode segment-timecode">${timecode}</div>
                                <div class="note-content">
                                    <div class="note-text">${noteText || '(Sans commentaire)'}</div>
                        `;
                    } else {
                        noteHtml = `
                            <div class="note-entry category-${category}">
                                <div class="note-timecode">${timecode}</div>
                                <div class="note-content">
                                    <div class="note-text">${noteText || '(Sans commentaire)'}</div>
                        `;
                    }
                    
                    if (thumbnail) {
                        noteHtml += `<div class="note-image"><img src="${thumbnail.src}" alt="Capture à ${timecode}"></div>`;
                    }
                    
                    noteHtml += `
                                </div>
                            </div>
                        `;
                    
                    notesArray.push({
                        time: parseFloat(timeValue),
                        html: noteHtml,
                        category: category
                    });
                });
                
                // Trier toutes les notes par leur timecode
                notesArray.sort((a, b) => a.time - b.time);
                
                // Option de tri par catégorie ou chronologique (réutiliser le même dialogue)
                const sortOptionHTML = `
                <div id="sort-dialog" class="sort-dialog">
                    <div class="sort-dialog-content">
                        <h2>Options d'export</h2>
                        <p>Comment souhaitez-vous organiser les notes ?</p>
                        <div class="sort-options">
                            <label>
                                <input type="radio" name="sortOption" value="time" checked>
                                Par ordre chronologique
                            </label>
                            <label>
                                <input type="radio" name="sortOption" value="category">
                                Par catégorie, puis chronologique
                            </label>
                        </div>
                        <div class="sort-dialog-buttons">
                            <button id="sort-cancel">Annuler</button>
                            <button id="sort-confirm">Confirmer</button>
                        </div>
                    </div>
                </div>`;
                
                // Ajouter le dialog à la page
                const dialogContainer = document.createElement('div');
                dialogContainer.innerHTML = sortOptionHTML;
                document.body.appendChild(dialogContainer.firstElementChild);
                
                // Gérer la confirmation
                document.getElementById('sort-confirm').addEventListener('click', function() {
                    const sortOption = document.querySelector('input[name="sortOption"]:checked').value;
                    document.getElementById('sort-dialog').remove();
                    
                    // Template CSS commun
                    const commonCSS = `
                        body {
                            font-family: Arial, sans-serif;
                            max-width: 800px;
                            margin: 0 auto;
                            padding: 20px;
                            background-color: #f9f9f9;
                            color: #333;
                        }
                        h1, h2 {
                            color: #2a5885;
                            border-bottom: 1px solid #eee;
                            padding-bottom: 10px;
                        }
                        .note-entry {
                            margin-bottom: 30px;
                            background-color: white;
                            padding: 15px;
                            border-radius: 0;
                            box-shadow: 0 2px 5px rgba(0,0,0,0.1);
                            display: flex;
                            flex-direction: column;
                        }
                        .note-timecode {
                            font-weight: bold;
                            color: #2a5885;
                            margin-bottom: 10px;
                            font-family: monospace;
                            background-color: #f0f5ff;
                            padding: 5px 10px;
                            border-radius: 0;
                            display: inline-block;
                        }
                        .note-content {
                            display: flex;
                            flex-direction: column;
                            gap: 15px;
                        }
                        .note-text {
                            line-height: 1.5;
                        }
                        .note-image {
                            margin-top: 10px;
                        }
                        .note-image img {
                            max-width: 100%;
                            border-radius: 0;
                            border: 1px solid #ddd;
                        }
                        .segment-entry {
                            border-left: 3px solid #FF5722;
                        }
                        .segment-timecode {
                            background-color: #fff0e8;
                            color: #d35400;
                        }
                        .category-section {
                            margin-top: 40px;
                        }
                        .category-montage {
                            border-top: 3px solid #2196F3;
                        }
                        .category-edito {
                            border-top: 3px solid #F44336;
                        }
                        .category-coquille {
                            border-top: 3px solid #9C27B0;
                        }
                    `;
                    
                    // Effectuer le tri selon l'option choisie
                    if (sortOption === 'category') {
                        // Trier par catégorie, puis par time
                        const categoryOrder = { 'montage': 1, 'edito': 2, 'coquille': 3, 'default': 4 };
                        notesArray.sort((a, b) => {
                            if (categoryOrder[a.category] !== categoryOrder[b.category]) {
                                return categoryOrder[a.category] - categoryOrder[b.category];
                            }
                            return a.time - b.time;
                        });
                        
                        // Sections pour chaque catégorie
                        const categories = {
                            'montage': { title: "Notes de montage", notes: [] },
                            'edito': { title: "Notes éditoriales", notes: [] },
                            'coquille': { title: "Coquilles et orthographe", notes: [] },
                            'default': { title: "Autres notes", notes: [] }
                        };
                        
                        // Répartir les notes dans les catégories
                        notesArray.forEach(note => {
                            categories[note.category].notes.push(note.html);
                        });
                        
                        // Construire le HTML avec les sections de catégories
                        let notesHtml = '';
                        Object.keys(categories).forEach(cat => {
                            if (categories[cat].notes.length > 0) {
                                notesHtml += `
                                    <div class="category-section">
                                        <h2>${categories[cat].title}</h2>
                                        ${categories[cat].notes.join('')}
                                    </div>
                                `;
                            }
                        });
                        
                        // Template HTML pour l'export avec catégories
                        const htmlContent = `<!DOCTYPE html>
                        <html lang="fr">
                        <head>
                            <meta charset="UTF-8">
                            <meta name="viewport" content="width=device-width, initial-scale=1.0">
                            <title>Notes de montage</title>
                            <style>${commonCSS}</style>
                        </head>
                        <body>
                            <h1>Notes de montage</h1>
                            ${notesHtml}
                        </body>
                        </html>`;
                        
                        downloadHtmlFile(htmlContent, 'notes_montage_par_categorie.html');
                    } else {
                        // Tri chronologique simple
                        notesArray.sort((a, b) => a.time - b.time);
                        
                        // Assembler le HTML des notes triées
                        let notesHtml = '';
                        notesArray.forEach(note => {
                            notesHtml += note.html;
                        });
                        
                        // Template HTML pour l'export chronologique
                        const htmlContent = `<!DOCTYPE html>
                        <html lang="fr">
                        <head>
                            <meta charset="UTF-8">
                            <meta name="viewport" content="width=device-width, initial-scale=1.0">
                            <title>Notes de montage</title>
                            <style>${commonCSS}</style>
                        </head>
                        <body>
                            <h1>Notes de montage</h1>
                            <div class="notes-section">
                                ${notesHtml}
                            </div>
                        </body>
                        </html>`;
                        
                        downloadHtmlFile(htmlContent, 'notes_montage_avec_images.html');
                    }
                    
                    showNotification('Notes exportées avec images');
                });
                
                // Gérer l'annulation
                document.getElementById('sort-cancel').addEventListener('click', function() {
                    document.getElementById('sort-dialog').remove();
                });
            }
            
            // Événements pour les notes (délégation + direct pour être sûr)
            document.addEventListener('click', function(e) {
                if (e.target && (e.target.id === 'addNoteBtn' || e.target.closest && e.target.closest('#addNoteBtn'))) {
                    e.preventDefault();
                    e.stopPropagation();
                    addNote();
                }
            }, true);
            if (addNoteBtn) addNoteBtn.addEventListener('click', function(e) { e.preventDefault(); addNote(); });
            if (noteInput) noteInput.addEventListener('keypress', function(e) {
                if (e.key === 'Enter') { e.preventDefault(); addNote(); }
            });
            
            // Événement pour l'exportation avec images
            if (exportNotesWithImagesBtn) exportNotesWithImagesBtn.addEventListener('click', exportNotesWithImages);
            
            // Mettre la vidéo en pause quand on clique dans le champ de saisie de notes
            noteInput.addEventListener('focus', function() {
                if (!videoPlayer.paused) {
                    videoPlayer.pause();
                    showNotification('Lecture en pause - Ajout de note');
                }
            });
            
            // Modifier le comportement du clic vidéo pour éviter lecture/pause en mode dessin
            videoPlayer.onclick = null; // Supprimer l'événement click précédent s'il existe
            
            videoPlayer.addEventListener('click', function(e) {
                if (drawingMode && drawingMode.checked) {
                    e.stopPropagation();
                    return;
                }
                
                // Sinon, comportement normal: lecture/pause
                e.stopPropagation();
                togglePlayPause();
            });
            
            // Éviter que le clic sur les contrôles ne déclenche le clic sur la vidéo
            var controlsBar = document.querySelector('.player-controls-bar') || document.querySelector('.custom-video-controls');
            if (controlsBar) controlsBar.addEventListener('click', function(e) { e.stopPropagation(); });
            
            if (exportNotesBtn) exportNotesBtn.addEventListener('click', function(e) { e.preventDefault(); exportNotes(); });
            
            // Détecter le type de fichier lors du drag
            document.addEventListener('dragover', function(e) {
                if (e.dataTransfer && e.dataTransfer.items.length) {
                    const item = e.dataTransfer.items[0];
                    if (item.kind === 'file') {
                        if (item.type.startsWith('video/')) {
                            dropZoneOverlay.querySelector('.drop-text').textContent = 'DEPOSE TA VIDEO ICI';
                        } else if (item.type === 'image/png') {
                            dropZoneOverlay.querySelector('.drop-text').textContent = 'DEPOSE TON IMAGE PNG ICI';
                        } else {
                            dropZoneOverlay.querySelector('.drop-text').textContent = 'TYPE DE FICHIER NON SUPPORTE';
                        }
                    }
                }
            });
            
            // Détection de chargement de vidéo pour cacher le placeholder
            videoPlayer.addEventListener('loadeddata', function() {
                if (videoPlaceholder) {
                    videoPlaceholder.style.display = 'none';
                }
            });
            
            // Gestion du glissement du curseur de lecture
            playhead.addEventListener('mousedown', function(e) {
                isDraggingPlayhead = true;
                playhead.classList.add('active');
                
                // Pause de la vidéo pendant le déplacement du curseur
                if (!videoPlayer.paused) {
                    videoPlayer.pause();
                }
                
                e.stopPropagation(); // Empêcher la propagation au conteneur parent
            });
            
            document.addEventListener('mousemove', function(e) {
                if (isDraggingPlayhead) {
                    const rect = progressContainer.getBoundingClientRect();
                    let position = (e.clientX - rect.left) / rect.width;
                    
                    // Limiter la position entre 0 et 1
                    position = Math.max(0, Math.min(1, position));
                    
                    // Mettre à jour la position du curseur et la barre de progression
                    playhead.style.left = `${position * 100}%`;
                    progressBar.style.width = `${position * 100}%`;
                    
                    // Mettre à jour la position de lecture actuelle
                    videoPlayer.currentTime = position * videoPlayer.duration;
                    
                    // Mettre à jour l'affichage du temps
                    timeDisplay.textContent = `${formatTimecodeShort(videoPlayer.currentTime)} / ${formatTimecodeShort(videoPlayer.duration)}`;
                }
            });
            
            document.addEventListener('mouseup', function() {
                if (isDraggingPlayhead) {
                    isDraggingPlayhead = false;
                    playhead.classList.remove('active');
                }
            });
            
            // Ajouter un survol pour rendre la barre de progression plus interactive
            progressContainer.addEventListener('mousemove', function(e) {
                const rect = progressContainer.getBoundingClientRect();
                const hoverPosition = (e.clientX - rect.left) / rect.width;
                
                // Limiter la position entre 0 et 1
                const position = Math.max(0, Math.min(1, hoverPosition));
                
                // Calculer le temps correspondant à la position du survol
                const hoverTime = position * videoPlayer.duration;
                
                // Mettre à jour la position et le contenu du tooltip
                timeTooltip.style.left = `${position * 100}%`;
                timeTooltip.textContent = formatTimecodeShort(hoverTime);
            });
            
            // Cacher le tooltip quand la souris quitte la barre de progression
            progressContainer.addEventListener('mouseleave', function() {
                timeTooltip.style.opacity = '0';
            });
            
            progressContainer.addEventListener('mouseenter', function() {
                timeTooltip.style.opacity = '1';
            });
            
            // Fonction pour afficher une notification
            function showNotification(message) {
                // Vérifier s'il y a déjà une notification active et la supprimer
                const existingNotification = document.querySelector('.notification');
                if (existingNotification) {
                    document.body.removeChild(existingNotification);
                }
                
                const notification = document.createElement('div');
                notification.className = 'notification';
                notification.textContent = message;
                document.body.appendChild(notification);
                
                // Afficher la notification avec un délai pour animation
                setTimeout(() => {
                    notification.classList.add('show');
                }, 10);
                
                // Masquer et supprimer la notification après un délai
                setTimeout(() => {
                    notification.classList.remove('show');
                    setTimeout(() => {
                        if (notification.parentElement) {
                            document.body.removeChild(notification);
                        }
                    }, 300);
                }, 3000);
            }
            
            // Fonction pour formater le timecode avec millisecondes
            function formatTimecode(timeInSeconds) {
                const hours = Math.floor(timeInSeconds / 3600);
                const minutes = Math.floor((timeInSeconds % 3600) / 60);
                const seconds = Math.floor(timeInSeconds % 60);
                const milliseconds = Math.floor((timeInSeconds % 1) * 1000);
                
                return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}.${milliseconds.toString().padStart(3, '0')}`;
            }
            
            // Références pour les points de segment (inPoint/outPoint déjà déclarés plus haut)
            const inPointDisplay = document.getElementById('inPointDisplay');
            const outPointDisplay = document.getElementById('outPointDisplay');
            const setInPointBtn = document.getElementById('setInPointBtn');
            const setOutPointBtn = document.getElementById('setOutPointBtn');
            
            // Définir le point IN du segment
            setInPointBtn.addEventListener('click', function() {
                if (!videoPlayer.src) {
                    showNotification('Aucune vidéo chargée');
                    return;
                }
                
                // Mettre en pause la vidéo
                if (!videoPlayer.paused) {
                            videoPlayer.pause();
                        }
                
                inPoint = videoPlayer.currentTime;
                inPointDisplay.textContent = formatTimecodeShort(inPoint);
                inPointDisplay.classList.add('has-value');
                setInPointBtn.classList.add('active');
                
                // Si le point OUT existe et est avant le point IN, le réinitialiser
                if (outPoint !== null && outPoint < inPoint) {
                    outPoint = null;
                    outPointDisplay.textContent = '--:--:--';
                    outPointDisplay.classList.remove('has-value');
                    setOutPointBtn.classList.remove('active');
                }
                
                // Indication visuelle pour guider l'utilisateur vers la prochaine étape
                noteInput.setAttribute('placeholder', 'Définissez le point OUT ou ajoutez une note...');
                setOutPointBtn.classList.add('attention');
                
                showNotification('Point IN défini à ' + formatTimecodeShort(inPoint));
            });
            
            // Définir le point OUT du segment
            setOutPointBtn.addEventListener('click', function() {
                if (!videoPlayer.src) {
                    showNotification('Aucune vidéo chargée');
                    return;
                }
                
                if (inPoint === null) {
                    showNotification('Définissez d\'abord un point IN');
                    return;
                }
                
                const currentTime = videoPlayer.currentTime;
                
                if (currentTime <= inPoint) {
                    showNotification('Le point OUT doit être après le point IN');
                    return;
                }
                
                // Mettre en pause la vidéo
                if (!videoPlayer.paused) {
                    videoPlayer.pause();
                }
                
                outPoint = currentTime;
                outPointDisplay.textContent = formatTimecodeShort(outPoint);
                outPointDisplay.classList.add('has-value');
                setOutPointBtn.classList.add('active');
                
                // Mettre le focus sur le champ de saisie de note
                noteInput.focus();
                
                // Indication visuelle pour guider l'utilisateur
                noteInput.setAttribute('placeholder', 'Décrivez ce segment...');
                setOutPointBtn.classList.remove('attention');
                
                showNotification('Point OUT défini à ' + formatTimecodeShort(outPoint) + ' - Ajoutez votre note');
            });
            
            // Réinitialiser les points IN/OUT 
            function resetSegmentPoints() {
                inPoint = null;
                outPoint = null;
                inPointDisplay.textContent = '--:--:--';
                outPointDisplay.textContent = '--:--:--';
                inPointDisplay.classList.remove('has-value');
                outPointDisplay.classList.remove('has-value');
                setInPointBtn.classList.remove('active');
                setOutPointBtn.classList.remove('active');
                setOutPointBtn.classList.remove('attention');
                
                // Réinitialiser le placeholder du champ de note
                noteInput.setAttribute('placeholder', 'Ajouter une note...');
            }
            
            // Variables pour le mode dessin
            const drawingCanvas = document.getElementById('drawingCanvas');
            const drawingMode = document.getElementById('drawingMode');
            const drawColor = document.getElementById('drawColor');
            const drawWidth = document.getElementById('drawWidth');
            const drawWidthValue = document.getElementById('drawWidthValue');
            const clearDrawing = document.getElementById('clearDrawing');
            const undoDrawing = document.getElementById('undoDrawing');
            
            // Contexte de dessin
            const ctx = drawingCanvas.getContext('2d');
            let isDrawing = false;
            let lastX = 0;
            let lastY = 0;
            
            // Historique de dessin pour la fonction d'annulation
            let drawHistory = [];
            let currentDrawingState = null;
            
            // Fonction pour redimensionner le canvas
            function resizeCanvas() {
                const rect = videoPlayer.getBoundingClientRect();
                drawingCanvas.width = rect.width;
                drawingCanvas.height = rect.height;
                
                // Restaurer l'état actuel après le redimensionnement
                if (currentDrawingState) {
                    const img = new Image();
                    img.onload = function() {
                        ctx.drawImage(img, 0, 0, drawingCanvas.width, drawingCanvas.height);
                    };
                    img.src = currentDrawingState;
                }
            }
            
            // Initialiser le canvas
            function initCanvas() {
                resizeCanvas();
                
                // S'assurer que le canvas est toujours à la bonne taille
                window.addEventListener('resize', resizeCanvas);
                videoPlayer.addEventListener('loadedmetadata', resizeCanvas);
            }
            
            if (drawingMode) {
                drawingMode.addEventListener('change', function() {
                    const ps = document.querySelector('.player-section');
                    if (this.checked) {
                        drawingCanvas.style.pointerEvents = 'auto';
                        if (ps) ps.classList.add('drawing-active');
                        showNotification('Mode dessin activé');
                    } else {
                        drawingCanvas.style.pointerEvents = 'none';
                        if (ps) ps.classList.remove('drawing-active');
                        showNotification('Mode dessin désactivé');
                    }
                });
            }
            if (drawWidth) {
                drawWidth.addEventListener('input', function() {
                    if (drawWidthValue) drawWidthValue.textContent = this.value + 'px';
                });
            }
            
            drawingCanvas.addEventListener('mousedown', function(e) {
                if (!drawingMode || !drawingMode.checked) return;
                
                const rect = drawingCanvas.getBoundingClientRect();
                const scaleX = drawingCanvas.width / rect.width;
                const scaleY = drawingCanvas.height / rect.height;
                
                lastX = (e.clientX - rect.left) * scaleX;
                lastY = (e.clientY - rect.top) * scaleY;
                isDrawing = true;
                
                // Dessiner un point au clic pour assurer la continuité même en cliquant simplement
                ctx.beginPath();
                ctx.arc(lastX, lastY, (drawWidth && drawWidth.value ? drawWidth.value : 4) / 2, 0, Math.PI * 2);
                ctx.fillStyle = drawColor ? drawColor.value : '#ff0000';
                ctx.fill();
                
                // Éviter de sauvegarder un état vide au début
                if (drawHistory.length === 0) {
                    saveDrawingState();
                }
            });
            
            // Dessiner en déplaçant la souris
            drawingCanvas.addEventListener('mousemove', function(e) {
                if (!isDrawing) return;
                
                const rect = drawingCanvas.getBoundingClientRect();
                const scaleX = drawingCanvas.width / rect.width;
                const scaleY = drawingCanvas.height / rect.height;
                
                const currentX = (e.clientX - rect.left) * scaleX;
                const currentY = (e.clientY - rect.top) * scaleY;
                
                // Dessiner une ligne
                ctx.beginPath();
                ctx.moveTo(lastX, lastY);
                ctx.lineTo(currentX, currentY);
                ctx.strokeStyle = drawColor ? drawColor.value : '#ff0000';
                ctx.lineWidth = drawWidth ? drawWidth.value : 4;
                ctx.lineCap = 'round';
                ctx.lineJoin = 'round';
                ctx.stroke();
                
                lastX = currentX;
                lastY = currentY;
            });
            
            // Arrêter de dessiner
            ['mouseup', 'mouseout'].forEach(event => {
                drawingCanvas.addEventListener(event, function() {
                    if (isDrawing) {
                        // Enregistrer l'état du dessin si nous étions en train de dessiner
                        saveDrawingState();
                    }
                    isDrawing = false;
                });
            });
            
            // Sauvegarder l'état du dessin pour l'annulation
            function saveDrawingState() {
                currentDrawingState = drawingCanvas.toDataURL();
                drawHistory.push(currentDrawingState);
                
                // Limiter la taille de l'historique
                if (drawHistory.length > 20) {
                    drawHistory.shift();
                }
            }
            
            if (undoDrawing) {
                undoDrawing.addEventListener('click', function() {
                if (drawHistory.length > 0) {
                    // Retirer l'état actuel
                    drawHistory.pop();
                    
                    // Effacer le canvas
                    ctx.clearRect(0, 0, drawingCanvas.width, drawingCanvas.height);
                    
                    // Restaurer l'état précédent s'il existe
                    if (drawHistory.length > 0) {
                        const img = new Image();
                        currentDrawingState = drawHistory[drawHistory.length - 1];
                        img.onload = function() {
                            ctx.drawImage(img, 0, 0, drawingCanvas.width, drawingCanvas.height);
                        };
                        img.src = currentDrawingState;
                    } else {
                        currentDrawingState = null;
                    }
                    
                    showNotification('Dernier trait annulé');
                } else {
                    showNotification('Aucun trait à annuler');
                }
            });
            }
            
            if (clearDrawing) {
                clearDrawing.addEventListener('click', function() {
                ctx.clearRect(0, 0, drawingCanvas.width, drawingCanvas.height);
                drawHistory = [];
                currentDrawingState = null;
                showNotification('Dessin effacé');
            });
            }
            
            // Inclure les dessins dans les captures d'écran
            function combineVideoAndDrawings(canvas, width, height) {
                const context = canvas.getContext('2d');
                
                // Dessiner le dessin s'il existe
                if (currentDrawingState) {
                    const img = new Image();
                    img.onload = function() {
                        context.drawImage(img, 0, 0, width, height);
                    };
                    img.src = currentDrawingState;
                }
            }
            
            // Modifier la fonction de capture d'écran pour inclure les dessins
            const originalCaptureScreenshot = captureScreenshot;
            captureScreenshot = function() {
                // Créer un canvas pour dessiner la vidéo
                const canvas = document.createElement('canvas');
                canvas.width = videoPlayer.videoWidth;
                canvas.height = videoPlayer.videoHeight;
                const ctx = canvas.getContext('2d');
                
                // Dessiner la vidéo sur le canvas
                ctx.drawImage(videoPlayer, 0, 0, canvas.width, canvas.height);
                
                // Si l'overlay est visible, le dessiner également
                if (overlayImage.style.display !== 'none') {
                    // Convertir les pourcentages en valeurs réelles
                    const xPos = (parseFloat(overlayImage.style.left || 0) / 100) * canvas.width;
                    const yPos = (parseFloat(overlayImage.style.top || 0) / 100) * canvas.height;
                    const width = (parseFloat(overlayImage.style.width || 100) / 100) * canvas.width;
                    const height = (parseFloat(overlayImage.style.height || 100) / 100) * canvas.height;
                    
                    // Dessiner l'overlay avec les paramètres actuels
                    ctx.globalAlpha = parseFloat(overlayImage.style.opacity || 1);
                    if (overlayImage.complete) {
                        ctx.drawImage(overlayImage, xPos, yPos, width, height);
                    }
                    ctx.globalAlpha = 1.0;
                }
                
                // Dessiner les annotations de dessin si elles existent
                if (currentDrawingState) {
                    const img = new Image();
                    img.onload = function() {
                        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
                        finalizeScreenshot(canvas);
                    };
                    img.src = currentDrawingState;
                } else {
                    // Pas de dessin, finaliser directement
                    finalizeScreenshot(canvas);
                }
            };
            
            // Finaliser la capture d'écran
            function finalizeScreenshot(canvas) {
                // Utiliser la capture pour ajouter une miniature aux notes
                const dataURL = canvas.toDataURL('image/jpeg', 0.8);
                currentThumbnail = {
                    dataURL: dataURL,
                    time: videoPlayer.currentTime
                };
                updateThumbnailPreview();
                
                showNotification('Capture réalisée - Prête pour une note');
            }
            
            // Modifier la fonction captureThumbnail pour inclure les dessins
            const originalCaptureThumbnail = captureThumbnail;
            captureThumbnail = function() {
                if (!videoPlayer.src) {
                    showNotification('Aucune vidéo chargée');
                    return;
                }
                
                // Pause de la vidéo pour faciliter la prise de note
                if (!videoPlayer.paused) {
                    videoPlayer.pause();
                }
                
                // Créer un canvas pour dessiner la vidéo en miniature
                const canvas = document.createElement('canvas');
                const aspectRatio = videoPlayer.videoWidth / videoPlayer.videoHeight;
                const thumbWidth = 320;
                canvas.width = thumbWidth;
                canvas.height = thumbWidth / aspectRatio;
                const ctx = canvas.getContext('2d');
                
                // Dessiner la vidéo sur le canvas
                ctx.drawImage(videoPlayer, 0, 0, canvas.width, canvas.height);
                
                // Si l'overlay est visible, le dessiner également
                if (overlayImage.style.display !== 'none') {
                    // Convertir les pourcentages en valeurs réelles
                    const xPos = (parseFloat(overlayImage.style.left || 0) / 100) * canvas.width;
                    const yPos = (parseFloat(overlayImage.style.top || 0) / 100) * canvas.height;
                    const width = (parseFloat(overlayImage.style.width || 100) / 100) * canvas.width;
                    const height = (parseFloat(overlayImage.style.height || 100) / 100) * canvas.height;
                    
                    // Dessiner l'overlay avec les paramètres actuels
                    ctx.globalAlpha = parseFloat(overlayImage.style.opacity || 1);
                    if (overlayImage.complete) {
                        ctx.drawImage(overlayImage, xPos, yPos, width, height);
                    }
                    ctx.globalAlpha = 1.0;
                }
                
                // Dessiner les annotations de dessin si elles existent
                if (currentDrawingState) {
                    const img = new Image();
                    img.onload = function() {
                        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
                        finalizeThumbnail(canvas);
                    };
                    img.src = currentDrawingState;
                } else {
                    finalizeThumbnail(canvas);
                }
            };
            
            // Finaliser la création de la miniature
            function finalizeThumbnail(canvas) {
                // Convertir le canvas en URL de données
                const dataURL = canvas.toDataURL('image/jpeg', 0.8);
                
                // Stocker la miniature actuelle
                currentThumbnail = {
                    dataURL: dataURL,
                    time: videoPlayer.currentTime
                };
                
                // Mettre à jour l'aperçu avec un effet visuel
                updateThumbnailPreview();
                
                // Mettre en évidence la zone de miniature
                thumbnailPreview.classList.add('highlight');
                setTimeout(() => {
                    thumbnailPreview.classList.remove('highlight');
                }, 1000);
                
                // Mettre le focus sur le champ de texte pour faciliter l'ajout de note
                noteInput.focus();
                
                showNotification('Capture ajoutée - Ajoutez votre note');
            }
            
            // Modifier le comportement du clic vidéo pour éviter lecture/pause en mode dessin
            videoPlayer.onclick = null; // Supprimer l'événement click précédent s'il existe
            
            // Initialiser le canvas quand le DOM est chargé
            initCanvas();
            
            const advancedToggle = document.querySelector('.advanced-toggle');
            const advancedContent = document.querySelector('.advanced-content');
            if (advancedToggle && advancedContent) {
                advancedToggle.addEventListener('click', function() {
                    this.classList.toggle('active');
                    advancedContent.classList.toggle('visible');
                    const isVisible = advancedContent.classList.contains('visible');
                    localStorage.setItem('advancedMenuVisible', isVisible);
                    showNotification(isVisible ? 'Fonctionnalités avancées affichées' : 'Fonctionnalités avancées masquées');
                });
                const savedState = localStorage.getItem('advancedMenuVisible') === 'true';
                if (savedState) {
                    advancedToggle.classList.add('active');
                    advancedContent.classList.add('visible');
                }
            }
            
            // Ajouter les gestionnaires d'événements pour rendre les notes éditables
            document.querySelectorAll('.note-text.editable').forEach(element => {
                element.addEventListener('click', function() {
                    const index = parseInt(this.getAttribute('data-index'));
                    const note = notes[index];
                    const currentText = note.text;
                    
                    // Ne pas activer le mode édition si déjà en cours
                    if (this.classList.contains('editing')) return;
                    
                    // Enregistrer le contenu actuel
                    this.dataset.originalContent = this.innerHTML;
                    
                    // Supprimer tout badge existant
                    const textOnly = currentText;
                    
                    // Créer l'interface d'édition
                    this.classList.add('editing');
                    this.innerHTML = `
                        <textarea class="edit-input" autofocus>${textOnly}</textarea>
                        <div class="note-edit-buttons">
                            <button class="note-edit-cancel">Annuler</button>
                            <button class="note-edit-save">Enregistrer</button>
                        </div>
                    `;
                    
                    // Activer le mode d'édition global pour désactiver les raccourcis clavier
                    isEditingNote = true;
                    
                    // Focus sur le textarea
                    const textarea = this.querySelector('textarea');
                    textarea.focus();
                    textarea.setSelectionRange(textarea.value.length, textarea.value.length);
                    
                    // Gestionnaire pour le bouton Sauvegarder
                    this.querySelector('.note-edit-save').addEventListener('click', function() {
                        const newText = textarea.value.trim();
                        
                        // Ne rien faire si le texte est vide
                        if (newText === '') return;
                        
                        // Mettre à jour les données
                        note.text = newText;
                        
                        // Désactiver le mode d'édition
                        isEditingNote = false;
                        
                        // Mettre à jour l'affichage
                        updateNotesList();
                        
                        showNotification('Note mise à jour');
                    });
                    
                    // Gestionnaire pour le bouton Annuler
                    this.querySelector('.note-edit-cancel').addEventListener('click', function() {
                        // Restaurer le contenu original
                        element.innerHTML = element.dataset.originalContent;
                        element.classList.remove('editing');
                        
                        // Désactiver le mode d'édition
                        isEditingNote = false;
                    });
                    
                    // Gérer la touche Escape pour annuler
                    textarea.addEventListener('keydown', function(e) {
                        if (e.key === 'Escape') {
                            element.innerHTML = element.dataset.originalContent;
                            element.classList.remove('editing');
                            
                            // Désactiver le mode d'édition
                            isEditingNote = false;
                            
                            e.preventDefault();
                        } else if (e.key === 'Enter' && e.ctrlKey) {
                            // Ctrl+Enter pour sauvegarder
                            const newText = textarea.value.trim();
                            if (newText !== '') {
                                note.text = newText;
                                
                                // Désactiver le mode d'édition
                                isEditingNote = false;
                                
                                updateNotesList();
                                showNotification('Note mise à jour');
                            }
                            e.preventDefault();
                        }
                    });
                    
                    // Empêcher la propagation de l'événement pour éviter de déclencher d'autres clics
                    const stopPropagation = function(e) {
                        e.stopPropagation();
                    };
                    
                    textarea.addEventListener('click', stopPropagation);
                    this.querySelector('.note-edit-save').addEventListener('click', stopPropagation);
                    this.querySelector('.note-edit-cancel').addEventListener('click', stopPropagation);
                });
            });

            // Fonctions pour gérer les nouveaux icônes SVG
            function updatePlayPauseIcon(isPlaying) {
                const playIcon = document.querySelector('.play-icon');
                const pauseIcon = document.querySelector('.pause-icon');
                
                if (isPlaying) {
                    playIcon.style.display = 'none';
                    pauseIcon.style.display = 'block';
                } else {
                    playIcon.style.display = 'block';
                    pauseIcon.style.display = 'none';
                }
            }

            function updateVolumeIcon(isMuted, volumeLevel) {
                const volumeHigh = document.querySelector('.volume-high');
                const volumeWaves = document.querySelector('.volume-waves');
                const volumeMuted = document.querySelector('.volume-muted');
                
                if (isMuted || volumeLevel === 0) {
                    volumeHigh.style.display = 'none';
                    volumeWaves.style.display = 'none';
                    volumeMuted.style.display = 'block';
                } else {
                    volumeHigh.style.display = 'block';
                    volumeMuted.style.display = 'none';
                    
                    if (volumeLevel > 0.5) {
                        volumeWaves.style.display = 'block';
                    } else {
                        volumeWaves.style.display = 'none';
                    }
                }
            }

            function updateFullscreenIcon(isFullscreen) {
                const fullscreenEnter = document.querySelector('.fullscreen-enter');
                const fullscreenExit = document.querySelector('.fullscreen-exit');
                
                if (isFullscreen) {
                    fullscreenEnter.style.display = 'none';
                    fullscreenExit.style.display = 'block';
                } else {
                    fullscreenEnter.style.display = 'block';
                    fullscreenExit.style.display = 'none';
                }
            }

            // Modifier vos gestionnaires d'événements existants pour utiliser ces fonctions
            document.addEventListener('DOMContentLoaded', () => {
                // ... votre code existant ...
                
                // Exemple d'utilisation avec les événements existants:
                const videoPlayer = document.getElementById('videoPlayer');
                const playPauseBtn = document.getElementById('playPauseBtn');
                const volumeBtn = document.getElementById('volumeBtn');
                const volumeSlider = document.getElementById('volumeSlider');
                const fullscreenBtn = document.getElementById('fullscreenBtn');
                
                playPauseBtn.addEventListener('click', () => {
                    if (videoPlayer.paused) {
                        videoPlayer.play();
                        updatePlayPauseIcon(true);
                    } else {
                        videoPlayer.pause();
                        updatePlayPauseIcon(false);
                    }
                });
                
                volumeBtn.addEventListener('click', () => {
                    videoPlayer.muted = !videoPlayer.muted;
                    updateVolumeIcon(videoPlayer.muted, volumeSlider.value);
                });
                
                volumeSlider.addEventListener('input', () => {
                    videoPlayer.volume = volumeSlider.value;
                    updateVolumeIcon(videoPlayer.muted, volumeSlider.value);
                });
                
                fullscreenBtn.addEventListener('click', () => {
                    if (document.fullscreenElement) {
                        document.exitFullscreen();
                        updateFullscreenIcon(false);
                    } else {
                        var target = document.querySelector('.player-section') || document.querySelector('.video-container');
                        if (target) target.requestFullscreen();
                        updateFullscreenIcon(true);
                    }
                });
                
                // Initialiser les icônes au chargement
                updatePlayPauseIcon(false);
                updateVolumeIcon(videoPlayer.muted, volumeSlider.value);
                updateFullscreenIcon(false);
            });
}); // fin initVideoAndImport (DOMContentLoaded)
