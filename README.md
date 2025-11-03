# Segmentation de Tumeurs Cérébrales & Mammaires

[![Python](https://img.shields.io/badge/Python-3.8+-blue.svg)](https://www.python.org/)
[![PyTorch](https://img.shields.io/badge/PyTorch-2.0+-red.svg)](https://pytorch.org/)
[![License](https://img.shields.io/badge/License-MIT-green.svg)](LICENSE)

> Projet académique de segmentation automatique de tumeurs dans les images médicales utilisant l'apprentissage profond.

## 📋 Table des Matières

- [À Propos](#à-propos)
- [Architectures](#architectures)
- [Jeux de Données](#jeux-de-données)
- [Installation](#installation)
- [Utilisation](#utilisation)
- [Résultats](#résultats)
- [Équipe](#équipe)

## 🎯 À Propos

Ce projet implémente et compare plusieurs architectures de réseaux de neurones convolutifs pour la segmentation automatique de tumeurs dans deux types d'images médicales :
- **IRM cérébrales** : détection de tumeurs cérébrales
- **Échographies mammaires** : détection de tumeurs du sein

### Objectifs

- Automatiser la détection et la segmentation des tumeurs
- Réduire les erreurs humaines et le temps d'analyse
- Comparer les performances de différentes architectures (U-Net, U-Net++, DeepLabV3)

## 🏗️ Architectures

### 1. U-Net++
- **Encodeur** : ResNet34 pré-entraîné sur ImageNet
- **Avantages** : Connexions denses entre encodeur et décodeur pour une reconstruction précise
- **Performances** : Meilleur compromis performance/précision

### 2. DeepLabV3
- **Caractéristiques** : Dilated convolutions + ASPP (Atrous Spatial Pyramid Pooling)
- **Avantages** : Capture d'informations contextuelles multi-échelles
- **Performances** : Scores les plus élevés (F1: 0.8335, Accuracy: 0.9884)

### 3. U-Net (baseline)
- Architecture classique pour la segmentation médicale

## 📊 Jeux de Données

### Brain Tumor Dataset
- **Source** : [Kaggle](https://www.kaggle.com/datasets/tinashri/brain-tumor-dataset-include)
- **Contenu** : 647 paires image/masque d'IRM cérébrales
- **Format** : PNG/JPG avec masques binaires

### Breast Ultrasound Images Dataset
- **Source** : [Kaggle](https://www.kaggle.com/datasets/aryashah2k/breast-ultrasound-images-dataset)
- **Contenu** : 647 échographies mammaires avec masques
- **Catégories** : Normal, bénin, malin

### Dataset Final
- **Total** : 1294 paires image/masque
- **Augmentation** : 10 352 images (ratio 8×)
- **Dimensions** : 512×512 pixels

## 🔧 Installation

### Prérequis

```bash
Python 3.8+
CUDA 11.0+ (recommandé pour GPU)
```

### Installation des dépendances

```bash
# Cloner le repository
git clone https://github.com/ahmed-elmahdaoui/tumor-segmentation.git
cd tumor-segmentation

# Créer un environnement virtuel
python -m venv venv
source venv/bin/activate  # Linux/Mac
# ou
venv\Scripts\activate  # Windows

# Installer les packages
pip install -r requirements.txt
```

### requirements.txt

```
torch>=2.0.0
torchvision>=0.15.0
segmentation-models-pytorch>=0.3.3
albumentations>=1.3.0
opencv-python>=4.7.0
numpy>=1.24.0
matplotlib>=3.7.0
tqdm>=4.65.0
pillow>=9.5.0
scikit-learn>=1.2.0
```

## 🚀 Utilisation

### 1. Préparation des données

```bash
# Structure des dossiers
data/
├── brain/
│   ├── images/
│   └── masks/
└── breast/
    ├── images/
    └── masks/
```

### 2. Entraînement

```python
python train.py --model unetplusplus --epochs 25 --batch-size 8 --lr 1e-4
```

**Paramètres disponibles** :
- `--model` : `unet`, `unetplusplus`, `deeplabv3`
- `--epochs` : Nombre d'époques (défaut: 25)
- `--batch-size` : Taille du batch (défaut: 8)
- `--lr` : Taux d'apprentissage (défaut: 1e-4)

### 3. Évaluation

```python
python evaluate.py --model-path checkpoints/best_model.pth --test-dir data/test/
```

### 4. Inférence

```python
python predict.py --image path/to/image.png --model-path checkpoints/best_model.pth
```

## 📈 Résultats

### Comparaison des Modèles

| Métrique | U-Net++ | DeepLabV3 | U-Net |
|----------|---------|-----------|-------|
| **Accuracy** | 0.9844 | **0.9884** | 0.6434 |
| **F1 Score** | 0.7823 | **0.8335** | 0.2410 |
| **Precision** | 0.7470 | **0.8201** | 0.1373 |
| **Recall** | 0.8211 | 0.8472 | 0.9878 |
| **IoU** | 0.6289 | **0.6334** | - |
| **Dice** | 0.7221 | **0.7315** | - |
| **Vitesse** | **1.86 s/it** | 3.19 s/it | - |

### Performances Clés

✅ **DeepLabV3** : Meilleurs scores globaux (recommandé pour la précision)  
✅ **U-Net++** : Meilleur compromis vitesse/performance (recommandé pour production)  
❌ **U-Net** : Performances insuffisantes sur ce dataset

## 🛠️ Techniques d'Augmentation

- **Transformations géométriques** : Flip horizontal/vertical, rotation 90°
- **Transformations spatiales** : Translation (±10%), zoom (±10%), rotation (±15°)
- **Transformations photométriques** : Luminosité, contraste, flou gaussien
- **Normalisation** : Mean=(0.5, 0.5, 0.5), Std=(0.5, 0.5, 0.5)

## 📝 Fonction de Perte

Combinaison hybride de **Dice Loss** et **Binary Cross-Entropy** :

```
L_total = (1 - Dice) + λ × BCE
```

- **Dice Loss** : Optimal pour classes déséquilibrées
- **BCE** : Stabilité de l'optimisation
- **Optimiseur** : Adam (β₁=0.9, β₂=0.999)

## 👥 Équipe

**Étudiants** :
- EL MAHDAOUI Ahmed
- ER-ROUGBANI Mouaad
- LAHMAMSSI Adnane

**Encadrant** :
- Dr. RIFFI Jamal

**Institution** : Université Sidi Mohamed Ben Abdellah  
**Année** : 2024-2025

## 📄 License

Ce projet est sous licence MIT. Voir le fichier [LICENSE](LICENSE) pour plus de détails.

## 🔗 Références

- [Brain Tumor Dataset](https://www.kaggle.com/datasets/tinashri/brain-tumor-dataset-include)
- [Breast Ultrasound Dataset](https://www.kaggle.com/datasets/aryashah2k/breast-ultrasound-images-dataset)
- [Segmentation Models PyTorch](https://github.com/qubvel/segmentation_models.pytorch)
- [U-Net++: A Nested U-Net Architecture](https://arxiv.org/abs/1807.10165)
- [DeepLabV3: Rethinking Atrous Convolution](https://arxiv.org/abs/1706.05587)

## 📧 Contact

Pour toute question ou collaboration, contactez l'équipe via les issues GitHub.

---

⭐ Si ce projet vous aide, n'hésitez pas à lui donner une étoile !
