const nodemailer = require('nodemailer');

// Create transporter (configure with your email service)
const createTransporter = () => {
  // For development, use Ethereal Email or configure with real SMTP
  // In production, use actual SMTP credentials (Gmail, SendGrid, etc.)
  
  if (process.env.EMAIL_HOST && process.env.EMAIL_USER && process.env.EMAIL_PASS) {
    return nodemailer.createTransport({
      host: process.env.EMAIL_HOST,
      port: process.env.EMAIL_PORT || 587,
      secure: process.env.EMAIL_PORT === '465',
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });
  }
  
  // Development: Use Ethereal Email (creates test accounts)
  // To use: install nodemailer and configure with test account
  // Or skip email sending in development
  return null;
};

/**
 * Send meal notification email
 */
exports.sendMealNotificationEmail = async (user, data) => {
  const { mealType, date, consumed, remaining, exceeded, dailyGoals } = data;
  
  // Skip email in development if transporter not configured
  const transporter = createTransporter();
  if (!transporter) {
    console.log('Email service not configured. Skipping email send.');
    console.log('Meal notification data:', {
      user: user.email,
      mealType,
      consumed,
      remaining,
      exceeded,
    });
    return;
  }

  const mealTypeFormatted = mealType.charAt(0).toUpperCase() + mealType.slice(1);
  const dateFormatted = new Date(date).toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  const hasExceeded = consumed.calories > dailyGoals.calories;
  const exceededPercentage = ((consumed.calories / dailyGoals.calories) * 100).toFixed(1);

  const progressPercentage = Math.min((consumed.calories / dailyGoals.calories) * 100, 100);

  // Calculate remaining percentages
  const remainingCalories = Math.max(0, dailyGoals.calories - consumed.calories);
  const remainingPercentage = ((remainingCalories / dailyGoals.calories) * 100).toFixed(1);

  const htmlContent = `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
        .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
        .meal-info { background: white; padding: 20px; border-radius: 8px; margin-bottom: 20px; }
        .stats-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 15px; margin: 20px 0; }
        .stat-box { background: white; padding: 15px; border-radius: 8px; border-left: 4px solid #667eea; }
        .stat-label { font-size: 12px; color: #666; text-transform: uppercase; margin-bottom: 5px; }
        .stat-value { font-size: 24px; font-weight: bold; color: #333; }
        .goal { color: #667eea; }
        .consumed { color: #48bb78; }
        .remaining { color: #ed8936; }
        .exceeded { color: #f56565; }
        .progress-bar { background: #e2e8f0; height: 30px; border-radius: 15px; overflow: hidden; margin: 10px 0; position: relative; }
        .progress-fill { height: 100%; background: linear-gradient(90deg, #48bb78 0%, #ed8936 50%, #f56565 100%); transition: width 0.3s; }
        .progress-text { position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%); font-weight: bold; color: white; text-shadow: 0 1px 2px rgba(0,0,0,0.3); }
        .warning-box { background: #fff5f5; border: 2px solid #f56565; border-radius: 8px; padding: 15px; margin: 20px 0; }
        .success-box { background: #f0fff4; border: 2px solid #48bb78; border-radius: 8px; padding: 15px; margin: 20px 0; }
        .footer { text-align: center; margin-top: 30px; padding-top: 20px; border-top: 1px solid #e2e8f0; color: #666; font-size: 12px; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>🍽️ ${mealTypeFormatted} Finalized!</h1>
          <p style="margin: 0; opacity: 0.9;">Daily Nutrition Tracker</p>
        </div>
        <div class="content">
          <div class="meal-info">
            <h2>Hello ${user.firstName}!</h2>
            <p>Your <strong>${mealTypeFormatted}</strong> on <strong>${dateFormatted}</strong> has been finalized.</p>
          </div>

          ${hasExceeded ? `
            <div class="warning-box">
              <h3 style="color: #f56565; margin-top: 0;">⚠️ Daily Limit Exceeded</h3>
              <p>You've consumed <strong>${exceededPercentage}%</strong> of your daily calorie goal. You exceeded by <strong>${exceeded.calories.toFixed(0)} calories</strong>.</p>
              <p><strong>Recommendation:</strong> Consider lighter meals for the rest of the day or increase physical activity.</p>
            </div>
          ` : `
            <div class="success-box">
              <h3 style="color: #48bb78; margin-top: 0;">✅ On Track!</h3>
              <p>Great job! You're staying within your daily limits. You have <strong>${remainingCalories.toFixed(0)} calories</strong> remaining for today.</p>
            </div>
          `}

          <div class="stats-grid">
            <div class="stat-box goal">
              <div class="stat-label">Daily Goal</div>
              <div class="stat-value">${dailyGoals.calories.toFixed(0)} kcal</div>
            </div>
            <div class="stat-box consumed">
              <div class="stat-label">Consumed</div>
              <div class="stat-value">${consumed.calories.toFixed(0)} kcal</div>
            </div>
            <div class="stat-box remaining">
              <div class="stat-label">Remaining</div>
              <div class="stat-value">${remaining.calories.toFixed(0)} kcal</div>
            </div>
            <div class="stat-box ${hasExceeded ? 'exceeded' : 'remaining'}">
              <div class="stat-label">Progress</div>
              <div class="stat-value">${progressPercentage.toFixed(1)}%</div>
            </div>
          </div>

          <div style="background: white; padding: 20px; border-radius: 8px; margin-top: 20px;">
            <h3 style="margin-top: 0;">Nutrition Breakdown</h3>
            <table style="width: 100%; border-collapse: collapse;">
              <tr>
                <td style="padding: 8px; border-bottom: 1px solid #e2e8f0;"><strong>Macronutrient</strong></td>
                <td style="padding: 8px; border-bottom: 1px solid #e2e8f0; text-align: right;"><strong>Goal</strong></td>
                <td style="padding: 8px; border-bottom: 1px solid #e2e8f0; text-align: right;"><strong>Consumed</strong></td>
                <td style="padding: 8px; border-bottom: 1px solid #e2e8f0; text-align: right;"><strong>Remaining</strong></td>
              </tr>
              <tr>
                <td style="padding: 8px;">Protein (g)</td>
                <td style="padding: 8px; text-align: right;">${dailyGoals.protein.toFixed(0)}</td>
                <td style="padding: 8px; text-align: right;">${consumed.protein.toFixed(1)}</td>
                <td style="padding: 8px; text-align: right; color: ${remaining.protein > 0 ? '#48bb78' : '#f56565'}">${remaining.protein > 0 ? remaining.protein.toFixed(1) : `+${exceeded.protein.toFixed(1)}`}</td>
              </tr>
              <tr>
                <td style="padding: 8px;">Carbs (g)</td>
                <td style="padding: 8px; text-align: right;">${dailyGoals.carbs.toFixed(0)}</td>
                <td style="padding: 8px; text-align: right;">${consumed.carbs.toFixed(1)}</td>
                <td style="padding: 8px; text-align: right; color: ${remaining.carbs > 0 ? '#48bb78' : '#f56565'}">${remaining.carbs > 0 ? remaining.carbs.toFixed(1) : `+${exceeded.carbs.toFixed(1)}`}</td>
              </tr>
              <tr>
                <td style="padding: 8px;">Fat (g)</td>
                <td style="padding: 8px; text-align: right;">${dailyGoals.fat.toFixed(0)}</td>
                <td style="padding: 8px; text-align: right;">${consumed.fat.toFixed(1)}</td>
                <td style="padding: 8px; text-align: right; color: ${remaining.fat > 0 ? '#48bb78' : '#f56565'}">${remaining.fat > 0 ? remaining.fat.toFixed(1) : `+${exceeded.fat.toFixed(1)}`}</td>
              </tr>
              <tr>
                <td style="padding: 8px;">Fiber (g)</td>
                <td style="padding: 8px; text-align: right;">${dailyGoals.fiber.toFixed(0)}</td>
                <td style="padding: 8px; text-align: right;">${consumed.fiber.toFixed(1)}</td>
                <td style="padding: 8px; text-align: right; color: ${remaining.fiber > 0 ? '#48bb78' : '#f56565'}">${remaining.fiber > 0 ? remaining.fiber.toFixed(1) : `+${exceeded.fiber.toFixed(1)}`}</td>
              </tr>
            </table>
          </div>

          <div class="footer">
            <p>Stay healthy and track your nutrition daily! 📊</p>
            <p>This is an automated notification from your Daily Tracker.</p>
          </div>
        </div>
      </div>
    </body>
    </html>
  `;

  const textContent = `
    ${mealTypeFormatted} Finalized!
    
    Hello ${user.firstName}!
    
    Your ${mealTypeFormatted} on ${dateFormatted} has been finalized.
    
    ${hasExceeded ? 
      `⚠️ WARNING: Daily Limit Exceeded
      You've consumed ${exceededPercentage}% of your daily calorie goal.
      You exceeded by ${exceeded.calories.toFixed(0)} calories.
      
      Recommendation: Consider lighter meals for the rest of the day.` :
      `✅ On Track!
      Great job! You have ${remainingCalories.toFixed(0)} calories remaining for today.`
    }
    
    Daily Summary:
    - Goal: ${dailyGoals.calories.toFixed(0)} kcal
    - Consumed: ${consumed.calories.toFixed(0)} kcal
    - Remaining: ${remaining.calories.toFixed(0)} kcal
    - Progress: ${progressPercentage.toFixed(1)}%
    
    Nutrition Breakdown:
    Protein: ${consumed.protein.toFixed(1)}g / ${dailyGoals.protein.toFixed(0)}g (Remaining: ${remaining.protein > 0 ? remaining.protein.toFixed(1) : `+${exceeded.protein.toFixed(1)}`}g)
    Carbs: ${consumed.carbs.toFixed(1)}g / ${dailyGoals.carbs.toFixed(0)}g (Remaining: ${remaining.carbs > 0 ? remaining.carbs.toFixed(1) : `+${exceeded.carbs.toFixed(1)}`}g)
    Fat: ${consumed.fat.toFixed(1)}g / ${dailyGoals.fat.toFixed(0)}g (Remaining: ${remaining.fat > 0 ? remaining.fat.toFixed(1) : `+${exceeded.fat.toFixed(1)}`}g)
    Fiber: ${consumed.fiber.toFixed(1)}g / ${dailyGoals.fiber.toFixed(0)}g (Remaining: ${remaining.fiber > 0 ? remaining.fiber.toFixed(1) : `+${exceeded.fiber.toFixed(1)}`}g)
    
    Stay healthy and track your nutrition daily!
  `;

  try {
    await transporter.sendMail({
      from: process.env.EMAIL_FROM || `"Daily Tracker" <${process.env.EMAIL_USER || 'noreply@dailytracker.com'}>`,
      to: user.email,
      subject: `🍽️ ${mealTypeFormatted} Finalized - ${hasExceeded ? 'Limit Exceeded!' : 'On Track!'}`,
      text: textContent,
      html: htmlContent,
    });

    console.log(`Meal notification email sent to ${user.email}`);
  } catch (error) {
    console.error('Error sending email:', error);
    throw error;
  }
};

/**
 * Send meal plan email to user
 */
exports.sendMealPlanEmail = async (user, mealPlan, date) => {
  const transporter = createTransporter();
  if (!transporter) {
    console.log('Email service not configured. Skipping email send.');
    console.log('Meal plan data:', {
      user: user.email,
      date,
      totalCalories: mealPlan.totalNutrition?.calories,
    });
    return;
  }

  const dateFormatted = new Date(date).toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  // Build meal plan HTML
  let mealsHtml = '';
  const mealIcons = { breakfast: '🌅', lunch: '🍛', dinner: '🌙' };
  
  mealPlan.meals?.forEach(meal => {
    if (meal.mealType === 'snack') return; // Skip snacks
    
    let itemsHtml = '';
    meal.items?.forEach(item => {
      const recipeName = item.recipeName || item.foodName || 'Recipe';
      itemsHtml += `
        <div style="background: #f7fafc; padding: 15px; border-radius: 8px; margin-bottom: 10px; border-left: 4px solid #667eea;">
          <h4 style="margin: 0 0 8px 0; color: #2d3748;">${recipeName}</h4>
          <p style="margin: 4px 0; color: #4a5568; font-size: 14px;">
            <strong>Calories:</strong> ${item.nutrition?.calories?.toFixed(0) || 0} kcal | 
            <strong>Protein:</strong> ${item.nutrition?.protein?.toFixed(1) || 0}g | 
            <strong>Carbs:</strong> ${item.nutrition?.carbs?.toFixed(1) || 0}g | 
            <strong>Fat:</strong> ${item.nutrition?.fat?.toFixed(1) || 0}g
          </p>
          ${item.recipeInstructions ? `
            <details style="margin-top: 8px;">
              <summary style="cursor: pointer; color: #667eea; font-weight: bold;">View Recipe Instructions</summary>
              <p style="margin-top: 8px; color: #4a5568; white-space: pre-wrap;">${item.recipeInstructions}</p>
            </details>
          ` : ''}
        </div>
      `;
    });

    mealsHtml += `
      <div style="background: white; padding: 20px; border-radius: 8px; margin-bottom: 20px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
        <h3 style="margin: 0 0 15px 0; color: #2d3748; display: flex; align-items: center; gap: 10px;">
          <span style="font-size: 24px;">${mealIcons[meal.mealType] || '🍽️'}</span>
          <span style="text-transform: capitalize;">${meal.mealType}</span>
        </h3>
        ${itemsHtml}
        <div style="margin-top: 15px; padding-top: 15px; border-top: 2px solid #e2e8f0;">
          <p style="margin: 0; color: #4a5568; font-weight: bold;">
            Meal Total: ${meal.totalNutrition?.calories?.toFixed(0) || 0} kcal | 
            P: ${meal.totalNutrition?.protein?.toFixed(1) || 0}g | 
            C: ${meal.totalNutrition?.carbs?.toFixed(1) || 0}g | 
            F: ${meal.totalNutrition?.fat?.toFixed(1) || 0}g
          </p>
        </div>
      </div>
    `;
  });

  const htmlContent = `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 700px; margin: 0 auto; padding: 20px; }
        .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
        .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
        .summary-box { background: white; padding: 20px; border-radius: 8px; margin-bottom: 20px; border: 2px solid #667eea; }
        .stats-grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 15px; margin: 20px 0; }
        .stat-box { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 15px; border-radius: 8px; text-align: center; }
        .stat-label { font-size: 12px; opacity: 0.9; text-transform: uppercase; margin-bottom: 5px; }
        .stat-value { font-size: 24px; font-weight: bold; }
        .footer { text-align: center; margin-top: 30px; padding-top: 20px; border-top: 1px solid #e2e8f0; color: #666; font-size: 12px; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>📋 Your Personalized Meal Plan</h1>
          <p style="margin: 0; opacity: 0.9;">${dateFormatted}</p>
        </div>
        <div class="content">
          <div style="margin-bottom: 20px;">
            <h2 style="color: #2d3748;">Hello ${user.firstName}!</h2>
            <p style="color: #4a5568;">Here's your personalized meal plan for ${dateFormatted}. This plan is designed to meet your nutrition goals.</p>
          </div>

          <div class="summary-box">
            <h3 style="margin-top: 0; color: #2d3748;">Daily Nutrition Summary</h3>
            <div class="stats-grid">
              <div class="stat-box">
                <div class="stat-label">Total Calories</div>
                <div class="stat-value">${mealPlan.totalNutrition?.calories?.toFixed(0) || 0}</div>
              </div>
              <div class="stat-box">
                <div class="stat-label">Protein</div>
                <div class="stat-value">${mealPlan.totalNutrition?.protein?.toFixed(0) || 0}g</div>
              </div>
              <div class="stat-box">
                <div class="stat-label">Carbohydrates</div>
                <div class="stat-value">${mealPlan.totalNutrition?.carbs?.toFixed(0) || 0}g</div>
              </div>
              <div class="stat-box">
                <div class="stat-label">Fat</div>
                <div class="stat-value">${mealPlan.totalNutrition?.fat?.toFixed(0) || 0}g</div>
              </div>
            </div>
          </div>

          <h3 style="color: #2d3748; margin-top: 30px;">Your Meals</h3>
          ${mealsHtml}

          <div class="footer">
            <p>Stay healthy and enjoy your meals! 🍽️</p>
            <p>This is an automated meal plan from your Nutrition Tracker.</p>
          </div>
        </div>
      </div>
    </body>
    </html>
  `;

  const textContent = `
    Your Personalized Meal Plan - ${dateFormatted}
    
    Hello ${user.firstName}!
    
    Here's your personalized meal plan for ${dateFormatted}.
    
    Daily Nutrition Summary:
    - Total Calories: ${mealPlan.totalNutrition?.calories?.toFixed(0) || 0} kcal
    - Protein: ${mealPlan.totalNutrition?.protein?.toFixed(0) || 0}g
    - Carbohydrates: ${mealPlan.totalNutrition?.carbs?.toFixed(0) || 0}g
    - Fat: ${mealPlan.totalNutrition?.fat?.toFixed(0) || 0}g
    
    Your Meals:
    ${mealPlan.meals?.map(meal => {
      if (meal.mealType === 'snack') return '';
      return `
    ${meal.mealType.toUpperCase()}:
    ${meal.items?.map(item => `  - ${item.recipeName || item.foodName}: ${item.nutrition?.calories?.toFixed(0) || 0} kcal`).join('\n')}
    Total: ${meal.totalNutrition?.calories?.toFixed(0) || 0} kcal
      `;
    }).join('\n')}
    
    Stay healthy and enjoy your meals!
  `;

  try {
    await transporter.sendMail({
      from: process.env.EMAIL_FROM || `"Nutrition Tracker" <${process.env.EMAIL_USER || 'noreply@nutritiontracker.com'}>`,
      to: user.email,
      subject: `📋 Your Meal Plan for ${dateFormatted}`,
      text: textContent,
      html: htmlContent,
    });

    console.log(`Meal plan email sent to ${user.email}`);
  } catch (error) {
    console.error('Error sending meal plan email:', error);
    throw error;
  }
};

