// Global variables
let model = null;
let currentImage = null;

// DOM Elements
const uploadArea = document.getElementById('uploadArea');
const fileInput = document.getElementById('fileInput');
const uploadSection = document.getElementById('uploadSection');
const loadingSection = document.getElementById('loadingSection');
const processingSection = document.getElementById('processingSection');
const resultsSection = document.getElementById('resultsSection');
const errorSection = document.getElementById('errorSection');
const loadingText = document.getElementById('loadingText');
const previewImage = document.getElementById('previewImage');
const foodName = document.getElementById('foodName');
const confidence = document.getElementById('confidence');
const nutritionGrid = document.getElementById('nutritionGrid');
const errorMessage = document.getElementById('errorMessage');
const resetBtn = document.getElementById('resetBtn');
const errorResetBtn = document.getElementById('errorResetBtn');
const addToTrackerBtn = document.getElementById('addToTrackerBtn');

// Initialize on page load
window.addEventListener('DOMContentLoaded', async () => {
    await loadModel();
    setupEventListeners();
});

// Load TensorFlow.js MobileNet model
async function loadModel() {
    try {
        showSection(loadingSection);
        loadingText.textContent = 'Loading TensorFlow.js model...';
        
        // Load MobileNet model
        model = await mobilenet.load({
            version: 2,
            alpha: 1.0
        });
        
        loadingText.textContent = 'Model loaded successfully!';
        setTimeout(() => {
            showSection(uploadSection);
        }, 500);
    } catch (error) {
        showError('Failed to load TensorFlow.js model. Please refresh the page.');
        console.error('Model loading error:', error);
    }
}

// Setup event listeners
function setupEventListeners() {
    // Click to upload
    uploadArea.addEventListener('click', () => {
        fileInput.click();
    });

    // File input change
    fileInput.addEventListener('change', (e) => {
        if (e.target.files && e.target.files[0]) {
            handleFile(e.target.files[0]);
        }
    });

    // Drag and drop
    uploadArea.addEventListener('dragover', (e) => {
        e.preventDefault();
        uploadArea.classList.add('dragover');
    });

    uploadArea.addEventListener('dragleave', () => {
        uploadArea.classList.remove('dragover');
    });

    uploadArea.addEventListener('drop', (e) => {
        e.preventDefault();
        uploadArea.classList.remove('dragover');
        
        if (e.dataTransfer.files && e.dataTransfer.files[0]) {
            handleFile(e.dataTransfer.files[0]);
        }
    });

    // Reset buttons
    resetBtn.addEventListener('click', resetApp);
    errorResetBtn.addEventListener('click', resetApp);
    
    // Add to tracker button
    if (addToTrackerBtn) {
        addToTrackerBtn.addEventListener('click', handleAddToTracker);
    }
}

// Handle file upload
function handleFile(file) {
    if (!file.type.startsWith('image/')) {
        showError('Please upload an image file.');
        return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
        currentImage = e.target.result;
        previewImage.src = currentImage;
        processImage();
    };
    reader.readAsDataURL(file);
}

// Main processing pipeline
async function processImage() {
    try {
        if (!model) {
            showError('Model not loaded. Please refresh the page.');
            return;
        }

        // Step 1: Recognize food
        showSection(processingSection);
        updateStep(1);
        
        const img = new Image();
        img.src = currentImage;
        
        await new Promise((resolve) => {
            img.onload = resolve;
        });

        const predictions = await model.classify(img);
        const topPrediction = predictions[0];
        
        updateStep(2);
        
        // Step 2: Fetch nutrition data
        const nutritionData = await fetchNutritionData(topPrediction.className);
        
        updateStep(3);
        await new Promise(resolve => setTimeout(resolve, 500));
        
        // Step 3: Display results
        displayResults(topPrediction, nutritionData);
        
    } catch (error) {
        console.error('Processing error:', error);
        showError('Failed to process image. Please try again with a different image.');
    }
}

// Update processing step
function updateStep(stepNumber) {
    for (let i = 1; i <= 3; i++) {
        const step = document.getElementById(`step${i}`);
        if (i === stepNumber) {
            step.classList.add('active');
        } else if (i < stepNumber) {
            step.classList.add('active');
        } else {
            step.classList.remove('active');
        }
    }
}

// Fetch nutrition data from USDA API
async function fetchNutritionData(foodName) {
    try {
        // Clean food name for search
        const searchTerm = cleanFoodName(foodName);
        
        // Search for food in USDA database
        const searchUrl = `https://api.nal.usda.gov/fdc/v1/foods/search?api_key=DEMO_KEY&query=${encodeURIComponent(searchTerm)}&pageSize=5`;
        
        const searchResponse = await fetch(searchUrl);
        if (!searchResponse.ok) {
            throw new Error('USDA API search failed');
        }
        
        const searchData = await searchResponse.json();
        
        if (!searchData.foods || searchData.foods.length === 0) {
            // Return default nutrition if no match found
            return getDefaultNutrition();
        }
        
        // Get the first food item
        const food = searchData.foods[0];
        const fdcId = food.fdcId;
        
        // Get detailed nutrition data
        const detailUrl = `https://api.nal.usda.gov/fdc/v1/food/${fdcId}?api_key=DEMO_KEY`;
        const detailResponse = await fetch(detailUrl);
        
        if (!detailResponse.ok) {
            throw new Error('USDA API detail fetch failed');
        }
        
        const detailData = await detailResponse.json();
        
        // Extract nutrition information
        return extractNutrition(detailData);
        
    } catch (error) {
        console.error('Nutrition fetch error:', error);
        // Return default nutrition on error
        return getDefaultNutrition();
    }
}

// Clean food name for better search results
function cleanFoodName(name) {
    // Remove common ImageNet prefixes and clean up
    return name
        .replace(/^[a-z]+\s+/, '') // Remove leading lowercase words
        .replace(/\s+/g, ' ')
        .trim()
        .split(',')[0] // Take first part if comma separated
        .split(' ')[0]; // Take first word for better matching
}

// Extract nutrition data from USDA API response
function extractNutrition(data) {
    const nutrition = {
        calories: 0,
        protein: 0,
        carbs: 0,
        fat: 0,
        fiber: 0,
        sugar: 0,
        sodium: 0
    };
    
    if (data.foodNutrients) {
        data.foodNutrients.forEach(nutrient => {
            const nutrientId = nutrient.nutrient?.id || nutrient.nutrientId;
            const value = nutrient.amount || 0;
            
            // Map USDA nutrient IDs to our nutrition object
            switch (nutrientId) {
                case 1008: // Energy (kcal)
                    nutrition.calories = Math.round(value);
                    break;
                case 1003: // Protein
                    nutrition.protein = Math.round(value * 10) / 10;
                    break;
                case 1005: // Carbohydrates
                    nutrition.carbs = Math.round(value * 10) / 10;
                    break;
                case 1004: // Total Fat
                    nutrition.fat = Math.round(value * 10) / 10;
                    break;
                case 1079: // Fiber
                    nutrition.fiber = Math.round(value * 10) / 10;
                    break;
                case 2000: // Sugars
                    nutrition.sugar = Math.round(value * 10) / 10;
                    break;
                case 1093: // Sodium
                    nutrition.sodium = Math.round(value);
                    break;
            }
        });
    }
    
    // If no data found, return default
    if (nutrition.calories === 0 && nutrition.protein === 0) {
        return getDefaultNutrition();
    }
    
    return nutrition;
}

// Get default nutrition values (fallback)
function getDefaultNutrition() {
    return {
        calories: 150,
        protein: 5.0,
        carbs: 25.0,
        fat: 3.0,
        fiber: 2.0,
        sugar: 5.0,
        sodium: 50
    };
}

// Display results
function displayResults(prediction, nutrition) {
    // Update food name and confidence
    foodName.textContent = formatFoodName(prediction.className);
    confidence.textContent = `Confidence: ${(prediction.probability * 100).toFixed(1)}%`;
    
    // Display nutrition data - only show: calories, carbohydrates, proteins, fibers, fat
    nutritionGrid.innerHTML = `
        <div class="nutrition-item">
            <div class="nutrition-label">Calories</div>
            <div class="nutrition-value">${nutrition.calories}</div>
            <div class="nutrition-unit">kcal</div>
        </div>
        <div class="nutrition-item">
            <div class="nutrition-label">Carbohydrates</div>
            <div class="nutrition-value">${nutrition.carbs}</div>
            <div class="nutrition-unit">g</div>
        </div>
        <div class="nutrition-item">
            <div class="nutrition-label">Proteins</div>
            <div class="nutrition-value">${nutrition.protein}</div>
            <div class="nutrition-unit">g</div>
        </div>
        <div class="nutrition-item">
            <div class="nutrition-label">Fibers</div>
            <div class="nutrition-value">${nutrition.fiber}</div>
            <div class="nutrition-unit">g</div>
        </div>
        <div class="nutrition-item">
            <div class="nutrition-label">Fat</div>
            <div class="nutrition-value">${nutrition.fat}</div>
            <div class="nutrition-unit">g</div>
        </div>
    `;
    
    // Store nutrition data globally for the add to tracker button
    // Only include: calories, carbs, protein, fiber, fat (exclude sugar and sodium)
    window.scannedNutritionData = {
        foodName: formatFoodName(prediction.className),
        nutrition: {
            calories: nutrition.calories,
            carbs: nutrition.carbs,
            protein: nutrition.protein,
            fiber: nutrition.fiber,
            fat: nutrition.fat
        }
    };
    
    showSection(resultsSection);
}

// Format food name for display
function formatFoodName(name) {
    return name
        .split(',')[0] // Take first part
        .split('_')
        .map(word => word.charAt(0).toUpperCase() + word.slice(1))
        .join(' ');
}

// Show specific section
function showSection(section) {
    uploadSection.style.display = 'none';
    loadingSection.style.display = 'none';
    processingSection.style.display = 'none';
    resultsSection.style.display = 'none';
    errorSection.style.display = 'none';
    
    section.style.display = 'block';
}

// Show error
function showError(message) {
    errorMessage.textContent = message;
    showSection(errorSection);
}

// Handle add to tracker button
async function handleAddToTracker() {
    if (!window.scannedNutritionData) {
        showError('No nutrition data available. Please scan an image first.');
        return;
    }

    // Check if we're in an iframe (React app context)
    if (window.parent && window.parent !== window) {
        // Send message to parent window (React app)
        window.parent.postMessage({
            type: 'SCAN_ADD_TO_TRACKER',
            data: window.scannedNutritionData
        }, '*');
    } else {
        // Standalone mode - show alert
        alert('Please use this feature from the main application. Nutrition data is ready to be added to your tracker.');
    }
}

// Reset app
function resetApp() {
    currentImage = null;
    previewImage.src = '';
    fileInput.value = '';
    window.scannedNutritionData = null;
    showSection(uploadSection);
    
    // Reset processing steps
    for (let i = 1; i <= 3; i++) {
        document.getElementById(`step${i}`).classList.remove('active');
    }
}

