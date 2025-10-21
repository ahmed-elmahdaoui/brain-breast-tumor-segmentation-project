const imageInput = document.getElementById("imageInput");
const maskInput = document.getElementById("maskInput");
const dropImage = document.getElementById("dropImage");
const dropMask = document.getElementById("dropMask");
const loader = document.getElementById("loader");

dropImage.addEventListener("click", () => imageInput.click());
dropMask.addEventListener("click", () => maskInput.click());

["dragover", "dragleave", "drop"].forEach(event =>
  [dropImage, dropMask].forEach(zone => zone.addEventListener(event, e => e.preventDefault()))
);

dropImage.addEventListener("drop", e => handleFileDrop(e, imageInput, "imageName", "originalImage"));
dropMask.addEventListener("drop", e => handleFileDrop(e, maskInput, "maskName", "trueMask"));

imageInput.addEventListener("change", e => handleFileChange(e, "imageName", "originalImage"));
maskInput.addEventListener("change", e => handleFileChange(e, "maskName", "trueMask"));

function handleFileDrop(e, input, nameId, imgId) {
  const file = e.dataTransfer.files[0];
  input.files = e.dataTransfer.files;
  document.getElementById(nameId).textContent = file.name;
  document.getElementById(imgId).src = URL.createObjectURL(file);
}

function handleFileChange(e, nameId, imgId) {
  const file = e.target.files[0];
  if (file) {
    document.getElementById(nameId).textContent = file.name;
    document.getElementById(imgId).src = URL.createObjectURL(file);
  }
}

function resetForm() {
  imageInput.value = "";
  maskInput.value = "";
  document.getElementById("imageName").textContent = "";
  document.getElementById("maskName").textContent = "";
  document.getElementById("originalImage").src = "";
  document.getElementById("trueMask").src = "";
  document.getElementById("resultImage").src = "";
}


async function submitForm() {
    const imageInput = document.getElementById("imageInput");
    const loader = document.getElementById("loader");

    const imageFile = imageInput.files[0];
    if (!imageFile) {
        alert("Veuillez sélectionner une image.");
        return;
    }

    const formData = new FormData();
    formData.append("image_file", imageFile);

    loader.style.display = "block";

    try {
        const response = await fetch("http://127.0.0.1:8000/overlay-contours/", {
            method: "POST",
            body: formData
        });

        if (!response.ok) {
            const errText = await response.text();
            throw new Error(errText);
        }

        const contentType = response.headers.get("content-type");
        if (!contentType || !contentType.includes("multipart/form-data"))
            throw new Error("Réponse non multipart attendue");
        const boundary = contentType.split("boundary=")[1];

        // Prépare le buffer et les bytes du boundary
        const buffer = await response.arrayBuffer();
        const bytes = new Uint8Array(buffer);
        const boundaryBytes = new TextEncoder().encode("--" + boundary);

        // Cherche toutes les positions du boundary
        function findBoundaryPositions(bytes, boundaryBytes) {
            let positions = [];
            for (let i = 0; i <= bytes.length - boundaryBytes.length; i++) {
                let found = true;
                for (let j = 0; j < boundaryBytes.length; j++) {
                    if (bytes[i + j] !== boundaryBytes[j]) {
                        found = false;
                        break;
                    }
                }
                if (found) positions.push(i);
            }
            return positions;
        }

        const positions = findBoundaryPositions(bytes, boundaryBytes);

        let foundImages = 0;
        for (let i = 0; i < positions.length - 1; i++) {
            const partStart = positions[i] + boundaryBytes.length;
            const partEnd = positions[i + 1];

            // Cherche le double CRLF qui sépare header et body (image)
            let headerEnd = partStart;
            while (
                headerEnd + 3 < partEnd &&
                !(bytes[headerEnd] === 13 && bytes[headerEnd + 1] === 10 &&
                  bytes[headerEnd + 2] === 13 && bytes[headerEnd + 3] === 10)
            ) {
                headerEnd++;
            }
            if (headerEnd + 3 >= partEnd) continue;

            // Header texte pour vérifier le type
            const headerText = new TextDecoder().decode(bytes.slice(partStart, headerEnd));
            if (!headerText.includes("Content-Type: image/png")) continue;

            // Le body commence après le double CRLF
            const bodyStart = headerEnd + 4;
            let bodyEnd = partEnd;
            // Retirer les \r\n à la fin du body
            while (bodyEnd > bodyStart && (bytes[bodyEnd - 1] === 10 || bytes[bodyEnd - 1] === 13)) {
                bodyEnd--;
            }

            // Extraire et afficher l'image
            const imgBytes = bytes.slice(bodyStart, bodyEnd);
            const blob = new Blob([imgBytes], { type: "image/png" });
            const imgURL = URL.createObjectURL(blob);

            if (foundImages === 0) {
                document.getElementById("resultImage1").src = imgURL;
            } else if (foundImages === 1) {
                document.getElementById("resultImage2").src = imgURL;
            }
            foundImages++;
        }

        if (foundImages === 0) {
            throw new Error("Aucune image trouvée dans la réponse multipart.");
        }
    } catch (error) {
        alert("Erreur : " + error.message);
    } finally {
        loader.style.display = "none";
    }
}




/*

async function submitForm() {
  const imageFile = imageInput.files[0];
  const maskFile = maskInput.files[0];

  if (!imageFile || !maskFile) {
    alert("Veuillez sélectionner à la fois une image et un masque.");
    return;
  }

  const formData = new FormData();
  formData.append("image_file", imageFile);
  //formData.append("mask_file", maskFile);

  loader.classList.remove("hidden");

  try {
    const response = await fetch("http://127.0.0.1:8001/overlay-contours/", {
      method: "POST",
      body: formData
    });

    if (!response.ok) {
      const errText = await response.text();
      throw new Error(errText);
    }

    const blob = await response.blob();
    document.getElementById("resultImage").src = URL.createObjectURL(blob);
  } catch (error) {
    alert("Erreur : " + error.message);
  } finally {
    loader.classList.add("hidden");
  }
}
//*/