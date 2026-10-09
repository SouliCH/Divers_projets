document.addEventListener("DOMContentLoaded", () => {
    
    let listeCours = []; 

    // === FONCTIONS DU MODE FOCUS ===
    const quitterModeFocus = () => {
        const tbody = document.getElementById("modules-tbody");
        if (tbody) {
            tbody.querySelectorAll("tr").forEach(ligne => ligne.style.display = ""); 
        }
        const conteneurPdf = document.getElementById("pdf-viewer-container");
        const iframePdf = document.getElementById("pdf-iframe");
        if (conteneurPdf) {
            conteneurPdf.style.display = "none";
            window.scrollTo({ top: 0, behavior: 'smooth' }); 
        }
        if (iframePdf) iframePdf.src = "";
    };

    const lancerModeFocus = (cours) => {
        const tbody = document.getElementById("modules-tbody");
        if (tbody) {
            tbody.querySelectorAll("tr").forEach(ligne => {
                if (ligne.getAttribute("data-nom") === cours.nom.toLowerCase()) {
                    ligne.style.display = "";
                } else {
                    ligne.style.display = "none";
                }
            });
        }

        if (cours.pdf) {
            const conteneurPdf = document.getElementById("pdf-viewer-container");
            const iframePdf = document.getElementById("pdf-iframe");
            const titrePdf = document.getElementById("titre-pdf");
            
            if (titrePdf) titrePdf.textContent = "Mode Focus : " + cours.nom;
            if (iframePdf) iframePdf.src = cours.pdf;
            if (conteneurPdf) {
                conteneurPdf.style.display = "block";
                setTimeout(() => conteneurPdf.scrollIntoView({ behavior: "smooth", block: "start" }), 100);
            }
        }
    };

    const btnFermerPdf = document.getElementById("btn-fermer-pdf");
    if (btnFermerPdf) btnFermerPdf.addEventListener("click", quitterModeFocus);


    // === 1. CHARGEMENT ET GÉNÉRATION AUTOMATIQUE ===
    fetch('donnees.json')
        .then(response => response.json())
        .then(data => {
            listeCours = data.cours || [];
            
            if (data.agenda) {
                Object.keys(data.agenda).forEach(jour => {
                    const conteneurJour = document.getElementById(jour.toLowerCase()); 
                    if (conteneurJour) {
                        const evenements = data.agenda[jour];
                        if (evenements && evenements.length > 0) {
                            conteneurJour.innerHTML = evenements.map(ev => {
                                const texteEv = (typeof ev === 'object' && ev !== null) ? (ev.summary || ev.nom || JSON.stringify(ev)) : ev;
                                return `<p>${texteEv}</p>`;
                            }).join('');
                        } else {
                            conteneurJour.innerHTML = `<p>Aucun cours</p>`;
                        }
                    }
                });
            }

            const tbody = document.getElementById("modules-tbody");
            if (tbody && data.cours) {
                tbody.innerHTML = ""; 
                
                data.cours.forEach((cours, index) => {
                    const objectifsHtml = cours.objectifs.map((obj, i) => `
                        <div style="margin-bottom: 8px; display: flex; align-items: flex-start;">
                            <input type="checkbox" id="obj-${index}-${i}" style="margin-top: 4px; margin-right: 8px; flex-shrink: 0; cursor: pointer;">
                            <label for="obj-${index}-${i}" style="text-align: justify; line-height: 1.4; flex-grow: 1; cursor: pointer;">${obj}</label>
                        </div>
                    `).join("");

                    const progressBarHtml = `
                        <div style="background: #e0e0e0; border-radius: 5px; width: 100%; height: 20px; position: relative;">
                            <div class="barre-avancement" style="width: 0%; min-width: 35px; background: #3498db; height: 100%; transition: width 0.3s; display: flex; align-items: center; justify-content: center; color: white; font-size: 12px; border-radius: 5px;">0%</div>
                        </div>
                    `;

                    const btnPdfHtml = cours.pdf ? `<button class="btn-pdf-focus" style="display: inline-block; white-space: nowrap; padding: 5px 10px; border: 1px solid #ccc; text-decoration: none; border-radius: 5px; color: #333; background: #f9f9f9; cursor: pointer;">📄 PDF</button>` : '';

                    const tr = document.createElement("tr");
                    tr.setAttribute("data-nom", cours.nom.toLowerCase()); 
                    tr.innerHTML = `
                        <td><span class="${cours.badgeClass}" style="display: inline-block; white-space: nowrap; padding: 5px 10px; border-radius: 5px; color: white; font-weight: bold; text-align: center;">${cours.nom}</span></td>
                        <td>${objectifsHtml}</td>
                        <td style="text-align: center;">${btnPdfHtml}</td>
                        <td>${cours.debut}<br>${cours.fin}</td>
                        <td style="color: #d32f2f; font-weight: bold;">${cours.examen}</td>
                        <td style="width: 120px;">${progressBarHtml}</td>
                    `;
                    tbody.appendChild(tr);

                    const btn = tr.querySelector(".btn-pdf-focus");
                    if (btn) btn.addEventListener("click", () => lancerModeFocus(cours));
                });

                tbody.querySelectorAll("tr").forEach((ligne, index) => {
                    const checkboxes = ligne.querySelectorAll("input[type='checkbox']");
                    const barre = ligne.querySelector(".barre-avancement"); 

                    if (checkboxes.length > 0 && barre) {
                        const mettreAJourProgression = () => {
                            const total = checkboxes.length;
                            const cochees = ligne.querySelectorAll("input[type='checkbox']:checked").length;
                            const pourcentage = Math.round((cochees / total) * 100);

                            barre.style.width = pourcentage + "%";
                            barre.textContent = pourcentage + "%";
                            
                            const etat = Array.from(checkboxes).map(cb => cb.checked);
                            localStorage.setItem(`progression_module_${index}`, JSON.stringify(etat));
                        };

                        const memoire = JSON.parse(localStorage.getItem(`progression_module_${index}`));
                        if (memoire) {
                            checkboxes.forEach((cb, i) => { if (memoire[i] !== undefined) cb.checked = memoire[i]; });
                        }
                        
                        mettreAJourProgression();
                        checkboxes.forEach(cb => cb.addEventListener("change", mettreAJourProgression));
                    }
                });
            }
        })
        .catch(error => console.error("Erreur :", error));


    // === 2. COMMANDES VOCALES (WEB SPEECH API) ===
    const btnMicro = document.getElementById("btn-micro"); 
    const btnMicroPdf = document.getElementById("btn-micro-pdf"); 
    const microStatut = document.getElementById("micro-statut");

    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    
    if (SpeechRecognition) {
        const recognition = new SpeechRecognition();
        recognition.lang = 'fr-FR';
        recognition.interimResults = false;
        recognition.maxAlternatives = 1;

        const demarrerMicro = () => {
            try {
                recognition.start();
                if (microStatut) {
                    microStatut.textContent = "🎙️ Parlez maintenant...";
                    microStatut.style.color = "#e74c3c";
                }
                if (btnMicroPdf) btnMicroPdf.textContent = "🔴 Écoute...";
            } catch (e) {
                console.warn("Le micro est déjà actif.");
            }
        };

        if (btnMicro) btnMicro.addEventListener("click", demarrerMicro);
        if (btnMicroPdf) btnMicroPdf.addEventListener("click", demarrerMicro);

        recognition.onresult = (event) => {
            const commande = event.results[0][0].transcript.toLowerCase().trim();
            
            if (microStatut) {
                microStatut.textContent = `🗣️ "${commande}"`;
                microStatut.style.color = "#27ae60";
            }

            // A. GESTION DU MODE SOMBRE / CLAIR
            if (commande.includes("sombre") || commande.includes("nuit")) {
                document.body.classList.add("dark-mode");
                if (microStatut) microStatut.textContent += " ➔ Mode sombre activé !";
            } 
            else if (commande.includes("clair") || commande.includes("jour")) {
                document.body.classList.remove("dark-mode");
                if (microStatut) microStatut.textContent += " ➔ Mode clair activé !";
            }
            // B. DEFILEMENT VERS L'AGENDA
            else if (commande.includes("agenda") || commande.includes("emploi du temps")) {
                const zoneAgenda = document.getElementById("lundi") || document.querySelector(".agenda-grid");
                if (zoneAgenda) {
                    quitterModeFocus(); 
                    setTimeout(() => zoneAgenda.scrollIntoView({ behavior: "smooth", block: "center" }), 200);
                }
            }
            // C. RETOUR / QUITTER MODE FOCUS
            else if (commande.includes("tout") || commande.includes("retour") || commande.includes("fermer") || commande.includes("quitter")) {
                quitterModeFocus();
                if (microStatut) microStatut.textContent += " ➔ Retour à la liste complète.";
            }
            // D. OUVRIR SPÉCIFIQUEMENT UN PDF EN MODE FOCUS (mot-clé "pdf")
            else if (commande.includes("pdf")) {
                const coursTrouve = listeCours.find(c => {
                    const nomC = c.nom.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
                    const cmdC = commande.normalize("NFD").replace(/[\u0300-\u036f]/g, "");
                    return cmdC.includes(nomC) || nomC.split(" ").some(m => m.length > 3 && cmdC.includes(m));
                });

                if (coursTrouve) {
                    lancerModeFocus(coursTrouve);
                    if (microStatut) microStatut.textContent += " ➔ Mode focus activé !";
                } else {
                    if (microStatut) microStatut.textContent += " ➔ ⚠️ PDF non trouvé.";
                }
            }
            // E. AFFICHER / DEFILER VERS UN MODULE (ex: "affiche module conflit")
            else {
                const lignes = document.querySelectorAll("#modules-tbody tr");
                let moduleTrouve = false;

                // Nettoyage de la commande (enlève accents et ponctuation type points)
                const commandeEpuree = commande
                    .normalize("NFD")
                    .replace(/[\u0300-\u036f]/g, "")
                    .replace(/[.,\/#!$%\^&\*;:{}=\-_`~()]/g, "");

                const motsCommande = commandeEpuree.split(" ");

                lignes.forEach(ligne => {
                    const nomAttribute = (ligne.getAttribute("data-nom") || "").toLowerCase();
                    const nomEpure = nomAttribute.normalize("NFD").replace(/[\u0300-\u036f]/g, "");

                    const correspondance = motsCommande.some(mot => mot.length > 3 && (nomEpure.includes(mot) || mot.includes(nomEpure)));

                    if (correspondance || commandeEpuree.includes(nomEpure)) {
                        moduleTrouve = true;

                        ligne.style.display = "";
                        ligne.scrollIntoView({ behavior: "smooth", block: "center" });

                        ligne.style.transition = "background-color 0.4s ease";
                        const fondOriginal = ligne.style.backgroundColor;
                        ligne.style.backgroundColor = "rgba(52, 152, 219, 0.35)";
                        
                        setTimeout(() => {
                            ligne.style.backgroundColor = fondOriginal;
                        }, 2500);
                    }
                });

                if (moduleTrouve && microStatut) {
                    microStatut.textContent += " ➔ Module trouvé !";
                } else if (!moduleTrouve && microStatut) {
                    microStatut.textContent += " ➔ ⚠️ Module non trouvé.";
                }
            }
        };

        recognition.onspeechend = () => {
            recognition.stop();
            if (btnMicroPdf) btnMicroPdf.textContent = "🎙️ Micro";
        };

        recognition.onerror = (event) => {
            if (microStatut) {
                microStatut.textContent = "⚠️ Erreur micro : " + event.error;
                microStatut.style.color = "#c0392b";
            }
            if (btnMicroPdf) btnMicroPdf.textContent = "🎙️ Micro";
        };

    } else {
        if (btnMicro) btnMicro.style.display = "none";
        if (btnMicroPdf) btnMicroPdf.style.display = "none";
        if (microStatut) microStatut.textContent = "Votre navigateur ne supporte pas la reconnaissance vocale.";
    }

});